function generateMatchVerdict(score, boyManglik, girlManglik, lang) {
    const isGood = score >= 18;
    const isManglikMatch = (boyManglik === girlManglik);

    const verdicts = {
        en: {
            excellent: "This is an excellent match! The compatibility score indicates high mental and emotional understanding.",
            good: "This is a good match. There is a solid foundation for a happy married life.",
            average: "The match is average. Adjustments and understanding will be required from both sides.",
            bad: "Compatibility is low. Significant differences in temperament may arise.",
            manglikIssue: "Manglik Dosha mismatch. Professional consultation and specific Vedic remedies are essential for harmony.",
            manglikOkay: "Manglik Dosha is balanced between both charts.",
            conclusionGood: "Marriage is recommended.",
            conclusionCaution: "Marriage is recommended with the performance of Manglik Shanti remedies.",
            conclusionAverage: "Marriage requires mutual adjustments and remedy performance.",
            conclusionBad: "Marriage is not recommended without significant remedies and consultation."
        }
    };

    const text = verdicts[lang] || verdicts.en;

    let analysis = "";
    if (score >= 28) analysis += text.excellent;
    else if (score >= 18) analysis += text.good;
    else if (score >= 10) analysis += text.average;
    else analysis += text.bad;

    analysis += " ";

    if (!isManglikMatch) {
        analysis += text.manglikIssue;
        analysis += " ";
        if (score >= 24) analysis += text.conclusionCaution;
        else if (score >= 18) analysis += text.conclusionAverage;
        else analysis += text.conclusionBad;
    } else {
        analysis += text.manglikOkay;
        analysis += " ";
        if (score >= 18) analysis += text.conclusionGood;
        else analysis += text.conclusionBad;
    }

    return analysis;
}

const testCases = [
    { score: 30, boyManglik: true, girlManglik: true, lang: 'en' },
    { score: 30, boyManglik: true, girlManglik: false, lang: 'en' },
    { score: 20, boyManglik: true, girlManglik: false, lang: 'en' },
    { score: 15, boyManglik: true, girlManglik: false, lang: 'en' },
    { score: 10, boyManglik: false, girlManglik: false, lang: 'en' }
];

testCases.forEach((tc, i) => {
    const result = generateMatchVerdict(tc.score, tc.boyManglik, tc.girlManglik, tc.lang);
    console.log(`Test Case ${i + 1}: Score=${tc.score}, BoyManglik=${tc.boyManglik}, GirlManglik=${tc.girlManglik}`);
    console.log(`Output: ${result}`);
    console.log('---');
});
