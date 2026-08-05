import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

function cookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`))?.split("=").slice(1).join("=");
}

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1", withCredentials: true, timeout: 15000 });
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase();
  if (method && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = cookie("csrfToken");
    if (csrf) config.headers.set("x-csrf-token", decodeURIComponent(csrf));
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;
api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const terminalAuthPath = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]
    .some((path) => original?.url?.includes(path));
  if (error.response?.status === 401 && original && !original._retried && !terminalAuthPath) {
    original._retried = true;
    refreshPromise ??= api.post("/auth/refresh").then(() => undefined).finally(() => { refreshPromise = null; });
    await refreshPromise;
    return api(original);
  }
  return Promise.reject(error);
});

export function apiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message || error.message;
  return error instanceof Error ? error.message : "Something went wrong";
}
