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

    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    try {
        const { ids } = await context.request.json();
        if (!Array.isArray(ids) || !ids.length) {
            return new Response(JSON.stringify({ views: {} }), { headers });
        }

        const results = await Promise.all(
            ids.map(async id => {
                const raw = await context.env.CATALOGS.get("__views__" + id);
                return [id, raw ? JSON.parse(raw) : null];
            })
        );

        const views = Object.fromEntries(results.filter(([, v]) => v !== null));
        return new Response(JSON.stringify({ views }), { headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
