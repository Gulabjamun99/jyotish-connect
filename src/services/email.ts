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
                        <p style="color: #555; line-height: 1.6;">Your cosmic transit has been aligned. Your consultation with <strong>${astrologerName}</strong> is confirmed.</p>
                        
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
                            <a href="https://jyotishconnect.com/user/dashboard" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
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
