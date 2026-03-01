import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
    try {
        const { consultationId } = await req.json();

        if (!consultationId) {
            return NextResponse.json({ success: false, error: "Missing consultationId" }, { status: 400 });
        }

        // Fetch consultation data from Firestore
        const consultRef = doc(db, "consultations", consultationId);
        const consultSnap = await getDoc(consultRef);

        if (!consultSnap.exists()) {
            return NextResponse.json({ success: false, error: "Consultation not found" }, { status: 404 });
        }

        const data = consultSnap.data();
        const transcript = data.transcript || [];
        const duration = data.duration || 0;
        const consultationType = data.type || "video";
        const endedAt = data.endedAt || new Date().toISOString();

        // Get participant details
        const userEmail = data.userEmail || "";
        const userName = data.userName || "User";
        const astrologerEmail = data.astrologerEmail || "";
        const astrologerName = data.astrologerName || "Acharya";

        if (transcript.length === 0) {
            return NextResponse.json({ success: true, message: "No transcript to send" });
        }

        // Format duration
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        const durationStr = `${mins}m ${secs}s`;

        // Format date
        const formattedDate = new Date(endedAt).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const formattedTime = new Date(endedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });

        // Build transcript HTML rows
        const transcriptRows = transcript.map((line: any, i: number) => {
            const isAstrologer = line.speaker === 'Astrologer' || line.speaker === astrologerName;
            const bgColor = isAstrologer ? '#fff7ed' : '#f0f9ff';
            const borderColor = isAstrologer ? '#fed7aa' : '#bae6fd';
            const labelColor = isAstrologer ? '#c2410c' : '#0369a1';
            return `
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <div style="min-width: 32px; width: 32px; height: 32px; border-radius: 50%; background: ${isAstrologer ? '#f97316' : '#0ea5e9'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                                ${(line.speaker || '?')[0].toUpperCase()}
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span style="font-weight: 700; font-size: 12px; color: ${labelColor}; text-transform: uppercase; letter-spacing: 0.5px;">${line.speaker}</span>
                                    <span style="font-size: 11px; color: #94a3b8;">${line.time}</span>
                                </div>
                                <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #334155; line-height: 1.6;">
                                    ${line.text}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Build the full email HTML
        const html = `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">✨ JyotishConnect</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 3px;">Consultation Transcript</p>
                </div>

                <!-- Summary Card -->
                <div style="padding: 24px 32px;">
                    <div style="background: #fafafa; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                        <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">Session Summary</h2>
                        <table style="width: 100%; font-size: 14px; color: #475569;">
                            <tr>
                                <td style="padding: 6px 0;"><strong>📅 Date:</strong></td>
                                <td style="padding: 6px 0;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0;"><strong>⏰ Time:</strong></td>
                                <td style="padding: 6px 0;">${formattedTime} IST</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0;"><strong>⏱️ Duration:</strong></td>
                                <td style="padding: 6px 0;">${durationStr}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0;"><strong>📞 Mode:</strong></td>
                                <td style="padding: 6px 0; text-transform: capitalize;">${consultationType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0;"><strong>👤 Seeker:</strong></td>
                                <td style="padding: 6px 0;">${userName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0;"><strong>🙏 Acharya:</strong></td>
                                <td style="padding: 6px 0;">${astrologerName}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Transcript -->
                    <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">📝 Full Transcript (${transcript.length} messages)</h2>
                    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        ${transcriptRows}
                    </table>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">This transcript was auto-generated by JyotishConnect.</p>
                    <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0;">May the stars guide you. © 2026 JyotishConnect</p>
                </div>
            </div>
        `;

        const subject = `📝 Consultation Transcript — ${astrologerName} × ${userName} — ${formattedDate}`;

        // Send to both participants
        const results = [];

        if (userEmail) {
            const res = await sendEmail({ to: userEmail, subject, html });
            results.push({ to: 'user', ...res });
        }

        if (astrologerEmail) {
            const res = await sendEmail({ to: astrologerEmail, subject, html });
            results.push({ to: 'astrologer', ...res });
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error("Send Transcript Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
