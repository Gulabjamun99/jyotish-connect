import { AstrologyService } from "./swisseph-service";
import { getZodiacSign } from "./calculator";
import { TransitInfo } from "./transit-logic";

export type { TransitInfo };

/**
 * Calculates current planetary transits for the given date/time on the server.
 * USES SWISS EPHEMERIS (Server-Only).
 */
export async function getPlanetaryTransits(date: Date = new Date()): Promise<TransitInfo[]> {
    const lat = 28.6139; // Delhi baseline
    const lon = 77.2090;

    const service = await AstrologyService.getInstance();
    const result = await service.calculatePlanets(date, lat, lon);
    
    return result.planets
        .filter(p => p.name !== "Asc")
        .map(p => ({
            planet: p.name,
            sign: getZodiacSign(p.longitude),
            longitude: p.longitude,
            isRetrograde: p.isRetrograde
        }));
}

// Re-export logic from pure file
export { findSignificantTransits } from "./transit-logic";
