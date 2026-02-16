import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * POST /api/peer - Store peer ID for consultation
 * Used when a user/astrologer joins and gets their PeerJS ID
 */
export async function POST(req: Request) {
    try {
        const { consultationId, peerId, role } = await req.json();

        if (!consultationId || !peerId || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Update consultation document with peer ID
        const consultationRef = doc(db, "consultations", consultationId);
        await updateDoc(consultationRef, {
            [`${role}PeerId`]: peerId,
            [`${role}JoinedAt`]: new Date().toISOString(),
            status: "active"
        });

        return NextResponse.json({ success: true, peerId });
    } catch (error: any) {
        console.error("Error storing peer ID:", error);
        return NextResponse.json(
            { error: error.message || "Failed to store peer ID" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/peer?consultationId=xxx&role=user
 * Get the peer ID of the other participant to connect to
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const consultationId = searchParams.get("consultationId");
        const role = searchParams.get("role");

        if (!consultationId || !role) {
            return NextResponse.json(
                { error: "Missing consultationId or role" },
                { status: 400 }
            );
        }

        // Determine which peer ID to fetch
        const otherRole = role === "astrologer" ? "user" : "astrologer";

        // Get consultation document
        const consultationRef = doc(db, "consultations", consultationId);
        const consultationSnap = await getDoc(consultationRef);

        if (!consultationSnap.exists()) {
            return NextResponse.json(
                { error: "Consultation not found" },
                { status: 404 }
            );
        }

        const data = consultationSnap.data();
        const otherPeerId = data[`${otherRole}PeerId`];

        return NextResponse.json({
            peerId: otherPeerId || null,
            waiting: !otherPeerId
        });
    } catch (error: any) {
        console.error("Error fetching peer ID:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch peer ID" },
            { status: 500 }
        );
    }
}
