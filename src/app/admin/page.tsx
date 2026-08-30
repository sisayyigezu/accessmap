"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import type {
  ReportSeverity,
  ReportStatus,
} from "@/types/report";

type AdminReport = {
  id: string;
  title: string;
  location_name: string;
  address: string;
  description: string;
  category: string;
  severity: ReportSeverity;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(Boolean(session));
      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoggingIn(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("Invalid email or password.");
      setLoggingIn(false);
      return;
    }

    setLoggingIn(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (checkingSession) {
    return (
      <PageShell>
        <LoadingMessage text="Checking admin session..." />
      </PageShell>
    );
  }

  if (!authenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <ShieldCheck size={24} />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
            Organization login
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Authorized organizations can verify reports, publish updates, and
            track accessibility issues through resolution.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-7 grid gap-5"
          >
            {loginError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
              >
                {loginError}
              </div>
            )}

            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-sm font-bold text-slate-900"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputStyles}
                placeholder="admin@example.com"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm font-bold text-slate-900"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputStyles}
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loggingIn ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </PageShell>
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
    />
  );
}

function Dashboard({
  onLogout,
}: {
  onLogout: () => Promise<void>;
}) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("reports")
      .select(
        `
          id,
          title,
          location_name,
          address,
          description,
          category,
          severity,
          status,
          admin_note,
          created_at
        `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError("Could not load reports.");
      setLoading(false);
      return;
    }

    setReports((data ?? []) as AdminReport[]);
    setLoading(false);
  }, []);

  useEffect(() => {
  let cancelled = false;

  async function initialLoad() {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
          id,
          title,
          location_name,
          address,
          description,
          category,
          severity,
          status,
          admin_note,
          created_at
        `,
      )
      .order("created_at", { ascending: false });

    if (cancelled) {
      return;
    }

    if (error) {
      setLoadError("Could not load reports.");
      setLoading(false);
      return;
    }

    setReports((data ?? []) as AdminReport[]);
    setLoading(false);
  }

  initialLoad();

  return () => {
    cancelled = true;
  };
}, []);

  async function updateReport(
    reportId: string,
    changes: Partial<Pick<AdminReport, "status" | "admin_note">>,
  ) {
    setSavingId(reportId);

    const { error } = await supabase
      .from("reports")
      .update(changes)
      .eq("id", reportId);

    if (error) {
      window.alert(`Update failed: ${error.message}`);
      setSavingId(null);
      return;
    }

    await loadReports();
    setSavingId(null);
  }

  const submitted = reports.filter(
    (report) => report.status === "submitted",
  ).length;

  const inProgress = reports.filter(
    (report) => report.status === "in_progress",
  ).length;

  const resolved = reports.filter(
    (report) => report.status === "resolved",
  ).length;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Organization dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Accessibility report queue
            </h1>

            <p className="mt-3 text-slate-600">
              Review community reports and publish progress as issues are
              addressed.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadReports}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric
            label="New reports"
            value={submitted}
          />
          <Metric
            label="In progress"
            value={inProgress}
          />
          <Metric
            label="Resolved"
            value={resolved}
          />
        </div>

        {loading ? (
          <div className="mt-8">
            <LoadingMessage text="Loading community reports..." />
          </div>
        ) : loadError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
            <p className="font-bold">{loadError}</p>
            <button
              onClick={loadReports}
              className="mt-3 text-sm font-bold underline"
            >
              Try again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto text-emerald-600"
            />
            <p className="mt-4 font-bold text-slate-950">
              No reports to review.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {reports.map((report) => (
              <AdminReportCard
                key={report.id}
                report={report}
                saving={savingId === report.id}
                onUpdate={updateReport}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function AdminReportCard({
  report,
  saving,
  onUpdate,
}: {
  report: AdminReport;
  saving: boolean;
  onUpdate: (
    id: string,
    changes: Partial<Pick<AdminReport, "status" | "admin_note">>,
  ) => Promise<void>;
}) {
  const [note, setNote] = useState(report.admin_note ?? "");

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase text-blue-700">
              {report.category}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-700">
              {report.severity} impact
            </span>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              {formatStatus(report.status)}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-950">
            {report.title}
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            {report.location_name} · {report.address}
          </p>

          <p className="mt-4 leading-7 text-slate-600">
            {report.description}
          </p>

          <Link
            href={`/issues/${report.id}`}
            target="_blank"
            className="mt-4 inline-block text-sm font-bold text-blue-700 hover:text-blue-900"
          >
            View public report ↗
          </Link>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <label className="text-sm font-bold text-slate-900">
            Status
          </label>

          <select
            value={report.status}
            disabled={saving}
            onChange={(event) =>
              onUpdate(report.id, {
                status: event.target.value as ReportStatus,
              })
            }
            className={`${inputStyles} mt-2`}
          >
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <label
            htmlFor={`note-${report.id}`}
            className="mt-4 block text-sm font-bold text-slate-900"
          >
            Public organization update
          </label>

          <textarea
            id={`note-${report.id}`}
            value={note}
            disabled={saving}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={500}
            placeholder="e.g. Facilities has scheduled repairs for tomorrow."
            className={`${inputStyles} mt-2 resize-y`}
          />

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onUpdate(report.id, {
                admin_note: note.trim() || null,
              })
            }
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              "Publish update"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to AccessMap
        </Link>
      </div>

      {children}
    </main>
  );
}

function LoadingMessage({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-600">
      <LoaderCircle
        size={20}
        className="animate-spin text-blue-600"
      />
      {text}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-3xl font-black text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function formatStatus(status: ReportStatus) {
  return status
    .replace("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const inputStyles =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";