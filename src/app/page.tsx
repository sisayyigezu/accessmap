export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import { MapSection } from "@/components/map-section";
import { Navbar } from "@/components/navbar";
import { ReportCard } from "@/components/report-card";
import {
  mapDatabaseReport,
  type DatabaseReport,
} from "@/lib/report-mappers";
import { supabase } from "@/lib/supabase";

export default async function Home() {
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
    .order("created_at", { ascending: false });

  const reports = error
    ? []
    : ((data ?? []) as DatabaseReport[]).map(mapDatabaseReport);

  const activeReports = reports.filter(
    (report) => report.status !== "resolved",
  );

  const resolvedReports = reports.filter(
    (report) => report.status === "resolved",
  );

  const inProgressReports = reports.filter(
    (report) => report.status === "in_progress",
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        >
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">
              <ShieldCheck size={16} />
              Community-powered accessibility
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
              See barriers.
              <br />
              Report them.
              <br />
              <span className="text-blue-600">Create change.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              AccessMap helps communities identify accessibility barriers,
              track their resolution, and make public spaces easier for
              everyone to access.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Report a barrier
                <ArrowRight size={18} />
              </Link>

              <Link
                href="#reports"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                <MapPinned size={18} />
                Explore reports
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6">
            <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                <CircleDot size={16} />
                LIVE COMMUNITY OVERVIEW
              </div>

              <p className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Accessibility becomes actionable when barriers become visible.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Metric
                  value={String(activeReports.length)}
                  label="Active"
                />

                <Metric
                  value={String(inProgressReports.length)}
                  label="In progress"
                />

                <Metric
                  value={String(resolvedReports.length)}
                  label="Resolved"
                />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
              

              <div>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Follow each issue from submission through 
                  review, action, and resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION — NEW */}
      {!error && <MapSection reports={reports} />}

      {/* REPORTS SECTION */}
      <section
        id="reports"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Community reports
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Barriers near the community
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Review reported accessibility issues and follow what is being
              done to address them.
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-500">
            {reports.length} reports shown
          </p>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="font-bold text-red-900">
              Reports could not be loaded
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-800">
              AccessMap is having trouble reaching the database. Please try
              again shortly.
            </p>
          </div>
        ) : reports.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <MapPinned
              className="mx-auto text-slate-400"
              size={36}
            />

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              No reports yet
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Be the first person to make an accessibility barrier visible.
            </p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <Step
            number="01"
            title="Spot a barrier"
            description="Notice an accessibility issue in a building, path, entrance, restroom, or public space."
          />

          <Step
            number="02"
            title="Make it visible"
            description="Submit a short community report with the location, type of barrier, and impact."
          />

          <Step
            number="03"
            title="Track action"
            description="Organizations review reports and publish progress until the issue is resolved."
          />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span className="font-bold text-slate-800">
            AccessMap
          </span>

          <span>
            Making accessibility barriers visible and actionable.
          </span>
        </div>
      </footer>
    </main>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="text-2xl font-black">
        {value}
      </div>

      <div className="mt-1 text-xs font-semibold text-slate-300">
        {label}
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-sm font-black text-blue-600">
        {number}
      </div>

      <h3 className="mt-2 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}