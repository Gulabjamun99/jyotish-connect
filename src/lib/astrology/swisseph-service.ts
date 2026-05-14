import SwissEph from 'swisseph-wasm';
import path from 'path';

export class AstrologyService {
    private static instance: AstrologyService;
    private swe: any;
    private initialized: boolean = false;

    private constructor() { }

    public static async getInstance(): Promise<AstrologyService> {
        // Ensure this ONLY runs on the server
        if (typeof window !== 'undefined') {
            throw new Error("AstrologyService can only be used on the server.");
        }

        if (!AstrologyService.instance) {
            AstrologyService.instance = new AstrologyService();
            await AstrologyService.instance.init();
        }
        return AstrologyService.instance;
    }

    private async init() {
        if (this.initialized) return;
        
        console.log('[AstrologyService] Initializing SwissEph...');
        this.swe = new SwissEph();
        
        try {
            await this.swe.initSwissEph();
            
            // Set standard Lahiri Ayanamsa
            this.swe.set_sid_mode(this.swe.SE_SIDM_LAHIRI, 0, 0);
            
            // Set ephemeris path
            // In Vercel, public folder is at the root
            const ephePath = path.join(process.cwd(), 'public', 'ephe');
            await this.swe.set_ephe_path(ephePath);
            
            this.initialized = true;
            console.log('[AstrologyService] Initialization complete.');
        } catch (error) {
            console.error('[AstrologyService] Initialization failed:', error);
            // Fallback: mark as initialized but limited
            this.initialized = true; 
        }
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
            { id: this.swe.SE_TRUE_NODE, name: "Rahu" },
            { id: this.swe.SE_TRUE_NODE, name: "Ketu", isKetu: true },
        ];

        const ayanamsa = this.swe.get_ayanamsa(jd);

        const results: any[] = [];

        // Calculate each planet
        const planetDefs = [
            { id: this.swe.SE_SUN,     name: "Sun" },
            { id: this.swe.SE_MOON,    name: "Moon" },
            { id: this.swe.SE_MERCURY, name: "Mercury" },
            { id: this.swe.SE_VENUS,   name: "Venus" },
            { id: this.swe.SE_MARS,    name: "Mars" },
            { id: this.swe.SE_JUPITER, name: "Jupiter" },
            { id: this.swe.SE_SATURN,  name: "Saturn" },
            { id: this.swe.SE_URANUS,  name: "Uranus" },
            { id: this.swe.SE_NEPTUNE, name: "Neptune" },
            { id: this.swe.SE_PLUTO,   name: "Pluto" },
            { id: this.swe.SE_TRUE_NODE, name: "Rahu" },
        ];

        for (const p of planetDefs) {
            const pos = this.swe.calc_ut(jd, p.id, flags);
            let longitude = pos[0];

            if (typeof longitude !== 'number' || isNaN(longitude)) {
                longitude = 0;
            }

            // Ensure longitude is in 0-360 range
            longitude = ((longitude % 360) + 360) % 360;

            const speed = pos[3] || 0;
            // Sun and Moon are NEVER retrograde - guard against calculation artifacts
            const isRetrograde = (p.name === 'Sun' || p.name === 'Moon')
                ? false
                : speed < 0;

            results.push({
                name: p.name,
                longitude,
                signId: (Math.floor(longitude / 30) % 12) + 1,
                degree: longitude % 30,
                speed,
                isRetrograde
            });
        }

        // Ketu = Rahu + 180 degrees (always exactly opposite)
        const rahu = results.find(r => r.name === 'Rahu')!;
        const ketuLong = ((rahu.longitude + 180) % 360);
        results.push({
            name: 'Ketu',
            longitude: ketuLong,
            signId: (Math.floor(ketuLong / 30) % 12) + 1,
            degree: ketuLong % 30,
            speed: rahu.speed,      // Rahu/Ketu move together
            isRetrograde: true      // Rahu/Ketu always retrograde by convention in Vedic
        });
        // Also mark Rahu as retrograde by convention
        rahu.isRetrograde = true;

        // Sunrise/Sunset
        let sunrise: number | undefined;
        let sunset: number | undefined;
        try {
            const geopos = [lng, lat, 0];
            const sunriseRes = this.swe.rise_trans(jd, this.swe.SE_SUN, null, this.swe.SEFLG_SWIEPH, 1, geopos, 0, 0);
            const sunsetRes = this.swe.rise_trans(jd, this.swe.SE_SUN, null, this.swe.SEFLG_SWIEPH, 2, geopos, 0, 0);

            if (sunriseRes && sunriseRes.tret) sunrise = sunriseRes.tret[0];
            if (sunsetRes && sunsetRes.tret) sunset = sunsetRes.tret[0];
        } catch (e) {
            console.warn('[SwissEph] rise_trans failed:', e);
        }

        // Ascendant & Houses — Vedic uses WHOLE SIGN house system
        // 'W' = Whole Sign, 'P' = Placidus, 'B' = Alcabitius (wrong for Vedic)
        let ascendant: number | undefined;
        let housesCusps: number[] = [];
        try {
            // Use Whole Sign houses for Vedic astrology
            const houses = this.swe.houses(jd, lat, lng, 'W');
            if (houses && typeof houses.ascendant === 'number' && !isNaN(houses.ascendant)) {
                // houses.ascendant from sidereal flag is already sidereal
                ascendant = ((houses.ascendant % 360) + 360) % 360;
                housesCusps = houses.house || [];
            }
        } catch (e) {
            console.warn('[SwissEph] houses() failed:', e);
        }

        if (ascendant === undefined || isNaN(ascendant)) {
            // Mathematical fallback for Sidereal Ascendant
            const J2000 = 2451545.0;
            const d0 = jd - J2000;
            let gmst = 280.46061837 + 360.98564736629 * d0;
            gmst = ((gmst % 360) + 360) % 360;
            let lst = gmst + lng;
            lst = ((lst % 360) + 360) % 360;
            const ramcRad = (lst * Math.PI) / 180;
            const latRad = (lat * Math.PI) / 180;
            const epsRad = (23.4393 * Math.PI) / 180;
            const ascRad = Math.atan2(Math.cos(ramcRad), -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad)));
            let ascTropical = (ascRad * 180) / Math.PI;
            ascTropical = ((ascTropical % 360) + 360) % 360;
            // Apply ayanamsa to convert tropical to sidereal
            ascendant = ((ascTropical - ayanamsa) % 360 + 360) % 360;
            console.warn('[SwissEph] Using fallback ascendant calculation, ayanamsa:', ayanamsa);
        }

        // In Whole Sign system, house cusps are simply every 30° from ascendant sign start
        const ascSignId = Math.floor(ascendant / 30); // 0-indexed sign of lagna
        if (housesCusps.length === 0) {
            // Build whole sign house cusps: H1 starts at the beginning of Lagna's sign
            for (let h = 0; h < 12; h++) {
                housesCusps.push(((ascSignId + h) % 12) * 30);
            }
        }

        results.push({
            name: "Asc",
            longitude: ascendant,
            signId: (Math.floor(ascendant / 30) % 12) + 1,
            degree: ascendant % 30,
            speed: 0,
            isRetrograde: false
        });

        return {
            jd,
            ayanamsa,
            planets: results,
            houses: housesCusps,
            ascendant,
            sunrise,
            sunset
        };
    }

    public close() {
        if (this.swe) {
            this.swe.close();
            this.initialized = false;
        }
    }
}
