import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
export default function AuthLayout({children}:{children:React.ReactNode}){return <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><header className="flex items-center justify-between p-5"><Logo/><ThemeToggle/></header><div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-md place-items-center px-5 pb-16"><div className="w-full">{children}<p className="mt-5 text-center text-xs text-zinc-500">By continuing, you agree to the acceptable-use and privacy terms.</p><p className="mt-2 text-center text-sm"><Link href="/" className="text-emerald-600">Return home</Link></p></div></div></main>}
