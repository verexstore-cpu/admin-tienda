export async function onRequest(context) {
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });
    }
    if (context.request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    try {
        const body = await context.request.json();
        if (!body || !body.prods) {
            return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers });
        }

        const rawId = body.customId
            ? String(body.customId).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
            : null;
        const id = rawId || Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(36).padStart(2, "0"))
            .join("")
            .slice(0, 6);

        await context.env.CATALOGS.put(id, JSON.stringify(body), {
            expirationTtl: 60 * 60 * 24 * 30, // 30 days
        });

        return new Response(JSON.stringify({ url: "/c/" + id }), { headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
