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

const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        const response = await fetch(listUrl);
        console.log("Status:", response.status);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(model => {
                console.log(`- ${model.name} (${model.displayName}) - Supported Actions: ${model.supportedGenerationMethods.join(', ')}`);
            });
        } else {
            console.log("No models returned:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch models failed:", err);
    }
}

listModels();
