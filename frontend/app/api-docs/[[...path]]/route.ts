import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<Response> {
  const { path = [] } = await params;
  const pathname = `/api-docs${path.length > 0 ? `/${path.join("/")}` : ""}`;
  const target = new URL(pathname, process.env.BACKEND_INTERNAL_URL || "http://localhost:8080");
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  const upstream = await fetch(target, { headers, cache: "no-store", redirect: "manual" });
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
