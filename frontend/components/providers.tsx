"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
export function Providers({ children }: { children: ReactNode }) { const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 }, mutations: { retry: 0 } } })); return <ThemeProvider attribute="class" defaultTheme="system" enableSystem><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider></ThemeProvider>; }
