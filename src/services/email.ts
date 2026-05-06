import { Resend } from 'resend';

// Only initialize if API key exists.
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// FALLBACK: If the domain is not verified, Resend will only allow sending from onboarding@resend.dev
// We will try to use the professional address, but if it fails, we warn in logs.
const SENDER_EMAIL = 'JyotishConnect <bookings@jyotishconnect.com>';
// Note: If you haven't verified jyotishconnect.com in Resend dashboard, change SENDER_EMAIL to 'onboarding@resend.dev'

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
        console.error("RESEND_API_KEY missing");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const data = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [userEmail],
            subject: `Booking Confirmed: Session with ${astrologerName}`,
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #f97316; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">JyotishConnect</h1>
                    </div>
                    <div style="padding: 30px; background-color: #fff;">
                        <h2 style="color: #333; margin-top: 0;">Namaste ${userName},</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your cosmic session is officially scheduled with <strong>Master ${astrologerName}</strong>.</p>
                        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
                            <h3 style="margin-top: 0; color: #c2410c;">Session Details</h3>
                            <ul style="list-style: none; padding: 0; margin: 0; color: #431407;">
                                <li style="margin-bottom: 10px;">📅 <strong>Date:</strong> ${formattedDate}</li>
                                <li style="margin-bottom: 10px;">⏰ <strong>Time:</strong> ${time} IST</li>
                                <li style="margin-bottom: 10px;">🎫 <strong>Booking ID:</strong> ${bookingId}</li>
                            </ul>
                        </div>
                        <div style="text-align: center;">
                            <a href="https://jyotishconnect.com/consult/${bookingId}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Join Room</a>
                        </div>
                    </div>
                </div>
            `
        });
        console.log("Email sent successfully to user");
        return { success: true, data };
    } catch (error) {
        console.error("Email failed:", error);
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
        await resend.emails.send({
            from: 'JyotishConnect <alerts@jyotishconnect.com>',
            to: [astrologerEmail],
            subject: `New Booking: ${userName}`,
            html: `<p>Namaste Acharya ${astrologerName}, ${userName} has booked a session on ${date} at ${time}. Room ID: ${bookingId}</p>`
        });
        console.log("Alert sent to astrologer");
        return { success: true };
    } catch (error) {
        console.error("Alert failed:", error);
        return { success: false };
    }
};

export const sendMeetingInvite = async ({ to, userName, astrologerName, type, date, time, bookingId }: any) => {
    if (!resend) return { success: false };
    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: [to],
            subject: `Consultation Confirmed: ${astrologerName}`,
            html: `<h3>Namaste ${userName},</h3><p>Your ${type} session with Master ${astrologerName} is set for ${date} at ${time}.</p><a href="https://jyotishconnect.com/consult/${bookingId}">Join Here</a>`
        });
        console.log("Meeting invite sent to user");
        return { success: true };
    } catch (error) {
        console.error("Invite failed:", error);
        return { success: false };
    }
};
