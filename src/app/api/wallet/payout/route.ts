import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        const bookingRef = dbAdmin.collection('bookings').doc(bookingId);

        await dbAdmin.runTransaction(async (t: any) => {
            const bookingDoc = await t.get(bookingRef);
            if (!bookingDoc.exists) throw new Error("Booking not found");

            const bookingData = bookingDoc.data();

            // Prevent double payouts
            if (bookingData?.status === 'completed') {
                throw new Error("Payout already processed for this booking");
            }

            const { astrologerId, price, userId } = bookingData as any;

            if (!astrologerId || !price) {
                throw new Error("Invalid booking data for payout");
            }

            const astroRef = dbAdmin.collection('astrologers').doc(astrologerId);
            const astroDoc = await t.get(astroRef);

            const currentWallet = astroDoc.exists ? (astroDoc.data()?.walletBalance || 0) : 0;
            const currentEarnings = astroDoc.exists ? (astroDoc.data()?.totalEarnings || 0) : 0;
            const currentConsultations = astroDoc.exists ? (astroDoc.data()?.consultations || 0) : 0;

            // 1. Mark Booking as Completed
            t.update(bookingRef, {
                status: 'completed',
                completedAt: new Date().toISOString()
            });

            // 2. Add funds to Astrologer's Wallet
            t.set(astroRef, {
                walletBalance: currentWallet + price,
                totalEarnings: currentEarnings + price,
                consultations: currentConsultations + 1
            }, { merge: true });

            // 3. Create Earnings Transaction Record
            const txRef = dbAdmin.collection('transactions').doc();
            t.set(txRef, {
                userId,
                astrologerId,
                amount: price,
                type: 'earning',
                status: 'completed',
                paymentMode: 'wallet',
                bookingId: bookingId,
                description: `Consultation Earnings: ${bookingData?.type || 'Session'}`,
                createdAt: new Date().toISOString()
            });
        });

        return NextResponse.json({ success: true, message: "Payout successful" });

    } catch (error: any) {
        console.error('Payout failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
