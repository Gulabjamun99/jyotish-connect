import { Resend } from 'resend';

// Only initialize if API key exists. We don't want to crash the whole app if it's missing.
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The free tier requires you to verify a domain to send to any email,
// OR you can only send to the email address associated with your Resend account.
// We'll assume the user will configure this later.

export const sendBookingConfirmation = async ({
    userEmail,
    userName,
    astrologerName,
    date,
    time,
    bookingId,
    amount
}: {
    userEmail: string;
    userName: string;
    astrologerName: string;
    date: Date | string;
    time: string;
    bookingId: string;
    amount: number;
}) => {
    if (!resend) {
        console.warn("RESEND_API_KEY not found. Skipping confirmation email.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const data = await resend.emails.send({
            from: 'JyotishConnect <bookings@jyotishconnect.com>', // Update with verified domain later
            to: [userEmail],
            subject: `Booking Confirmed: Session with ${astrologerName}`,
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #f97316; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">JyotishConnect</h1>
                    </div>
                    <div style="padding: 30px; background-color: #fff;">
                        <h2 style="color: #333; margin-top: 0;">Namaste ${userName},</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your cosmic session is officially scheduled. <strong>Master ${astrologerName}</strong> is looking forward to providing profound guidance.</p>
                        
                        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
                            <h3 style="margin-top: 0; color: #c2410c;">Session Details</h3>
                            <ul style="list-style: none; padding: 0; margin: 0; color: #431407;">
                                <li style="margin-bottom: 10px;">📅 <strong>Date:</strong> ${formattedDate}</li>
                                <li style="margin-bottom: 10px;">⏰ <strong>Time:</strong> ${time} IST</li>
                                <li style="margin-bottom: 10px;">💳 <strong>Amount Paid:</strong> ₹${amount}</li>
                                <li style="margin-bottom: 10px;">🎫 <strong>Booking ID:</strong> ${bookingId}</li>
                            </ul>
                        </div>

                        <p style="color: #555; margin-bottom: 30px;">Please ensure you have a stable internet connection and are in a quiet room for the session.</p>
                        
                        <div style="text-align: center;">
                            <a href="https://jyotishconnect.com/consult/${bookingId}?type=video" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Join Consultation Room</a>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">May the stars guide you. © 2026 JyotishConnect</p>
                    </div>
                </div>
            `
        });

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email via Resend:", error);
        return { success: false, error };
    }
};

export const sendAstrologerAlert = async ({
    astrologerEmail,
    astrologerName,
    userName,
    date,
    time,
    bookingId
}: {
    astrologerEmail: string;
    astrologerName: string;
    userName: string;
    date: Date | string;
    time: string;
    bookingId: string;
}) => {
    if (!resend) return { success: false };

    try {
        const formattedDate = new Date(date).toLocaleDateString('en-IN');

        await resend.emails.send({
            from: 'JyotishConnect Alerts <alerts@jyotishconnect.com>',
            to: [astrologerEmail],
            subject: `New Booking: ${userName} on ${formattedDate}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Namaste Acharya ${astrologerName},</h2>
                    <p>A new seeker has booked a session with you.</p>
                    <ul>
                        <li><strong>Seeker:</strong> ${userName}</li>
                        <li><strong>Date:</strong> ${formattedDate}</li>
                        <li><strong>Time:</strong> ${time}</li>
                        <li><strong>Room ID:</strong> ${bookingId}</li>
                    </ul>
                    <p>Please check your Master Console for details or click below to join directly:</p>
                    <a href="https://jyotishconnect.com/consult/${bookingId}?participant=astrologer" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 10px;">Join Consultation Room</a>
                </div>
            `
        });
        return { success: true };
    } catch (error) {
        console.error("Failed alert:", error);
        return { success: false };
    }
};

export const sendMeetingInvite = async ({ 
    to, 
    userName, 
    astrologerName, 
    type, 
    date, 
    time, 
    bookingId 
}: { 
    to: string, 
    userName: string, 
    astrologerName: string, 
    type: string, 
    date: string, 
    time: string, 
    bookingId: string 
}) => {
    if (!resend) return { success: false };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jyotishconnect.com';
    const joinUrl = `${appUrl}/consult/${bookingId}?type=${type}`;

    const html = `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">JyotishConnect</h1>
            <p style="color: #ffedd5; margin-top: 8px; font-weight: 500; opacity: 0.9;">Your Sacred Consultation is Confirmed</p>
        </div>
        <div style="padding: 40px; background-color: white;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Namaste ${userName},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Your <strong>${type.toUpperCase()}</strong> consultation with <strong>Master ${astrologerName}</strong> has been successfully scheduled. Prepare your space for a journey of celestial discovery.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0;">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Session Parameters</h3>
                <div style="margin-bottom: 12px; color: #1e293b;"><strong style="color: #475569;">Guide:</strong> Master ${astrologerName}</div>
                <div style="margin-bottom: 12px; color: #1e293b;"><strong style="color: #475569;">Modality:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</div>
                <div style="margin-bottom: 12px; color: #1e293b;"><strong style="color: #475569;">Date:</strong> ${date}</div>
                <div style="color: #1e293b;"><strong style="color: #475569;">Time:</strong> ${time}</div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="${joinUrl}" style="background-color: #2563eb; color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s;">
                    Join Consultation Room
                </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 24px; line-height: 1.5;">
                Please ensure you are in a quiet environment with a stable connection.<br/>
                The universe speaks to those who listen carefully. ✨
            </p>
        </div>
    </div>
    `;

    try {
        await resend.emails.send({
            from: 'JyotishConnect <bookings@jyotishconnect.com>',
            to: [to],
            subject: `Sacred Consultation Confirmed: Master ${astrologerName}`,
            html
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send meeting invite:", error);
        return { success: false, error };
    }
};
