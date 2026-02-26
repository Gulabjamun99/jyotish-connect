import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, collection, runTransaction } from 'firebase/firestore';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, astrologerId, amount, bookingData } = body;

        if (!userId || !astrologerId || !amount || !bookingData) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        let bookingId = '';

        await runTransaction(db, async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists()) throw new Error("User not found");

            const currentBalance = userDoc.data()?.walletBalance || 0;
            // FREE TESTING: Bypass balance checks and deduction
            // if (currentBalance < amount) {
            //     throw new Error("Insufficient wallet balance");
            // }

            // 1. Deduct from wallet (DISABLED FOR TESTING)
            // t.update(userRef, {
            //     walletBalance: currentBalance - amount
            // });

            // 2. Create the Booking Document
            const bookingsRef = collection(db, 'bookings');
            const newBookingRef = doc(bookingsRef);
            bookingId = newBookingRef.id;

            t.set(newBookingRef, {
                ...bookingData,
                id: bookingId,
                status: bookingData.time === "Instant" ? "active" : "upcoming", // Active immediately for instant
                paymentMode: 'wallet',
                createdAt: new Date().toISOString()
            });

            // 3. Create a Transaction record
            const txRef = doc(collection(db, 'transactions'));
            t.set(txRef, {
                userId,
                astrologerId,
                amount,
                type: 'payment',
                status: 'completed',
                paymentMode: 'wallet',
                bookingId: bookingId,
                description: `Consultation Booking: ${bookingData.type}`,
                createdAt: new Date().toISOString()
            });
        });

        return NextResponse.json({ success: true, bookingId });

    } catch (error: any) {
        console.error('Wallet payment failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
