"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { BoundaryMapper } from "./BoundaryMapper";
import type { LatLng } from "./FieldsMap";

interface Props {
  fieldId: string;
  fieldName: string;
  apiKey: string | undefined;
  initialBoundary: LatLng[];
}

export function FieldsBoundaryPanel({ fieldId, fieldName, apiKey, initialBoundary }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        🗺 Map
      </Button>

      {/* Slide-in drawer overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#0D3320]">Boundary Mapper</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Field: <span className="font-semibold text-[#1A7A3A]">{fieldName}</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info banner */}
            <div className="px-6 py-3 bg-[#F0FDF4] border-b border-[#BBF7D0] text-sm text-[#15803D] flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Draw the paddock boundary manually by clicking on the map, or upload a <strong>.kml</strong> file exported from Google Earth, QGIS, or AgriDigital.
              </span>
            </div>

            {/* Mapper (takes remaining height) */}
            <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col">
              <BoundaryMapper
                apiKey={apiKey}
                fieldId={fieldId}
                initialBoundary={initialBoundary}
                onSaved={() => {
                  // Close drawer after a short delay so user sees the "Saved!" message
                  setTimeout(() => setOpen(false), 1500);
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
