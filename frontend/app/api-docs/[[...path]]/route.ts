import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STRIPPED_HEADERS = [
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
): Promise<Response> {
  const { path = [] } = await params;
  const pathname = `/api-docs${path.length > 0 ? `/${path.join("/")}` : ""}`;
  const target = new URL(
    pathname,
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"
  );
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const header of STRIPPED_HEADERS) headers.delete(header);

  try {
    const upstream = await fetch(target, {
      headers,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000)
    });
    const responseHeaders = new Headers(upstream.headers);
    for (const header of STRIPPED_HEADERS) responseHeaders.delete(header);

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch {
    return new Response("RouteWell API documentation is temporarily unavailable", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}
