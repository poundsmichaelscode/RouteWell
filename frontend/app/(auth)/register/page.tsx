"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiMessage } from "@/lib/api";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(12).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/)
});

type Values = z.infer<typeof schema>;
const registrationEnabled = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION !== "false";

export default function RegisterPage() {
  const router = useRouter();
  const { register: signUp } = useAuth();
  const [error, setError] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  if (!registrationEnabled) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <h1 className="text-2xl font-bold">Registration is disabled</h1>
        <p className="mt-3 text-sm text-zinc-500">
          Ask your RouteWell administrator to provision or activate your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Return to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Create your workspace</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Start managing logistics operations securely.
      </p>

      <form
        className="mt-7 grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            setError("");
            await signUp(values);
            router.push("/dashboard");
          } catch (registrationError) {
            setError(apiMessage(registrationError));
          }
        })}
      >
        <label>
          <span className="mb-1.5 block text-sm font-medium">First name</span>
          <Input autoComplete="given-name" {...form.register("firstName")} />
          <span className="text-xs text-red-600">
            {form.formState.errors.firstName?.message}
          </span>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium">Last name</span>
          <Input autoComplete="family-name" {...form.register("lastName")} />
          <span className="text-xs text-red-600">
            {form.formState.errors.lastName?.message}
          </span>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <Input type="email" autoComplete="email" {...form.register("email")} />
          <span className="text-xs text-red-600">
            {form.formState.errors.email?.message}
          </span>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <Input
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          <span className="mt-1 block text-xs text-zinc-500">
            12+ characters with uppercase, lowercase and a number.
          </span>
          <span className="text-xs text-red-600">
            {form.formState.errors.password?.message}
          </span>
        </label>

        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

        <Button
          className="sm:col-span-2"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-emerald-600">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
