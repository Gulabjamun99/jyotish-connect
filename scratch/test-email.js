const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Manually parse .env.local to load SMTP credentials
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

console.log("Loaded SMTP Config:");
console.log("Host:", env.SMTP_HOST);
console.log("Port:", env.SMTP_PORT);
console.log("User:", env.SMTP_USER);
console.log("Pass length:", env.SMTP_PASS ? env.SMTP_PASS.length : 0);

if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.error("Missing SMTP configuration in .env.local");
    process.exit(1);
}

async function testSend() {
    try {
        const transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: Number(env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });

        console.log("Verifying connection to SMTP transporter...");
        await transporter.verify();
        console.log("✓ Connection verified successfully!");

        console.log("Sending test email to:", env.SMTP_USER);
        const info = await transporter.sendMail({
            from: `"JyotishConnect Test" <${env.SMTP_USER}>`,
            to: env.SMTP_USER,
            subject: "Test Email from JyotishConnect",
            text: "SMTP testing is successful!",
            html: "<b>SMTP testing is successful!</b>"
        });

        console.log("✓ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ SMTP Error occurred:");
        console.error(error);
    }
}

testSend();
