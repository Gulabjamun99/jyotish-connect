import { computePlanetaryPositions } from "./swisseph-service";
import { getZodiacSign } from "./calculator";

export interface TransitInfo {
    planet: string;
    sign: string;
    longitude: number;
    isRetrograde: boolean;
}

/**
 * Calculates current planetary transits for the given date/time.
 * Uses Swiss Ephemeris for 100% accuracy.
 */
export async function getPlanetaryTransits(date: Date = new Date()): Promise<TransitInfo[]> {
    const lat = 28.6139; // Default Delhi (Global Baseline)
    const lon = 77.2090;

    const positions = await computePlanetaryPositions(date, lat, lon);
    
    // We map the internal computation to a clean transit interface
    return Object.entries(positions).map(([planet, data]: [string, any]) => {
        return {
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            sign: getZodiacSign(data.longitude),
            longitude: data.longitude,
            isRetrograde: data.speed < 0
        };
    });
}

/**
 * Compares current transits to a user's natal positions to find significant "Alert" moments.
 * (e.g., Saturn Transit, Jupiter Transit to Natal Sun, etc.)
 */
export function findSignificantTransits(natalPositions: any, currentTransits: TransitInfo[]) {
    const alerts = [];

    for (const transit of currentTransits) {
        const natalPlanet = natalPositions[transit.planet.toLowerCase()];
        if (!natalPlanet) continue;

        // Logic for "Conjunctions" (within 5 degrees)
        const diff = Math.abs(transit.longitude - natalPlanet.longitude);
        if (diff < 5 || diff > 355) {
            alerts.push({
                type: "Conjunction",
                planet: transit.planet,
                sign: transit.sign,
                severity: "High",
                message: `Major cosmic alignment! Transit ${transit.planet} is conjunct your Natal ${transit.planet} in ${transit.sign}. Expect significant shifts.`
            });
        }
        
        // Logic for Sade Sati (Saturn in 12, 1, 2 from Natal Moon)
        if (transit.planet === "Saturn") {
            // Placeholder for Moon Sign based logic
        }
    }

    return alerts;
}
