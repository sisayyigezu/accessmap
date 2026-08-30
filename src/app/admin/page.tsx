import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to AccessMap
        </Link>

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShieldCheck size={22} />
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
          Organization dashboard
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          Organizations will use this dashboard to review reports, verify
          accessibility barriers, post updates, and mark issues as resolved.
        </p>
      </div>
    </main>
  );
}