import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { GeoSearchRequestSchema } from '../utils/validators';

// Miles to degrees approximation (rough, sufficient for geo-search queries)
function milesToDegrees(miles: number): number {
  return miles / 69.0;
}

export const geoSearchService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = GeoSearchRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lat, lng, radiusMiles, species, limit } = parsed.data;
    const delta = milesToDegrees(radiusMiles);

    let q = db
      .collection('lakes')
      .where('lat', '>=', lat - delta)
      .where('lat', '<=', lat + delta)
      .orderBy('lat')
      .limit(limit);

    if (species) {
      q = db
        .collection('lakes')
        .where('speciesPresent', 'array-contains', species)
        .where('lat', '>=', lat - delta)
        .where('lat', '<=', lat + delta)
        .orderBy('lat')
        .limit(limit);
    }

    const snap = await q.get();
    const lakes = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((lake) => {
        const lakeLng = (lake as { lng?: number }).lng ?? 0;
        return Math.abs(lakeLng - lng) <= delta;
      });

    logger.info('Geo search completed', { lat, lng, radiusMiles, results: lakes.length });
    return { lakes };
  }
);
