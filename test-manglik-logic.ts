import { generateMatchVerdict } from './src/lib/astrology/prediction-engine';

const testCases = [
    { score: 30, boyManglik: true, girlManglik: true, lang: 'en', expected: 'excellent ... manglikOkay ... Marriage is recommended.' },
    { score: 30, boyManglik: true, girlManglik: false, lang: 'en', expected: 'excellent ... manglikIssue ... Marriage is recommended with the performance of Manglik Shanti remedies.' },
    { score: 20, boyManglik: true, girlManglik: false, lang: 'en', expected: 'good ... manglikIssue ... Marriage requires mutual adjustments and remedy performance.' },
    { score: 15, boyManglik: true, girlManglik: false, lang: 'en', expected: 'average ... manglikIssue ... Marriage is not recommended without significant remedies and consultation.' },
    { score: 10, boyManglik: false, girlManglik: false, lang: 'en', expected: 'average ... manglikOkay ... Marriage is not recommended without significant remedies and consultation.' }
];

testCases.forEach((tc, i) => {
    const result = generateMatchVerdict(tc.score, tc.boyManglik, tc.girlManglik, tc.lang);
    console.log(`Test Case ${i + 1}:`);
    console.log(`Input: Score=${tc.score}, BoyManglik=${tc.boyManglik}, GirlManglik=${tc.girlManglik}`);
    console.log(`Output: ${result}`);
    console.log('---');
});
