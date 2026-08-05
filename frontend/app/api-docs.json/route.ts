export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const target = new URL(
    "/api-docs.json",
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"
  );

  try {
    const upstream = await fetch(target, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000)
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json"
      }
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "The RouteWell API documentation is temporarily unavailable"
        }
      },
      { status: 502 }
    );
  }
}
