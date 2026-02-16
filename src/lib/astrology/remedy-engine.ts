export function recommendGemstones(planets: any[]): any[] {
    const recommendations: any[] = [];
    const sun = planets.find(p => p.name === "Sun");

    // Logic based on house lords and planet strength
    // Functional Benefics for each Lagna
    // ...
    return recommendations;
}

export function generateRemedies(doshas: any): any[] {
    const remedies: any[] = [];
    if (doshas?.Manglik?.present) {
        remedies.push({
            title: "Manglik Shanti",
            description: "Perform Mangal Gauri Puja or Kumbh Vivah to mitigate the impact of Mars.",
            priority: "High"
        });
    }
    // ...
    return remedies;
}
