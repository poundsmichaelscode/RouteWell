"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Car,
  Contact,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Truck,
  X,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Array<"ADMIN" | "MANAGER" | "DISPATCHER" | "DRIVER" | "VIEWER">;
};

const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/deliveries", label: "Deliveries", icon: Package },
  { href: "/customers", label: "Customers", icon: Contact, roles: ["ADMIN", "MANAGER", "DISPATCHER", "VIEWER"] },
  { href: "/drivers", label: "Drivers", icon: Truck, roles: ["ADMIN", "MANAGER", "DISPATCHER", "VIEWER"] },
  { href: "/vehicles", label: "Vehicles", icon: Car, roles: ["ADMIN", "MANAGER", "DISPATCHER", "VIEWER"] },
  { href: "/routes", label: "Routes", icon: Map, roles: ["ADMIN", "MANAGER", "DISPATCHER", "VIEWER"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER", "DISPATCHER", "VIEWER"] },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: Settings },
  { href: "/admin/users", label: "Administration", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/admin/system", label: "System monitoring", icon: Activity, roles: ["ADMIN"] }
];

function NavigationLinks({
  path,
  role,
  onNavigate
}: {
  path: string;
  role: "ADMIN" | "MANAGER" | "DISPATCHER" | "DRIVER" | "VIEWER";
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {navigation
        .filter((item) => !item.roles || item.roles.includes(role))
        .map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              path === href
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
    </nav>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);


  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="size-10 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600" />
      </div>
    );
  }

  const signOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        <Logo />
        <div className="mt-8">
          <NavigationLinks path={path} role={user.role} />
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(20rem,88vw)] overflow-y-auto bg-white p-4 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <Logo />
              <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={19} />
              </Button>
            </div>
            <div className="mt-8">
              <NavigationLinks path={path} role={user.role} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="mt-8 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
              <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
              <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}>
                <LogOut size={16} /> Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </Button>
            <Logo />
          </div>
          <div className="hidden items-center gap-2 text-sm text-zinc-500 lg:flex">
            <Boxes size={16} /> Operations workspace
          </div>
          <ThemeToggle />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
