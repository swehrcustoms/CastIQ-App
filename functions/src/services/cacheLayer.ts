import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { WeatherRequestSchema } from '../utils/validators';

const TOMORROW_BASE = 'https://api.tomorrow.io/v4/weather/realtime';
const CACHE_TTL_HOURS = 1;

export const cacheLayer = onCall(
  { region: 'us-central1', maxInstances: 20 },
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

    // TODO: Phase 2 — call Tomorrow.io API with TOMORROW_API_KEY from Functions config
    // For now return a placeholder structure
    const placeholder = {
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
      _source: `${TOMORROW_BASE}?location=${lat},${lng}`,
    };

    await db.collection('weather_cache').doc(cacheId).set(placeholder);
    logger.info('Weather cache miss — placeholder written', { lakeId });
    return { weather: placeholder, cached: false };
  }
);
