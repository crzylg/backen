// Konditor-Rechner CORS-Proxy für Open Food Facts / Open Prices.
//
// Warum das nötig ist: Beide APIs unterstützen kein CORS für
// Browser-Anfragen von einer GitHub-Pages-Domain aus. Dieser Worker leitet
// GET-Anfragen unverändert an die beiden erlaubten Upstream-Domains weiter
// und fügt die nötigen CORS-Header hinzu. Er speichert nichts, verändert
// nichts und lässt nur diese zwei Domains als Ziel zu.
//
// Deployment: siehe README.md in diesem Ordner.

const ALLOWED_ORIGINS = [
  "https://crzylg.github.io",
  "http://localhost:8080",
  "http://localhost:8000",
  "http://127.0.0.1:8080"
];

const UPSTREAMS = {
  "/off/": "https://world.openfoodfacts.org/",
  "/prices/": "https://prices.openfoodfacts.org/"
};

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    const url = new URL(request.url);
    const matchedPrefix = Object.keys(UPSTREAMS).find((p) => url.pathname.startsWith(p));
    if (!matchedPrefix) {
      return new Response(
        JSON.stringify({ error: "Unknown path. Use /off/... or /prices/..." }),
        { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const upstreamUrl = UPSTREAMS[matchedPrefix] + url.pathname.slice(matchedPrefix.length) + url.search;

    let upstreamRes;
    try {
      upstreamRes = await fetch(upstreamUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Konditor-Rechner-Proxy/1.0 (+https://crzylg.github.io/backen/)"
        }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Upstream fetch failed", detail: String(err) }),
        { status: 502, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const body = await upstreamRes.text();
    return new Response(body, {
      status: upstreamRes.status,
      headers: {
        ...headers,
        "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json"
      }
    });
  }
};
