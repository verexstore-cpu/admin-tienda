export async function onRequest(context) {
    const cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
    if (context.request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (context.request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const headers = { "Content-Type": "application/json", ...cors };

    try {
        const { afiliadoCodigo } = await context.request.json();
        if (!afiliadoCodigo) return new Response(JSON.stringify({ error: "afiliadoCodigo requerido" }), { status: 400, headers });

        const rawIdx = await context.env.CATALOGS.get("__affiliate__" + afiliadoCodigo);
        if (!rawIdx) {
            return new Response(JSON.stringify({ totalCatalogos: 0, totalVistas: 0, ultimaVista: null, primerCatalogo: null }), { headers });
        }

        const { ids } = JSON.parse(rawIdx);
        const viewsRaw = await Promise.all(ids.map(id => context.env.CATALOGS.get("__views__" + id)));

        let totalVistas = 0, ultimaVista = null, primerCatalogo = null;
        viewsRaw.forEach((r, i) => {
            if (!r) return;
            const v = JSON.parse(r);
            totalVistas += v.count || 0;
            if (!ultimaVista || v.last > ultimaVista) ultimaVista = v.last;
            if (!primerCatalogo || v.first < primerCatalogo) primerCatalogo = v.first;
        });

        return new Response(JSON.stringify({
            totalCatalogos: ids.length,
            totalVistas,
            ultimaVista,
            primerCatalogo,
        }), { headers });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
}
