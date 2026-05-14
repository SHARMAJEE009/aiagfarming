"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const defaultCenter = { lat: -26.726, lng: 150.744 };

type MarkerPos = { lat: number; lng: number };

interface FieldsMapProps {
  apiKey: string | undefined;
  markers?: MarkerPos[];
  heightPx?: number;
}

export function FieldsMap({ apiKey, markers = [defaultCenter], heightPx = 256 }: FieldsMapProps) {
  if (!apiKey?.trim()) {
    return (
      <div className="h-full min-h-[240px] flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5EC] to-[#c3e6cc] rounded-xl text-[#1A7A3A] text-center px-6 py-10">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <p className="font-semibold">Interactive field map</p>
        <p className="text-sm opacity-70 mt-1 max-w-sm">
          Set <span className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in{" "}
          <span className="font-mono text-xs">.env.local</span> and reload.
        </p>
      </div>
    );
  }

  const h = `${heightPx}px`;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={markers[0] ?? defaultCenter}
        defaultZoom={12}
        style={{ width: "100%", height: h }}
        gestureHandling="cooperative"
      >
        {markers.slice(0, 12).map((pos, i) => (
          <Marker key={`${pos.lat}-${pos.lng}-${i}`} position={pos} />
        ))}
      </Map>
    </APIProvider>
  );
}
