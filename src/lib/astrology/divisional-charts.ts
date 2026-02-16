export function getDivisionalSign(longitude: number, division: number): number {
    const signId = Math.floor(longitude / 30);
    const degree = longitude % 30;
    const partSize = 30 / division;
    const part = Math.floor(degree / partSize);

    let resultSignId = 0;

    switch (division) {
        case 1: // Rasi
            resultSignId = signId;
            break;
        case 9: // Navamsa
            // Fire signs (Aries, Leo, Sag): Start from Aries
            // Earth signs (Taurus, Virgo, Cap): Start from Capricorn
            // Air signs (Gemini, Libra, Aqu): Start from Libra
            // Water signs (Can, Sco, Pis): Start from Cancer
            const startSignsD9 = [0, 9, 6, 3]; // 0=Aries, 9=Cap, 6=Lib, 3=Can (0-indexed)
            resultSignId = (startSignsD9[signId % 4] + part) % 12;
            break;
        case 10: // Dashamsha
            // Odd signs: Count from same sign
            // Even signs: Count from 9th from same sign
            if (signId % 2 === 0) { // Aries is 0 (Even-indexed, but it's 1st sign -> Odd)
                // Wait, signId 0 is Aries (Sign 1 - Odd)
                resultSignId = (signId + part) % 12;
            } else {
                resultSignId = ((signId + 8) % 12 + part) % 12;
            }
            break;
        case 16: // Shodashamsha
            // Move signs cyclically from Aries for Aries, Leo, Sag...
            // Actually simpler: result = (sign_index * 16 + part) % 12 for some charts.
            // Shodashamsha: Aries/Leo/Sag -> Aries, Tau/Vir/Cap -> Leo, Gem/Lib/Aqu -> Sag, Can/Sco/Pis -> Pis
            const startSignsD16 = [0, 4, 8, 11];
            resultSignId = (startSignsD16[signId % 4] + part) % 12;
            break;
        case 20: // Vimshamsha
            // Aries/Leo/Sag -> Aries, Tau/Vir/Cap -> Sag, Gem/Lib/Aqu -> Leo, Can/Sco/Pis -> ?
            // Standard rule: Aries... -> Aries, Taurus... -> Sagittarius, Gemini... -> Leo, Cancer... -> Aries
            const startSignsD20 = [0, 8, 4, 0];
            resultSignId = (startSignsD20[signId % 4] + part) % 12;
            break;
        case 24: // Chaturvimshamsha
            // Odd: Start from Leo. Even: Start from Cancer.
            if (signId % 2 === 0) {
                resultSignId = (4 + part) % 12; // Leo is index 4
            } else {
                resultSignId = (3 + part) % 12; // Cancer is index 3
            }
            break;
        case 60: // Shashtiamsha
            // Start from own sign
            resultSignId = (signId + part) % 12;
            break;
        default:
            resultSignId = (signId + part) % 12;
    }

    return resultSignId + 1; // Return 1-12
}

export function calculateAllDivisions(longitude: number) {
    return {
        D1: getDivisionalSign(longitude, 1),
        D9: getDivisionalSign(longitude, 9),
        D10: getDivisionalSign(longitude, 10),
        D16: getDivisionalSign(longitude, 16),
        D20: getDivisionalSign(longitude, 20),
        D24: getDivisionalSign(longitude, 24),
        D60: getDivisionalSign(longitude, 60),
    };
}
