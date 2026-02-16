import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, html, ics } = body;

        console.log("📧 Attempting to send email to:", to);

        // Dynamic Import to handle missing package
        let nodemailer;
        try {
            nodemailer = await import('nodemailer');
        } catch (e) {
            console.warn("⚠️ Nodemailer not installed. Email simulation mode.");
        }

        if (nodemailer && process.env.SMTP_HOST) {
            // Real Email Sending
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: '"JyotishConnect" <no-reply@jyotishconnect.com>',
                to,
                subject,
                html,
                attachments: ics ? [{
                    filename: 'consultation.ics',
                    content: ics,
                    contentType: 'text/calendar'
                }] : []
            });
            console.log("✅ Email sent successfully via SMTP.");
            return NextResponse.json({ success: true, method: 'smtp' });

        } else {
            // Simulation Mode
            console.log("================ EMAIL SIMULATION ================");
            console.log("To:", to);
            console.log("Subject:", subject);
            console.log("Body:", html?.substring(0, 100) + "...");
            if (ics) console.log("Has ICS Attachment: Yes");
            console.log("==================================================");

            return NextResponse.json({
                success: true,
                method: 'simulation',
                message: 'Email logged to server console (SMTP not configured)'
            });
        }

    } catch (error: any) {
        console.error("Email API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
