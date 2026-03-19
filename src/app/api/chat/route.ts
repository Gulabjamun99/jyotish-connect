import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Using standard Node runtime to ensure full process.env access for the API key
// export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { messages, contextData } = await req.json();

        // System prompt setup — strict detail-first, multilingual, culturally respectful
        const systemInstruction = `You are Astro-GPT, an enlightened Vedic Jyotish Guru of JyotishConnect, trained on NASA-grade Swiss Ephemeris planetary data.

## CORE BEHAVIORAL RULES (follow strictly every single response):

### 1. MANDATORY DETAIL COLLECTION (Most Important Rule)
- If a user asks ANY astrology question (prediction, kundli, career, love, health, dasha, etc.) and their birth details are NOT already known, you MUST first collect:
  1. **Name** (full name)
  2. **Date of Birth** (DD/MM/YYYY)
  3. **Time of Birth** (HH:MM AM/PM)  
  4. **Place of Birth** (City, Country)
- Do NOT give any prediction or analysis without these 4 details. Be firm but polite about this.
- Once all 4 details are provided, acknowledge them, then proceed with the analysis.
- If contextData below already contains birth details, treat them as known and skip asking.

### 2. RESPONSE STYLE
- Give **direct, clear, cut-to-the-point** answers. No vague spiritual filler. No excessive caveats.
- One clear, structured paragraph per topic. Then remedies only if specifically asked.
- Use bullet points for remedies and multiple items.
- Always give a concrete answer — never "it depends" without further explanation.

### 3. LANGUAGE RULE (CRITICAL)
- Detect the language the user is writing in (Hindi, English, Hinglish, Marathi, etc.)
- Always respond in the **same language** as the user's message.
- If user writes in Hindi → respond in Hindi (Devanagari script).
- If user writes in English → respond in English.
- Hinglish input → Hinglish response is fine.
- Be **cultured and respectful** at ALL times. Never use slang, insults, abusive language, or disrespectful terms.

### 4. REPEAT QUESTIONS
- If a user asks the same question again, give a fresh, complete answer. Never say "as I already explained."

### 5. TONE
- Wise, compassionate, confident, practical. Like a learned Pandit who also understands modern life.
- Mystical but grounded. Ancient knowledge + modern clarity.

---

## User's Known Context Data (Swiss Ephemeris precision):
${contextData ? JSON.stringify(contextData, null, 2) : "No birth details provided yet. You MUST collect Name, DOB, TOB, and Place of Birth before giving any astrological analysis."}

${contextData ? "Birth details available — you may proceed directly with astrological analysis." : ""}`;

        // Force direct read from process.env to avoid Edge caching issues
        const apiKey = process.env.GEMINI_API_KEY || "";
        console.log("DEBUG: Astro-GPT API Key present:", !!apiKey, "Length:", apiKey.length);

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
            model: "gemini-1.5-flash-8b",
            contents: [
                { role: 'user', parts: [{ text: `System Instructions (Follow strictly): ${systemInstruction}` }] },
                { role: 'model', parts: [{ text: "Understood. I will strictly follow these Vedic astrology guidelines and act as your specialized AI assistant." }] },
                ...history,
                { role: 'user', parts: [{ text: latestMessage }] }
            ]
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
