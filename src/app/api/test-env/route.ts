import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasTwilioKey: !!process.env.NEXT_PUBLIC_TWILIO_API_KEY,
        twilioKeyPreview: process.env.NEXT_PUBLIC_TWILIO_API_KEY?.substring(0, 10) + "...",
        allPublicEnvs: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    });
}
