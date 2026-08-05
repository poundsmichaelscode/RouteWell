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
  email: z.string().email(),
  password: z.string().min(1)
});

type Values = z.infer<typeof schema>;
const registrationEnabled = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION !== "false";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Sign in to your logistics operations workspace.
      </p>

      <form
        className="mt-7 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            setError("");
            await login(values.email, values.password);
            router.push("/dashboard");
          } catch (loginError) {
            setError(apiMessage(loginError));
          }
        })}
      >
        <label>
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <Input type="email" autoComplete="email" {...register("email")} />
          <span className="text-xs text-red-600">{errors.email?.message}</span>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <Input
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          <span className="text-xs text-red-600">{errors.password?.message}</span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        {registrationEnabled ? (
          <>
            New to RouteWell?{" "}
            <Link href="/register" className="font-medium text-emerald-600">
              Create account
            </Link>
          </>
        ) : (
          "Access is managed by your RouteWell administrator."
        )}
      </p>
    </Card>
  );
}
