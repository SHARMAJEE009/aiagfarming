import { LatLng, calculatePolygonAreaHectares } from "./geometry";

export interface ParsedField {
  name: string;
  boundary_geojson: LatLng[];
  area_ha: number;
}

export function parseKMLFields(kmlString: string): ParsedField[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlString, "text/xml");
  
  const placemarks = xmlDoc.getElementsByTagName("Placemark");
  const fields: ParsedField[] = [];

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    const nameNode = placemark.getElementsByTagName("name")[0];
    const name = nameNode?.textContent?.trim() || `Field ${i + 1}`;

    const coordinatesNode = placemark.getElementsByTagName("coordinates")[0];
    if (coordinatesNode && coordinatesNode.textContent) {
      const coordsStr = coordinatesNode.textContent.trim();
      const pairs = coordsStr.split(/\s+/);
      
      const boundary_geojson: LatLng[] = [];
      for (const pair of pairs) {
        if (!pair) continue;
        const parts = pair.split(',');
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            boundary_geojson.push({ lat, lng });
          }
        }
      }

      if (boundary_geojson.length >= 3) {
        const area_ha = calculatePolygonAreaHectares(boundary_geojson);
        fields.push({
          name,
          boundary_geojson,
          area_ha
        });
      }
    }
  }

  return fields;
}
