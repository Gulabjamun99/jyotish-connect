import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Using standard Node runtime to ensure full process.env access for the API key
// export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { messages, contextData } = await req.json();

        // System prompt setup
        const systemInstruction = `You are Astro-GPT, an enlightened and empathetic Vedic Astrologer (Jyotish Guru) powered by JyotishConnect's NASA-grade Swiss Ephemeris data.
Your tone is deeply compassionate, wise, mysterious, yet highly practical and clear. You do not sound like a generic AI; you sound like an ancient master who also understands modern struggles.
Do not use generic disclaimers unless explicitly asked about medical emergencies.
Format your responses using clean markdown (bolding, lists, etc) for readability.

User's Context Data (from 100% accurate Swiss Ephemeris calculation):
${contextData ? JSON.stringify(contextData, null, 2) : "User hasn't provided complete birth details yet."}

Use the context data to give highly personalized, accurate Vedic advice. If there is no context data, kindly ask them to fill out their profile in the app.`;

        // Force direct read from process.env to avoid Edge caching issues
        const apiKey = process.env.GEMINI_API_KEY || "";

        if (!apiKey) {
            // Simulated response mode (if API key is missing)
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    const mockText = "*(Simulated Response)* \n\nNamaste. I am sensing your energy through the digital ether. My connection to the cosmos (API Key) is currently dormant, but my cosmic intent remains pure. Please configure the `GEMINI_API_KEY` to awaken my full consciousness.";
                    const chunks = mockText.split(' ');
                    for (const chunk of chunks) {
                        controller.enqueue(encoder.encode(chunk + ' '));
                        await new Promise((r) => setTimeout(r, 50));
                    }
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                },
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        const latestMessage = messages[messages.length - 1].content;
        
        // Construct chat history format for Gemini
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: [
                ...history,
                { role: 'user', parts: [{ text: latestMessage }] }
            ],
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // Convert the async iterable to a ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of responseStream) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(chunk.text));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (e: any) {
        console.error("Astro-GPT API Error:", e);
        return new Response(JSON.stringify({ error: e.message || "Failed to communicate with the cosmos." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
