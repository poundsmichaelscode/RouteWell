"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { DeliveryForm } from "@/components/delivery-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, apiMessage } from "@/lib/api";
import type { Delivery } from "@/lib/types";
import { formatDate } from "@/lib/utils";
export default function Deliveries(){const [search,setSearch]=useState("");const query=useQuery({queryKey:["deliveries",search],queryFn:async()=>{const{data}=await api.get<{data:Delivery[]}>("/deliveries",{params:{page:1,limit:50,search:search||undefined}});return data.data}});return <><PageHeader title="Deliveries" description="Create, assign, search and track delivery work." action={<DeliveryForm/>}/><Card><div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800"><Search size={17}/><Input className="border-0 bg-transparent focus:ring-0" placeholder="Tracking number, customer or address…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950"><tr>{["Tracking","Customer","Status","Priority","Driver","Scheduled"].map(x=><th className="px-4 py-3" key={x}>{x}</th>)}</tr></thead><tbody>{query.isLoading?<tr><td className="p-8" colSpan={6}>Loading…</td></tr>:query.isError?<tr><td className="p-8 text-red-600" colSpan={6}>{apiMessage(query.error)}</td></tr>:query.data?.map(d=><tr key={d.id} className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-4 py-3 font-medium">{d.trackingNumber}</td><td className="px-4 py-3">{d.customer.name}</td><td className="px-4 py-3"><Badge value={d.status}/></td><td className="px-4 py-3"><Badge value={d.priority}/></td><td className="px-4 py-3">{d.driver?`${d.driver.firstName} ${d.driver.lastName}`:"Unassigned"}</td><td className="px-4 py-3">{formatDate(d.scheduledAt)}</td></tr>)}</tbody></table></div></Card></>}
