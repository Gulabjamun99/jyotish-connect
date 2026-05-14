export function getDivisionalSign(longitude: number, division: number): number {
    const signId = Math.floor(longitude / 30);
    const degree = longitude % 30;
    const partSize = 30 / division;
    const part = Math.floor(degree / partSize);

    let resultSignId = 0;

    if (division === 1) {
        resultSignId = signId;

    } else if (division === 9) {
        // Navamsa: Fire→Aries(0), Earth→Capricorn(9), Air→Libra(6), Water→Cancer(3)
        const startSignsD9 = [0, 9, 6, 3];
        resultSignId = (startSignsD9[signId % 4] + part) % 12;

    } else if (division === 10) {
        // Dashamsha: Odd signs count from same sign; Even signs count from 9th
        const signNum1 = signId + 1; // convert to 1-based
        if (signNum1 % 2 === 1) {   // odd sign
            resultSignId = (signId + part) % 12;
        } else {                    // even sign → start from 9th (index +8)
            resultSignId = ((signId + 8) + part) % 12;
        }

    } else if (division === 16) {
        // Shodashamsha: Fire→Aries(0), Earth→Leo(4), Air→Sag(8), Water→Pisces(11)
        const startSignsD16 = [0, 4, 8, 11];
        resultSignId = (startSignsD16[signId % 4] + part) % 12;

    } else if (division === 20) {
        // Vimshamsha
        const startSignsD20 = [0, 8, 4, 0];
        resultSignId = (startSignsD20[signId % 4] + part) % 12;

    } else if (division === 24) {
        // Chaturvimshamsha: Odd→Leo(4), Even→Cancer(3)
        if (signId % 2 === 0) {
            resultSignId = (4 + part) % 12;
        } else {
            resultSignId = (3 + part) % 12;
        }

    } else if (division === 60) {
        resultSignId = (signId + part) % 12;

    } else {
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
