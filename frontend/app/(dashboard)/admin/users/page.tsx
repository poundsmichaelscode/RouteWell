"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, apiMessage } from "@/lib/api";
import type { ApiList, Role, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const roles: Role[] = ["ADMIN", "MANAGER", "DISPATCHER", "DRIVER", "VIEWER"];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const response = await api.get<ApiList<User>>("/users", { params: { page: 1, limit: 100, search: search || undefined } });
      return response.data.data;
    }
  });
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<User, "role" | "active">> }) => api.patch(`/users/${id}`, data),
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (mutationError) => setError(apiMessage(mutationError))
  });

  return (
    <>
      <PageHeader title="User administration" description="Assign roles and suspend access without deleting audit history." />
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      <Card>
        <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <Search size={17} className="text-zinc-400" />
          <Input className="border-0 bg-transparent focus:ring-0" placeholder="Search users…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Created</th></tr>
            </thead>
            <tbody>
              {users.isLoading && <tr><td colSpan={4} className="p-8 text-center">Loading…</td></tr>}
              {users.isError && <tr><td colSpan={4} className="p-8 text-center text-red-600">{apiMessage(users.error)}</td></tr>}
              {users.data?.map((user) => (
                <tr key={user.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck size={17} /></span><div><p className="font-medium">{user.firstName} {user.lastName}</p><p className="text-xs text-zinc-500">{user.email}</p></div></div></td>
                  <td className="px-4 py-3"><select aria-label={`Role for ${user.email}`} value={user.role} disabled={updateUser.isPending} onChange={(event) => updateUser.mutate({ id: user.id, data: { role: event.target.value as Role } })} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">{roles.map((role) => <option key={role}>{role}</option>)}</select></td>
                  <td className="px-4 py-3"><button type="button" disabled={updateUser.isPending} onClick={() => updateUser.mutate({ id: user.id, data: { active: !user.active } })} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Badge value={user.active ? "ACTIVE" : "SUSPENDED"} /></button></td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {users.data?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
