"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, X } from "lucide-react";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { api, apiMessage } from "@/lib/api";
import type { Customer, Delivery, Driver, Route, Vehicle } from "@/lib/types";

type LookupData = {
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  routes: Route[];
};

type Props = {
  delivery?: Delivery;
  trigger?: ReactNode;
};

async function loadLookups(): Promise<LookupData> {
  const params = { page: 1, limit: 100 };
  const [customers, drivers, vehicles, routes] = await Promise.all([
    api.get<{ data: Customer[] }>("/customers", { params }),
    api.get<{ data: Driver[] }>("/drivers", { params }),
    api.get<{ data: Vehicle[] }>("/vehicles", { params }),
    api.get<{ data: Route[] }>("/routes", { params })
  ]);
  return {
    customers: customers.data.data,
    drivers: drivers.data.data,
    vehicles: vehicles.data.data,
    routes: routes.data.data
  };
}

function localDateTime(value?: string): string {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function DeliveryForm({ delivery, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWrite = user ? ["ADMIN", "MANAGER", "DISPATCHER"].includes(user.role) : false;
  const editing = Boolean(delivery);

  const lookups = useQuery({
    queryKey: ["delivery-lookups"],
    queryFn: loadLookups,
    enabled: open
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      delivery
        ? api.patch(`/deliveries/${delivery.id}`, payload)
        : api.post("/deliveries", payload),
    onSuccess: async () => {
      setOpen(false);
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        queryClient.invalidateQueries({ queryKey: ["delivery"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (mutationError) => setError(apiMessage(mutationError))
  });

  if (!canWrite) return null;

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button><Plus size={17} /> Create delivery</Button>
        )}
      </span>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
          <Card className="my-6 w-full max-w-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2 className="font-semibold">{editing ? "Edit delivery" : "Create delivery"}</h2>
                <p className="text-sm text-zinc-500">Assign operational resources and schedule the job.</p>
              </div>
              <Button variant="ghost" onClick={() => setOpen(false)} aria-label="Close"><X /></Button>
            </div>

            {lookups.isLoading ? (
              <p className="p-6">Loading customers and fleet resources…</p>
            ) : lookups.isError ? (
              <p className="p-6 text-red-600">{apiMessage(lookups.error)}</p>
            ) : (
              <form
                className="grid gap-4 p-5 sm:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const optional = (name: string) => {
                    const value = formData.get(name);
                    return value ? String(value) : undefined;
                  };
                  const nullableRelation = (name: string) => optional(name) ?? (editing ? null : undefined);
                  mutation.mutate({
                    customerId: String(formData.get("customerId")),
                    driverId: nullableRelation("driverId"),
                    vehicleId: nullableRelation("vehicleId"),
                    routeId: nullableRelation("routeId"),
                    pickupAddress: String(formData.get("pickupAddress")),
                    deliveryAddress: String(formData.get("deliveryAddress")),
                    scheduledAt: new Date(String(formData.get("scheduledAt"))).toISOString(),
                    priority: String(formData.get("priority")),
                    weightKg: optional("weightKg") ? Number(formData.get("weightKg")) : editing ? null : undefined,
                    notes: optional("notes") ?? (editing ? null : undefined)
                  });
                }}
              >
                <label>
                  <span className="mb-1 block text-sm font-medium">Customer</span>
                  <select name="customerId" required defaultValue={delivery?.customerId ?? ""} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="">Select customer</option>
                    {lookups.data?.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Scheduled at</span>
                  <Input name="scheduledAt" type="datetime-local" defaultValue={localDateTime(delivery?.scheduledAt)} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Driver</span>
                  <select name="driverId" defaultValue={delivery?.driverId ?? ""} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="">Unassigned</option>
                    {lookups.data?.drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName} · {driver.status}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Vehicle</span>
                  <select name="vehicleId" defaultValue={delivery?.vehicleId ?? ""} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="">Unassigned</option>
                    {lookups.data?.vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber} · {vehicle.type}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Route</span>
                  <select name="routeId" defaultValue={delivery?.routeId ?? ""} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="">Custom route</option>
                    {lookups.data?.routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Weight (kg)</span>
                  <Input name="weightKg" type="number" min="0" step="0.1" defaultValue={delivery?.weightKg ?? ""} />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Pickup address</span>
                  <Input name="pickupAddress" defaultValue={delivery?.pickupAddress} required />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Delivery address</span>
                  <Input name="deliveryAddress" defaultValue={delivery?.deliveryAddress} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Priority</span>
                  <select name="priority" defaultValue={delivery?.priority ?? "NORMAL"} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Notes</span>
                  <Input name="notes" defaultValue={delivery?.notes ?? ""} />
                </label>
                {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving…" : editing ? <><Pencil size={16} /> Save changes</> : "Create delivery"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
