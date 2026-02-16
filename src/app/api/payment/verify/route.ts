import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingData // Data passed from client to create the booking
        } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error("Razorpay Secret is missing");

        // 1. Verify Signature
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
        }

        // 2. Secure Booking Creation (Server-Side)
        // We use Admin SDK to bypass client-side rules and ensure data integrity
        const bookingRef = dbAdmin.collection('bookings').doc();
        const bookingId = bookingRef.id;

        const newBooking = {
            ...bookingData,
            id: bookingId,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            status: "confirmed",
            paymentStatus: "paid",
            createdAt: new Date().toISOString(),
            verified: true // Server verified flag
        };

        await bookingRef.set(newBooking);

        // Optional: Send Email here (Server-to-Server) to avoid client network issues
        // For now, we return success and let client handle UI redirect

        return NextResponse.json({
            success: true,
            bookingId: bookingId,
            message: "Payment verified and booking created"
        });

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
