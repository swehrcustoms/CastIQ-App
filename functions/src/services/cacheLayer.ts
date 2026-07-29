import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { db } from '../utils/adminInit';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { WeatherRequestSchema } from '../utils/validators';

const TOMORROW_BASE = 'https://api.tomorrow.io/v4/weather/realtime';
const CACHE_TTL_HOURS = 1;
const tomorrowIoApiKey = defineSecret('TOMORROW_IO_API_KEY');

const WIND_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function degreesToCardinal(degrees: number | undefined): string | null {
  if (degrees == null || Number.isNaN(degrees)) return null;
  const idx = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return WIND_DIRS[idx];
}

/** Convert millibars (hPa) to inches of mercury */
function mbToInHg(mb: number | undefined): number | null {
  if (mb == null || Number.isNaN(mb)) return null;
  return Math.round((mb * 0.02953) * 100) / 100;
}

export const cacheLayer = onCall(
  {
    region: 'us-central1',
    maxInstances: 20,
    secrets: [tomorrowIoApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = WeatherRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lakeId, lat, lng } = parsed.data;
    const cacheId = `${lakeId}_${new Date().toISOString().slice(0, 13)}`;

    const cached = await db.collection('weather_cache').doc(cacheId).get();
    if (cached.exists) {
      const data = cached.data()!;
      const ttl = (data.ttl as Timestamp).toDate();
      if (ttl > new Date()) {
        logger.info('Weather cache hit', { lakeId });
        return { weather: data, cached: true };
      }
    }

    let weatherDoc: Record<string, unknown> = {
      cacheId,
      lakeId,
      fetchedAt: FieldValue.serverTimestamp(),
      waterTempF: null,
      airTempF: null,
      windSpeedMph: null,
      windDirection: null,
      pressureInHg: null,
      precipitationIn: null,
      cloudCover: null,
      uvIndex: null,
      ttl: new Date(Date.now() + CACHE_TTL_HOURS * 3600 * 1000),
    };

    try {
      const apiKey = tomorrowIoApiKey.value();
      if (!apiKey) {
        throw new Error('TOMORROW_IO_API_KEY is empty');
      }

      const url = new URL(TOMORROW_BASE);
      url.searchParams.set('location', `${lat},${lng}`);
      url.searchParams.set('units', 'imperial');
      url.searchParams.set('apikey', apiKey);

      const res = await fetch(url.toString());
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Tomorrow.io ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as {
        data?: {
          values?: {
            temperature?: number;
            windSpeed?: number;
            windDirection?: number;
            pressureSeaLevel?: number;
            precipitationIntensity?: number;
            cloudCover?: number;
            uvIndex?: number;
            temperatureApparent?: number;
          };
        };
      };

      const v = json.data?.values ?? {};
      weatherDoc = {
        ...weatherDoc,
        airTempF: v.temperature ?? null,
        // Tomorrow realtime does not always include water temp; leave null safely
        waterTempF: null,
        windSpeedMph:
          v.windSpeed != null ? Math.round(v.windSpeed * 10) / 10 : null,
        windDirection: degreesToCardinal(v.windDirection),
        pressureInHg: mbToInHg(v.pressureSeaLevel),
        precipitationIn: v.precipitationIntensity ?? null,
        cloudCover: v.cloudCover != null ? Math.round(v.cloudCover) : null,
        uvIndex: v.uvIndex ?? null,
        _source: 'tomorrow.io',
      };

      logger.info('Weather fetched from Tomorrow.io', { lakeId });
    } catch (err) {
      logger.warn('Tomorrow.io fetch failed — returning partial/null weather', {
        lakeId,
        error: String(err),
      });
      weatherDoc = {
        ...weatherDoc,
        _source: 'fallback',
        _error: String(err),
      };
    }

    await db.collection('weather_cache').doc(cacheId).set(weatherDoc);
    return { weather: weatherDoc, cached: false };
  }
);
