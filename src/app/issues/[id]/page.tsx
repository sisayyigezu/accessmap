import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/status-badge";
import { reports } from "@/data/reports";

type IssuePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return reports.map((report) => ({
    id: report.id,
  }));
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { id } = await params;

  const report = reports.find((item) => item.id === id);

  if (!report) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/#reports"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to reports
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={report.status} />

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                {report.severity.charAt(0).toUpperCase() +
                  report.severity.slice(1)}{" "}
                impact
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {report.title}
            </h1>

            <div className="mt-4 flex items-start gap-2 text-slate-600">
              <MapPin className="mt-0.5 shrink-0" size={18} />

              <div>
                <p className="font-bold text-slate-800">
                  {report.locationName}
                </p>

                <p className="text-sm">{report.address}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              What was reported
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {report.description}
            </p>

            {report.adminNote ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                  Organization update
                </p>

                <p className="mt-2 leading-7 text-emerald-950">
                  {report.adminNote}
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-bold text-slate-900">
                  Awaiting organization update
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This report is visible to the community while it moves through
                  the review process.
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}