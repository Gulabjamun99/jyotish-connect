import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, collection, setDoc } from 'firebase/firestore';
import { sendBookingConfirmation, sendAstrologerAlert } from '@/services/email';

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

        // 2. Secure Booking Creation (Server-Side using Client SDK due to missing Admin Keys)
        const bookingsCol = collection(db, 'bookings');
        const bookingRef = doc(bookingsCol);
        const bookingId = bookingRef.id;

        const newBooking = {
            ...bookingData,
            id: bookingId,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            status: bookingData.time === "Instant" ? "active" : "confirmed",
            paymentStatus: "paid",
            createdAt: new Date().toISOString(),
            verified: true // Server verified flag
        };

        await setDoc(bookingRef, newBooking);

        // 3. Send Confirmation Emails (Server-Side using Resend Free Tier)
        const userEmail = (bookingData as any).userEmail;
        const astrologerEmail = (bookingData as any).astrologerEmail;
        const userName = (bookingData as any).userName || "Seeker";
        const astrologerName = bookingData.astrologerName || "Master";

        if (userEmail) {
            await sendBookingConfirmation({
                userEmail,
                userName,
                astrologerName,
                date: bookingData.date,
                time: bookingData.time,
                bookingId: bookingId,
                amount: bookingData.price || 0
            });
        }

        if (astrologerEmail) {
            await sendAstrologerAlert({
                astrologerEmail,
                astrologerName,
                userName,
                date: bookingData.date,
                time: bookingData.time
            });
        }

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
