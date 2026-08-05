import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = [
  "connection",
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

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;
  const target = new URL(
    `/api/v1/${path.join("/")}`,
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"
  );
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) headers.delete(header);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(30_000)
    });

    const responseHeaders = new Headers(upstream.headers);
    for (const header of HOP_BY_HOP_HEADERS) responseHeaders.delete(header);

    const cookieHeaders = upstream.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies = cookieHeaders.getSetCookie?.() ?? [];
    responseHeaders.delete("set-cookie");

    if (setCookies.length > 0) {
      for (const value of setCookies) responseHeaders.append("set-cookie", value);
    } else {
      const fallback = upstream.headers.get("set-cookie");
      if (fallback) responseHeaders.append("set-cookie", fallback);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "The RouteWell API is temporarily unavailable"
        }
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
