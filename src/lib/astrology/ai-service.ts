import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIPredictions(data: any, lang: string = "en") {
    try {
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) return { summary: "AI analysis unavailable (Missing API Key)." };
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as an expert Vedic Astrologer. Analyze this birth data: ${JSON.stringify(data)}. 
        Provide a concise, professional life analysis in ${lang === 'hi' ? 'Hindi' : 'English'}.
        Focus on: Personality, Career, and Key Life Advice.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { summary: response.text() };
    } catch (e) {
        console.error("AI Generation Error:", e);
        return { summary: "The cosmic signals are currently faint. Please try again later." };
    }
}
