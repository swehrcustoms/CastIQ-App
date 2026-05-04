export function milesToDegrees(miles: number): number {
  return miles / 69.0;
}

export function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3_958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function mapboxStaticUrl(
  lng: number,
  lat: number,
  zoom: number,
  width: number,
  height: number,
  token: string
): string {
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${token}`;
}
