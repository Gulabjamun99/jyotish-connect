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

        // Targeted localized room links for both User and Astrologer
        const userMeetingLink = `https://jyotish-connect-nine.vercel.app/en/consult/${payload.bookingId || ''}?type=${type}`;
        const astrologerMeetingLink = `https://jyotish-connect-nine.vercel.app/en/consult/${payload.bookingId || ''}?type=${type}&role=astrologer`;
        const isInstant = String(time).toLowerCase().includes('now');
        
        const buildEmailHtml = (isUser: boolean) => {
            const meetingLink = isUser ? userMeetingLink : astrologerMeetingLink;
            if (isInstant) {
                return `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 20px 25px -5px rgba(220, 38, 38, 0.1);">
                        <div style="background: #dc2626; padding: 40px; text-align: center;">
                            <div style="display: inline-block; padding: 12px 24px; border: 2px solid #ef4444; border-radius: 12px; background: #b91c1c;">
                                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">🚨 LIVE CALL REQUEST</h1>
                            </div>
                            <p style="color: #fca5a5; margin: 16px 0 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">IMMEDIATE CONNECTION REQUIRED</p>
                        </div>

                        <div style="padding: 40px; color: #1e293b; line-height: 1.7;">
                            <h2 style="margin-top: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;">
                                ${isUser ? `Connecting to Acharya... 🙏` : `Namaste, ${astrologerName}! 🙏`}
                            </h2>
                            
                            <p style="font-size: 16px; color: #475569;">
                                ${isUser 
                                    ? `We are connecting you to <strong>Master ${astrologerName}</strong>. Please enter the room below to wait for the connection.` 
                                    : `Seeker <strong>${userName || 'a Seeker'}</strong> is waiting in your consultation room **right now** for a live **${type}** session. Please connect immediately.`}
                            </p>

                            <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 20px; padding: 30px; margin: 32px 0; text-align: center;">
                                <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">🚨 Live Room Status</p>
                                <p style="margin: 8px 0 0; color: #dc2626; font-size: 22px; font-weight: 900;">Seeker is Waiting Live</p>
                            </div>

                            <div style="text-align: center; margin: 40px 0;">
                                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 1px;">Join Consultation Immediately</p>
                                <a href="${meetingLink}" style="display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 20px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3); text-transform: uppercase; letter-spacing: 1px;">⚡ Enter Live Room Now</a>
                                <p style="margin-top: 12px; font-size: 11px; color: #94a3b8;">Click the button above to instantly connect to the session.</p>
                            </div>

                            <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 16px;">
                                <p style="margin: 0; font-size: 13px; color: #9a3412; font-weight: 600; line-height: 1.5;">
                                    ✨ <strong>Pro Tip:</strong> Direct Calls represent urgent seeking of guidance. Connecting promptly builds deep seeker loyalty and exceptional ratings.
                                </p>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">JyotishConnect Live Response Desk ✨</p>
                        </div>
                    </div>
                `;
            }

            return `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                    <div style="background: #000000; padding: 40px; text-align: center;">
                        <div style="display: inline-block; padding: 12px 24px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;">
                            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">JyotishConnect</h1>
                        </div>
                        <p style="color: #f97316; margin: 16px 0 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Sacred Consultation Confirmed</p>
                    </div>

                    <div style="padding: 40px; color: #1e293b; line-height: 1.7;">
                        <h2 style="margin-top: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;">
                            ${isUser ? `Namaste, ${userName || 'Seeker'}! 🙏` : `Namaste, ${astrologerName}! 🙏`}
                        </h2>
                        
                        <p style="font-size: 16px; color: #475569;">
                            ${isUser 
                                ? `Your spiritual journey with <strong>Master ${astrologerName}</strong> is now officially scheduled. Prepare your heart and mind for the wisdom ahead.` 
                                : `A new soul has sought your guidance. A session with <strong>${userName || 'a Seeker'}</strong> has been successfully booked.`}
                        </p>

                        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 20px; padding: 30px; margin: 32px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; width: 100px;">📅 Date</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 16px; font-weight: 700;">${formattedDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">⏰ Time</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 16px; font-weight: 700;">${time} (IST)</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">🔮 Mode</td>
                                    <td style="padding: 10px 0; color: #0f172a; font-size: 16px; font-weight: 700; text-transform: capitalize;">${type} Session</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin: 40px 0;">
                            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 1px;">Join the Session Here</p>
                            <a href="${meetingLink}" style="display: inline-block; background: #f97316; color: white; text-decoration: none; padding: 20px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);">Enter Consultation Room</a>
                            <p style="margin-top: 12px; font-size: 11px; color: #94a3b8;">Click the button above at the scheduled time to connect.</p>
                        </div>

                        <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 16px;">
                            <p style="margin: 0; font-size: 13px; color: #9a3412; font-weight: 600; line-height: 1.5;">
                                ✨ <strong>Pro Tip:</strong> Ensure you are in a quiet room with a stable internet connection. We have attached a Calendar Invite (.ics) to this email for your convenience.
                            </p>
                        </div>
                    </div>

                    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">May the cosmos illuminate your path. ✨<br/><strong>JyotishConnect Support Team</strong></p>
                    </div>
                </div>
            `;
        };

        const results = [];

        // 1. Email the User
        if (userEmail) {
            const subject = isInstant
                ? `🚨 LIVE SESSION CONNECTED: Enter Room to Wait for Acharya`
                : `Booking Confirmed: Consultation with ${astrologerName}`;
            const res = await sendEmail({
                to: userEmail,
                subject,
                html: buildEmailHtml(true),
                ics
            });
            results.push({ to: 'user', ...res });
        }

        // 2. Email the Astrologer
        if (astrologerEmail) {
            const subject = isInstant 
                ? `🚨 LIVE CALL REQUEST: Seeker waiting for you LIVE on JyotishConnect now!`
                : `New Booking: Consultation with ${userName || 'Seeker'}`;
            const res = await sendEmail({
                to: astrologerEmail,
                subject,
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
