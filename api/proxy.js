export default async function handler(req, res) {
  // CORS (ajuste o origin depois se quiser restringir)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzR5fpSvazf-RzbZjZaDqXJAoMr60s9jFHtNwwK5TWu85PMR9Kg8n9ZYMeq4kZJrZY/exec";

  try {
    // Repassa querystring (ex: ?fn=ping)
    const url = new URL(SCRIPT_URL);
    for (const [k, v] of Object.entries(req.query || {})) {
      if (Array.isArray(v)) v.forEach((vv) => url.searchParams.append(k, vv));
      else if (v !== undefined) url.searchParams.set(k, v);
    }

    // Corpo (para POST)
    const method = req.method || "GET";
    const hasBody = method !== "GET" && method !== "HEAD";
    const body =
      hasBody && req.body
        ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body))
        : undefined;

    const upstream = await fetch(url.toString(), {
      method,
      headers: { "Content-Type": "application/json" },
      body,
      redirect: "follow",
    });

    const text = await upstream.text();

    // Tenta devolver JSON; se não for JSON, devolve texto
    try {
      const json = JSON.parse(text);
      return res.status(upstream.status).json(json);
    } catch {
      return res.status(upstream.status).send(text);
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
}
