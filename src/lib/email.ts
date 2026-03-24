import { NextResponse } from 'next/server';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    ics?: string;
}

export async function sendEmail({ to, subject, html, ics }: EmailOptions) {
    console.log("📧 Attempting to send email to:", to);

    // Dynamic Import to handle missing package in some environments
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
        return { success: true, method: 'smtp' };

    } else {
        // Simulation Mode
        console.log("================ EMAIL SIMULATION ================");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("Body:", html?.substring(0, 100) + "...");
        if (ics) console.log("Has ICS Attachment: Yes");
        console.log("==================================================");

        return {
            success: true,
            method: 'simulation',
            message: 'Email logged to server console (SMTP not configured)'
        };
    }
}

interface InviteOptions {
    to: string;
    userName: string;
    astrologerName: string;
    type: string;
    date: string;
    time: string;
    joinUrl: string;
}

export async function sendMeetingInvite({ to, userName, astrologerName, type, date, time, joinUrl }: InviteOptions) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f97316; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">JyotishConnect Consultation</h1>
            <p style="color: #ffedd5; margin-top: 8px;">Your upcoming cosmic session is confirmed.</p>
        </div>
        <div style="padding: 32px;">
            <h2 style="color: #0f172a; margin-top: 0;">Namaste ${userName},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                Your ${type.toUpperCase()} consultation has been officially scheduled. Master ${astrologerName} is looking forward to providing profound guidance.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">Session Details</h3>
                <div style="margin-bottom: 12px;"><strong>Guru / Guide:</strong> Master ${astrologerName}</div>
                <div style="margin-bottom: 12px;"><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Call</div>
                <div style="margin-bottom: 12px;"><strong>Date:</strong> ${date}</div>
                <div><strong>Time:</strong> ${time}</div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="${joinUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Join Consultation Room
                </a>
            </div>
            
            <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                Please join the room 5 minutes prior to the start time.<br/>
                May the universe illuminate your path. ✨
            </p>
        </div>
    </div>
    `;

    return sendEmail({
        to,
        subject: `Your Cosmic Consultation with Master ${astrologerName}`,
        html
    });
}
