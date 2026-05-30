"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { Button, Input } from "@/components/ui";
import type { LatLng } from "./FieldsMap";

interface FieldData {
  id: string;
  name: string;
  boundary?: LatLng[];
}

/* ─── Renders existing saved field boundaries as read-only reference ─────── */
function ExistingBoundariesLayer({ fields }: { fields: FieldData[] }) {
  const map       = useMap();
  const mapsLib   = useMapsLibrary("maps");
  const markerLib = useMapsLibrary("marker");
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const labelsRef   = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!mapsLib || !markerLib || !map) return;

    polygonsRef.current.forEach((p) => p.setMap(null));
    labelsRef.current.forEach((l) => { l.map = null; });
    polygonsRef.current = [];
    labelsRef.current = [];

    const mappedFields = fields.filter((f) => f.boundary && f.boundary.length >= 3);

    mappedFields.forEach((field) => {
      const boundary = field.boundary!;
      const polygon = new mapsLib.Polygon({
        paths: boundary,
        strokeColor: "#4B5563",
        strokeOpacity: 0.7,
        strokeWeight: 1.5,
        fillColor: "#6B7280",
        fillOpacity: 0.15,
        map,
        clickable: false,
      });
      polygonsRef.current.push(polygon);

      // Label at centroid
      const lat = boundary.reduce((s, p) => s + p.lat, 0) / boundary.length;
      const lng = boundary.reduce((s, p) => s + p.lng, 0) / boundary.length;
      const el = document.createElement("div");
      el.style.cssText =
        "background:rgba(255,255,255,0.85);border:1px solid #D1D5DB;border-radius:4px;padding:1px 5px;font-size:11px;color:#374151;font-weight:500;pointer-events:none;white-space:nowrap;";
      el.textContent = field.name;

      const label = new markerLib.AdvancedMarkerElement({ position: { lat, lng }, content: el, map });
      labelsRef.current.push(label);
    });

    // Auto-fit to include existing boundaries
    if (mappedFields.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      mappedFields.forEach((f) => f.boundary!.forEach((pt) => bounds.extend(pt)));
      map.fitBounds(bounds, 80);
    }

    return () => {
      polygonsRef.current.forEach((p) => p.setMap(null));
      labelsRef.current.forEach((l) => { l.map = null; });
    };
  }, [mapsLib, markerLib, map, fields]);

  return null;
}

/* ─── Renders the polygon being drawn and handles click-to-add-point ────── */
function DrawableMap({
  points,
  setPoints,
  defaultCenter,
  existingFields,
}: {
  points: LatLng[];
  setPoints: React.Dispatch<React.SetStateAction<LatLng[]>>;
  defaultCenter: LatLng;
  existingFields: FieldData[];
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const renderPolygon = useCallback(
    (pts: LatLng[]) => {
      if (!mapsLib || !map) return;
      polygonRef.current?.setMap(null);
      if (pts.length < 3) return;
      polygonRef.current = new mapsLib.Polygon({
        paths: pts,
        strokeColor: "#1A7A3A",
        strokeOpacity: 0.9,
        strokeWeight: 2.5,
        fillColor: "#1A7A3A",
        fillOpacity: 0.3,
        map,
      });
    },
    [mapsLib, map]
  );

  useEffect(() => {
    renderPolygon(points);
  }, [points, renderPolygon]);

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;
      const pt = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
      setPoints((prev) => {
        const next = [...prev, pt];
        renderPolygon(next);
        return next;
      });
    },
    [setPoints, renderPolygon]
  );

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={14}
      mapId="add-field-boundary-map"
      style={{ width: "100%", height: "100%" }}
      gestureHandling="cooperative"
      onClick={handleMapClick}
    >
      {/* Existing field boundaries as grey reference layer */}
      <ExistingBoundariesLayer fields={existingFields} />

      {/* Points being drawn for the new field */}
      {points.map((pt, i) => (
        <AdvancedMarker key={i} position={pt}>
          <div className="w-3 h-3 bg-[#1A7A3A] border-2 border-white rounded-full shadow-md" />
        </AdvancedMarker>
      ))}
    </Map>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
interface AddFieldModalProps {
  apiKey?: string;
  farmCenter?: LatLng;
  existingFields?: FieldData[];
}

const DEFAULT_CENTER: LatLng = { lat: -26.726, lng: 150.744 };

export function AddFieldModal({ apiKey, farmCenter, existingFields = [] }: AddFieldModalProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [soil, setSoil] = useState("");
  const [points, setPoints] = useState<LatLng[]>([]);
  const router = useRouter();

  const mapCenter = farmCenter ?? DEFAULT_CENTER;

  const handleClose = () => {
    setOpen(false);
    setName(""); setArea(""); setSoil(""); setPoints([]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !area) return;
    setSaving(true);
    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          area_ha: area,
          soil_type: soil || undefined,
          boundary: points.length >= 3 ? points : undefined,
        }),
      });
      if (res.ok) {
        handleClose();
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Failed to add field");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Field
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
               style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#0D3320]">Add New Field</h2>
                <p className="text-sm text-gray-500 mt-0.5">Enter field details and optionally draw a boundary on the map</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body: form left, map right */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* ── Left: Form ── */}
              <div className="w-80 flex-shrink-0 border-r border-[#E5E7EB] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <Input
                    label="Field Name"
                    placeholder="e.g. North Paddock A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Area (hectares)"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 48.5"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                  />
                  <Input
                    label="Soil Type (optional)"
                    placeholder="e.g. Clay Loam"
                    value={soil}
                    onChange={(e) => setSoil(e.target.value)}
                  />

                  {points.length > 0 && (
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2.5">
                      <p className="text-xs text-[#15803D] font-medium">
                        ✓ {points.length} boundary point{points.length !== 1 ? "s" : ""} drawn
                        {points.length >= 3 ? " — polygon ready" : ` — need ${3 - points.length} more`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPoints([])}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Clear boundary
                      </button>
                    </div>
                  )}

                  {/* Legend */}
                  {existingFields.some((f) => f.boundary && f.boundary.length >= 3) && (
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-3 rounded-sm border border-gray-400 bg-gray-300/40 flex-shrink-0" />
                        Existing fields
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-3 rounded-sm border border-[#1A7A3A] bg-[#1A7A3A]/30 flex-shrink-0" />
                        New field boundary
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <Button type="submit" size="lg" className="w-full" loading={saving} disabled={!name || !area}>
                      {saving ? "Saving…" : "Add Field"}
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>

              {/* ── Right: Map ── */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Map instruction banner */}
                <div className="px-4 py-2.5 bg-[#F0FDF4] border-b border-[#BBF7D0] flex items-center gap-2 flex-shrink-0">
                  <svg className="w-4 h-4 text-[#15803D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="text-xs text-[#15803D]">
                    <strong>Optional:</strong> Click on the map to draw the new field boundary. Existing fields shown in grey for reference.
                  </p>
                </div>

                {/* Map */}
                {apiKey?.trim() ? (
                  <div className="flex-1 min-h-0">
                    <APIProvider apiKey={apiKey}>
                      <DrawableMap
                        points={points}
                        setPoints={setPoints}
                        existingFields={existingFields}
                        defaultCenter={mapCenter}
                      />
                    </APIProvider>
                  </div>
                ) : (
                  <div className="flex-1 bg-gradient-to-br from-[#E8F5EC] to-[#c3e6cc] flex flex-col items-center justify-center text-[#1A7A3A]">
                    <svg className="w-12 h-12 opacity-40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-sm font-medium opacity-70">Map unavailable</p>
                    <p className="text-xs opacity-50 mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable boundary drawing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
