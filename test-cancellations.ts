import { calculateGuna } from "./src/lib/astrology/gun-milan";

console.log("==========================================");
console.log("RUNNING ASTROLOGICAL CANCELLATION TESTS");
console.log("==========================================\n");

// Test Case 1: Bhakoot Cancellation (Aries vs Scorpio - Both Mars-ruled, 6-8 relation)
const boy1 = {
    signId: 1, // Aries
    nakshatra: "Ashwini",
    nakshatraId: 0
};
const girl1 = {
    signId: 8, // Scorpio
    nakshatra: "Anuradha",
    nakshatraId: 16
};

console.log("--- TEST CASE 1: BHAKOOT CANCELLATION ---");
console.log(`Boy: Moon Sign Aries (signId: 1, lord: Mars), Nakshatra: Ashwini`);
console.log(`Girl: Moon Sign Scorpio (signId: 8, lord: Mars), Nakshatra: Anuradha`);

const result1 = calculateGuna(boy1, girl1);
console.log("Calculated Ashtakoot Milan Guna:");
console.log(`Total Score: ${result1.totalScore} / 36`);
console.log(`Bhakoot Score: ${result1.ashtakoot.bhakoot.score} / 7`);
console.log(`Bhakoot Interpretation: ${result1.ashtakoot.bhakoot.interpretation}`);
console.log(`Nadi Score: ${result1.ashtakoot.nadi.score} / 8`);
console.log(`Nadi Interpretation: ${result1.ashtakoot.nadi.interpretation}`);
console.log("-----------------------------------------\n");

// Test Case 2: Nadi Cancellation (Same Moon Sign, Different Nakshatras - both Adi Nadi)
const boy2 = {
    signId: 1, // Aries
    nakshatra: "Ashwini", // Adi Nadi
    nakshatraId: 0
};
const girl2 = {
    signId: 1, // Aries
    nakshatra: "Ardra", // Adi Nadi
    nakshatraId: 5
};

console.log("--- TEST CASE 2: NADI CANCELLATION (Same Sign, Diff Nakshatras) ---");
console.log(`Boy: Moon Sign Aries (signId: 1), Nakshatra: Ashwini (Adi Nadi)`);
console.log(`Girl: Moon Sign Aries (signId: 1), Nakshatra: Ardra (Adi Nadi)`);

const result2 = calculateGuna(boy2, girl2);
console.log("Calculated Ashtakoot Milan Guna:");
console.log(`Total Score: ${result2.totalScore} / 36`);
console.log(`Nadi Score: ${result2.ashtakoot.nadi.score} / 8`);
console.log(`Nadi Interpretation: ${result2.ashtakoot.nadi.interpretation}`);
console.log(`Bhakoot Score: ${result2.ashtakoot.bhakoot.score} / 7`);
console.log("-----------------------------------------\n");

// Test Case 3: Nadi Cancellation (Different Moon Signs, Same Nakshatras - both Antya Nadi)
const boy3 = {
    signId: 1, // Aries
    nakshatra: "Krittika", // Antya Nadi
    nakshatraId: 2
};
const girl3 = {
    signId: 2, // Taurus
    nakshatra: "Krittika", // Antya Nadi
    nakshatraId: 2
};

console.log("--- TEST CASE 3: NADI CANCELLATION (Diff Signs, Same Nakshatra) ---");
console.log(`Boy: Moon Sign Aries (signId: 1), Nakshatra: Krittika (Antya Nadi)`);
console.log(`Girl: Moon Sign Taurus (signId: 2), Nakshatra: Krittika (Antya Nadi)`);

const result3 = calculateGuna(boy3, girl3);
console.log("Calculated Ashtakoot Milan Guna:");
console.log(`Total Score: ${result3.totalScore} / 36`);
console.log(`Nadi Score: ${result3.ashtakoot.nadi.score} / 8`);
console.log(`Nadi Interpretation: ${result3.ashtakoot.nadi.interpretation}`);
console.log(`Bhakoot Score: ${result3.ashtakoot.bhakoot.score} / 7`);
console.log("==========================================");
