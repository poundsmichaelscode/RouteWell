export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const backendUrl = new URL(
    "/health/ready",
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"
  );

  try {
    const upstream = await fetch(backendUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000)
    });
    const dependencies = await upstream.json().catch(() => ({ status: "unknown" }));

    return Response.json(
      {
        status: upstream.ok ? "ready" : "not-ready",
        service: "routewell-web",
        backend: dependencies
      },
      { status: upstream.ok ? 200 : 503 }
    );
  } catch {
    return Response.json(
      {
        status: "not-ready",
        service: "routewell-web",
        backend: { status: "unavailable" }
      },
      { status: 503 }
    );
  }
}
