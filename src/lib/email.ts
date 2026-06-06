import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    ics?: string;
}

export async function sendEmail({ to, subject, html, ics }: EmailOptions) {
    console.log("📧 Attempting to send email to:", to);

    if (process.env.SMTP_HOST) {
        // Real Email Sending via SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const senderEmail = process.env.SMTP_USER || 'no-reply@jyotishconnect.com';

        await transporter.sendMail({
            from: `"JyotishConnect" <${senderEmail}>`,
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

    } else if (process.env.RESEND_API_KEY) {
        // Fallback to Resend
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: 'JyotishConnect <bookings@jyotishconnect.com>',
            to: [to],
            subject,
            html,
            attachments: ics ? [{
                filename: 'consultation.ics',
                content: ics,
            }] : []
        });

        if (error) {
            console.error("❌ Resend error:", error);
            throw error;
        }
        console.log("✅ Email sent successfully via Resend.");
        return { success: true, method: 'resend', data };

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
            message: 'Email logged to server console (SMTP or Resend not configured)'
        };
    }
}
