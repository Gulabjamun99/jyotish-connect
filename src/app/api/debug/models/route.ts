import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) return new Response(JSON.stringify({ error: "No API Key" }), { status: 500 });

    const results: any = {};
    const versions = ["v1", "v1beta"];

    for (const v of versions) {
        const url = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`;
        try {
            const res = await fetch(url);
            const json = await res.json();
            results[v] = json;
        } catch (e: any) {
            results[v] = { error: e.message };
        }
    }

    return new Response(JSON.stringify(results, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
