import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await dbAdmin.collection('astrologers').get();
        let deletedCount = 0;
        let keptCount = 0;

        const batch = dbAdmin.batch();

        snapshot.forEach(doc => {
            if (doc.id !== "1i5Fj2u7VrexYbvPfVDIX7NX9Dd2") {
                batch.delete(doc.ref);
                deletedCount++;
            } else {
                keptCount++;
            }
        });

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Deleted ${deletedCount} demo astrologers. Kept ${keptCount} real astrologers.`,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
