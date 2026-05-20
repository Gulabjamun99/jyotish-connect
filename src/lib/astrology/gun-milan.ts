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
    const isAuspiciousTara = (diff: number) => [1, 2, 4, 6, 8, 0].includes(diff % 9);
    const bToG = (girlMoon.nakshatraId - boyMoon.nakshatraId + 27) % 9;
    const gToB = (boyMoon.nakshatraId - girlMoon.nakshatraId + 27) % 9;
    if (isAuspiciousTara(bToG) && isAuspiciousTara(gToB)) ashtakoot.tara.score = 3;
    else if (isAuspiciousTara(bToG) || isAuspiciousTara(gToB)) ashtakoot.tara.score = 1.5;
    else ashtakoot.tara.score = 0;

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
    let bhakootCancelled = false;
    let bhakootScore = 0;
    if ([1, 7, 3, 11, 4, 10].includes(diff)) {
        bhakootScore = 7;
    } else {
        // Check Bhakoot Dosha cancellation
        if (bLord === gLord) {
            bhakootCancelled = true;
            bhakootScore = 7;
        } else {
            const friendship1 = LORD_FRIENDSHIP[bLord]?.[gLord] ?? 0;
            const friendship2 = LORD_FRIENDSHIP[gLord]?.[bLord] ?? 0;
            if (friendship1 >= 4 && friendship2 >= 4) {
                bhakootCancelled = true;
                bhakootScore = 7;
            }
        }
    }
    ashtakoot.bhakoot.score = bhakootScore;

    // 8. Nadi (8 points)
    const bNadi = NADI_TABLE[boyMoon.nakshatra];
    const gNadi = NADI_TABLE[girlMoon.nakshatra];
    ashtakoot.nadi.boyVal = bNadi;
    ashtakoot.nadi.girlVal = gNadi;
    
    let nadiCancelled = false;
    let nadiScore = 0;
    if (bNadi !== gNadi) {
        nadiScore = 8;
    } else {
        // Check Nadi Dosha cancellation
        if (boyMoon.signId === girlMoon.signId && boyMoon.nakshatra !== girlMoon.nakshatra) {
            nadiCancelled = true;
            nadiScore = 8;
        } else if (boyMoon.signId !== girlMoon.signId && boyMoon.nakshatra === girlMoon.nakshatra) {
            nadiCancelled = true;
            nadiScore = 8;
        }
    }
    ashtakoot.nadi.score = nadiScore;

    // --- Interpretations ---
    ashtakoot.varna.interpretation = ashtakoot.varna.score === 1 ? "Excellent ego compatibility and work ethics." : "Work ethics and status may require adjustment.";
    ashtakoot.vashya.interpretation = ashtakoot.vashya.score === 2 ? "Mutual attraction and dominance are balanced." : "One partner may dominate the other.";
    ashtakoot.tara.interpretation = ashtakoot.tara.score === 3 ? "Destiny and longevity alignment is strong." : "Minor health or destiny conflicts possible.";
    ashtakoot.yoni.interpretation = ashtakoot.yoni.score >= 3 ? "Physical and biological compatibility is excellent." : "Physical needs and habits may differ.";
    ashtakoot.maitri.interpretation = ashtakoot.maitri.score >= 4 ? "Strong intellectual and psychological bond." : "Intellectual differences might arise.";
    ashtakoot.gana.interpretation = ashtakoot.gana.score >= 4 ? "Behavioral and social temperament is well-matched." : "Temperamental differences likely.";
    ashtakoot.bhakoot.interpretation = bhakootCancelled 
        ? "Bhakoot Dosha cancelled due to auspicious planetary friendship of sign lords. Highly favorable."
        : ashtakoot.bhakoot.score === 7 
            ? "Excellent financial and family growth." 
            : "Potential financial or family disagreements.";
    ashtakoot.nadi.interpretation = nadiCancelled 
        ? "Nadi Dosha cancelled due to same Moon sign with different Nakshatras or vice-versa. Safe for union."
        : ashtakoot.nadi.score === 8 
            ? "Superior genetic and physiological compatibility." 
            : "Caution: Potential health or progeny issues (Nadi Dosha).";

    const totalScore = Object.values(ashtakoot).reduce((acc: number, curr: any) => acc + curr.score, 0);

    return {
        totalScore,
        ashtakoot
    };
}
