import Link from "next/link";
import { Route } from "lucide-react";
export function Logo(){return <Link href="/" className="flex items-center gap-2 font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white"><Route size={20}/></span><span>RouteWell</span></Link>}
