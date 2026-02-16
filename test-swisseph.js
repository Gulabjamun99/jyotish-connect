const swisseph = require('swisseph-wasm');

async function test() {
    try {
        await swisseph.init();
        console.log("Swiss Ephemeris WASM initialized");

        // Test planetary position
        // swe_calc_ut(jd, ipl, iflag)
        // 2460706.5 = Feb 2, 2026 12:00 UTC
        const jd = 2460706.5;
        const flags = swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;

        // Set Ayanamsa to Lahiri
        swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

        const sun = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, flags);
        console.log("Sun Position:", sun);

        const moon = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, flags);
        console.log("Moon Position:", moon);

        // Terminate
        swisseph.swe_close();
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
