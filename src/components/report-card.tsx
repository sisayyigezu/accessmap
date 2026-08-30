import Link from "next/link";
import {
  Accessibility,
  ArrowUpRight,
  Bath,
  Construction,
  DoorOpen,
  Footprints,
  MapPin,
  TriangleAlert,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import type {
  AccessibilityReport,
  BarrierCategory,
} from "@/types/report";

type ReportCardProps = {
  report: AccessibilityReport;
};

const categoryConfig: Record<
  BarrierCategory,
  {
    label: string;
    icon: typeof Accessibility;
  }
> = {
  ramp: {
    label: "Ramp access",
    icon: Accessibility,
  },
  elevator: {
    label: "Elevator",
    icon: Accessibility,
  },
  sidewalk: {
    label: "Sidewalk",
    icon: Footprints,
  },
  restroom: {
    label: "Restroom",
    icon: Bath,
  },
  entrance: {
    label: "Entrance",
    icon: DoorOpen,
  },
  construction: {
    label: "Construction",
    icon: Construction,
  },
  other: {
    label: "Other barrier",
    icon: TriangleAlert,
  },
};

const severityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-50 text-orange-700",
  high: "bg-red-50 text-red-700",
};

export function ReportCard({ report }: ReportCardProps) {
  const category = categoryConfig[report.category];
  const Icon = category.icon;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={21} />
        </div>

        <StatusBadge status={report.status} />
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
          {category.label}
        </p>

        <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-slate-950">
          {report.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={15} aria-hidden="true" />
          <span>{report.locationName}</span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {report.description}
        </p>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              severityStyles[report.severity]
            }`}
          >
            {report.severity.charAt(0).toUpperCase() +
              report.severity.slice(1)}{" "}
            impact
          </span>

          <Link
            href={`/issues/${report.id}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 transition hover:text-blue-900"
          >
            View
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}