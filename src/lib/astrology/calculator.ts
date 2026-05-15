import { AstrologyService } from "./swisseph-service";
import { calculateGuna } from "./gun-milan";
import { calculateAllDivisions } from "./divisional-charts";
import { detectYogas } from "./yoga-engine";
import { generateRemedies } from "./remedy-engine";

export function getZodiacSign(longitude: number): string {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const signId = Math.floor((longitude % 360) / 30);
    return signs[signId];
}

export function calculatePanchang(date: Date, planets: any[], lat: number = 22.9734, lng: number = 78.6569, jdSunrise?: number, jdSunset?: number) {
    const sun = planets.find(p => p.name === "Sun");
    const moon = planets.find(p => p.name === "Moon");

    if (!sun || !moon) return {};

    // 1. Tithi (12 degrees per Tithi)
    let diff = moon.longitude - sun.longitude;
    if (diff < 0) diff += 360;
    const tithi = Math.floor(diff / 12) + 1;
    const paksha = tithi <= 15 ? "Shukla" : "Krishna";

    // 2. Yoga (Sun + Moon, 13 deg 20 min per Yoga)
    let sum = moon.longitude + sun.longitude;
    if (sum >= 360) sum -= 360;
    const yoga = Math.floor(sum / (360 / 27)) + 1;

    // 3. Karana (6 degrees per Karana, starts from 2nd half of 1st Tithi)
    const karana = Math.floor(diff / 6) + 1;

    // 4. Vara (Weekday)
    const vara = date.getDay(); // 0 is Sunday

    // 5. Sunrise & Sunset Calculation for IST
    const istOffset = 5.5;
    let sunriseIST = 0;
    let sunsetIST = 0;

    if (jdSunrise && jdSunset) {
        // High-Precision NASA Path: Convert JD UT to local decimal hours (IST)
        const istDays = 5.5 / 24;
        sunriseIST = ((jdSunrise + 0.5 + istDays) % 1) * 24;
        sunsetIST = ((jdSunset + 0.5 + istDays) % 1) * 24;
    } else {
        // Simplified fallback calculation based on location
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
        const latRad = (lat * Math.PI) / 180;

        // Solar declination approximation
        const declination = Math.asin(Math.sin(23.45 * Math.PI / 180) * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180));

        // Hour angle at sunrise/sunset
        const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
        const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle))) * 180 / Math.PI;

        // Calculate sunrise/sunset in UTC
        const sunriseUTC = 12 - hourAngle / 15 - lng / 15;
        const sunsetUTC = 12 + hourAngle / 15 - lng / 15;

        // Convert to IST (UTC+5:30)
        sunriseIST = sunriseUTC + istOffset;
        sunsetIST = sunsetUTC + istOffset;
    }

    // Format time as HH:MM
    const formatTime = (decimal: number) => {
        let hours = Math.floor(decimal);
        while (hours < 0) hours += 24;
        while (hours >= 24) hours -= 24;
        const minutes = Math.round((decimal - Math.floor(decimal)) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const tithiNum = tithi > 30 ? 30 : tithi;
    const yogaNum = yoga > 27 ? 27 : yoga;
    const karanaNum = karana > 60 ? 60 : karana;

    // Tithi mapping: 1-15 and 16-30 both map to 0-14 (indices 0 to 14), index 15 = Amavasya/Purnima 
    let tithiId = (tithiNum - 1) % 15;
    if (tithiNum === 15 || tithiNum === 30) {
        tithiId = tithiNum === 15 ? 14 : 15; // 14 for Purnima (index 14), 15 for Amavasya (index 15)
    }

    // Karana Mapping (11 unique karanas spread over 60 halves)
    // Movable: repeats 8 times (7x8 = 56). Fixed: 4 times.
    let karanaId = 0;
    if (karanaNum === 1) karanaId = 10; // Kintughna
    else if (karanaNum === 58) karanaId = 7; // Shakuni
    else if (karanaNum === 59) karanaId = 8; // Chatushpada
    else if (karanaNum === 60) karanaId = 9; // Naga
    else {
        // Between 2 and 57 (inclusive), map index offset - 2, modulo 7 for movable karanas
        karanaId = (karanaNum - 2) % 7;
    }

    return {
        tithi: tithiNum,
        tithiId,
        paksha,
        yoga: yogaNum,
        yogaId: (yogaNum - 1),
        karana: karanaNum,
        karanaId,
        vara,
        sunrise: formatTime(sunriseIST),
        sunset: formatTime(sunsetIST)
    };
}

export function calculateVimshottari(nakshatraId: number, longitude: number, birthDate: Date) {
    const nakSize = 360 / 27;
    const degInNak = longitude % nakSize;
    const percentDone = degInNak / nakSize;

    const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    const durations = [7, 20, 6, 10, 7, 18, 16, 19, 17];

    const startLordIdx = (nakshatraId - 1) % 9;
    const firstMahadashaUsed = durations[startLordIdx] * percentDone;
    const firstMahadashaLeft = durations[startLordIdx] - firstMahadashaUsed;

    const mahadashas = [];
    let currentPtr = new Date(birthDate);

    // Calculate 108 years (full cycle is 120, but 108 is usually enough for a report)
    let lordIdx = startLordIdx;

    for (let i = 0; i < 9; i++) {
        const duration = i === 0 ? firstMahadashaLeft : durations[lordIdx];
        const endDate = new Date(currentPtr);
        endDate.setFullYear(endDate.getFullYear() + Math.floor(duration));
        endDate.setMonth(endDate.getMonth() + Math.round((duration % 1) * 12));

        // Calculate Antardashas within each Mahadasha
        const antardashas = [];
        let adPtr = new Date(currentPtr);
        let adLordIdx = i === 0 ? startLordIdx : lordIdx;

        for (let j = 0; j < 9; j++) {
            const adDuration = (durations[lordIdx] * durations[adLordIdx]) / 120;
            const adEnd = new Date(adPtr);
            adEnd.setFullYear(adEnd.getFullYear() + Math.floor(adDuration));
            adEnd.setMonth(adEnd.getMonth() + Math.round((adDuration % 1) * 12));

            antardashas.push({
                lord: lords[adLordIdx],
                start: adPtr.toISOString(),
                end: adEnd.toISOString()
            });
            adPtr = adEnd;
            adLordIdx = (adLordIdx + 1) % 9;
        }

        mahadashas.push({
            lord: lords[lordIdx],
            start: currentPtr.toISOString(),
            end: endDate.toISOString(),
            antardashas
        });

        currentPtr = endDate;
        lordIdx = (lordIdx + 1) % 9;
    }

    const nowMs = Date.now();
    let currentLords = ['—', '—', '—'];
    const activeMaha = mahadashas.find(m => {
        const s = new Date(m.start).getTime(), e = new Date(m.end).getTime();
        return nowMs >= s && nowMs <= e;
    }) || mahadashas[0];
    
    if (activeMaha) {
        const activeAntar = activeMaha.antardashas?.find((a: any) => {
            const s = new Date(a.start).getTime(), e = new Date(a.end).getTime();
            return nowMs >= s && nowMs <= e;
        }) || activeMaha.antardashas?.[0];
        currentLords = [activeMaha.lord, activeAntar?.lord || '—', '—'];
    }

    return {
        mahadashas,
        periods: mahadashas,
        currentLords,
        percentLeft: 1 - percentDone
    };
}

export async function getFullAstrologyData(date: Date, lat: number, lng: number) {
    const service = await AstrologyService.getInstance();
    const data = await service.calculatePlanets(date, lat, lng);

    const ascSignId = Math.floor(data.ascendant / 30); // 0-indexed, e.g. Leo=4

    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

    const planetsWithVaisheshika = data.planets.map(p => {
        const planetSignId0 = Math.floor(p.longitude / 30) % 12; // 0-indexed sign
        const nakshatraId = Math.floor(p.longitude / (360 / 27)) % 27 + 1;

        // WHOLE SIGN house: house = (planet_sign - lagna_sign + 12) % 12 + 1
        const house = (planetSignId0 - ascSignId + 12) % 12 + 1;

        return {
            ...p,
            signId: planetSignId0 + 1,        // 1-indexed
            sign: signs[planetSignId0],
            nakshatraId,
            nakshatra: nakshatras[nakshatraId - 1],
            house,
            divisions: calculateAllDivisions(p.longitude)
        };
    });

    // Pass high precision sunrise/sunset from Swiss Ephemeris
    const panchang = calculatePanchang(date, planetsWithVaisheshika, lat, lng, data.sunrise, data.sunset);
    const moon = planetsWithVaisheshika.find(p => p.name === "Moon");
    const dasha = moon ? calculateVimshottari(moon.nakshatraId, moon.longitude, date) : null;

    // Calculate Doshas
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    const mars = planetsWithVaisheshika.find(p => p.name === "Mars");
    const rahu = planetsWithVaisheshika.find(p => p.name === "Rahu");
    const ketu = planetsWithVaisheshika.find(p => p.name === "Ketu");
    const sun = planetsWithVaisheshika.find(p => p.name === "Sun");
    const saturn = planetsWithVaisheshika.find(p => p.name === "Saturn");

    const marsHouse = mars ? mars.house : 0;
    const isManglik = marsHouse > 0 && manglikHouses.includes(marsHouse);

    // Kaal Sarp Dosha: Check if all planets are hemmed between Rahu and Ketu
    let isKaalSarp = false;
    let kaalSarpDesc = "No Kaal Sarp Dosha detected.";
    if (rahu && ketu) {
        const rahuLong = rahu.longitude;
        const ketuLong = ketu.longitude;

        // Check if all planets (except Rahu/Ketu) are on one side
        const planetsToCheck = planetsWithVaisheshika.filter(p => p.name !== "Rahu" && p.name !== "Ketu" && p.name !== "Asc");
        
        const allRahuToKetu = planetsToCheck.every(p => {
            const diff = (p.longitude - rahuLong + 360) % 360;
            return diff < 180;
        });

        const allKetuToRahu = planetsToCheck.every(p => {
            const diff = (p.longitude - rahuLong + 360) % 360;
            return diff > 180;
        });

        isKaalSarp = allRahuToKetu || allKetuToRahu;
        if (isKaalSarp) {
            kaalSarpDesc = "Kaal Sarp Dosha is present. All planets are positioned on one side of the Rahu-Ketu axis, which may cause obstacles and delays in life.";
        }
    }

    // Pitra Dosha: Sun afflicted by Rahu/Ketu or 9th house issues
    let isPitra = false;
    let pitraDesc = "No Pitra Dosha detected.";
    if (sun && rahu && ketu) {
        const sunHouse = sun.house;
        const rahuHouse = rahu.house;
        const ketuHouse = ketu.house;

        // Check if Sun is in same house as Rahu/Ketu or 9th house afflicted
        isPitra = sunHouse === rahuHouse || sunHouse === ketuHouse || sunHouse === 9 || rahuHouse === 9 || ketuHouse === 9;
        if (isPitra) {
            pitraDesc = "Pitra Dosha is present, indicating ancestral karmic debts. This may manifest as obstacles in progeny or family issues.";
        }
    }

    // Sade Sati: Saturn transiting 12th, 1st, or 2nd from Moon sign
    let isSadeSati = false;
    let sadeSatiDesc = "No Sade Sati currently.";
    if (saturn && moon) {
        const saturnSign = saturn.signId;
        const moonSign = moon.signId;

        // Calculate relative position
        const diff = (saturnSign - moonSign + 12) % 12;
        isSadeSati = diff === 0 || diff === 1 || diff === 11; // 12th, 1st, or 2nd house from Moon

        if (isSadeSati) {
            const phase = diff === 11 ? "Rising" : diff === 0 ? "Peak" : "Setting";
            sadeSatiDesc = `Sade Sati is active (${phase} phase). This 7.5-year transit may bring challenges and transformations.`;
        }
    }

    const doshas = {
        Manglik: {
            present: isManglik,
            house: marsHouse,
            description: isManglik ? `Mars is placed in house ${marsHouse}, which can cause challenges in marital harmony.` : "No significant Manglik affliction."
        },
        KaalSarp: {
            present: isKaalSarp,
            description: kaalSarpDesc
        },
        Pitra: {
            present: isPitra,
            description: pitraDesc
        },
        SadeSati: {
            present: isSadeSati,
            description: sadeSatiDesc
        }
    };

    const yogas = detectYogas(planetsWithVaisheshika, data.houses);
    const remedies = generateRemedies(doshas);

    // Div Charts for the native
    const buildHouseChart = (planets: any[], key: 'house' | 'sign' | 'D9' | 'D10') => {
        const chart: { [house: number]: string[] } = {};
        
        let divAscSign = 1; // Default to Aries
        if (key === 'D9' || key === 'D10') {
            const ascPlanet = planets.find(p => p.name === 'Asc');
            if (ascPlanet) {
                divAscSign = ascPlanet.divisions[key];
            }
        }

        planets.forEach(p => {
            let houseNum: number;
            if (key === 'house') {
                houseNum = p.house;
            } else if (key === 'sign') {
                houseNum = p.signId;
            } else {
                const pSign = p.divisions[key];
                houseNum = (pSign - divAscSign + 12) % 12 + 1;
            }

            if (!chart[houseNum]) {
                chart[houseNum] = [];
            }
            chart[houseNum].push(p.name);
        });
        return chart;
    };

    const charts = {
        D1: buildHouseChart(planetsWithVaisheshika, 'house'),
        D9: buildHouseChart(planetsWithVaisheshika, 'D9'),
        D10: buildHouseChart(planetsWithVaisheshika, 'D10'),
        Moon: buildHouseChart(planetsWithVaisheshika.map(p => ({
            ...p,
            house: ((p.signId - moon!.signId + 12) % 12) + 1
        })), 'house')
    };

    const d9Asc = planetsWithVaisheshika.find(p => p.name === 'Asc')?.divisions.D9 || 1;
    const d10Asc = planetsWithVaisheshika.find(p => p.name === 'Asc')?.divisions.D10 || 1;

    return {
        ...data,
        name: "Self",
        moonSign: moon?.sign || "Unknown",
        nakshatra: moon?.nakshatra || "Unknown",
        ascendantSign: signs[ascSignId],
        planets: planetsWithVaisheshika,
        panchang,
        dasha,
        doshas,
        yogas,
        remedies,
        charts,
        d9Ascendant: (d9Asc - 1) * 30,
        d10Ascendant: (d10Asc - 1) * 30,
    };
}

export async function performMatchMaking(boyDetails: any, girlDetails: any) {
    const boyData = await getFullAstrologyData(boyDetails.date, boyDetails.lat, boyDetails.lng);
    const girlData = await getFullAstrologyData(girlDetails.date, girlDetails.lat, girlDetails.lng);

    // Merge names and details for UI
    const boy = { 
        ...boyData, 
        name: boyDetails.name || "Groom",
        dob: boyDetails.date.toLocaleDateString(),
        tob: boyDetails.date.toLocaleTimeString(),
        pob: boyDetails.birthplace || "Unknown"
    };
    const girl = { 
        ...girlData, 
        name: girlDetails.name || "Bride",
        dob: girlDetails.date.toLocaleDateString(),
        tob: girlDetails.date.toLocaleTimeString(),
        pob: girlDetails.birthplace || "Unknown"
    };

    const boyMoon = boy.planets.find(p => p.name === "Moon");
    const girlMoon = girl.planets.find(p => p.name === "Moon");

    const milan = calculateGuna(boyMoon, girlMoon);

    return {
        boy,
        girl,
        milan
    };
}
