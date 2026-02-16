export const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

import { GANA_TABLE, YONI_TABLE, NADI_TABLE, LORD_FRIENDSHIP, SIGN_LORDS, YONI_COMPATIBILITY } from './gun-milan-tables';

export function calculateGuna(boyMoon: any, girlMoon: any) {
    const ashtakoot: any = {
        varna: { score: 0, boyVal: "", girlVal: "", total: 1 },
        vashya: { score: 0, boyVal: "", girlVal: "", total: 2 },
        tara: { score: 0, boyVal: "", girlVal: "", total: 3 },
        yoni: { score: 0, boyVal: "", girlVal: "", total: 4 },
        maitri: { score: 0, boyVal: "", girlVal: "", total: 5 },
        gana: { score: 0, boyVal: "", girlVal: "", total: 6 },
        bhakoot: { score: 0, boyVal: "", girlVal: "", total: 7 },
        nadi: { score: 0, boyVal: "", girlVal: "", total: 8 }
    };

    // 1. Varna (1 point)
    const getVarna = (signId: number) => {
        if ([4, 8, 12].includes(signId)) return 4; // Brahmin
        if ([1, 5, 9].includes(signId)) return 3;  // Kshatriya
        if ([2, 6, 10].includes(signId)) return 2; // Vaishya
        return 1; // Shudra
    };
    const bVarna = getVarna(boyMoon.signId);
    const gVarna = getVarna(girlMoon.signId);
    ashtakoot.varna.score = bVarna >= gVarna ? 1 : 0;
    ashtakoot.varna.boyVal = ["", "Shudra", "Vaishya", "Kshatriya", "Brahmin"][bVarna];
    ashtakoot.varna.girlVal = ["", "Shudra", "Vaishya", "Kshatriya", "Brahmin"][gVarna];

    // 2. Vashya (2 points)
    // Simplified logic: 2 if same, 0 if enemy, 1 if neutral
    ashtakoot.vashya.score = boyMoon.signId === girlMoon.signId ? 2 : 1;

    // 3. Tara (3 points)
    const taraDiff = (girlMoon.nakshatraId - boyMoon.nakshatraId + 27) % 9;
    if ([1, 2, 4, 6, 8, 0].includes(taraDiff % 9)) ashtakoot.tara.score = 3;
    else ashtakoot.tara.score = 1.5;

    // 4. Yoni (4 points)
    const bYoni = YONI_TABLE[boyMoon.nakshatra];
    const gYoni = YONI_TABLE[girlMoon.nakshatra];
    ashtakoot.yoni.boyVal = bYoni;
    ashtakoot.yoni.girlVal = gYoni;
    ashtakoot.yoni.score = YONI_COMPATIBILITY[bYoni]?.[gYoni] ?? 2; // Default to neutral

    // 5. Maitri (5 points)
    const bLord = SIGN_LORDS[boyMoon.signId - 1];
    const gLord = SIGN_LORDS[girlMoon.signId - 1];
    ashtakoot.maitri.boyVal = bLord;
    ashtakoot.maitri.girlVal = gLord;
    ashtakoot.maitri.score = LORD_FRIENDSHIP[bLord]?.[gLord] ?? 0;

    // 6. Gana (6 points)
    const bGana = GANA_TABLE[boyMoon.nakshatra];
    const gGana = GANA_TABLE[girlMoon.nakshatra];
    ashtakoot.gana.boyVal = bGana;
    ashtakoot.gana.girlVal = gGana;
    if (bGana === gGana) ashtakoot.gana.score = 6;
    else if (bGana === "Deva" && gGana === "Manushya") ashtakoot.gana.score = 6;
    else if (bGana === "Manushya" && gGana === "Deva") ashtakoot.gana.score = 5;
    else if (bGana === "Deva" && gGana === "Rakshasa") ashtakoot.gana.score = 1;
    else ashtakoot.gana.score = 0;

    // 7. Bhakoot (7 points)
    const diff = (girlMoon.signId - boyMoon.signId + 12) % 12 + 1;
    if ([1, 7, 3, 11, 4, 10].includes(diff)) ashtakoot.bhakoot.score = 7;
    else ashtakoot.bhakoot.score = 0;

    // 8. Nadi (8 points)
    const bNadi = NADI_TABLE[boyMoon.nakshatra];
    const gNadi = NADI_TABLE[girlMoon.nakshatra];
    ashtakoot.nadi.boyVal = bNadi;
    ashtakoot.nadi.girlVal = gNadi;
    ashtakoot.nadi.score = bNadi !== gNadi ? 8 : 0;

    const totalScore = Object.values(ashtakoot).reduce((acc: number, curr: any) => acc + curr.score, 0);

    return {
        totalScore,
        ashtakoot
    };
}
