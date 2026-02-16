import { NextResponse } from "next/server";
import { getFullAstrologyData, performMatchMaking } from "@/lib/astrology/calculator";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, data } = body;

        if (type === "full") {
            const { date, lat, lng } = data;
            const result = await getFullAstrologyData(new Date(date), lat, lng);
            return NextResponse.json(result);
        }

        if (type === "match") {
            const { boyDetails, girlDetails } = data;
            const result = await performMatchMaking(
                { ...boyDetails, date: new Date(boyDetails.date) },
                { ...girlDetails, date: new Date(girlDetails.date) }
            );
            return NextResponse.json(result);
        }

        if (type === "horoscope") {
            const { sign, date, lat, lng, locale } = data;
            // For horoscope, we usually just need planetary positions
            const result = await getFullAstrologyData(new Date(date), lat, lng);
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: "Invalid calculation type" }, { status: 400 });
    } catch (error) {
        console.error("Astrology API error:", error);
        return NextResponse.json({ error: "Failed to perform calculation" }, { status: 500 });
    }
}
