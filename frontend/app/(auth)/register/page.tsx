"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiMessage } from "@/lib/api";
const schema=z.object({firstName:z.string().min(2),lastName:z.string().min(2),email:z.string().email(),password:z.string().min(12).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/)});type Values=z.infer<typeof schema>;
export default function Register(){const router=useRouter();const {register:signUp}=useAuth();const [error,setError]=useState("");const form=useForm<Values>({resolver:zodResolver(schema)});return <Card className="p-6 sm:p-8"><h1 className="text-2xl font-bold">Create your workspace</h1><p className="mt-2 text-sm text-zinc-500">Start managing logistics operations securely.</p><form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(async v=>{try{setError("");await signUp(v);router.push("/dashboard")}catch(e){setError(apiMessage(e))}})}>{[["firstName","First name"],["lastName","Last name"]].map(([name,label])=><label key={name}><span className="mb-1.5 block text-sm font-medium">{label}</span><Input {...form.register(name as "firstName"|"lastName")}/></label>)}<label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Email</span><Input type="email" {...form.register("email")}/></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Password</span><Input type="password" {...form.register("password")}/><span className="mt-1 block text-xs text-zinc-500">12+ characters with uppercase, lowercase and a number.</span></label>{error&&<p className="text-sm text-red-600 sm:col-span-2">{error}</p>}<Button className="sm:col-span-2" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting?"Creating…":"Create account"}</Button></form><p className="mt-5 text-center text-sm text-zinc-500">Already registered? <Link href="/login" className="font-medium text-emerald-600">Sign in</Link></p></Card>}
