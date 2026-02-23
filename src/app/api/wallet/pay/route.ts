import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, astrologerId, amount, bookingData } = body;

        if (!userId || !astrologerId || !amount || !bookingData) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const userRef = dbAdmin.collection('users').doc(userId);
        let bookingId = '';

        await dbAdmin.runTransaction(async (t: any) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) throw new Error("User not found");

            const currentBalance = userDoc.data()?.walletBalance || 0;
            if (currentBalance < amount) {
                throw new Error("Insufficient wallet balance");
            }

            // 1. Deduct from wallet
            t.update(userRef, {
                walletBalance: currentBalance - amount
            });

            // 2. Create the Booking Document
            const bookingsRef = dbAdmin.collection('bookings');
            const newBookingRef = bookingsRef.doc();
            bookingId = newBookingRef.id;

            t.set(newBookingRef, {
                ...bookingData,
                id: bookingId,
                status: 'active', // Active immediately for instant/scheduled
                paymentMode: 'wallet',
                createdAt: new Date().toISOString()
            });

            // 3. Create a Transaction record
            const txRef = dbAdmin.collection('transactions').doc();
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
