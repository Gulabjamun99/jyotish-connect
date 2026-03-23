export interface TransitInfo {
    planet: string;
    sign: string;
    longitude: number;
    isRetrograde: boolean;
}

/**
 * Compares current transits to a user's natal positions to find significant "Alert" moments.
 * (e.g., Saturn Transit, Jupiter Transit to Natal Sun, etc.)
 * This is pure logic and can run safely on the client.
 */
export function findSignificantTransits(natalPositions: any, currentTransits: TransitInfo[]) {
    const alerts = [];

    for (const transit of currentTransits) {
        const natalPlanet = natalPositions[transit.planet.toLowerCase()];
        if (!natalPlanet) continue;

        // Logic for "Conjunctions" (within 5 degrees)
        const diff = Math.abs(transit.longitude - natalPlanet.longitude);
        const wrappedDiff = Math.min(diff, 360 - diff);

        if (wrappedDiff < 5) {
            alerts.push({
                type: "Conjunction",
                planet: transit.planet,
                sign: transit.sign,
                severity: "High",
                message: `Major cosmic alignment! Transit ${transit.planet} is conjunct your Natal ${transit.planet} in ${transit.sign}. Expect significant shifts.`
            });
        }
    }

    return alerts;
}
