import SwissEph from 'swisseph-wasm';

async function test() {
    let swe = null;
    try {
        swe = new SwissEph();
        await swe.initSwissEph();
        console.log("Swiss Ephemeris WASM initialized");

        // 2460706.5 = Feb 2, 2026 12:00 UTC
        const jd = swe.julday(2026, 2, 2, 12);
        console.log("Julian Day:", jd);

        // Setup Sidereal mode (Lahiri)
        swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
        const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;

        const sun = swe.calc_ut(jd, swe.SE_SUN, flags);
        console.log("Sun Position (Sidereal):", sun); // [long, lat, dist, speed]

        const moon = swe.calc_ut(jd, swe.SE_MOON, flags);
        console.log("Moon Position (Sidereal):", moon);

        const ayanamsa = swe.get_ayanamsa(jd);
        console.log("Ayanamsa:", ayanamsa);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (swe) swe.close();
    }
}

test();
