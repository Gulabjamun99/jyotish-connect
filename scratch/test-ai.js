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

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function runTest(modelName) {
    console.log(`\nTesting generateContent with model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `Act as an expert Vedic Astrologer. Analyze this birth data: {"name":"Rahul","dob":"15/08/1990","tob":"10:30 AM","pob":"Delhi"}. 
        Provide a concise, professional life analysis in English.
        Focus on: Personality, Career, and Key Life Advice.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`SUCCESS for ${modelName}! Result length:`, response.text().length);
    } catch (e) {
        console.error(`ERROR for ${modelName}:`, e.message);
    }
}

async function runAll() {
    await runTest("gemini-1.5-flash");
    await runTest("gemini-2.5-flash-lite");
    await runTest("gemini-2.5-flash");
}

runAll();
