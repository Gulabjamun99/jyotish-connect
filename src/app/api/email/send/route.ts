import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, html, ics } = body;

        const result = await sendEmail({ to, subject, html, ics });
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Email API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
