"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Database, MemoryStick, Server } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api, apiMessage } from "@/lib/api";

type SystemStatus = {
  status: string;
  uptimeSeconds: number;
  nodeVersion: string;
  memory: { rss: number; heapUsed: number };
  dependencies: { database: { status: string; latencyMs: number }; redis: { status: string; latencyMs: number } };
  timestamp: string;
};

function megabytes(bytes: number) { return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }

export default function SystemPage() {
  const query = useQuery({ queryKey: ["system-status"], queryFn: async () => (await api.get<{ data: SystemStatus }>("/dashboard/system")).data.data, refetchInterval: 30_000 });
  if (query.isLoading) return <p>Loading system status…</p>;
  if (query.isError) return <p className="text-red-600">{apiMessage(query.error)}</p>;
  const data = query.data!;
  const cards = [
    { label: "API uptime", value: `${Math.floor(data.uptimeSeconds / 60)} min`, icon: Activity },
    { label: "Runtime", value: data.nodeVersion, icon: Server },
    { label: "Memory RSS", value: megabytes(data.memory.rss), icon: MemoryStick },
    { label: "Heap used", value: megabytes(data.memory.heapUsed), icon: Database }
  ];
  return <><PageHeader title="System monitoring" description="Live application dependency and process health. Refreshes every 30 seconds." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="p-5"><Icon size={20} className="text-emerald-600" /><p className="mt-4 text-sm text-zinc-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardContent></Card>)}</div><Card className="mt-5"><CardContent className="grid gap-4 p-5 sm:grid-cols-2"><div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><div className="flex items-center justify-between"><strong>PostgreSQL</strong><Badge value={data.dependencies.database.status.toUpperCase()} /></div><p className="mt-2 text-sm text-zinc-500">Latency: {data.dependencies.database.latencyMs} ms</p></div><div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><div className="flex items-center justify-between"><strong>Redis</strong><Badge value={data.dependencies.redis.status.toUpperCase()} /></div><p className="mt-2 text-sm text-zinc-500">Latency: {data.dependencies.redis.latencyMs} ms</p></div></CardContent></Card></>;
}
