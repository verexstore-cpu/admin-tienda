// Banner global para catálogos de afiliado — a diferencia del banner de
// cliente (que se define cada vez que se genera un link, guardado dentro del
// propio registro KV del catálogo), este banner es UNO SOLO compartido por
// TODOS los catálogos de afiliado, editable desde el admin, y se inyecta en
// tiempo real en c/[id].js — así no hay que regenerar ningún link de afiliado
// ya compartido para que la promo aparezca o se quite.
const KEY = "__banner_afiliado_global__";

export async function onRequest(context) {
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });
    }

    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    if (context.request.method === "GET") {
        const raw = await context.env.CATALOGS.get(KEY);
        return new Response(raw || JSON.stringify({ txt: "", sub: "", color: "#7c3aed", activo: false }), { headers });
    }

    if (context.request.method === "POST") {
        try {
            const body = await context.request.json();
            const data = {
                txt: String(body?.txt || "").trim(),
                sub: String(body?.sub || "").trim(),
                color: String(body?.color || "#7c3aed"),
                activo: !!body?.activo,
            };
            // Sin expirationTtl — el banner global vive hasta que lo edite el admin.
            await context.env.CATALOGS.put(KEY, JSON.stringify(data));
            return new Response(JSON.stringify({ ok: true }), { headers });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
        }
    }

    return new Response("Method Not Allowed", { status: 405 });
}
