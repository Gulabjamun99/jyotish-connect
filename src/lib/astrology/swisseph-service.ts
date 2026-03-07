import SwissEph from 'swisseph-wasm';

export class AstrologyService {
    private static instance: AstrologyService;
    private swe: any;
    private initialized: boolean = false;

    private constructor() { }

    public static async getInstance(): Promise<AstrologyService> {
        if (!AstrologyService.instance) {
            AstrologyService.instance = new AstrologyService();
            await AstrologyService.instance.init();
        }
        return AstrologyService.instance;
    }

    private async init() {
        if (this.initialized) return;
        this.swe = new SwissEph();
        await this.swe.initSwissEph();

        // Set ephemeris path to public folder where .se1 files are bundled
        // next.js/server context usually expects absolute path or relative to CWD
        try {
            await this.swe.set_ephe_path('./public/ephe');
        } catch (e) {
            console.warn("Could not set ephe path, using default built-in data");
        }

        // Set standard Lahiri Ayanamsa (AstroSage standard)
        this.swe.set_sid_mode(this.swe.SE_SIDM_LAHIRI, 0, 0);
        this.initialized = true;
    }

    public async calculatePlanets(date: Date, lat: number, lng: number) {
        if (!this.initialized) await this.init();

        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

        const jd = this.swe.julday(year, month, day, hour);
        const flags = this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED | this.swe.SEFLG_SIDEREAL;

        const planets = [
            { id: this.swe.SE_SUN, name: "Sun" },
            { id: this.swe.SE_MOON, name: "Moon" },
            { id: this.swe.SE_MERCURY, name: "Mercury" },
            { id: this.swe.SE_VENUS, name: "Venus" },
            { id: this.swe.SE_MARS, name: "Mars" },
            { id: this.swe.SE_JUPITER, name: "Jupiter" },
            { id: this.swe.SE_SATURN, name: "Saturn" },
            { id: this.swe.SE_URANUS, name: "Uranus" },
            { id: this.swe.SE_NEPTUNE, name: "Neptune" },
            { id: this.swe.SE_PLUTO, name: "Pluto" },
            { id: this.swe.SE_MEAN_NODE, name: "Rahu" },
            { id: this.swe.SE_MEAN_NODE, name: "Ketu", isKetu: true }, // Ketu is 180 deg from Rahu
        ];

        const ayanamsa = this.swe.get_ayanamsa(jd);

        const results = planets.map(p => {
            const pos = this.swe.calc_ut(jd, p.id, flags);
            let longitude = pos[0];
            if (p.isKetu) longitude = (longitude + 180) % 360;

            // Ensure longitude is a valid number
            if (typeof longitude !== 'number' || isNaN(longitude)) {
                longitude = 0;
            }

            const signId = Math.floor(longitude / 30) + 1;
            const deg = longitude % 30;

            return {
                name: p.name,
                longitude,
                signId,
                degree: deg,
                speed: pos[3] || 0,
                isRetrograde: (pos[3] || 0) < 0
            };
        });

        // --- Ascendant Calculation ---
        // Try swisseph houses() first
        let ascendant: number | undefined;
        let housesCusps: number[] = [];
        try {
            const houses = this.swe.houses(jd, lat, lng, 'B');
            if (houses && typeof houses.ascendant === 'number' && !isNaN(houses.ascendant)) {
                ascendant = houses.ascendant;
                housesCusps = houses.house || [];
                console.log('[SwissEph] houses() succeeded, ascendant:', ascendant);
            }
        } catch (e) {
            console.warn('[SwissEph] houses() failed:', e);
        }

        // Fallback: Calculate ascendant mathematically using Local Sidereal Time
        if (ascendant === undefined || isNaN(ascendant)) {
            console.log('[SwissEph] Using mathematical ascendant calculation fallback');

            // Calculate Local Sidereal Time (LST)
            // Step 1: Days since J2000.0
            const J2000 = 2451545.0;
            const d0 = jd - J2000;

            // Step 2: Greenwich Mean Sidereal Time (GMST) in degrees
            let gmst = 280.46061837 + 360.98564736629 * d0;
            gmst = ((gmst % 360) + 360) % 360;

            // Step 3: Local Sidereal Time (add longitude)
            let lst = gmst + lng;
            lst = ((lst % 360) + 360) % 360;

            // Step 4: RAMC (Right Ascension of Medium Coeli) = LST
            const ramcRad = (lst * Math.PI) / 180;
            const latRad = (lat * Math.PI) / 180;

            // Step 5: Obliquity of ecliptic (~23.4393°)
            const epsilon = 23.4393;
            const epsRad = (epsilon * Math.PI) / 180;

            // Step 6: Ascendant formula
            // ASC = atan2(cos(RAMC), -(sin(RAMC)*cos(e) + tan(lat)*sin(e)))
            const ascRad = Math.atan2(
                Math.cos(ramcRad),
                -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
            );
            let ascDeg = (ascRad * 180) / Math.PI;
            ascDeg = ((ascDeg % 360) + 360) % 360;

            // Apply Lahiri ayanamsa to get sidereal ascendant
            ascendant = ((ascDeg - ayanamsa) % 360 + 360) % 360;

            console.log('[SwissEph] Calculated sidereal ascendant:', ascendant.toFixed(2), '° (sign:', Math.floor(ascendant / 30) + 1, ')');
        }

        // Add Ascendant as a pseudo-planet in the results
        const ascSignId = Math.floor(ascendant / 30) + 1;
        results.push({
            name: "Asc",
            longitude: ascendant,
            signId: ascSignId,
            degree: ascendant % 30,
            speed: 0,
            isRetrograde: false
        });

        return {
            jd,
            ayanamsa,
            planets: results,
            houses: housesCusps,
            ascendant
        };
    }

    public close() {
        if (this.swe) {
            this.swe.close();
            this.initialized = false;
        }
    }
}
