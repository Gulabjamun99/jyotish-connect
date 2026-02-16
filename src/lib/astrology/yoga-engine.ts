export interface Yoga {
    name: string;
    description: string;
    active: boolean;
}

export function detectYogas(planets: any[], houses: any[]): Yoga[] {
    const yogas: Yoga[] = [];
    const sun = planets.find(p => p.name === "Sun");
    const moon = planets.find(p => p.name === "Moon");
    const mars = planets.find(p => p.name === "Mars");
    const mercury = planets.find(p => p.name === "Mercury");
    const jupiter = planets.find(p => p.name === "Jupiter");
    const venus = planets.find(p => p.name === "Venus");
    const saturn = planets.find(p => p.name === "Saturn");

    // Helper: Get house relative to Lagna (assuming houses[0] is Ascendant)
    const getHouse = (longitude: number) => {
        // Simple whole sign for now or use the house cusps from swisseph
        // For accurate Yogas, we need the house index
        // ...
    };

    // 1. Gajakesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
    if (moon && jupiter) {
        const diff = (jupiter.signId - moon.signId + 12) % 12 + 1;
        if ([1, 4, 7, 10].includes(diff)) {
            yogas.push({
                name: "Gajakesari Yoga",
                description: "Jupiter in kendra from Moon. Indicates wealth, intelligence, and virtue.",
                active: true
            });
        }
    }

    // 2. Budhaditya Yoga: Sun and Mercury in same sign
    if (sun && mercury && sun.signId === mercury.signId) {
        yogas.push({
            name: "Budhaditya Yoga",
            description: "Sun and Mercury conjunction. Indicates intelligence and professional success.",
            active: true
        });
    }

    // 3. Panch Mahapurusha Yogas (Mars, Mercury, Jupiter, Venus, Saturn in Kendra and Own/Exalted sign)
    const kendras = [1, 4, 7, 10];
    const EXALTATIONS: Record<string, number> = { "Sun": 1, "Moon": 4, "Mars": 10, "Mercury": 6, "Jupiter": 4, "Venus": 12, "Saturn": 7 };
    const OWN_SIGNS: Record<string, number[]> = { "Sun": [5], "Moon": [4], "Mars": [1, 8], "Mercury": [3, 6], "Jupiter": [9, 12], "Venus": [2, 7], "Saturn": [10, 11] };

    // Function to check Kendra and Strength
    const checkMahapurusha = (p: any, house: number, yogaName: string, desc: number) => {
        if (!p) return;
        if (kendras.includes(house)) {
            if (p.signId === EXALTATIONS[p.name] || OWN_SIGNS[p.name].includes(p.signId)) {
                yogas.push({ name: yogaName, description: "One of the five great man yogas. Indicates exceptional strength in related area.", active: true });
            }
        }
    };

    // Note: To do this properly, we need the actual calculated house of each planet
    // ...

    return yogas;
}
