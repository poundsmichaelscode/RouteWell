"use client";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/utils";
export default function Reports(){const query=useQuery({queryKey:["reports"],queryFn:async()=>{const{data}=await api.get<{data:{status:string;_count:{status:number};_avg:{weightKg:string|null}}[]}>("/dashboard/reports/deliveries");return data.data}});const download=()=>{const blob=new Blob([JSON.stringify(query.data??[],null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`routewell-report-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url)};return <><PageHeader title="Reports" description="Generate operational delivery summaries for analysis." action={<Button variant="secondary" onClick={download}><Download size={17}/>Export JSON</Button>}/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{query.data?.map(row=><Card key={row.status}><CardContent className="p-5"><p className="text-sm text-zinc-500">{titleCase(row.status)}</p><p className="mt-2 text-3xl font-bold">{row._count.status}</p><p className="mt-2 text-xs text-zinc-500">Average weight: {row._avg.weightKg??"—"} kg</p></CardContent></Card>)}</div></>}
