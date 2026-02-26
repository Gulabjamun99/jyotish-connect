import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await dbAdmin.collection('astrologers').get();
        const astrologers: any[] = [];
        snapshot.forEach(doc => {
            astrologers.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json({
            success: true,
            count: astrologers.length,
            astrologers: astrologers.map(a => ({ id: a.id, name: a.displayName || a.name }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
