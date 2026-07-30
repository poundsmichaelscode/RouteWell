"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>console.error(error),[error]);return <main className="grid min-h-screen place-items-center p-5 text-center"><div><p className="text-sm font-semibold text-red-600">Application error</p><h1 className="mt-3 text-3xl font-bold">Something went wrong</h1><p className="mt-3 max-w-md text-zinc-500">Request ID or error digest: {error.digest||"not available"}</p><Button className="mt-6" onClick={reset}>Try again</Button></div></main>}
