export async function onRequest(context) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
    };
    if (context.request.method === "OPTIONS") return new Response(null, { headers });
    if (context.request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

    try {
        // Listar todas las llaves del historial permanente
        const list = await context.env.CATALOGS.list({ prefix: "__hist__" });
        const records = await Promise.all(
            list.keys.map(async ({ name }) => {
                const raw = await context.env.CATALOGS.get(name);
                if (!raw) return null;
                const hist = JSON.parse(raw);
                // Verificar si el link todavía está activo en KV
                const vivo = await context.env.CATALOGS.get(hist.id);
                return { ...hist, activo: !!vivo };
            })
        );
        const result = records
            .filter(Boolean)
            .sort((a, b) => b.createdAt - a.createdAt);

        return new Response(JSON.stringify({ ok: true, links: result }), { headers });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers });
    }
}
