export default async function handler(req, res) {
  // CORS: permita seu GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "https://jessicateodoro90.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const targetBase =
    "https://script.google.com/macros/s/AKfycbzYL9mAH4sf-ZPvgmpI7y8JO64rqWVButEBlcpJrLOnwq0QQF5rUPSpAdbTTyQeDWY/exec";

  // Repassa querystring (?fn=ping etc.)
  const url = new URL(req.url, "https://proxy.local");
  const targetUrl = `${targetBase}${url.search}`;

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : JSON.stringify(req.body ?? {}),
    redirect: "follow",
  });

  const text = await upstream.text();
  return res.status(upstream.status).send(text);
}
