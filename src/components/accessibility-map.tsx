"use client";

import Link from "next/link";
import { useEffect } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import type { AccessibilityReport } from "@/types/report";

type AccessibilityMapProps = {
  reports: AccessibilityReport[];
};

export function AccessibilityMap({
  reports,
}: AccessibilityMapProps) {
  useEffect(() => {
    // Leaflet sometimes expects its default image assets in a location that
    // bundlers do not preserve. We use CircleMarker below, so no marker image
    // configuration is required.
    void L;
  }, []);

  const mappedReports = reports.filter(
    (report) =>
      report.latitude !== 0 &&
      report.longitude !== 0 &&
      Number.isFinite(report.latitude) &&
      Number.isFinite(report.longitude),
  );

  if (mappedReports.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center">
        <div>
          <p className="font-bold text-slate-900">
            No mapped reports yet
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
            Reports with location coordinates will appear here.
          </p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [
    mappedReports[0].latitude,
    mappedReports[0].longitude,
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="h-[440px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappedReports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[
              report.latitude,
              report.longitude,
            ]}
            radius={10}
            pathOptions={{
              color:
                report.status === "resolved"
                  ? "#059669"
                  : report.severity === "high"
                    ? "#dc2626"
                    : "#2563eb",
              fillColor:
                report.status === "resolved"
                  ? "#10b981"
                  : report.severity === "high"
                    ? "#ef4444"
                    : "#3b82f6",
              fillOpacity: 0.85,
              weight: 3,
            }}
          >
            <Popup>
              <div className="min-w-[210px]">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {report.locationName}
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {report.title}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {report.severity} impact ·{" "}
                  {report.status.replace("_", " ")}
                </p>

                <Link
                  href={`/issues/${report.id}`}
                  className="mt-3 inline-block text-sm font-bold text-blue-700"
                >
                  View report →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}