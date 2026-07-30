"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiMessage } from "@/lib/api";

const schema = z.object({ firstName: z.string().min(2).max(50), lastName: z.string().min(2).max(50) });
type Values = z.infer<typeof schema>;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), values: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" } });

  return (
    <>
      <PageHeader title="Profile" description="Manage your account identity and review your access level." />
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="grid size-16 place-items-center rounded-2xl bg-emerald-600 text-xl font-bold text-white">{user?.firstName[0]}{user?.lastName[0]}</div>
          <h2 className="mt-5 text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
          <p className="text-zinc-500">{user?.email}</p>
          {user && <div className="mt-4"><Badge value={user.role} /></div>}
          <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(async (values) => {
            try { setError(""); await updateProfile(values); setMessage("Profile updated successfully."); }
            catch (updateError) { setMessage(""); setError(apiMessage(updateError)); }
          })}>
            <label><span className="mb-1.5 block text-sm font-medium">First name</span><Input {...form.register("firstName")} /></label>
            <label><span className="mb-1.5 block text-sm font-medium">Last name</span><Input {...form.register("lastName")} /></label>
            {message && <p className="text-sm text-emerald-600 sm:col-span-2">{message}</p>}
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save profile"}</Button></div>
          </form>
          <div className="mt-8 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">Administrative role changes remain separated from self-service profile updates. Add verified email-change and password-reset flows through your transactional email provider before a public commercial launch.</div>
        </CardContent>
      </Card>
    </>
  );
}
