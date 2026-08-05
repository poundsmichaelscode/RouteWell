import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MapPin,
  PackageCheck,
  Route,
  ShieldCheck,
  Truck
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const features = [
  { icon: PackageCheck, title: "Delivery control", text: "Create, assign, search and track deliveries through auditable status transitions." },
  { icon: Truck, title: "Fleet operations", text: "Manage drivers, vehicles, capacity, availability and maintenance state." },
  { icon: BarChart3, title: "Operational insight", text: "Monitor delivery health, workload and exceptions from a live analytics dashboard." },
  { icon: ShieldCheck, title: "Secure by design", text: "RBAC, private networks, encrypted transport, audit logs and reproducible infrastructure." }
];

const architecture = [
  { icon: ShieldCheck, label: "Application Gateway WAF v2" },
  { icon: Route, label: "Private frontend subnet" },
  { icon: Truck, label: "Private backend subnet" },
  { icon: MapPin, label: "Isolated database subnet" }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-zinc-600 dark:text-zinc-300 md:flex">
          <a href="#platform">Platform</a>
          <a href="#architecture">Architecture</a>
          <Link href="/api-docs">API</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login"><Button variant="secondary" size="sm">Sign in</Button></Link>
          <Link href="/register"><Button size="sm">Get started</Button></Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={14} /> Enterprise logistics operations
          </div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.05em] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
            Every route, vehicle and delivery—under control.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            RouteWell gives logistics teams one secure workspace to plan deliveries, allocate resources, monitor exceptions and report performance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register"><Button size="lg">Launch workspace <ArrowRight size={18} /></Button></Link>
            <Link href="/login"><Button size="lg" variant="secondary">View demo</Button></Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-zinc-500">
            {["Private PostgreSQL", "Infrastructure as Code", "Automated deployment"].map((item) => (
              <span className="flex items-center gap-2" key={item}><CheckCircle2 size={16} className="text-emerald-600" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-3 shadow-2xl dark:border-zinc-800">
            <div className="rounded-2xl bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-zinc-500">Live operations</p><p className="mt-1 text-2xl font-semibold text-white">1,284 deliveries</p></div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">98.4% on time</span>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3">
                {[["In transit", "146"], ["Assigned", "78"], ["Exceptions", "12"]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <p className="text-xs text-zinc-500">{label}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-52 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="relative h-full overflow-hidden rounded-lg bg-[radial-gradient(circle_at_20%_30%,#064e3b_0,transparent_25%),radial-gradient(circle_at_80%_60%,#065f46_0,transparent_25%)]">
                  <div className="absolute left-[18%] top-[28%] size-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <div className="absolute left-[49%] top-[48%] size-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                  <div className="absolute right-[16%] top-[60%] size-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <svg className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M70 60 C150 50, 160 120, 250 100 S350 130, 430 110" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-y border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-sm font-semibold text-emerald-600">Unified platform</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Built for dispatchers, managers, drivers and administrators.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon /></span>
                <h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600">Production architecture</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Public entry point. Private application tiers.</h2>
            <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-300">Azure Application Gateway terminates HTTPS and routes traffic to a private web tier. The web tier proxies API requests to a private app tier, and only that app tier can reach PostgreSQL.</p>
          </div>
          <div className="grid gap-3 text-sm">
            {architecture.map(({ icon: Icon, label }, index) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                <span className="grid size-10 place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-800"><Icon size={19} /></span>
                <div className="flex-1 font-medium">{label}</div><span className="text-xs text-zinc-400">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between"><Logo /><p>Portfolio reference implementation · 2026</p></div>
      </footer>
    </main>
  );
}
