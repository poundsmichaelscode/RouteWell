"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useAuth } from "./auth-provider";
import { PageHeader } from "./page-header";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { api, apiMessage } from "@/lib/api";
import { formatDate, titleCase } from "@/lib/utils";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "datetime-local" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

type Props<T extends { id: string; createdAt?: string }> = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  columns: { key: string; label: string; render?: (item: T) => ReactNode }[];
};

function valueAt(item: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[part];
  }, item);
}

function inputValue(value: unknown, type?: Field["type"]): string | number {
  if (value === null || value === undefined) return "";
  if (type === "date") return new Date(String(value)).toISOString().slice(0, 10);
  if (type === "datetime-local") return new Date(String(value)).toISOString().slice(0, 16);
  return typeof value === "number" ? value : String(value);
}

function payloadFromForm(form: HTMLFormElement, fields: Field[]): Record<string, unknown> {
  const formData = new FormData(form);
  return Object.fromEntries(
    fields.map((field) => {
      const raw = formData.get(field.name);
      if (raw === null || raw === "") return [field.name, undefined];
      if (field.type === "number") return [field.name, Number(raw)];
      return [field.name, raw];
    })
  );
}

export function ResourcePage<T extends { id: string; createdAt?: string }>({
  title,
  description,
  endpoint,
  fields,
  columns
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canWrite = user ? ["ADMIN", "MANAGER", "DISPATCHER"].includes(user.role) : false;
  const canDelete = user ? ["ADMIN", "MANAGER"].includes(user.role) : false;

  const query = useQuery({
    queryKey: [endpoint, search],
    queryFn: async () => {
      const { data } = await api.get<{ data: T[] }>(endpoint, {
        params: { page: 1, limit: 50, search: search || undefined }
      });
      return data.data;
    }
  });

  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const payload = payloadFromForm(form, fields);
      return editing
        ? api.patch(`${endpoint}/${editing.id}`, payload)
        : api.post(endpoint, payload);
    },
    onSuccess: async () => {
      setOpen(false);
      setEditing(null);
      setError("");
      await queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (mutationError) => setError(apiMessage(mutationError))
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${endpoint}/${id}`),
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (mutationError) => setError(apiMessage(mutationError))
  });

  const openCreate = () => {
    setEditing(null);
    setError("");
    setOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setError("");
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          canWrite ? (
            <Button onClick={openCreate}>
              <Plus size={17} /> Add {title.replace(/s$/, "")}
            </Button>
          ) : undefined
        }
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
            placeholder={`Search ${title.toLowerCase()}…`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">{column.label}</th>
                ))}
                <th className="px-4 py-3">Created</th>
                {(canWrite || canDelete) && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr><td colSpan={columns.length + 2} className="p-8 text-center">Loading…</td></tr>
              ) : query.isError ? (
                <tr><td colSpan={columns.length + 2} className="p-8 text-center text-red-600">{apiMessage(query.error)}</td></tr>
              ) : query.data?.length === 0 ? (
                <tr><td colSpan={columns.length + 2} className="p-8 text-center text-zinc-500">No records found.</td></tr>
              ) : (
                query.data?.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    {columns.map((column) => {
                      const value = valueAt(item, column.key);
                      const showBadge = typeof value === "string" && ["status", "priority", "type", "role"].includes(column.key);
                      return (
                        <td key={column.key} className="whitespace-nowrap px-4 py-3">
                          {column.render ? column.render(item) : showBadge ? <Badge value={value} /> : String(value ?? "—")}
                        </td>
                      );
                    })}
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{formatDate(item.createdAt)}</td>
                    {(canWrite || canDelete) && (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {canWrite && (
                          <Button variant="ghost" size="sm" aria-label="Edit" onClick={() => openEdit(item)}>
                            <Pencil size={16} />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Delete"
                            onClick={() => window.confirm("Delete this record?") && remove.mutate(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
          <Card className="my-6 w-full max-w-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2 className="font-semibold">{editing ? "Edit" : "Create"} {title.replace(/s$/, "")}</h2>
                <p className="text-sm text-zinc-500">Enter the required operational details.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X size={18} /></Button>
            </div>
            <form
              className="grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate(event.currentTarget);
              }}
            >
              {fields.map((field) => (
                <label key={field.name} className={field.name.toLowerCase().includes("address") ? "sm:col-span-2" : ""}>
                  <span className="mb-1.5 block text-sm font-medium">{field.label}</span>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      required={field.required}
                      defaultValue={inputValue(editing ? valueAt(editing, field.name) : undefined, field.type)}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      {field.options?.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}
                    </select>
                  ) : (
                    <Input
                      name={field.name}
                      type={field.type || "text"}
                      required={field.required}
                      placeholder={field.placeholder}
                      defaultValue={inputValue(editing ? valueAt(editing, field.name) : undefined, field.type)}
                      step={field.type === "number" ? "any" : undefined}
                    />
                  )}
                </label>
              ))}
              {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
