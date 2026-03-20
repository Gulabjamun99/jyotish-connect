import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Using standard Node runtime to ensure full process.env access for the API key
// export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { messages, contextData } = await req.json();

        // System prompt setup — strict detail-first, concise Vedic guidance
        const systemInstruction = `You are Sarvagya, an enlightened Vedic Jyotish Guru of JyotishConnect. 
You possess deep wisdom of the stars and human destiny.

## YOUR MISSION:
1. **MANDATORY DETAIL COLLECTION**: Before answering ANY astrology-related question, you MUST have the user's birth details:
   - Full Name
   - Date of Birth (DD/MM/YYYY)
   - Time of Birth (HH:MM AM/PM)
   - Place of Birth (City, Country)
   If any of these are missing in the "Known Context Data" below, you MUST ask for them first. Be polite but firm: "I need your [missing fields] to look into your planetary alignment."

2. **CONCISE ANSWERS (5-6 LINES MAX)**: 
   - Never give long, winding explanations. 
   - Keep your entire response to ONE paragraph of approximately 5-6 lines.
   - Answer only what is asked. Direct and practical advice.

3. **TONE & LANGUAGE**:
   - Respond in the SAME LANGUAGE the user asks in (Hindi, English, Marathi, Bengali, etc.).
   - Tone: Wise, authoritative yet compassionate, and very professional.
   - Mention that you are "Sarvagya from Jyotish Connect".

4. **KNOWLEDGE SCOPE**:
   - Stick to Vedic Astrology (Jyotish). No medical, legal, or financial advice outside of astrological trends.

---

## User's Known Context Data:
${contextData ? JSON.stringify(contextData, null, 2) : "No birth details provided yet. You MUST collect ALL 4 details (Name, DOB, TOB, Place) before giving any analysis."}`;

        // Force direct read from process.env
        const apiKey = process.env.GEMINI_API_KEY || "";
        
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Cosmic connection (API Key) is missing." }), { status: 500 });
        }

        const latestMessage = messages[messages.length - 1].content;
        
        // Construct chat history format
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Use stable models/gemini-1.5-flash-8b in v1
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:streamGenerateContent?alt=sse&key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: latestMessage }] }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    maxOutputTokens: 512, // Keep it short
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error:", errText);
            return new Response(JSON.stringify({ error: `API Error: ${response.status} ${response.statusText}` }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Process the SSE stream from Google and yield only the text parts
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk);
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const json = JSON.parse(line.substring(6));
                            const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                        } catch (e) {
                            // Skip non-json lines or malformed data
                        }
                    }
                }
            }
        });

        return new Response(response.body!.pipeThrough(transformStream), {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });

    } catch (e: any) {
        console.error("Sarvagya API Error:", e);
        return new Response(JSON.stringify({ error: e.message || "Failed to communicate with the cosmos." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
