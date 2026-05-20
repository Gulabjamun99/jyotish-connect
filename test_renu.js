const SwissEph = require('swisseph-wasm');
const path = require('path');

async function checkRenu() {
    const swe = new SwissEph();
    await swe.initSwissEph();
    swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
    const ephePath = path.join(__dirname, 'public', 'ephe');
    await swe.set_ephe_path(ephePath);

    // June 19, 1998, 23:20 IST. Jamshedpur: Lat 22.8046 N, Lng 86.2029 E.
    // Convert 23:20 IST to UTC: 23:20 - 5:30 = 17:50 UTC on June 19, 1998.
    const year = 1998;
    const month = 6;
    const day = 19;
    const hour = 17 + 50 / 60; // 17.8333

    const jd = swe.julday(year, month, day, hour);
    const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;
    const ayanamsa = swe.get_ayanamsa(jd);

    console.log("Julian Day:", jd);
    console.log("Ayanamsa:", ayanamsa);

    const houses = swe.houses(jd, 22.8046, 86.2029, 'W');
    const ascendant = houses.ascendant;
    console.log("Ascendant Sidereal longitude:", ascendant);
    const ascSignId = Math.floor(ascendant / 30);
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    console.log("Ascendant Sign:", signs[ascSignId], "Degree:", ascendant % 30);

    const marsPos = swe.calc_ut(jd, swe.SE_MARS, flags);
    const marsLong = marsPos[0];
    const marsSignId = Math.floor(marsLong / 30);
    const marsHouse = (marsSignId - ascSignId + 12) % 12 + 1;
    console.log("Mars Sidereal Longitude:", marsLong);
    console.log("Mars Sign:", signs[marsSignId], "Degree:", marsLong % 30);
    console.log("Mars House:", marsHouse);

    swe.close();
}

checkRenu().catch(console.error);
