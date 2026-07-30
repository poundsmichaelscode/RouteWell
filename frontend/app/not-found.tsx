import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound(){return <main className="grid min-h-screen place-items-center p-5 text-center"><div><p className="text-sm font-semibold text-emerald-600">404</p><h1 className="mt-3 text-4xl font-bold">Page not found</h1><p className="mt-3 text-zinc-500">The RouteWell page you requested does not exist.</p><Link href="/"><Button className="mt-6">Return home</Button></Link></div></main>}
