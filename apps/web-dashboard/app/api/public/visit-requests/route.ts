export async function POST(request: Request) {
  const gatewayApiUrl = process.env.GATEWAY_API_URL ?? "http://localhost:3001/api";
  const baseUrl = gatewayApiUrl.replace(/\/+$/, "");
  const body = await request.text();
  try {
    const response = await fetch(`${baseUrl}/public/visit-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return Response.json(
      { message: "The visit request gateway is unavailable" },
      { status: 502 },
    );
  }
}
