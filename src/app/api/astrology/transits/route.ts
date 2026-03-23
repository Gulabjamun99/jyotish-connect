import { NextResponse } from "next/server";
import { getPlanetaryTransits } from "@/lib/astrology/transit-calculator";

export async function GET() {
    try {
        const transits = await getPlanetaryTransits();
        return NextResponse.json({ transits });
    } catch (error) {
        console.error("API Error: Transits failed:", error);
        return NextResponse.json({ error: "Failed to fetch transits" }, { status: 500 });
    }
}
