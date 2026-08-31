export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/status-badge";
import {
  mapDatabaseReport,
  type DatabaseReport,
} from "@/lib/report-mappers";
import { supabase } from "@/lib/supabase";

type IssuePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function IssuePage({
  params,
}: IssuePageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
        id,
        title,
        location_name,
        address,
        category,
        description,
        severity,
        status,
        latitude,
        longitude,
        admin_note,
        image_url,
        created_at,
        updated_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load report:", error);
  }

  if (!data) {
    notFound();
  }

  const report = mapDatabaseReport(
    data as DatabaseReport,
  );

  const severityStyles = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-orange-50 text-orange-700",
    high: "bg-red-50 text-red-700",
  };

  const createdDate = new Date(
    report.createdAt,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/#reports"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-600 transition hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} />
          Back to reports
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={report.status} />

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  severityStyles[report.severity]
                }`}
              >
                {report.severity.charAt(0).toUpperCase() +
                  report.severity.slice(1)}{" "}
                impact
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {report.title}
            </h1>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 shrink-0"
                  size={18}
                />

                <div>
                  <p className="font-bold text-slate-800">
                    {report.locationName}
                  </p>

                  <p>{report.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays
                  className="mt-0.5 shrink-0"
                  size={18}
                />

                <div>
                  <p className="font-bold text-slate-800">
                    Reported
                  </p>

                  <p>{createdDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <section>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                Community report
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                What was reported
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {report.description}
              </p>
              {report.imageUrl && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.imageUrl}
                    alt={`Photo evidence for ${report.title}`}
                    className="max-h-[480px] w-full object-cover"
                  />
                </div>
              )}
            </section>

            <section className="mt-8">
              {report.adminNote ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                    Organization update
                  </p>

                  <p className="mt-2 leading-7 text-emerald-950">
                    {report.adminNote}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-bold text-slate-900">
                    Awaiting organization update
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This report is visible to the community while it moves
                    through review.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Report lifecycle
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <LifecycleStep
                  label="Submitted"
                  active
                />

                <LifecycleStep
                  label="Verified"
                  active={[
                    "verified",
                    "in_progress",
                    "resolved",
                  ].includes(report.status)}
                />

                <LifecycleStep
                  label="In progress"
                  active={[
                    "in_progress",
                    "resolved",
                  ].includes(report.status)}
                />

                <LifecycleStep
                  label="Resolved"
                  active={report.status === "resolved"}
                />
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}

function LifecycleStep({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 text-center text-xs font-bold ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-slate-200 bg-white text-slate-400"
      }`}
    >
      {label}
    </div>
  );
}