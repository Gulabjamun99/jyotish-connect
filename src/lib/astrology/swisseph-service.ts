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

            const signId = Math.floor(longitude / 30) + 1;
            const deg = longitude % 30;

            return {
                name: p.name,
                longitude,
                signId,
                degree: deg,
                speed: pos[3],
                isRetrograde: pos[3] < 0
            };
        });

        // House calculation - Sripathi System (AstroSage standard)
        const houses = this.swe.houses(jd, lat, lng, 'B'); // 'B' for Sripathi
        const ascendant = houses.ascendant;



        return {
            jd,
            ayanamsa,
            planets: results,
            houses: houses.house || [],
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
