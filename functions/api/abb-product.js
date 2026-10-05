export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return Response.json(
      { error: "Missing product barcode" },
      { status: 400 }
    );
  }

  const apiUrl =
    `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(code)}.json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "AskBeforeBuy/1.0 (Cloudflare Pages)"
      }
    });

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    return Response.json(
      { error: "Unable to reach product database" },
      { status: 502 }
    );
  }
}
