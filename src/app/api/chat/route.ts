import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Using standard Node runtime to ensure full process.env access for the API key
// export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { messages, contextData } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "No messages provided." }), { status: 400 });
        }

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
            console.error("CRITICAL: GEMINI_API_KEY is missing in process.env");
            return new Response(JSON.stringify({ error: "Cosmic connection (API Key) is missing." }), { status: 500 });
        }

        // Construct chat history format — Gemini requires contents to start with 'user' and alternate roles
        // 1. Filter out empty or invalid messages
        const validMessages = messages.filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0);
        
        // 2. Map to Gemini format
        let history = validMessages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content.trim() }]
        }));

        // 3. Ensure alternating roles and starting with 'user'
        // Skip leading model messages
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        if (history.length === 0) {
            return new Response(JSON.stringify({ error: "No valid user messages found." }), { status: 400 });
        }

        // 4. Final safety check: if last message is from user, extract it and leave rest in history
        const latestMessage = history.pop();
        if (!latestMessage) {
            return new Response(JSON.stringify({ error: "No user message found to process." }), { status: 400 });
        }
        
        // Double check roles alternate after pop. If empty, it's fine. 
        // If not empty, ensures and alternates.
        const cleanHistory = [];
        let nextRole = 'user';
        for (const msg of history) {
            if (msg.role === nextRole) {
                cleanHistory.push(msg);
                nextRole = nextRole === 'user' ? 'model' : 'user';
            }
        }

        // Use standard models/gemini-1.5-flash in v1 for maximum compatibility
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
        
        // v1 does NOT support "systemInstruction" field. 
        // We must prepend it to the first user message.
        const firstMessage = cleanHistory.length > 0 ? cleanHistory[0] : latestMessage;
        
        // Inject system prompt into the first user message
        const originalText = firstMessage.parts[0]?.text || "";
        const combinedFirstMessageText = `[SYSTEM INSTRUCTION: ${systemInstruction}]\n\nUser Question: ${originalText}`;
        
        // Update the first message in our payload
        if (cleanHistory.length > 0) {
            cleanHistory[0].parts[0].text = combinedFirstMessageText;
        } else {
            latestMessage.parts[0].text = combinedFirstMessageText;
        }

        const requestBody = {
            contents: [
                ...cleanHistory,
                latestMessage
            ],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                maxOutputTokens: 800, // Slightly more for better detail
            }
        };

        console.log("Gemini Request Body (v1 Prepended):", JSON.stringify(requestBody, null, 2).substring(0, 500) + "...");

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error details:", errText);
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errJson = JSON.parse(errText);
                if (errJson.error?.message) errorMessage = errJson.error.message;
            } catch (e) {}
            
            return new Response(JSON.stringify({ error: errorMessage }), {
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
                        } catch (e) { }
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
        console.error("Sarvagya Server Side Error:", e);
        return new Response(JSON.stringify({ error: e.message || "Failed to communicate with the cosmos." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
