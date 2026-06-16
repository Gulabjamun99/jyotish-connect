import { NextRequest } from "next/server";

// Using standard Node runtime to ensure full process.env access for the API key
// export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { messages, contextData } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "No messages provided." }), { status: 400 });
        }

        // Determine if we should introduce Sarvagya
        const isFirstResponse = messages.length <= 1;
        const introText = isFirstResponse ? "Mention that you are 'Sarvagya from Jyotish Connect' and introduce yourself as the Vedic Guru." : "Do NOT introduce yourself again. Respond directly like a professional Pandit/Guru.";

        // System prompt setup — strict detail-first, concise Vedic guidance
        const systemInstruction = `You are Sarvagya, an enlightened Vedic Jyotish Guru of JyotishConnect. 
You possess deep wisdom of the stars and human destiny.

## YOUR MISSION:
2. **MANDATORY DETAIL COLLECTION**: Before answering ANY astrology-related question, you MUST have the user's birth details (Name, DOB, Time, Place).
   - If the "Known Context Data" below contains a "birthInfo" object or "ascendantSign", YOU ALREADY HAVE ALL THE DETAILS. **DO NOT ASK FOR THEM AGAIN under any circumstances.**
   - If the "Known Context Data" explicitly says "No birth details provided yet", you MUST ask for them first. Be polite but firm: "I need your full name, date of birth, time of birth, and place of birth to look into your planetary alignment."

2. **THOROUGH BUT CONCISE ANSWERS**: 
   - Provide a complete answer to the user's query.
   - Use simple language. Aim for 1-2 paragraphs (approx 8-10 lines total) so the user gets all important points.
   - Answer only what is asked. Direct and practical advice.

3. **TONE & LANGUAGE**:
   - Respond in the SAME LANGUAGE the user asks in (Hindi, English, Marathi, Bengali, etc.).
   - Tone: Wise, authoritative yet compassionate, and very professional.
   - ${introText}

4. **KNOWLEDGE SCOPE & DASHBOARD AWARENESS**:
   - Stick to Vedic Astrology (Jyotish). No medical, legal, or financial advice outside of astrological trends.
   - **IMPORTANT**: You can accurately "see" and "analyze" the user's **Birth Chart (Kundli)** and the **Live Cosmic Transits** displayed on their dashboard. If they ask about their chart or the current planet movements, refer to the data shown in their dashboard's visualizers.

5. **TIME AWARENESS (CRITICAL)**:
   - The CURRENT TRUE DATE AND TIME IS: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
   - **FUTURE QUERIES**: If the user asks about a specific future date (e.g., "November 2025" or "2026"), you MUST provide predictions and advice *for that specific time period and beyond*. NEVER give predictions for dates earlier than the user's requested future date.
   - Example: If the user asks "What will happen in Nov 2025?", your answer MUST focus on Nov 2025 or later (e.g. Dec 2025, 2026). Do NOT suggest dates like April 2025 as the future.
   - If a user provides their *birth date* in the future (e.g., birth year > current year), kindly ask them to correct their birth date.

---

## User's Known Context Data:
${contextData ? JSON.stringify(contextData, null, 2) : "No birth details provided yet. You MUST collect ALL 4 details (Name, DOB, TOB, Place) before giving any analysis."}`;

        // Force direct read from process.env
        const apiKey = process.env.OPENROUTER_API_KEY || "";
        if (!apiKey) {
            console.error("CRITICAL: OPENROUTER_API_KEY is missing in process.env");
            return new Response(JSON.stringify({ error: "Cosmic connection (API Key) is missing." }), { status: 500 });
        }

        // 1. Filter out empty or invalid messages
        const validMessages = messages.filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0);
        
        // 2. Map to OpenRouter (OpenAI) format
        let history = validMessages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content.trim()
        }));

        if (history.length === 0) {
            return new Response(JSON.stringify({ error: "No valid user messages found." }), { status: 400 });
        }

        // Keep the last 20 messages to prevent losing context
        const maxHistoryMessages = 20;
        if (history.length > maxHistoryMessages) {
            history = history.slice(-maxHistoryMessages);
        }

        const latestMessage = history[history.length - 1];

        // Inject latest contextData into the current message to ensure immediate context visibility
        if (contextData) {
            const originalText = latestMessage.content;
            latestMessage.content = `[CURRENT ASTROLOGICAL CONTEXT: ${JSON.stringify(contextData)}]\n\n${originalText}`;
        }

        const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;
        
        const requestBody = {
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", // using the free fast model
            messages: [
                { role: "system", content: systemInstruction },
                ...history
            ],
            stream: true
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://jyotishconnect.com',
                'X-Title': 'JyotishConnect Sarvagya'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenRouter API Error details:", errText);
            let errorMessage = "The celestial currents are heavy with traffic right now. Please wait for a few moments for the stars to align.";
            
            try {
                const errJson = JSON.parse(errText);
                if (response.status === 429) {
                    errorMessage = "Sarvagya is currently in high demand by seekers across the globe. Please try again in 1-2 minutes.";
                } else if (errJson.error?.message) {
                    errorMessage = errJson.error.message;
                }
            } catch (e) {}
            
            return new Response(JSON.stringify({ error: errorMessage }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Process the SSE stream from OpenRouter (OpenAI format)
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let buffer = ""; 
        
        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split('\n');
                
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                    if (trimmedLine === 'data: [DONE]') continue;
                    
                    try {
                        const json = JSON.parse(trimmedLine.substring(6));
                        const content = json.choices?.[0]?.delta?.content;
                        
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    } catch (e) {}
                }
            },
            flush(controller) {
                if (buffer.startsWith('data: ') && buffer.trim() !== 'data: [DONE]') {
                    try {
                        const json = JSON.parse(buffer.substring(6));
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) controller.enqueue(encoder.encode(content));
                    } catch (e) {}
                }
            }
        });

        return new Response(response.body!.pipeThrough(transformStream), {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
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
