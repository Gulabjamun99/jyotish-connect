const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    console.error(".env.local file not found at path:", envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0];
    const val = parts.slice(1).join('=');
    env[key] = val;
});

if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.error("Missing SMTP configuration in .env.local");
    process.exit(1);
}

async function testSend() {
    try {
        const transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: Number(env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });

        console.log("Sending email with from: 'no-reply@jyotishconnect.com'...");
        const info = await transporter.sendMail({
            from: '"JyotishConnect" <no-reply@jyotishconnect.com>',
            to: env.SMTP_USER,
            subject: "From-Header Test Email",
            text: "Testing custom from header with Gmail SMTP.",
            html: "<b>Testing custom from header with Gmail SMTP.</b>"
        });

        console.log("✓ Email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("Envelope:", info.envelope);
    } catch (error) {
        console.error("❌ SMTP Error occurred:");
        console.error(error);
    }
}

testSend();
