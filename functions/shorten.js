export async function onRequest(context) {
    const url = new URL(context.request.url);
    const target = url.searchParams.get("url");

    if (!target) {
        return new Response("Missing url", { status: 400 });
    }

    try {
        const res = await fetch(
            `https://is.gd/create.php?format=simple&url=${encodeURIComponent(target)}`
        );
        const short = await res.text();
        return new Response(short.trim(), {
            headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" }
        });
    } catch (e) {
        return new Response(target, {
            headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" }
        });
    }
}
