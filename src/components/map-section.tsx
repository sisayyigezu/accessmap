"use client";

import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";

import type { AccessibilityReport } from "@/types/report";

const AccessibilityMap = dynamic(
  () =>
    import("@/components/accessibility-map").then(
      (module) => module.AccessibilityMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[440px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-100">
        <p className="text-sm font-semibold text-slate-500">
          Loading accessibility map...
        </p>
      </div>
    ),
  },
);

export function MapSection({
  reports,
}: {
  reports: AccessibilityReport[];
}) {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <MapPinned size={21} />
          </span>

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Accessibility map
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              See where barriers are happening
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Explore accessibility reports geographically and open any mapped
              issue for more detail.
            </p>
          </div>
        </div>

        <AccessibilityMap reports={reports} />

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
          <LegendDot className="bg-red-500" label="High impact" />
          <LegendDot className="bg-blue-500" label="Reported barrier" />
          <LegendDot className="bg-emerald-500" label="Resolved" />
        </div>
      </div>
    </section>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />
      {label}
    </span>
  );
}