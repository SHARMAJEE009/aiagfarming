"use client";

import { useEffect, useRef } from "react";
import { APIProvider, Map, useMap, useMapsLibrary, AdvancedMarker } from "@vis.gl/react-google-maps";

export type LatLng = { lat: number; lng: number };

interface FieldData {
  id: string;
  name: string;
  boundary?: LatLng[];
}

interface FieldsMapProps {
  apiKey: string | undefined;
  fields?: FieldData[];
  markers?: LatLng[];
  heightPx?: number;
}

const DEFAULT_CENTER: LatLng = { lat: -26.726, lng: 150.744 };

/* ─── Inner component that draws polygons via the Maps API ─────────────────── */
function PolygonLayer({ fields }: { fields: FieldData[] }) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!mapsLib || !map) return;

    // Clear previous polygons
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    fields.forEach((field) => {
      if (!field.boundary || field.boundary.length < 3) return;
      const polygon = new mapsLib.Polygon({
        paths: field.boundary,
        strokeColor: "#1A7A3A",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#1A7A3A",
        fillOpacity: 0.2,
        map,
      });
      polygonsRef.current.push(polygon);
    });

    // Auto-fit bounds to all polygons
    if (polygonsRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      fields.forEach((f) => f.boundary?.forEach((pt) => bounds.extend(pt)));
      map.fitBounds(bounds, 60);
    }

    return () => polygonsRef.current.forEach((p) => p.setMap(null));
  }, [mapsLib, map, fields]);

  return null;
}

/* ─── Exported Map Component ─────────────────────────────────────────────── */
export function FieldsMap({ apiKey, fields = [], markers = [], heightPx = 256 }: FieldsMapProps) {
  if (!apiKey?.trim()) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5EC] to-[#c3e6cc] rounded-xl text-[#1A7A3A] text-center px-6 py-10"
        style={{ height: `${heightPx}px` }}
      >
        <svg className="w-12 h-12 mx-auto mb-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="font-semibold">Interactive field map</p>
        <p className="text-sm opacity-70 mt-1 max-w-sm">
          Set <span className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in{" "}
          <span className="font-mono text-xs">.env.local</span> and reload.
        </p>
      </div>
    );
  }

  // Compute a good default center from all boundaries or fallback markers
  const allPoints = [
    ...fields.flatMap((f) => f.boundary ?? []),
    ...markers,
  ];
  const center =
    allPoints.length > 0
      ? {
          lat: allPoints.reduce((a, p) => a + p.lat, 0) / allPoints.length,
          lng: allPoints.reduce((a, p) => a + p.lng, 0) / allPoints.length,
        }
      : DEFAULT_CENTER;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={12}
        mapId="fields-overview-map"
        style={{ width: "100%", height: `${heightPx}px` }}
        gestureHandling="cooperative"
      >
        {/* Render all saved boundaries */}
        <PolygonLayer fields={fields} />

        {/* Fallback plain markers when no boundary defined */}
        {fields
          .filter((f) => !f.boundary || f.boundary.length < 3)
          .map((f, i) =>
            markers[i] ? (
              <AdvancedMarker key={f.id} position={markers[i]}>
                <div className="w-4 h-4 bg-[#1A7A3A] border-2 border-white rounded-full shadow-md" />
              </AdvancedMarker>
            ) : null
          )}
      </Map>
    </APIProvider>
  );
}
