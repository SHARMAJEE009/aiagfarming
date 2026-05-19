"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type LatLng = { lat: number; lng: number };

interface BoundaryMapperProps {
  apiKey: string | undefined;
  fieldId: string;
  initialBoundary?: LatLng[];
  defaultCenter?: LatLng;
  onSaved?: (boundary: LatLng[]) => void;
}

/* ─── Inner map that renders the polygon & handles draw mode ──────────────── */
function DrawableMap({
  mode,
  points,
  setPoints,
  defaultCenter,
}: {
  mode: "draw" | "view";
  points: LatLng[];
  setPoints: React.Dispatch<React.SetStateAction<LatLng[]>>;
  defaultCenter: LatLng;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  // Re-draw polygon whenever points change
  const renderPolygon = useCallback(
    (pts: LatLng[]) => {
      if (!mapsLib || !map) return;
      polygonRef.current?.setMap(null);
      if (pts.length < 3) return;
      polygonRef.current = new mapsLib.Polygon({
        paths: pts,
        strokeColor: "#1A7A3A",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#1A7A3A",
        fillOpacity: 0.25,
        map,
      });
    },
    [mapsLib, map]
  );

  // Re-render polygon whenever points change
  useEffect(() => {
    renderPolygon(points);
  }, [points, renderPolygon]);

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (mode !== "draw" || !e.detail.latLng) return;
      const newPt = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
      setPoints((prev) => {
        const next = [...prev, newPt];
        renderPolygon(next);
        return next;
      });
    },
    [mode, setPoints, renderPolygon]
  );

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={14}
      mapId="boundary-map"
      style={{ width: "100%", height: "100%" }}
      gestureHandling="cooperative"
      onClick={handleMapClick}
    >
      {/* Show vertex markers while drawing */}
      {mode === "draw" &&
        points.map((pt, i) => (
          <AdvancedMarker key={i} position={pt}>
            <div className="w-3 h-3 bg-[#1A7A3A] border-2 border-white rounded-full shadow-md" />
          </AdvancedMarker>
        ))}
    </Map>
  );
}

/* ─── KML Parser ─────────────────────────────────────────────────────────── */
function parseKml(text: string): LatLng[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const coordEls = xml.getElementsByTagName("coordinates");
  if (!coordEls.length) return [];
  const raw = coordEls[0].textContent || "";
  return raw
    .trim()
    .split(/\s+/)
    .map((s) => {
      const [lng, lat] = s.split(",").map(Number);
      return { lat, lng };
    })
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function BoundaryMapper({
  apiKey,
  fieldId,
  initialBoundary = [],
  defaultCenter = { lat: -26.726, lng: 150.744 },
  onSaved,
}: BoundaryMapperProps) {
  const [tab, setTab] = useState<"draw" | "kml">("draw");
  const [points, setPoints] = useState<LatLng[]>(initialBoundary);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [kmlError, setKmlError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── KML Upload handler ── */
  const handleKmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKmlError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseKml(text);
      if (!parsed.length) {
        setKmlError("No valid coordinates found in this KML file.");
        return;
      }
      setPoints(parsed);
    };
    reader.readAsText(file);
  };

  /* ── Save boundary to database ── */
  const handleSave = async () => {
    if (points.length < 3) {
      alert("Please mark at least 3 points to define a boundary.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/fields/${fieldId}/boundary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boundary: points }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        onSaved?.(points);
      } else {
        alert("Failed to save boundary. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setPoints([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!apiKey?.trim()) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5EC] to-[#c3e6cc] rounded-xl text-[#1A7A3A] text-center px-6 py-12 h-full">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="font-semibold">Boundary Mapper</p>
        <p className="text-sm opacity-70 mt-1 max-w-sm">
          Set <span className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in{" "}
          <span className="font-mono text-xs">.env.local</span> to enable field boundary mapping.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Mode Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-1">
          {(["draw", "kml"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white text-[#1A7A3A] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "draw" ? "✏️ Draw Manually" : "📂 Upload KML"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {points.length > 0 && (
            <span className="bg-[#E8F5EC] text-[#1A7A3A] px-2 py-0.5 rounded-full text-xs font-medium">
              {points.length} points
            </span>
          )}
        </div>
      </div>

      {/* KML Upload Panel */}
      {tab === "kml" && (
        <div className="bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#E8F5EC] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Upload .KML File</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">
                Export your paddock from Google Earth, ArcGIS, or QGIS as .kml and upload it here. The boundary will be drawn on the map automatically.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".kml"
                onChange={handleKmlFile}
                className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1A7A3A]/10 file:text-[#1A7A3A] hover:file:bg-[#1A7A3A]/20 cursor-pointer"
              />
              {kmlError && (
                <p className="text-xs text-red-600 mt-2">⚠️ {kmlError}</p>
              )}
              {points.length > 0 && (
                <p className="text-xs text-[#1A7A3A] mt-2 font-medium">
                  ✓ {points.length} boundary coordinates loaded — boundary is visible on map below.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "draw" && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-sm text-[#15803D] flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Click on the map to add boundary points. Connect at least 3 points to form a paddock polygon.</span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm" style={{ minHeight: "380px" }}>
        <APIProvider apiKey={apiKey}>
          <DrawableMap
            mode={tab === "draw" ? "draw" : "view"}
            points={points}
            setPoints={setPoints}
            defaultCenter={
              points.length > 0
                ? {
                    lat: points.reduce((a, p) => a + p.lat, 0) / points.length,
                    lng: points.reduce((a, p) => a + p.lng, 0) / points.length,
                  }
                : defaultCenter
            }
          />
        </APIProvider>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleClear}
          disabled={points.length === 0}
          className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          🗑 Clear boundary
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-[#1A7A3A] font-medium">✓ Boundary saved!</span>
          )}
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={points.length < 3}
          >
            {saving ? "Saving…" : "Save Boundary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
