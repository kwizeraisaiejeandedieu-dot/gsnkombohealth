// Netlify Function: /.netlify/functions/health-chat
// Configure OPENROUTER_API_KEY in Netlify Environment Variables.
// Never put the API key in frontend HTML or JavaScript.

export default async (request) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...headers, Allow: "POST" }
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "Server setup incomplete: add OPENROUTER_API_KEY in Netlify Environment Variables."
    }), { status: 500, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400, headers
    });
  }

  if (!Array.isArray(body.messages) || !body.messages.length) {
    return new Response(JSON.stringify({ error: "Please send a health question." }), {
      status: 400, headers
    });
  }

  if (JSON.stringify(body).length > 14 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "Request too large. Please use a smaller image." }), {
      status: 413, headers
    });
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://johnhealth.netlify.app",
        "X-Title": "JOHN HEALTH"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: body.messages,
        max_tokens: Math.min(Number(body.max_tokens) || 1000, 1500),
        temperature: 0.3
      })
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return new Response(JSON.stringify({
        error: result?.error?.message || `AI provider error (${upstream.status}).`
      }), { status: upstream.status, headers });
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({
      error: "Could not connect to the AI provider. Please try again."
    }), { status: 502, headers });
  }
};
