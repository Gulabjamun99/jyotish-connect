const fs = require('fs');
const path = require('path');

// Load .env.local variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}\\s*=\\s*["']?([^"'\r\n]+)["']?`));
    return match ? match[1] : undefined;
};

const apiKey = getEnv('GEMINI_API_KEY');
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in .env.local");
    process.exit(1);
}

const systemInstruction = `You are Sarvagya, an enlightened Vedic Jyotish Guru of JyotishConnect. 
You possess deep wisdom of the stars and human destiny.`;

const messages = [
    { id: "initial", role: "model", content: "Hi, I am Sarvagya from Jyotish Connect." },
    { id: "1", role: "user", content: "My name is Rahul, 15/08/1990, 10:30 AM, Delhi" },
    { id: "2", role: "model", content: "Hello Rahul. I see you are born with Libra ascendant." },
    { id: "3", role: "user", content: "What about my career?" }
];

async function testGemini() {
    const validMessages = messages.filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0);
    
    let history = validMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content.trim() }]
    }));

    while (history.length > 0 && history[0].role === 'model') {
        history.shift();
    }

    const maxHistoryMessages = 6;
    if (history.length > maxHistoryMessages) {
        history = history.slice(-maxHistoryMessages);
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }
    }

    const latestMessage = history.pop();
    if (!latestMessage) {
        console.error("No user message found to process.");
        process.exit(1);
    }

    const cleanHistory = [];
    let nextRole = 'user';
    for (const msg of history) {
        if (msg.role === nextRole) {
            cleanHistory.push(msg);
            nextRole = nextRole === 'user' ? 'model' : 'user';
        }
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`;
    
    const firstMessage = cleanHistory.length > 0 ? cleanHistory[0] : latestMessage;
    const originalText = firstMessage.parts[0]?.text || "";
    const combinedFirstMessageText = `[SYSTEM INSTRUCTION: ${systemInstruction}]\n\nUser Question: ${originalText}`;
    
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
            maxOutputTokens: 2048,
        }
    };

    console.log("Request Contents sent to Gemini:", JSON.stringify(requestBody.contents, null, 2));

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        console.log("Response Status:", response.status, response.statusText);
        const text = await response.text();
        if (!response.ok) {
            console.error("Gemini Error:", text);
        } else {
            console.log("Success! Raw Response chunk (first 500 chars):", text.substring(0, 500));
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

async function testMultiple() {
    console.log("Starting test 1...");
    await testGemini();
    console.log("\nStarting test 2...");
    await testGemini();
    console.log("\nStarting test 3...");
    await testGemini();
    console.log("\nStarting test 4...");
    await testGemini();
    console.log("\nStarting test 5...");
    await testGemini();
}

testMultiple();
