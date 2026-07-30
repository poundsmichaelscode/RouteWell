export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const target = new URL("/api-docs.json", process.env.BACKEND_INTERNAL_URL || "http://localhost:8080");
  const upstream = await fetch(target, { cache: "no-store" });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") || "application/json" }
  });
}
