"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, apiMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Notification = { id: string; title: string; message: string; readAt: string | null; createdAt: string };

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get<{ data: Notification[] }>("/notifications")).data.data });
  const markRead = useMutation({ mutationFn: (id: string) => api.patch(`/notifications/${id}/read`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const markAll = useMutation({ mutationFn: () => api.patch("/notifications/read-all"), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const unread = query.data?.filter((item) => !item.readAt).length ?? 0;

  return (
    <>
      <PageHeader title="Notifications" description={`${unread} unread operational update${unread === 1 ? "" : "s"}.`} action={<Button variant="secondary" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck size={17} />Mark all read</Button>} />
      <Card className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {query.isLoading && <p className="p-8 text-center">Loading…</p>}
        {query.isError && <p className="p-8 text-center text-red-600">{apiMessage(query.error)}</p>}
        {query.data?.map((item) => (
          <button key={item.id} type="button" disabled={Boolean(item.readAt) || markRead.isPending} onClick={() => markRead.mutate(item.id)} className="flex w-full items-start gap-4 p-5 text-left hover:bg-zinc-50 disabled:cursor-default dark:hover:bg-zinc-800/40">
            <span className={`mt-1 grid size-10 shrink-0 place-items-center rounded-xl ${item.readAt ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}><Bell size={18} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="text-sm">{item.title}</strong>{!item.readAt && <span className="size-2 rounded-full bg-emerald-500" />}</span><span className="mt-1 block text-sm text-zinc-500">{item.message}</span><span className="mt-2 block text-xs text-zinc-400">{formatDate(item.createdAt)}</span></span>
          </button>
        ))}
        {query.data?.length === 0 && <p className="p-8 text-center text-zinc-500">No notifications yet.</p>}
      </Card>
    </>
  );
}
