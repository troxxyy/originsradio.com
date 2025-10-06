addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type, Authorization",
  "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range",
  "Access-Control-Max-Age": "86400",
};

async function handleRequest(request) {
  const { method } = request;
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target) {
    return new Response("Missing `url` query parameter", { status: 400, headers: CORS_HEADERS });
  }

  try {
    // Validate target is a proper URL, but allow any host
    new URL(target);
  } catch {
    return new Response("Invalid target URL", { status: 400, headers: CORS_HEADERS });
  }

  const passthroughHeaders = new Headers();
  for (const [k, v] of request.headers.entries()) {
    const name = k.toLowerCase();
    if (name === "range" || name === "authorization") {
      passthroughHeaders.set(k, v);
    }
  }

  let upstream;
  try {
    upstream = await fetch(new Request(target, { method, headers: passthroughHeaders, redirect: "follow" }));
  } catch (err) {
    return new Response("Fetch failed: " + err.toString(), { status: 502, headers: CORS_HEADERS });
  }

  const newHeaders = new Headers(upstream.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) newHeaders.set(k, v);
  if (!newHeaders.has("Accept-Ranges")) newHeaders.set("Accept-Ranges", "bytes");

  return new Response(method === "HEAD" ? null : upstream.body, { status: upstream.status, headers: newHeaders });
}


