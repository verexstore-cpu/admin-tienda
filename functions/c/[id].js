export async function onRequest(context) {
    const id = context.params.id;
    if (!id) return new Response("Not Found", { status: 404 });

    const raw = await context.env.CATALOGS.get(id);
    if (!raw) {
        return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:3rem">
            <h2>⏰ Catálogo no encontrado</h2>
            <p>Este enlace expiró o no es válido.</p></body></html>`,
            { status: 404, headers: { "Content-Type": "text/html;charset=UTF-8" } }
        );
    }

    const baseUrl = new URL(context.request.url);
    const catalogoUrl = `${baseUrl.protocol}//${baseUrl.host}/catalogo.html`;
    const catalogoRes = await fetch(catalogoUrl);
    let html = await catalogoRes.text();

    // Inject data before </body>
    const injection = `<script>window.__CATALOG_DATA__ = ${raw};</script>`;
    html = html.replace("</body>", injection + "</body>");

    return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
}
