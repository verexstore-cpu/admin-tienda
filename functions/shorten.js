export async function onRequest(context) {
    const url = new URL(context.request.url);
    const target = url.searchParams.get("url");

    if (!target) {
        return new Response("Missing url", { status: 400 });
    }

    try {
        const res   = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
        const short = (await res.text()).trim();
        if (short.startsWith("http")) {
            return new Response(short, {
                headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" }
            });
        }
        throw new Error("Bad response");
    } catch (e) {
        return new Response(target, {
            headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" }
        });
    }
}
