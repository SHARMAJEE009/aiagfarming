export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS = 6371008.8; // meters

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the area of a spherical polygon in square meters.
 * Assumes Earth is a perfect sphere.
 */
export function calculatePolygonArea(path: LatLng[]): number {
  if (!path || path.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < path.length; i++) {
    const p1 = path[i];
    const p2 = path[(i + 1) % path.length];
    
    const lng1 = toRadians(p1.lng);
    const lat1 = toRadians(p1.lat);
    const lng2 = toRadians(p2.lng);
    const lat2 = toRadians(p2.lat);

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2.0);
  return area;
}

/**
 * Calculates the area of a polygon in hectares (1 hectare = 10,000 sq meters).
 */
export function calculatePolygonAreaHectares(path: LatLng[]): number {
  const sqMeters = calculatePolygonArea(path);
  return sqMeters / 10000;
}
