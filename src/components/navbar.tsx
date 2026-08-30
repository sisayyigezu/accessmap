import Link from "next/link";
import { Accessibility, Plus } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
          aria-label="AccessMap home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Accessibility size={22} />
          </span>

          <span>
            <span className="block text-lg font-bold leading-none tracking-tight text-slate-950">
              AccessMap
            </span>

            <span className="mt-1 hidden text-xs font-medium text-slate-500 sm:block">
              Community accessibility
            </span>
          </span>
        </Link>

        <nav
          className="flex items-center gap-2"
          aria-label="Primary navigation"
        >
          <Link
            href="/#reports"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Explore
          </Link>

          <Link
            href="/admin"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex"
          >
            Admin
          </Link>

          <Link
            href="/report"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Report a barrier</span>
            <span className="sm:hidden">Report</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}