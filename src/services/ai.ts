import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export const transcribeAudio = async (audioUrl: string) => {
    try {
        const transcript = await client.transcripts.transcribe({
            audio: audioUrl,
            language_detection: true,
        });
        return transcript.text;
    } catch (error) {
        console.error("Transcription error:", error);
        throw error;
    }
};
