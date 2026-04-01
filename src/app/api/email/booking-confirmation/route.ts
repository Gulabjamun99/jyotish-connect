import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { 
            userId, 
            userEmail, 
            userName, 
            astrologerId, 
            astrologerName, 
            date, 
            time, 
            type,
            ics
        } = payload;

        if (!userEmail && !userId) {
            return NextResponse.json({ success: false, error: "Missing user email" }, { status: 400 });
        }

        // Fetch astrologer email safely from server-side
        let astrologerEmail = "";
        try {
            const astroRef = doc(db, "astrologers", astrologerId);
            const astroSnap = await getDoc(astroRef);
            if (astroSnap.exists()) {
                astrologerEmail = astroSnap.data().email || "";
            }
        } catch (e) {
            console.error("Failed to fetch astrologer email:", e);
        }

        // Format date string beautifully
        const sessionDateObj = new Date(date);
        const formattedDate = sessionDateObj.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // The HTML Template shared for both User and Astrologer
        const buildEmailHtml = (isUser: boolean) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9;">
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">✨ JyotishConnect</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 3px;">Booking Confirmed</p>
                </div>

                <div style="padding: 32px; color: #334155; line-height: 1.6;">
                    <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">
                        ${isUser ? `Hello, ${userName || 'Seeker'}! 🙏` : `Namaste, ${astrologerName}! 🙏`}
                    </h2>
                    
                    <p style="font-size: 15px;">
                        ${isUser 
                            ? `Your consultation with <strong>${astrologerName}</strong> has been successfully scheduled.` 
                            : `A new consultation has been booked with <strong>${userName || 'a Seeker'}</strong>.`}
                    </p>

                    <div style="background: #fafafa; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">📅 Date:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">⏰ Time:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${time} IST</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">📞 Type:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 700; text-transform: capitalize;">${type} Consultation</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #fdfae5; border: 1px solid #fef08a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 13px; color: #854d0e; text-align: center; font-weight: 500;">
                            ⚠️ Please join the meeting room strictly <strong>on time</strong> using your dashboard. 
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://jyotishconnect.com/${isUser ? 'user/dashboard' : 'astrologer/dashboard'}" style="display: inline-block; background: #f97316; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        `;

        const results = [];

        // 1. Email the User
        if (userEmail) {
            const res = await sendEmail({
                to: userEmail,
                subject: `Booking Confirmed: Consultation with ${astrologerName}`,
                html: buildEmailHtml(true),
                ics
            });
            results.push({ to: 'user', ...res });
        }

        // 2. Email the Astrologer
        if (astrologerEmail) {
            const res = await sendEmail({
                to: astrologerEmail,
                subject: `New Booking: Consultation with ${userName || 'Seeker'}`,
                html: buildEmailHtml(false),
                ics
            });
            results.push({ to: 'astrologer', ...res });
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error("Booking Confirmation Email Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
