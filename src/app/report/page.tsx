import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function ReportPage() {
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

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Construction size={22} />
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
          Report a barrier
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          This is where community members will submit accessibility barriers.
          We will connect this form to Supabase in the next milestone.
        </p>
      </div>
    </main>
  );
}