"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Search, Trash2, X } from "lucide-react";
import { DeliveryForm } from "@/components/delivery-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { api, apiMessage } from "@/lib/api";
import type { Delivery } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";

type DeliveryEvent = {
  id: string;
  status: string;
  note?: string;
  latitude?: string | number;
  longitude?: string | number;
  createdAt: string;
};

type DeliveryDetail = Delivery & { events: DeliveryEvent[] };

const transitions: Record<string, string[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "FAILED"],
  IN_TRANSIT: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["ASSIGNED", "CANCELLED"],
  CANCELLED: []
};

export default function DeliveriesPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canEdit = user ? ["ADMIN", "MANAGER", "DISPATCHER"].includes(user.role) : false;
  const canDelete = user ? ["ADMIN", "MANAGER"].includes(user.role) : false;
  const canUpdateStatus = user ? ["ADMIN", "MANAGER", "DISPATCHER", "DRIVER"].includes(user.role) : false;
  const statusOptions = (status: string) =>
    (transitions[status] ?? []).filter(
      (next) => user?.role !== "DRIVER" || ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"].includes(next)
    );

  const deliveries = useQuery({
    queryKey: ["deliveries", search],
    queryFn: async () => {
      const { data } = await api.get<{ data: Delivery[] }>("/deliveries", {
        params: { page: 1, limit: 50, search: search || undefined }
      });
      return data.data;
    }
  });

  const detail = useQuery({
    queryKey: ["delivery", selectedId],
    enabled: Boolean(selectedId),
    queryFn: async () => {
      const { data } = await api.get<{ data: DeliveryDetail }>(`/deliveries/${selectedId}`);
      return data.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/deliveries/${id}/status`, { status, note: `Status changed to ${titleCase(status)}` }),
    onSuccess: async () => {
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        queryClient.invalidateQueries({ queryKey: ["delivery"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
      ]);
    },
    onError: (mutationError) => setError(apiMessage(mutationError))
  });

  const removeDelivery = useMutation({
    mutationFn: (id: string) => api.delete(`/deliveries/${id}`),
    onSuccess: async () => {
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (mutationError) => setError(apiMessage(mutationError))
  });

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Create, assign, search and track delivery work."
        action={<DeliveryForm />}
      />

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <Card>
        <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <Search size={17} className="text-zinc-400" />
          <Input
            className="border-0 bg-transparent focus:ring-0"
            placeholder="Tracking number, customer or address…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950">
              <tr>
                {[
                  "Tracking",
                  "Customer",
                  "Status",
                  "Priority",
                  "Driver",
                  "Scheduled",
                  "Actions"
                ].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {deliveries.isLoading ? (
                <tr><td className="p-8" colSpan={7}>Loading…</td></tr>
              ) : deliveries.isError ? (
                <tr><td className="p-8 text-red-600" colSpan={7}>{apiMessage(deliveries.error)}</td></tr>
              ) : deliveries.data?.length === 0 ? (
                <tr><td className="p-8 text-center text-zinc-500" colSpan={7}>No deliveries found.</td></tr>
              ) : (
                deliveries.data?.map((delivery) => (
                  <tr key={delivery.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3 font-medium">{delivery.trackingNumber}</td>
                    <td className="px-4 py-3">{delivery.customer.name}</td>
                    <td className="px-4 py-3"><Badge value={delivery.status} /></td>
                    <td className="px-4 py-3"><Badge value={delivery.priority} /></td>
                    <td className="px-4 py-3">
                      {delivery.driver ? `${delivery.driver.firstName} ${delivery.driver.lastName}` : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">{formatDate(delivery.scheduledAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedId(delivery.id)}>
                        <Eye size={16} /> View
                      </Button>
                      {canEdit && (
                        <DeliveryForm
                          delivery={delivery}
                          trigger={<Button variant="ghost" size="sm"><Pencil size={16} /> Edit</Button>}
                        />
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={removeDelivery.isPending}
                          onClick={() => {
                            if (window.confirm(`Delete ${delivery.trackingNumber}? This action cannot be undone.`)) {
                              removeDelivery.mutate(delivery.id);
                            }
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      )}
                      {canUpdateStatus && statusOptions(delivery.status).length > 0 && (
                        <select
                          aria-label={`Update ${delivery.trackingNumber} status`}
                          defaultValue=""
                          disabled={updateStatus.isPending}
                          className="ml-2 h-9 rounded-lg border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                          onChange={(event) => {
                            const status = event.target.value;
                            if (status) updateStatus.mutate({ id: delivery.id, status });
                            event.currentTarget.value = "";
                          }}
                        >
                          <option value="">Change status…</option>
                          {statusOptions(delivery.status).map((status) => (
                              <option key={status} value={status}>{titleCase(status)}</option>
                            ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedId && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
          <Card className="my-6 w-full max-w-2xl">
            <CardHeader className="flex flex-row items-start justify-between border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold">Delivery tracking</h2>
                <p className="text-sm text-zinc-500">Status history and assignment details.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} aria-label="Close">
                <X size={18} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              {detail.isLoading && <p>Loading delivery history…</p>}
              {detail.isError && <p className="text-red-600">{apiMessage(detail.error)}</p>}
              {detail.data && (
                <>
                  <div className="grid gap-3 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950 sm:grid-cols-2">
                    <p><span className="text-zinc-500">Tracking:</span> <strong>{detail.data.trackingNumber}</strong></p>
                    <p><span className="text-zinc-500">Status:</span> <Badge value={detail.data.status} /></p>
                    <p><span className="text-zinc-500">Customer:</span> {detail.data.customer.name}</p>
                    <p><span className="text-zinc-500">Scheduled:</span> {formatDate(detail.data.scheduledAt)}</p>
                    <p className="sm:col-span-2"><span className="text-zinc-500">Route:</span> {detail.data.pickupAddress} → {detail.data.deliveryAddress}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Timeline</h3>
                    <div className="mt-3 space-y-3">
                      {detail.data.events.map((event) => (
                        <div key={event.id} className="border-l-2 border-emerald-500 pl-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Badge value={event.status} />
                            <span className="text-xs text-zinc-500">{formatDate(event.createdAt)}</span>
                          </div>
                          {event.note && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{event.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
