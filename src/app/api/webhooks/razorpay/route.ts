import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbAdmin } from '@/lib/firebase-admin';
import { sendBookingConfirmation, sendAstrologerAlert } from '@/services/email';

// Webhooks should ALWAYS be used for production payments (unlike client-side verify which can be spoofed)
export async function POST(req: Request) {
    try {
        const payload = await req.text(); // Raw body for verifying signature
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // In free tier/dev, we might not have a webhook secret configured yet.
        // It's highly recommended to add it to .env
        if (!webhookSecret) {
            console.warn("⚠️ RAZORPAY_WEBHOOK_SECRET is missing. Webhooks will fail in production.");
            return NextResponse.json({ success: false, error: "Missing Webhook Secret" }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ success: false, error: "No signature provided" }, { status: 400 });
        }

        // 1. Verify Webhook Authenticity
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error("❌ Invalid Webhook Signature");
            return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
        }

        // 2. Parse Validated Payload
        const event = JSON.parse(payload);
        console.log(`✅ Webhook Received: ${event.event}`);

        // 3. Handle Payment Captured
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            // In Razorpay, custom data is stored in 'notes' when creating the order/payment
            const bookingNotes = payment.notes || {};

            // Query Firestore to see if this booking exists via the fallback client-side verify
            // If it does, just update it. If not, create a new one securely.
            const bookingsRef = dbAdmin.collection('bookings');
            const snapshot = await bookingsRef.where('orderId', '==', orderId).get();

            let bookingId = "";
            let bookingRef;

            if (snapshot.empty) {
                // Client side verify failed or never fired (e.g. user closed window too fast)
                // We MUST create the booking securely via the Webhook
                console.log(`Creating secure booking via Webhook for Order: ${orderId}`);
                bookingRef = bookingsRef.doc();
                bookingId = bookingRef.id;

                await bookingRef.set({
                    id: bookingId,
                    userId: bookingNotes.userId || 'unknown',
                    userName: bookingNotes.userName || 'Seeker',
                    astrologerId: bookingNotes.astrologerId,
                    astrologerName: bookingNotes.astrologerName || 'Master',
                    type: bookingNotes.type || 'video',
                    date: bookingNotes.date || new Date().toISOString(),
                    time: bookingNotes.time || 'Instant',
                    price: payment.amount / 100, // Convert paise to rupees
                    paymentId: payment.id,
                    orderId: orderId,
                    status: "confirmed",
                    paymentStatus: "paid",
                    createdAt: new Date().toISOString(),
                    verified: true, // Server verified flag
                    source: "webhook"
                });

                // Since this is the first time we process this payment, send the emails.
                if (bookingNotes.userEmail) {
                    await sendBookingConfirmation({
                        userEmail: bookingNotes.userEmail,
                        userName: bookingNotes.userName,
                        astrologerName: bookingNotes.astrologerName,
                        date: bookingNotes.date || new Date(),
                        time: bookingNotes.time || 'Instant',
                        bookingId: bookingId,
                        amount: payment.amount / 100
                    });
                }

                if (bookingNotes.astrologerEmail) {
                    await sendAstrologerAlert({
                        astrologerEmail: bookingNotes.astrologerEmail,
                        astrologerName: bookingNotes.astrologerName,
                        userName: bookingNotes.userName,
                        date: bookingNotes.date || new Date(),
                        time: bookingNotes.time || 'Instant',
                        bookingId: bookingId
                    });
                }

            } else {
                // Booking already exists (created by client-side verify API)
                // Just mark it as doubly secure via Webhook
                bookingRef = snapshot.docs[0].ref;
                await bookingRef.update({
                    webhookVerified: true,
                    webhookReceivedAt: new Date().toISOString()
                });
                console.log(`Webhook confirmed existing booking for Order: ${orderId}`);
            }
        }

        // Return 200 OK so Razorpay knows we got it
        return NextResponse.json({ success: true, message: "Webhook processed securely" });

    } catch (error: any) {
        console.error("Webhook Processing Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
