
import { INTERPRETATIONS } from "./interpretations";

// --- Types ---
interface ChartPlanet {
    name: string;
    house: number; // 1-12
    sign: string;
    isRetro: boolean;
}

interface ChartData {
    planets: ChartPlanet[];
    ascendant: string;
}

import { GoogleGenAI } from "@google/genai";

// --- Kundli Prediction Engine ---

export async function generateAIPredictions(chart: any, lang: string) {
    if (!process.env.GEMINI_API_KEY) {
        return generateLifePredictions(chart, lang);
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let planetsText = "";
        if (chart.planets && Array.isArray(chart.planets)) {
            planetsText = chart.planets.map((p: any) => `${p.name} in ${p.house} House (${p.sign})`).join(', ');
        }

        const locales: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi", bn: "Bengali", gu: "Gujarati", ta: "Tamil", te: "Telugu", kn: "Kannada" };
        const langName = locales[lang] || "English";

        const prompt = `You are an expert ancient Vedic Astrologer. Analyze the following birth chart data and provide highly detailed, personalized, and inspiring astrological predictions for the native strictly in ${langName}.
        
Chart Data:
- Ascendant (Lagna): ${chart.ascendant || 'Unknown'}
- Moon Sign: ${chart.moonSign || 'Unknown'}
- Sun Sign: ${chart.sunSign || 'Unknown'}
- Planetary Placements: ${planetsText}

Requirements:
1. Provide a 3-4 sentence detailed reading for each of the 7 specified categories: Career, Health, Marriage, Wealth, Education, Spirituality, and Foreign.
2. Base your readings firmly on the specific planetary placements provided. Mention the planet and house logically (e.g., 'Since your Mars is situated in the 10th house...').
3. Produce a premium reading equivalent to a detailed 50-page AstroSage PDF report section.
4. You MUST respond ONLY with a valid JSON object featuring exactly these keys, no markdown wrapping, no code blocks:
{
  "Career": "...",
  "Health": "...",
  "Marriage": "...",
  "Wealth": "...",
  "Education": "...",
  "Spirituality": "...",
  "Foreign": "..."
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text);
            const fallback = generateLifePredictions(chart, lang);
            return {
                Career: result.Career || fallback.Career,
                Health: result.Health || fallback.Health,
                Marriage: result.Marriage || fallback.Marriage,
                Wealth: result.Wealth || fallback.Wealth,
                Education: result.Education || fallback.Education,
                Spirituality: result.Spirituality || fallback.Spirituality,
                Foreign: result.Foreign || fallback.Foreign,
            };
        }
    } catch (error) {
        console.error("Gemini AI Prediction Error:", error);
    }

    // Fallback to static
    return generateLifePredictions(chart, lang);
}

export function generateLifePredictions(chart: any, lang: string) {
    const data = INTERPRETATIONS[lang as keyof typeof INTERPRETATIONS] || INTERPRETATIONS.en;

    const getPlanet = (name: string) => chart.planets.find((p: any) => p.name === name);

    // Get placement text for a given planet + house
    const getText = (planetName: string, house: number) => {
        const pData = (data as any).placements[planetName];
        if (pData && pData[house]) {
            return pData[house];
        }
        // Fallback with house meaning
        const hData = (data as any).houses[house];
        const pDesc = (data as any).planets[planetName] || planetName;
        const template = (data as any).defaults?.planet_placed || "{planet} is placed in the {house}th House of {sign}.";
        return template
            .replace("{planet}", pDesc)
            .replace("{house}", house.toString())
            .replace("{sign}", hData);
    };

    // Get retrograde note
    const getRetroNote = (planet: any, lang: string) => {
        if (!planet?.isRetro) return "";
        const notes: any = {
            en: ` (Retrograde — effects are internalized and may manifest with delay but greater depth.)`,
            hi: ` (वक्री — प्रभाव आंतरिक होते हैं और देर से लेकिन गहराई से प्रकट हो सकते हैं।)`,
        };
        return notes[lang] || notes.en;
    };

    // Build prediction line: planet description + placement + retro note
    const buildLine = (planetName: string) => {
        const planet = getPlanet(planetName);
        const house = planet?.house || 1;
        const placement = getText(planetName, house);
        const retro = getRetroNote(planet, lang);
        return placement + retro;
    };

    // --- Category builders using relevant planets per Vedic significance ---

    // CAREER: Sun (authority), Saturn (karma/discipline), Mars (energy), 10th house occupant
    const sun = getPlanet("Sun");
    const saturn = getPlanet("Saturn");
    const mars = getPlanet("Mars");
    const mercury = getPlanet("Mercury");
    const jupiter = getPlanet("Jupiter");
    const venus = getPlanet("Venus");
    const moon = getPlanet("Moon");
    const rahu = getPlanet("Rahu");
    const ketu = getPlanet("Ketu");

    const career = [
        buildLine("Sun"),
        buildLine("Saturn"),
        // If Mars is in career houses (10,6,3)
        ...(mars && [10, 6, 3].includes(mars.house) ? [buildLine("Mars")] : []),
        // If Rahu is in 10th house
        ...(rahu && rahu.house === 10 ? [buildLine("Rahu")] : []),
    ].join("\n\n");

    // HEALTH: Sun (vitality), Mars (energy/accidents), Saturn (chronic), 6th house
    const health = [
        buildLine("Sun"),
        buildLine("Mars"),
        ...(saturn && [6, 8, 1].includes(saturn.house) ? [buildLine("Saturn")] : []),
        ...(ketu && [6, 8, 1].includes(ketu.house) ? [buildLine("Ketu")] : []),
    ].join("\n\n");

    // MARRIAGE: Venus (love/luxury), Mars (passion/manglik), Jupiter (blessing), 7th house
    const marriage = [
        buildLine("Venus"),
        buildLine("Mars"),
        ...(jupiter && [7, 1, 2].includes(jupiter.house) ? [buildLine("Jupiter")] : []),
        ...(rahu && rahu.house === 7 ? [buildLine("Rahu")] : []),
    ].join("\n\n");

    // WEALTH: Jupiter (fortune), Venus (luxury), Mercury (business), 2nd/11th house
    const wealth = [
        buildLine("Jupiter"),
        buildLine("Venus"),
        ...(mercury && [2, 11, 10].includes(mercury.house) ? [buildLine("Mercury")] : []),
        buildLine("Moon"),
    ].join("\n\n");

    // EDUCATION: Mercury (intellect), Jupiter (wisdom), 4th/5th/9th house
    const education = [
        buildLine("Mercury"),
        buildLine("Jupiter"),
        ...(ketu && [5, 9, 12].includes(ketu.house) ? [buildLine("Ketu")] : []),
    ].join("\n\n");

    // SPIRITUALITY: Ketu (moksha), Jupiter (guru), 9th/12th house
    const spirituality = [
        buildLine("Ketu"),
        ...(jupiter && [9, 12, 5].includes(jupiter.house) ? [buildLine("Jupiter")] : []),
        ...(saturn && [12, 9].includes(saturn.house) ? [buildLine("Saturn")] : []),
    ].join("\n\n");

    // FOREIGN/TRAVEL: Rahu (foreign), 12th house, 9th house
    const foreign = [
        buildLine("Rahu"),
        ...(ketu && [12, 9].includes(ketu.house) ? [buildLine("Ketu")] : []),
        ...(moon && [12, 9].includes(moon.house) ? [buildLine("Moon")] : []),
    ].join("\n\n");

    return {
        Career: career,
        Health: health,
        Marriage: marriage,
        Wealth: wealth,
        Education: education,
        Spirituality: spirituality,
        Foreign: foreign,
    };
}

// --- Horoscope Transit Engine (internal, superseded) ---

function _generateDailyHoroscopeOld(userSign: string, currentPlanets: any[], lang: string) {
    const data = INTERPRETATIONS[lang as keyof typeof INTERPRETATIONS] || INTERPRETATIONS.en;

    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const userSignIdx = signs.indexOf(userSign);

    if (userSignIdx === -1) return null;

    const getHouse = (planetSign: string) => {
        const pIdx = signs.indexOf(planetSign);
        if (pIdx === -1) return 1;
        return ((pIdx - userSignIdx + 12) % 12) + 1;
    };

    // Current Planet Transits
    const sun = currentPlanets.find(p => p.name === "Sun");
    const moon = currentPlanets.find(p => p.name === "Moon");
    const mars = currentPlanets.find(p => p.name === "Mars");
    const venus = currentPlanets.find(p => p.name === "Venus");
    const mercury = currentPlanets.find(p => p.name === "Mercury");
    const jupiter = currentPlanets.find(p => p.name === "Jupiter");
    const saturn = currentPlanets.find(p => p.name === "Saturn");

    const housing = {
        Sun: getHouse(sun?.sign || "Aries"),
        Moon: getHouse(moon?.sign || "Aries"),
        Mars: getHouse(mars?.sign || "Aries"),
        Venus: getHouse(venus?.sign || "Aries"),
        Mercury: getHouse(mercury?.sign || "Aries"),
        Jupiter: getHouse(jupiter?.sign || "Aries"),
        Saturn: getHouse(saturn?.sign || "Aries")
    };

    // Helper: Determine aspect/nature
    const getNature = (house: number, planet?: string) => {
        if ([8, 12].includes(house)) return "negative";
        if (house === 6) {
            // Malefics are good in 6th house (Victory)
            if (["Sun", "Mars", "Saturn", "Rahu", "Ketu"].includes(planet || "")) return "positive";
            return "negative";
        }
        if ([1, 5, 9, 11].includes(house)) return "positive";
        return "neutral";
    };

    // --- Generate Categorized Predictions ---
    const currentTransits = (data as any).transits || INTERPRETATIONS.en.transits;
    const enTransits = INTERPRETATIONS.en.transits;

    const getTransit = (planet: string, house: number) => {
        if (currentTransits[planet] && currentTransits[planet][house]) return currentTransits[planet][house];
        if ((enTransits as any)[planet] && (enTransits as any)[planet][house]) return (enTransits as any)[planet][house];
        return "";
    };

    // 1. Career (Sun + Saturn + 10th/2nd/6th House transits)
    const sunTxt = getTransit("Sun", housing.Sun);
    const saturnTxt = getTransit("Saturn", housing.Saturn);
    const careerPred = (sunTxt + " " + saturnTxt).trim();

    // 2. Love (Venus + 5th/7th House transits)
    const lovePred = getTransit("Venus", housing.Venus);

    // 3. Health (Mars + 6th House + Sun)
    const healthPred = getTransit("Mars", housing.Mars);

    // --- High Level Highlights (Positive & Negative) ---
    // Rule: Avoid repeating text already used in Career/Love/Health if possible.
    // Rule: Positive MUST be positive, Negative MUST be a caution.

    const usedTexts = new Set<string>();
    if (sunTxt) usedTexts.add(sunTxt);
    if (saturnTxt) usedTexts.add(saturnTxt);
    if (lovePred) usedTexts.add(lovePred);
    if (healthPred) usedTexts.add(healthPred);

    // 4. Positive (Luck/Gains/Good News)
    let positiveHighlight = "";
    // Priority: Jupiter in positive house, then Moon in positive house, then Mercury/Venus in positive house.
    const posCandidates = [
        { name: "Jupiter", house: housing.Jupiter },
        { name: "Moon", house: housing.Moon },
        { name: "Venus", house: housing.Venus },
        { name: "Mercury", house: housing.Mercury },
        { name: "Sun", house: housing.Sun }
    ];

    for (const cand of posCandidates) {
        if (getNature(cand.house, cand.name) === "positive") {
            const txt = getTransit(cand.name, cand.house);
            if (txt && !usedTexts.has(txt)) {
                positiveHighlight = txt;
                usedTexts.add(txt);
                break;
            }
        }
    }

    if (!positiveHighlight) {
        positiveHighlight = (data as any).defaults?.positive || "The cosmic energy favors your initiatives today. Stay optimistic.";
    }

    // 5. Negative (Caution/Challenges)
    let negativeHighlight = "";
    // Priority: Saturn in negative house, then Mars, then Rahu (if we had it), then Sun in negative house.
    const negCandidates = [
        { name: "Saturn", house: housing.Saturn },
        { name: "Mars", house: housing.Mars },
        { name: "Sun", house: housing.Sun }
    ];

    for (const cand of negCandidates) {
        if (getNature(cand.house, cand.name) === "negative") {
            const txt = getTransit(cand.name, cand.house);
            if (txt && !usedTexts.has(txt)) {
                negativeHighlight = txt;
                usedTexts.add(txt);
                break;
            }
        }
    }

    if (!negativeHighlight) {
        negativeHighlight = (data as any).defaults?.caution || "Avoid impulsive decisions today. Patience will yield better results.";
    }


    // Day-based seed for Luck Factors
    const now = new Date();
    const dateSeed = now.getFullYear() * 1000 + now.getMonth() * 100 + now.getDate();
    const seed = dateSeed + userSignIdx;

    const luckyColor = (data as any).lucky.colors[seed % (data as any).lucky.colors.length];
    const luckyNumber = (data as any).lucky.numbers[seed % (data as any).lucky.numbers.length];

    const getL = (key: string) => {
        const labels: any = {
            en: { luckyColor: "Lucky Color", luckyNumber: "Lucky Number", transit: "Transit Info" },
            hi: { luckyColor: "शुभ रंग", luckyNumber: "शुभ अंक", transit: "गोचर विवरण" },
            mr: { luckyColor: "शुभ रंग", luckyNumber: "शुभ अंक", transit: "गोचर वर्णन" },
            bn: { luckyColor: "শুভ রঙ", luckyNumber: "শুভ সংখ্যা", transit: "গোচর তথ্য" },
            gu: { luckyColor: "શુભ રંગ", luckyNumber: "શુભ અંક", transit: "ગોચર વિગત" },
            ta: { luckyColor: "அதிர்ஷ்ட நிறம்", luckyNumber: "அதிர்ஷ்ட எண்", transit: "பெயர்ச்சி தகவல்" },
            te: { luckyColor: "అదృష్ట రంగు", luckyNumber: "అదృష్ట సంఖ్య", transit: "గోచార సమాచారం" },
            kn: { luckyColor: "ಅದೃಷ್ಟ ಬಣ್ಣ", luckyNumber: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ", transit: "ಗೋಚಾರ ಮಾಹಿತಿ" }
        };
        const l = labels[lang] || labels.en;
        return l[key];
    };

    return {
        career: careerPred,
        love: lovePred,
        health: healthPred,
        positive: positiveHighlight,
        negative: negativeHighlight,
        luckyColor,
        luckyNumber,
        labels: {
            color: getL("luckyColor"),
            number: getL("luckyNumber")
        },
        transitInfo: (() => {
            const transitMap: any = {
                en: `Sun in House ${housing.Sun}, Moon in House ${housing.Moon}`,
                hi: `सूर्य घर ${housing.Sun}, चंद्रमा घर ${housing.Moon}`,
                // Fillers for others to avoid crash, ideal to translate later
                mr: `Sun in House ${housing.Sun}, Moon in House ${housing.Moon}`,
            };
            return transitMap[lang] || transitMap.en;
        })()
    };
}

// --- Matching Prediction Engine ---

export function generateMatchVerdict(score: number, boyManglik: boolean, girlManglik: boolean, lang: string) {
    const isGood = score >= 18;
    const isManglikMatch = (boyManglik === girlManglik);

    const verdicts: any = {
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
        },
        hi: {
            excellent: "यह एक उत्तम मिलान है! अनुकूलता स्कोर उच्च मानसिक और भावनात्मक समझ का संकेत देता है।",
            good: "यह एक अच्छा मिलान है। सुखी वैवाहिक जीवन के लिए एक ठोस आधार है।",
            average: "मिलान औसत है। दोनों पक्षों को समायोजन और समझ की आवश्यकता होगी।",
            bad: "अनुकूलता कम है। स्वभाव में महत्वपूर्ण अंतर उत्पन्न हो सकते हैं।",
            manglikIssue: "मांगलिक दोष असंगतता है। सद्भाव के लिए पेशेवर परामर्श और विशिष्ट वैदिक उपचार आवश्यक हैं।",
            manglikOkay: "दोनों कुंडलियों में मांगलिक दोष संतुलित है।",
            conclusionGood: "विवाह की सिफारिश की जाती है।",
            conclusionCaution: "मांगलिक शांति उपायों के साथ विवाह की सिफारिश की जाती है।",
            conclusionAverage: "विवाह के लिए आपसी तालमेल और उपायों की आवश्यकता है।",
            conclusionBad: "उपायों और परामर्श के बिना विवाह की सिफारिश नहीं की जाती है।"
        },
        mr: {
            excellent: "हे एक उत्तम मिलान आहे! सुसंगतता स्कोर उच्च मानसिक आणि भावनिक समज दर्शवतो.",
            good: "हे एक चांगले मिलान आहे. सुखी वैवाहिक जीवनासाठी एक भक्कम पाया आहे.",
            average: "मिलान सरासरी आहे. दोन्ही बाजूंनी समायोजन आणि समजूतदारपणा आवश्यक असेल.",
            bad: "सुसंगतता कमी आहे. स्वभावात लक्षणीय फरक निर्माण होऊ शकतो.",
            manglikIssue: "मांगलिक दोष विसंगती आहे. सुसंवादासाठी व्यावसायिक सल्ला आणि विशिष्ट वैदिक उपाय आवश्यक आहेत.",
            manglikOkay: "दोन्ही कुंडलीमध्ये मांगलिक दोष संतुलित आहे.",
            conclusionGood: "विवाहाची शिफारस केली जाते.",
            conclusionCaution: "मांगलिक शांती उपाय करून विवाह करण्यास हरकत नाही.",
            conclusionAverage: "विवाहासाठी परस्पर समायोजन आणि उपाय करणे आवश्यक आहे.",
            conclusionBad: "उपाय केल्याशिवाय विवाहाची शिफारस केली जात नाही."
        },
        te: {
            excellent: "ఇది అద్భుతమైన జంట! అనుకూలత స్కోరు అధిక మానసిక మరియు భావోద్వేగ అవగాహనను సూచిస్తుంది.",
            good: "ఇది ఒక మంచి జంట. సుఖవంతమైన వివాహ జీవితానికి బలమైన పునాది ఉంది.",
            average: "ఈ జంట సగటున ఉంది. ఇరుపక్షాల నుండి సర్దుబాట్లు మరియు అవగాహన అవసరం.",
            bad: "అనుకూలత తక్కువగా ఉంది. స్వభావంలో ముఖ్యమైన తేడాలు రావచ్చు.",
            manglikIssue: "మాంగళిక దోషం సరిపోలడం లేదు. సామరస్యం కోసం వృత్తిపరమైన సంప్రదింపులు మరియు నిర్దిష్ట వేద నివారణలు అవసరం.",
            manglikOkay: "రెండు జాతకాలలో మాంగళిక దోషం సమతుల్యంగా ఉంది.",
            conclusionGood: "వివాహం సిఫార్సు చేయబడింది.",
            conclusionCaution: "మాంగళిక శాంతి పరిహారాలతో వివాహం సిఫార్సు చేయబడింది.",
            conclusionAverage: "వివాహానికి పరస్పర సర్దుబాటు మరియు పరిహారాలు అవసరం.",
            conclusionBad: "పరిహారాలు మరియు సంప్రదింపులు లేకుండా వివాహం సిఫార్సు చేయబడదు."
        },
        kn: {
            excellent: "ಇದು ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ! ಹೊಂದಾಣಿಕೆಯ ಸ್ಕೋರ್ ಸುಧಾರಿತ ಮಾನಸಿಕ ಮತ್ತು ಭಾವನಾತ್ಮಕ ತಿಳುವಳಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
            good: "ಇದು ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ. ಸುಖಿ ವೈವಾಹಿಕ ಜೀವನಕ್ಕೆ ಭದ್ರ ಬುನಾದಿ ಇದೆ.",
            average: "ಹೊಂದಾಣಿಕೆ ಸಾಧಾರಣವಾಗಿದೆ. ಎರಡೂ ಕಡೆಯಿಂದ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ತಿಳುವಳಿಕೆ ಅಗತ್ಯ.",
            bad: "ಹೊಂದಾಣಿಕೆ ಕಡಿಮೆಯಾಗಿದೆ. ಸ್ವಭಾವದಲ್ಲಿ ಗಮನಾರ್ಹ ವ್ಯತ್ಯಾಸಗಳು ಉಂಟಾಗಬಹುದು.",
            manglikIssue: "ಮಾಂಗಳಿಕ ದೋಷ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ಸಾಮರಸ್ಯಕ್ಕಾಗಿ ವೃತ್ತಿಪರ ಸಮಾಲೋಚನೆ ಮತ್ತು ನಿರ್ದಿಷ್ಟ ವೈದಿಕ ಪರಿಹಾರಗಳು ಅವಶ್ಯಕ.",
            manglikOkay: "ಎರಡೂ ಜಾತಕಗಳಲ್ಲಿ ಮಾಂಗಳಿಕ ದೋಷ ಸಮತೋಲಿತವಾಗಿದೆ.",
            conclusionGood: "ವಿವಾಹಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
            conclusionCaution: "ಮಾಂಗಳಿಕ ಶಾಂತಿ ಪರಿಹಾರಗಳೊಂದಿಗೆ ವಿವಾಹಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
            conclusionAverage: "ವಿವಾಹಕ್ಕೆ ಪರಸ್ಪರ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ಪರಿಹಾರಗಳ ಅಗತ್ಯವಿದೆ.",
            conclusionBad: "ಪರಿಹಾರಗಳು ಮತ್ತು ಸಮಾಲೋಚನೆ ಇಲ್ಲದೆ ವಿವಾಹಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿಲ್ಲ."
        }
    };

    const text = verdicts[lang as keyof typeof verdicts] || verdicts.en;

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

/**
 * Enhanced Manglik Cancellation Logic
 */
export function analyzeManglikCancellation(boy: any, girl: any, lang: string) {
    const isBoyManglik = boy.doshas.Manglik.present;
    const isGirlManglik = girl.doshas.Manglik.present;

    const msgs: any = {
        en: {
            both: "Both are Manglik. The Dosha is effectively cancelled, creating a balanced union.",
            boyOnly: "Only the Boy is Manglik. This may cause temperamental friction. Vedic remedies advised.",
            girlOnly: "Only the Girl is Manglik. This is traditionally considered a strong dosha. Shanti Puja recommended.",
            none: "Neither partner has Manglik Dosha. Excellent for domestic peace.",
            can_jupiter: "Mars is influenced by Jupiter, significantly reducing the intensity of the Dosha."
        },
        hi: {
            both: "दोनों मांगलिक हैं। दोष प्रभावी रूप से समाप्त हो गया है, जिससे एक संतुलित मिलन बनता है।",
            boyOnly: "केवल लड़का मांगलिक है। इससे स्वभावगत घर्षण हो सकता है। वैदिक उपायों की सलाह दी जाती है।",
            girlOnly: "केवल लड़की मांगलिक है। इसे पारंपरिक रूप से एक मजबूत दोष माना जाता है। शांति पूजा की सिफारिश की जाती है।",
            none: "किसी भी साथी को मांगलिक दोष नहीं है। घरेलू शांति के लिए उत्तम।",
            can_jupiter: "मंगल बृहस्पति से प्रभावित है, जिससे दोष की तीव्रता काफी कम हो जाती है।"
        },
        mr: {
            both: "दोन्ही मांगलिक आहेत. दोष प्रभावीपणे रद्द झाला आहे, ज्यामुळे एक संतुलित नाते निर्माण होते.",
            boyOnly: "फक्त मुलगा मांगलिक आहे. यामुळे स्वभावात संघर्ष होऊ शकतो. वैदिक उपायांचा सल्ला दिला जातो.",
            girlOnly: "फक्त मुलगी मांगलिक आहे. याला पारंपारिकपणे एक मजबूत दोष मानले जाते. शांती पूजेची शिफारस केली जाते.",
            none: "दोघांपैकी कोणालाही मांगलिक दोष नाही. घरगुती शांततेसाठी उत्तम.",
            can_jupiter: "मंगळ गुरुच्या प्रभावाखाली आहे, ज्यामुळे दोषाची तीव्रता लक्षणीयरीत्या कमी होते."
        },
        te: {
            both: "ఇద్దరూ మాంగళికలు. దోషం ప్రభావవంతంగా రద్దయింది, ఫలితంగా సమతుల్య మేళనం లభిస్తుంది.",
            boyOnly: "అబ్బాయి మాత్రమే మాంగళికం. ఇది స్వభావరీత్యా ఘర్షణకు కారణం కావచ్చు. వేద పరిహారాలు సూచించబడ్డాయి.",
            girlOnly: "అమ్మాయి మాత్రమే మాంగళికం. ఇది సాంప్రదాయకంగా బలమైన దోషంగా పరిగణించబడుతుంది. శాంతి పూజ సిఫార్సు చేయబడింది.",
            none: "ఎవరికీ మాంగళిక దోషం లేదు. గృహ శాంతికి అద్భుతం.",
            can_jupiter: "కుజుడు గురుగ్రహ ప్రభావంతో ఉన్నాడు, ఇది దోషం యొక్క తీవ్రతను గణనీయంగా తగ్గిస్తుంది."
        },
        kn: {
            both: "ಇಬ್ಬರೂ ಮಾಂಗಳಿಕರು. ದೋಷವು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ, ಸಮತೋಲಿತ ಒಕ್ಕೂಟವನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.",
            boyOnly: "ಹುಡುಗ ಮಾತ್ರ ಮಾಂಗಳಿಕ. ಇದು ಸ್ವಭಾವತಃ ಘರ್ಷಣೆಗೆ ಕಾರಣವಾಗಬಹುದು. ವೈದಿಕ ಪರಿಹಾರಗಳು ಸಲಹೆ ನೀಡಲಾಗಿದೆ.",
            girlOnly: "ಹುಡುಗಿ ಮಾತ್ರ ಮಾಂಗಳಿಕ. ಇದನ್ನು ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ಪ್ರಬಲ ದೋಷವೆಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ. ಶಾಂತಿ ಪೂಜೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
            none: "ಯಾವುದೇ ಪಾಲುದಾರರಿಗೆ ಮಾಂಗಳಿಕ ದೋಷವಿಲ್ಲ. ಕೌಟುಂಬಿಕ ಶಾಂತಿಗೆ ಅತ್ಯುತ್ತಮ.",
            can_jupiter: "ಮಂಗಳವು ಗುರುುವಿನಿಂದ ಪ್ರಭಾವಿತವಾಗಿದೆ, ಇದು ದೋಷದ ತೀವ್ರತೆಯನ್ನು ಗಮನಾರ್ಹವಾಗಿ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ."
        }
    };

    const text = msgs[lang as keyof typeof msgs] || msgs.en;

    if (isBoyManglik && isGirlManglik) return text.both;
    if (isBoyManglik) return text.boyOnly;
    if (isGirlManglik) return text.girlOnly;
    return text.none;
}

// Internal Logic Helpers
function analyzeNavamsaBond(boy: any, girl: any, lang: string) {
    const score = boy.milan?.ashtakoot?.maitri?.score || 0;
    const isStrong = score >= 4;

    const msgs: any = {
        en: `Navamsa (D9) indicates a ${isStrong ? 'prosperous' : 'balanced'} spiritual union. Venus-Mars synergy supports ${isStrong ? 'deep emotional growth' : 'mutual understanding'}.`,
        hi: `नवांश (D9) एक ${isStrong ? 'समृद्ध' : 'संतुलित'} आध्यात्मिक मिलन का संकेत देता है। शुक्र-मंगल तालमेल ${isStrong ? 'गहरे भावनात्मक विकास' : 'पारस्परिक समझ'} का समर्थन करता है।`,
        mr: `नवांश (D9) एक ${isStrong ? 'समृद्ध' : 'संतुलित'} आध्यात्मिक मिलनाचा संकेत देते। शुक्र-मंगळ समन्वय ${isStrong ? 'खोल भावनिक वाढ' : 'परस्पर समज'} वाढवतो।`,
        te: `నవాంశ (D9) ఒక ${isStrong ? 'సంపన్నమైన' : 'సమతుల్యమైన'} ఆధ్యాత్మిక కలయికను సూచిస్తుంది.`,
        kn: `ನವಾಂಶ (D9) ಒಂದು ${isStrong ? 'ಸಮೃದ್ಧ' : 'ಸಮತೋಲಿತ'} ಆಧ್ಯಾತ್ಮಿಕ ಒಕ್ಕೂಟವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`
    };
    return msgs[lang] || msgs.en;
}

function calculateLikelyMarriagePeriod(boy: any, girl: any, lang: string) {
    const score = boy.milan?.total || girl.milan?.total || 18;
    const year = new Date().getFullYear();
    const startYear = score > 25 ? year : year + 1;
    const endYear = startYear + 1;

    const msgs: any = {
        en: `Strong indicators for marriage observed between ${startYear} and ${endYear} based on current transit alignments.`,
        hi: `वर्तमान गोचर संरेखण के आधार पर ${startYear} और ${endYear} के बीच विवाह के मजबूत संकेत देखे गए हैं।`,
        mr: `गोचर स्थितीनुसार ${startYear} ते ${endYear} दरम्यान विवाहाचे प्रबळ योग दिसून येतात।`,
        te: `${startYear} మరియు ${endYear} మధ్య వివాహానికి బలమైన సూచనలు ఉన్నాయి।`,
        kn: `${startYear} ಮತ್ತು ${endYear} ನಡುವೆ ವಿವಾಹಕ್ಕೆ ಬಲವಾದ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿವೆ।`
    };
    return msgs[lang] || msgs.en;
}

function generateLifeForecastSummary(score: number, lang: string) {
    const isHigh = score > 25;
    const year = new Date().getFullYear();
    const msgs: any = {
        en: `The initial phase from ${year} indicates ${isHigh ? 'exceptional harmony' : 'necessary adjustments'}. Stability and prosperity are expected to grow significantly from the ${isHigh ? '5th' : '7th'} year onwards.`,
        hi: `प्रारंभिक चरण (${year} से) ${isHigh ? 'असाधारण सामंजस्य' : 'आवश्यक समायोजन'} का संकेत देता है। ${isHigh ? '5वें' : '7वें'} वर्ष से स्थिरता और समृद्धि बढ़ने की उम्मीद है।`,
        mr: `सुरुवातीचा टप्पा (${year} पासून) ${isHigh ? 'असाधारण सुसंवाद' : 'आवश्यक तडजोड'} दर्शवतो. ${isHigh ? '५' : '७'} व्या वर्षापासून स्थिरता आणि आरोग्य वाढण्याची शक्यता आहे.`,
        te: `${year} నుండి ప్రారంభ దశ ${isHigh ? 'అద్భుతమైన సామరస్యాన్ని' : 'అవసరమైన సర్దుబాట్లను'} సూచిస్తుంది.`,
        kn: `${year} ರಿಂದ ಪ್ರಾರಂಭಿಕ ಹಂತವು ${isHigh ? 'ಅಸಾಧಾರಣ ಸಾಮರಸ್ಯ' : 'ಅಗತ್ಯ ಹೊಂದಾಣಿಕೆಗಳನ್ನು'} ಸೂಚಿಸುತ್ತದೆ.`
    };
    return msgs[lang] || msgs.en;
}

function getContextualRemedies(result: any, lang: string) {
    const list: string[] = [];
    const isEnglish = lang === 'en';

    const remedyMap: any = {
        en: {
            vishnu: "Chant Vishnu Sahasranama for financial stability.",
            gauri: "Perform Gauri-Shankar Puja for progeny and health.",
            hanuman: "Recite Hanuman Chalisa 108 times over 40 days.",
            shiva: "Visit a Shiva-Parvati temple on Mondays."
        },
        hi: {
            vishnu: "वित्तीय स्थिरता के लिए विष्णु सहस्रनाम का पाठ करें।",
            gauri: "संतान और स्वास्थ्य के लिए गौरी-शंकर पूजा करें।",
            hanuman: "40 दिनों तक 108 बार हनुमान चालीसा का पाठ करें।",
            shiva: "सोमवार को शिव-पार्वती मंदिर जाएं।"
        },
        mr: {
            vishnu: "आर्थिक स्थिरतेसाठी विष्णू सहस्रनामाचा जप करा.",
            gauri: "संतती आणि आरोग्यासाठी गौरी-शंकर पूजा करा.",
            hanuman: "४० दिवस १०८ वेळा हनुमान चालिसाचे पठण करा.",
            shiva: "सोमवारी शिव-पार्वती मंदिरात जा."
        },
        te: {
            vishnu: "ఆర్థిక స్థిరత్వం కోసం విష్ణు సహస్రనామ పారాయణం చేయండి.",
            gauri: "సంతానం మరియు ఆరోగ్యం కోసం గౌరీ-శంకర్ పూజ చేయండి.",
            hanuman: "40 రోజుల పాటు 108 సార్లు హనుమాన్ చాలీసా పఠించండి.",
            shiva: "సోమవారాల్లో శివ-పార్వతుల ఆలయాన్ని దర్శించండి."
        },
        kn: {
            vishnu: "ಆರ್ಥಿಕ ಸ್ಥಿರತೆಗಾಗಿ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ.",
            gauri: "ಸಂತಾನ ಮತ್ತು ಆರೋಗ್ಯಕ್ಕಾಗಿ ಗೌರಿ-ಶಂಕರ ಪೂಜೆ ಮಾಡಿ.",
            hanuman: "40 ದಿನಗಳ ಕಾಲ 108 ಬಾರಿ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ.",
            shiva: "ಸೋಮವಾರದಂದು ಶಿವ-ಪಾರ್ವತಿ ದೇವಸ್ಥಾನಕ್ಕೆ ಭೇಟಿ ನೀಡಿ."
        },
        bn: {
            vishnu: "আর্থিক স্থিতিশীলতার জন্য বিষ্ণু সহস্রনাম জপ করুন।",
            gauri: "সন্তান ও স্বাস্থ্যের জন্য গৌরী-শঙ্কর পূজা করুন।",
            hanuman: "৪০ দিন ধরে ১০৮ বার হনুমান চালিসা পাঠ করুন।",
            shiva: "সোমবার শিব-পার্বতী মন্দিরে যান।"
        },
        gu: {
            vishnu: "આર્થિક સ્થિરતા માટે વિષ્ણુ સહસ્ત્રનામનો પાઠ કરો.",
            gauri: "સંતાન અને સ્વાસ્થ્ય માટે ગૌરી-શંકર પૂજા કરો.",
            hanuman: "૪૦ દિવસ સુધી ૧૦૮ વખત હનુમાન ચાલીસાનો પાઠ કરો.",
            shiva: "સોમવારે શિવ-પાર્વતી મંદિરે જાવ."
        },
        ta: {
            vishnu: "நிதி ஸ்திரத்தன்மைக்கு விஷ்ணு லலிதா சஹஸ்ரநாமம் பாராயணம் செய்யவும்.",
            gauri: "குழந்தை பாக்கியம் மற்றும் ஆரோக்கியத்திற்கு கௌரி-சங்கர் பூஜை செய்யவும்.",
            hanuman: "40 நாட்களுக்கு 108 முறை அனுமன் சாலிசா பாராயணம் செய்யவும்.",
            shiva: "திங்கட்கிழமைகளில் சிவன்-பார்வதி கோவிலுக்குச் செல்லவும்."
        }
    };

    const r = remedyMap[lang] || remedyMap.en;

    if (result.milan.ashtakoot.bhakoot.score < 7) list.push(r.vishnu);
    if (result.milan.ashtakoot.nadi.score < 8) list.push(r.gauri);
    if (result.milan.ashtakoot.Manglik !== undefined && result.boy.doshas.Manglik.present !== result.girl.doshas.Manglik.present) {
        list.push(r.hanuman);
    } // Note: Original code used a specific property check, preserved here roughly.

    if (list.length < 2) list.push(r.shiva);

    return list;
}


/**
 * Generates an in-depth matching report covering Marriage, Nature, Family, Finance, Bond, and Doshas.
 */
export const generateDetailedMatchingReport = (
    result: any,
    lang: string = "en"
) => {
    const score = result.milan.totalScore;
    const boyData = result.boy;
    const girlData = result.girl;

    // Helper to get planet by house
    const getPlanetInHouse = (planets: any[], house: number) => planets.find(p => p.house === house);

    const reports: any = {
        en: {
            marriage: {
                title: "Marriage Compatibility",
                rating: score >= 24 ? "Excellent" : score >= 18 ? "Good" : "Average",
                verdict: score >= 24
                    ? "Highly favorable for long-term marital bliss. Karmic alignment detected."
                    : score >= 18
                        ? "A stable and positive match. Minor issues can be easily resolved."
                        : "Average compatibility. Empathy and compromise will be the foundation here."
            },
            nature: {
                title: "Nature & Temperament",
                verdict: (result.milan.ashtakoot.gana.score >= 5)
                    ? "Both partners share a harmonious 'Gana' (nature), leading to mutual respect."
                    : "Differences in temperament may arise. Understand and respect each other's inherent nature."
            },
            family: {
                title: "Family Life & Children",
                verdict: (result.milan.ashtakoot.nadi.score === 8)
                    ? "Excellent genetic and health compatibility. Very favorable for offspring."
                    : "Nadi considerations detected. Special Vedic prayers for progeny health may be required."
            },
            finance: {
                title: "Wealth & Prosperity",
                verdict: (result.milan.ashtakoot.bhakoot.score === 7)
                    ? "Strong financial synchronization. Wealth accumulation will be steady."
                    : "Financial planning requires transparency to avoid Bhakoot-related fluctuations."
            },
            bond: {
                title: "Navamsa (D9) Synergy",
                verdict: analyzeNavamsaBond(boyData, girlData, lang)
            },
            timing: {
                title: "Marriage Timing Estimate",
                verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang)
            },
            forecast: {
                title: "12-Year Married Life Forecast",
                verdict: generateLifeForecastSummary(score, lang)
            },
            remedies: {
                title: "Personalized Remedies",
                list: getContextualRemedies(result, lang)
            },
            summary: {
                verdict: score >= 24 ? "Proceed" : score >= 18 ? "Caution" : "Not Recommended",
                confidence: Math.min(95, 60 + (score * 1)),
                nextSteps: score >= 24 ? "Select Muhurat" : "Perform Remedies"
            }
        },
        hi: {
            marriage: {
                title: "विवाह अनुकूलता",
                rating: score >= 24 ? "उत्कृष्ट" : score >= 18 ? "अच्छा" : "औसत",
                verdict: score >= 24
                    ? "दीर्घकालिक वैवाहिक सुख के लिए अत्यधिक अनुकूल। कर्मों का मेल देखा गया।"
                    : score >= 18
                        ? "एक स्थिर और सकारात्मक मिलान। छोटी समस्याओं को आसानी से हल किया जा सकता है।"
                        : "औसत अनुकूलता। सहानुभूति और समझौता यहाँ आधार होगा।"
            },
            nature: {
                title: "प्रकृति और स्वभाव",
                verdict: (result.milan.ashtakoot.gana.score >= 5)
                    ? "दोनों साथी एक सामंजस्यपूर्ण 'गण' (स्वभाव) साझा करते हैं, जिससे आपसी सम्मान मिलता है।"
                    : "स्वभाव में भिन्नताएं उत्पन्न हो सकती हैं। एक-दूसरे की जन्मजात प्रकृति को समझें और उसका सम्मान करें।"
            },
            family: {
                title: "पारिवारिक जीवन और संतान",
                verdict: (result.milan.ashtakoot.nadi.score === 8)
                    ? "उत्कृष्ट आनुवंशिक और स्वास्थ्य अनुकूलता। संतान के लिए बहुत अनुकूल।"
                    : "नाड़ी संबंधी विचार सामने आए हैं। संतान के स्वास्थ्य के लिए विशेष वैदिक प्रार्थनाओं की आवश्यकता हो सकती है।"
            },
            finance: {
                title: "धन और समृद्धि",
                verdict: (result.milan.ashtakoot.bhakoot.score === 7)
                    ? "मजबूत वित्तीय तालमेल। धन संचय स्थिर रहेगा।"
                    : "भकूट से संबंधित उतार-चढ़ाव से बचने के लिए वित्तीय नियोजन में पारदर्शिता की आवश्यकता है।"
            },
            bond: {
                title: "नवांश (D9) तालमेल",
                verdict: analyzeNavamsaBond(boyData, girlData, lang)
            },
            timing: {
                title: "विवाह समय का अनुमान",
                verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang)
            },
            forecast: {
                title: "12-वर्षीय वैवाहिक जीवन का पूर्वानुमान",
                verdict: generateLifeForecastSummary(score, lang)
            },
            remedies: {
                title: "व्यक्तिगत उपाय",
                list: getContextualRemedies(result, lang)
            },
            summary: {
                verdict: score >= 24 ? "आगे बढ़ें" : score >= 18 ? "सावधानी" : "अनुशंसित नहीं",
                confidence: Math.min(95, 60 + (score * 1)),
                nextSteps: score >= 24 ? "मुहूर्त चुनें" : "उपाय करें"
            }
        },
        mr: {
            marriage: {
                title: "विवाह सुसंगतता",
                rating: score >= 24 ? "उत्कृष्ट" : score >= 18 ? "चांगले" : "सरासरी",
                verdict: score >= 24
                    ? "दीर्घकालीन वैवाहिक सुखासाठी अत्यंत अनुकूल. कर्माचा मेळ दिसून आला आहे."
                    : score >= 18
                        ? "एक स्थिर आणि सकारात्मक मिलान. लहान समस्या सहज सोडवल्या जाऊ शकतात."
                        : "सरासरी सुसंगतता. येथे सहानुभूती आणि तडजोड हा पाया असेल."
            },
            nature: {
                title: "स्वभाव आणि प्रवृत्ती",
                verdict: (result.milan.ashtakoot.gana.score >= 5)
                    ? "दोन्ही जोडीदारांचा 'गण' (स्वभाव) सुसंवादी आहे, ज्यामुळे एकमेकांबद्दल आदर निर्माण होतो."
                    : "स्वभावात फरक असू शकतो. एकमेकांच्या मूळ स्वभावाचा समजून घेऊन आदर करा."
            },
            family: {
                title: "कौटुंबिक जीवन आणि मुले",
                verdict: (result.milan.ashtakoot.nadi.score === 8)
                    ? "उत्कृष्ट अनुवंशिक आणि आरोग्य सुसंगतता. संततीसाठी अत्यंत अनुकूल."
                    : "नाडी दोष विचारात घेणे आवश्यक आहे. संततीच्या आरोग्यासाठी विशेष वैदिक प्रार्थनांची आवश्यकता असू शकते."
            },
            finance: {
                title: "संपत्ती आणि समृद्धी",
                verdict: (result.milan.ashtakoot.bhakoot.score === 7)
                    ? "मजबूत आर्थिक समन्वय. संपत्तीची साठवण स्थिर राहील."
                    : "भकूटशी संबंधित चढ-उतार टाळण्यासाठी आर्थिक नियोजनात पारदर्शकता आवश्यक आहे."
            },
            bond: {
                title: "नवांश (D9) समन्वय",
                verdict: analyzeNavamsaBond(boyData, girlData, lang)
            },
            timing: {
                title: "विवाह वेळेचा अंदाज",
                verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang)
            },
            forecast: {
                title: "१२ वर्षांचा वैवाहिक अंदाज",
                verdict: generateLifeForecastSummary(score, lang)
            },
            remedies: {
                title: "वैयक्तिकृत उपाय",
                list: getContextualRemedies(result, lang)
            },
            summary: {
                verdict: score >= 24 ? "पुढे जा" : score >= 18 ? "सावधान" : "शिफारस नाही",
                confidence: Math.min(95, 60 + (score * 1)),
                nextSteps: score >= 24 ? "मुहूर्त निवडा" : "उपाय करा"
            }
        },
        te: {
            marriage: {
                title: "వివాహ అనుకూలత",
                rating: score >= 24 ? "అద్భుతం" : score >= 18 ? "మంచిది" : "సగటు",
                verdict: score >= 24
                    ? "దీర్ఘకాలిక వైవాహిక సుఖానికి అత్యంత అనుకూలం. కర్మల అమరిక కనుగొనబడింది."
                    : score >= 18
                        ? "స్థిరమైన మరియు సానుకూలమైన జంట. చిన్న సమస్యలను సులభంగా పరిష్కరించుకోవచ్చు."
                        : "సగటు అనుకూలత. సానుభూతి మరియు సర్దుబాటు ఇక్కడ పునాది అవుతుంది."
            },
            nature: {
                title: "స్వభావం మరియు ప్రవృత్తి",
                verdict: (result.milan.ashtakoot.gana.score >= 5)
                    ? "ఇద్దరు భాగస్వాములు సామరస్యపూర్వకమైన 'గణాన్ని' (స్వభావం) కలిగి ఉన్నారు, ఇది పరస్పర గౌరవానికి దారితీస్తుంది."
                    : "స్వభావంలో తేడాలు రావచ్చు. ఒకరి సహజ స్వభావాన్ని మరొకరు అర్థం చేసుకుని గౌరవించాలి."
            },
            family: {
                title: "కుటుంబ జీవితం మరియు సంతానం",
                verdict: (result.milan.ashtakoot.nadi.score === 8)
                    ? "అద్భుతమైన జన్యు మరియు ఆరోగ్య అనుకూలత. సంతానానికి చాలా అనుకూలం."
                    : "నాడి దోషం అంశాలు గుర్తించబడ్డాయి. సంతాన ఆరోగ్యం కోసం ప్రత్యేక వేద ప్రార్థనలు అవసరం కావచ్చు."
            },
            finance: {
                title: "సంపద మరియు శ్రేయస్సు",
                verdict: (result.milan.ashtakoot.bhakoot.score === 7)
                    ? "బలమైన ఆర్థిక సమన్వయం. సంపద సేకరణ స్థిరంగా ఉంటుంది."
                    : "భకూట సంబంధిత హెచ్చుతగ్గులను నివారించడానికి ఆర్థిక ప్రణాళికలో పారదర్శకత అవసరం."
            },
            bond: {
                title: "నవాంశ (D9) అనుకూలత",
                verdict: analyzeNavamsaBond(boyData, girlData, lang)
            },
            timing: {
                title: "వివాహ సమయ అంచనా",
                verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang)
            },
            forecast: {
                title: "12 ఏళ్ల వైవాహిక జీవిత అంచనా",
                verdict: generateLifeForecastSummary(score, lang)
            },
            remedies: {
                title: "వ్యక్తిగత పరిహారాలు",
                list: getContextualRemedies(result, lang)
            },
            summary: {
                verdict: score >= 24 ? "ముందుకు వెళ్ళండి" : score >= 18 ? "జాగ్రత్త" : "సిఫార్సు చేయబడలేదు",
                confidence: Math.min(95, 60 + (score * 1)),
                nextSteps: score >= 24 ? "ముహూర్తం ఎంచుకోండి" : "పరిహారాలు చేయండి"
            }
        },
        kn: {
            marriage: {
                title: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ",
                rating: score >= 24 ? "ಅತ್ಯುತ್ತಮ" : score >= 18 ? "ಉತ್ತಮ" : "ಸಾಧಾರಣ",
                verdict: score >= 24
                    ? "ದೀರ್ಘಕಾಲದ ದಾಂಪತ್ಯಕ್ಕೆ ಅತ್ಯಂತ ಅನುಕೂಲಕರ. ಕರ್ಮಗಳ ಜೋಡಣೆ ಪತ್ತೆಯಾಗಿದೆ."
                    : score >= 18
                        ? "ಸ್ಥಿರ ಮತ್ತು ಸಕಾರಾತ್ಮಕ ಹೊಂದಾಣಿಕೆ. ಸಣ್ಣ ಸಮಸ್ಯೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಪರಿಹರಿಸಬಹುದು."
                        : "ಸಾಧಾರಣ ಹೊಂದಾಣಿಕೆ. ಸಹಾನುಭೂತಿ ಮತ್ತು ಹೊಂದಾಣಿಕೆ ಇಲ್ಲಿ ಅಡಿಪಾಯವಾಗಿರುತ್ತದೆ."
            },
            nature: {
                title: "ಸ್ವಭಾವ ಮತ್ತು ಪ್ರವೃತ್ತಿ",
                verdict: (result.milan.ashtakoot.gana.score >= 5)
                    ? "ಇಬ್ಬರೂ ಪಾಲುದಾರರು ಸಾಮರಸ್ಯದ 'ಗಣ'ವನ್ನು (ಸ್ವಭಾವ) ಹಂಚಿಕೊಳ್ಳುತ್ತಾರೆ, ಇದು ಪರಸ್ಪರ ಗೌರವಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ."
                    : "ಸ್ವಭಾವದಲ್ಲಿ ವ್ಯತ್ಯಾಸಗಳು ಉಂಟಾಗಬಹುದು. ಒಬ್ಬರನ್ನೊಬ್ಬರು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ ಮತ್ತು ಗೌರವಿಸಿ."
            },
            family: {
                title: "ಕೌಟುಂಬಿಕ ಜೀವನ ಮತ್ತು ಮಕ್ಕಳು",
                verdict: (result.milan.ashtakoot.nadi.score === 8)
                    ? "ಅತ್ಯುತ್ತಮ ಆನುವಂಶಿಕ ಮತ್ತು ಆರೋಗ್ಯ ಹೊಂದಾಣಿಕೆ. ಸಂತಾನಕ್ಕೆ ಬಹಳ ಅನುಕೂಲಕರ."
                    : "ನಾಡಿ ದೋಷದ ಅಂಶಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಸಂತಾನದ ಆರೋಗ್ಯಕ್ಕಾಗಿ ವಿಶೇಷ ವೈದಿಕ ಪ್ರಾರ್ಥನೆಗಳು ಅಗತ್ಯವಿರಬಹುದು."
            },
            finance: {
                title: "ಸಂಪತ್ತು ಮತ್ತು ಸಮೃದ್ಧಿ",
                verdict: (result.milan.ashtakoot.bhakoot.score === 7)
                    ? "ಬಲವಾದ ಆರ್ಥಿಕ ಸಮನ್ವಯ. ಸಂಪತ್ತು ಸಂಗ್ರಹ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ."
                    : "ಭಕೂಟ ಸಂಬಂಧಿತ ಏರಿಳಿತಗಳನ್ನು ತಪ್ಪಿಸಲು ಆರ್ಥಿಕ ಯೋಜನೆಯಲ್ಲಿ ಪಾರದರ್ಶಕತೆ ಅಗತ್ಯ."
            },
            bond: {
                title: "ನವಾಂಶ (D9) ಸಿನರ್ಜಿ",
                verdict: analyzeNavamsaBond(boyData, girlData, lang)
            },
            timing: {
                title: "ವಿವಾಹ ಸಮಯದ ಅಂದಾಜು",
                verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang)
            },
            forecast: {
                title: "12 ವರ್ಷಗಳ ವೈವಾಹಿಕ ಜೀವನದ ಮುನ್ಸೂಚನೆ",
                verdict: generateLifeForecastSummary(score, lang)
            },
            remedies: {
                title: "ವೈಯಕ್ತಿಕ ಪರಿಹಾರಗಳು",
                list: getContextualRemedies(result, lang)
            },
            summary: {
                verdict: score >= 24 ? "ಮುಂದುವರಿಸಿ" : score >= 18 ? "ಎಚ್ಚರಿಕೆ" : "ಶಿಫಾರಸು ಮಾಡಲಾಗಿಲ್ಲ",
                confidence: Math.min(95, 60 + (score * 1)),
                nextSteps: score >= 24 ? "ಮುಹೂರ್ತ ಆಯ್ಕೆ ಮಾಡಿ" : "ಪರಿಹಾರಗಳನ್ನು ಮಾಡಿ"
            }
        }
    };

    return reports[lang as keyof typeof reports] || reports.en;
};

export const generateAshtakootAnalysis = (
    key: string,
    score: number,
    total: number,
    boyVal: string,
    girlVal: string,
    lang: string = "en"
) => {
    const isFull = score === total;
    const isZero = score === 0;

    const descriptions: any = {
        varna: {
            en: `Work compatibility is ${isFull ? "excellent" : "average"}. Boy is ${boyVal} and Girl is ${girlVal}.`,
            hi: `कार्य अनुकूलता ${isFull ? "उत्तम" : "औसत"} है। लड़का ${boyVal} है और लड़की ${girlVal} है।`,
            mr: `कार्य सुसंगतता ${isFull ? "उत्कृष्ट" : "सरासरी"} आहे. मुलगा ${boyVal} आहे आणि मुलगी ${girlVal} आहे.`,
            te: `పని అనుకూలత ${isFull ? "అద్భుతం" : "సగటు"}. వరుడు ${boyVal} మరియు వధువు ${girlVal}.`,
            kn: `ಕೆಲಸದ ಹೊಂದಾಣಿಕೆ ${isFull ? "ಅತ್ಯುತ್ತಮ" : "ಸಾಧಾರಣ"}. ಹುಡುಗ ${boyVal} ಮತ್ತು ಹುಡುಗಿ ${girlVal}.`
        },
        vashya: {
            en: `Power dynamics are ${isFull ? "balanced" : "challenging"}. Nature: ${boyVal} & ${girlVal}.`,
            hi: `शक्ति संतुलन ${isFull ? "संतुलित" : "चुनौतीपूर्ण"} है। प्रकृति: ${boyVal} और ${girlVal}।`,
            mr: `शक्ती संतुलन ${isFull ? "संतुलित" : "आव्हानात्मक"} आहे. निसर्ग: ${boyVal} आणि ${girlVal}.`,
            te: `శక్తి సమతుల్యత ${isFull ? "సమతుల్యంగా" : "సవాలుగా"} ఉంది. స్వభావం: ${boyVal} & ${girlVal}.`,
            kn: `ಶಕ್ತಿ ಸಮತೋಲನ ${isFull ? "ಸಮತೋಲಿತ" : "ಸವಾಲಿನ"}. ಸ್ವಭಾವ: ${boyVal} & ${girlVal}.`
        },
        tara: {
            en: `Destiny alignment is ${isFull ? "strong" : "moderate"}. Indicates ${isFull ? "good luck" : "mixed fortune"} together.`,
            hi: `भाग्य अनुकूलता ${isFull ? "मजबूत" : "मध्यम"} है। यह एक साथ ${isFull ? "सौभाग्य" : "मिश्रित भाग्य"} का संकेत देता है।`,
            mr: `भाग्य अनुकूलता ${isFull ? "मजबूत" : "मध्यम"} आहे. हे एकत्र ${isFull ? "सौभाग्य" : "मिश्रित भाग्य"} दर्शवते.`,
            te: `విధి అమరిక ${isFull ? "బలంగా" : "మితంగా"} ఉంది. ఇది కలిసి ${isFull ? "మంచి అదృష్టాన్ని" : "మిశ్రమ అదృష్టాన్ని"} సూచిస్తుంది.`,
            kn: `ವಿಧಿ ಜೋಡಣೆ ${isFull ? "ಪ್ರಬಲ" : "ಮಧ್ಯಮ"}. ಇದು ಒಟ್ಟಿಗೆ ${isFull ? "ಒಳ್ಳೆಯ ಅದೃಷ್ಟ" : "ಮಿಶ್ರ ಫಲ"} ಸೂಚಿಸುತ್ತದೆ.`
        },
        yoni: {
            en: `Basic nature compatibility is ${isFull ? "perfect" : isZero ? "oppositional" : "average"}. Types: ${boyVal} & ${girlVal}.`,
            hi: `मूल स्वभाव अनुकूलता ${isFull ? "परिपूर्ण" : isZero ? "विरोधी" : "औसत"} है। प्रकार: ${boyVal} और ${girlVal}।`,
            mr: `मूळ स्वभाव सुसंगतता ${isFull ? "परिपूर्ण" : isZero ? "विरोधी" : "सरासरी"} आहे. प्रकार: ${boyVal} आणि ${girlVal}.`,
            te: `ప్రాథమిక స్వభావ అనుకూలత ${isFull ? "పరిపూర్ణంగా" : isZero ? "విరుద్ధంగా" : "సగటున"} ఉంది. రకాలు: ${boyVal} & ${girlVal}.`,
            kn: `ಮೂಲ ಸ್ವಭಾವ ಹೊಂದಾಣಿಕೆ ${isFull ? "ಪರಿಪೂರ್ಣ" : isZero ? "ವಿರುದ್ಧ" : "ಸಾಧಾರಣ"}. ವಿಧಗಳು: ${boyVal} & ${girlVal}.`
        },
        maitri: {
            en: `Mental friendship is ${isFull ? "deep" : isZero ? "lacking" : "cordial"}. Lords: ${boyVal} & ${girlVal}.`,
            hi: `मानसिक मित्रता ${isFull ? "गहरी" : isZero ? "कम" : "सौहार्दपूर्ण"} है। स्वामी: ${boyVal} और ${girlVal}।`,
            mr: `मानसिक मैत्री ${isFull ? "खोल" : isZero ? "कमी" : "सौहार्दपूर्ण"} आहे. स्वामी: ${boyVal} आणि ${girlVal}.`,
            te: `మానసిక స్నేహం ${isFull ? "లోతుగా" : isZero ? "లేకపోవడం" : "సౌహార్దపూర్వకంగా"} ఉంది. అధిపతులు: ${boyVal} & ${girlVal}.`,
            kn: `ಮಾನಸಿಕ ಸ್ನೇಹ ${isFull ? "ಆಳವಾದ" : isZero ? "ಕೊರತೆ" : "ಸೌಹಾರ್ದಯುತ"}. ಅಧಿಪತಿಗಳು: ${boyVal} & ${girlVal}.`
        },
        gana: {
            en: `Temperament match is ${isFull ? "harmonious" : isZero ? "clashing" : "manageable"}. Boy: ${boyVal}, Girl: ${girlVal}.`,
            hi: `स्वभाव मिलान ${isFull ? "सुसंगत" : isZero ? "टकरावपूर्ण" : "प्रबंधनीय"} है। लड़का: ${boyVal}, लड़की: ${girlVal}।`,
            mr: `स्वभाव जुळणी ${isFull ? "सुसंगत" : isZero ? "टकरावपूर्ण" : "व्यवस्थापित करण्यायोग्य"} आहे. मुलगा: ${boyVal}, मुलगी: ${girlVal}.`,
            te: `స్వభావం అనుకూలత ${isFull ? "సామరస్యపూర్వకంగా" : isZero ? "విరుద్ధంగా" : "నిర్వహించదగినదిగా"} ఉంది. వరుడు: ${boyVal}, వధువు: ${girlVal}.`,
            kn: `ಸ್ವಭಾವ ಹೊಂದಾಣಿಕೆ ${isFull ? "ಸುಸಂಗತ" : isZero ? "ಘರ್ಷಣೆ" : "ನಿರ್ವಹಿಸಬಹುದಾದ"}. ಹುಡುಗ: ${boyVal}, ಹುಡುಗಿ: ${girlVal}.`
        },
        bhakoot: {
            en: isZero ? "Bhakoot Dosha detected. Emotional disconnect possible." : "Emotional connection is strong and supportive.",
            hi: isZero ? "भकूट दोष पाया गया। भावनात्मक अलगाव संभव है।" : "भावनात्मक संबंध मजबूत और सहायक है।",
            mr: isZero ? "भकूट दोष आढळला. भावनिक अलिप्तता शक्य आहे." : "भावनिक संबंध मजबूत आणि आश्वासक आहे.",
            te: isZero ? "భకూట దోషం కనుగొనబడింది. భావోద్వేగ విచ్ఛేదం సాధ్యమే." : "భావోద్వేగ బంధం బలంగా మరియు మద్దతుగా ఉంది.",
            kn: isZero ? "ಭಕೂಟ ದೋಷ ಪತ್ತೆಯಾಗಿದೆ. ಭಾವನಾತ್ಮಕ ಕಡಿತ ಸಾಧ್ಯ." : "ಭಾವನಾತ್ಮಕ ಸಂಬಂಧ ಪ್ರಬಲ ಮತ್ತು ಬೆಂಬಲಿತವಾಗಿದೆ."
        },
        nadi: {
            en: isZero ? "Nadi Dosha detected. Health/Genetic mismatch advisable to consult." : "Excellent health & genetic compatibility.",
            hi: isZero ? "नाड़ी दोष पाया गया। स्वास्थ्य/आनुवंशिक बेमेल, परामर्श की सलाह दी जाती है।" : "उत्तम स्वास्थ्य और आनुवंशिक अनुकूलता।",
            mr: isZero ? "नाडी दोष आढळला. आरोग्य/अनुवांशिक बेमेल, सल्ला घेण्याचा सल्ला दिला जातो." : "उत्कृष्ट आरोग्य आणि अनुवांशिक सुसंगतता.",
            te: isZero ? "నాడీ దోషం కనుగొనబడింది. ఆరోగ్య/జన్యుపరమైన అస్థిరత, సంప్రదించడం మంచిది." : "అద్భుతమైన ఆరోగ్య మరియు జన్యు అనుకూలత.",
            kn: isZero ? "ನಾಡಿ ದೋಷ ಪತ್ತೆಯಾಗಿದೆ. ಆರೋಗ್ಯ/ಜನ್ುವಿನ ಹೊಂದಾಣಿಕೆಯಿಲ್ಲ, ಸಮಾಲೋಚನೆ ಸೂಕ್ತ." : "ಅತ್ಯುತ್ತಮ ಆರೋಗ್ಯ ಮತ್ತು ಆನುವಂಶಿಕ ಹೊಂದಾಣಿಕೆ."
        }
    };

    const textObj = descriptions[key] || {
        en: "Analysis unavailable",
        hi: "विश्लेषण अनुपलब्ध",
        mr: "विश्लेषण उपलब्ध नाही",
        te: "విశ్లేషణ అందుబాటులో లేదు",
        kn: "ವಿಶ್ಲೇಷಣೆ ಲಭ್ಯವಿಲ್ಲ"
    };
    return textObj[lang as keyof typeof textObj] || textObj.en;
};

// ─── Daily Horoscope — transit-based, changes every day ───────────────────────

const _SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
function _doy() { const n = new Date(), s = new Date(n.getFullYear(),0,0); return Math.floor((n.getTime()-s.getTime())/864e5); }
function _pick<T>(a: T[], seed: number): T { return a[Math.abs(seed) % a.length]; }

const _EN = {
    positive: ["Cosmic currents align in your favour — take bold action on a goal you've hesitated over.","A powerful planetary configuration supports self-expression. Speak your truth and be heard.","Today carries rare auspicious energy. Initiate, connect, and trust your instincts.","Celestial forces amplify your natural magnetism. Relationships and opportunities both flourish.","Inner clarity arrives unexpectedly. A long-standing confusion dissolves today.","The universe lends you extra courage — step outside your comfort zone confidently.","A breakthrough moment may arrive from an unusual direction. Stay open to surprises.","Energy levels are high. Physical and mental stamina support ambitious undertakings.","Your leadership qualities shine today. Others naturally look to you for direction.","Gratitude amplifies abundance. Small wins today set up larger victories tomorrow.","A harmonious planetary link benefits your creative output. Express yourself boldly.","Intuition is sharper than logic today — trust what your gut tells you."],
    negative: ["Avoid financial commitments under uncertainty. Review any contract twice before signing.","Emotional reactivity peaks briefly — pause before responding in tense conversations.","Minor delays or miscommunications arise. Build extra time into important schedules.","Energy dips mid-day. Prioritise hydration and short breaks to maintain focus.","Resist the urge to overpromise. Under-committing and over-delivering wins respect.","Old anxieties may resurface. Acknowledge them without letting them drive decisions.","Arguments on minor matters can escalate. Choose your battles wisely today.","Distractions dilute productivity. Silence notifications and focus on one task at a time.","A setback in plans is a redirection, not a failure. Adapt flexibly.","Overconfidence could lead to a misstep. Cross-check important information before acting.","Beware of impulsive spending. Wants and needs may feel indistinguishable today.","Travel or commutes may face unexpected delays. Allow extra buffer time."],
    career: ["Sun illuminates your professional sphere — present ideas boldly, authority figures are receptive.","Emotional intelligence is your work superpower today. Listen more; speak with precision.","Mercury sharpens communications — contracts, proposals and emails carry serious weight.","Mars fuels determination. Tackle the challenging project you've been postponing.","Jupiter expands opportunity. A mentor or unexpected contact opens a significant door.","Analytical work yields breakthroughs today. Research, data and strategy pay dividends.","A bold career move is favoured. Courage to negotiate or propose a new venture is high.","Collaborative efforts outshine solo work today. Involve your team in key decisions.","Leadership tasks flow effortlessly. Your visibility and credibility rise meaningfully.","A delayed result or recognition finally arrives. Your efforts are being noticed.","Focus on long-term strategies rather than short-term firefighting — big-picture thinking wins.","Networking yields surprising results. Reach out to a contact you haven't spoken to recently."],
    love: ["Venus graces your relationship sector — romantic feelings run deep, express them warmly.","Shared activities with a partner or loved one create lasting memories today.","Singles may encounter someone intriguing in an unexpected social setting.","Open and honest communication resolves a lingering misunderstanding in your relationship.","Your charm and charisma are at their seasonal peak. Make the most of social occasions.","Financial harmony with your partner leads to a productive shared decision.","Old friendships deepen meaningfully. Prioritise the people who truly matter.","Compassion and patience define your most successful relationship interactions today.","A heartfelt gesture — however small — strengthens your closest bond significantly.","Romantic surprises are possible. Keep the evening light and spontaneous.","Family harmony improves. An elder's wisdom proves unexpectedly helpful.","Your emotional availability is a gift today. Be present in conversations."],
    health: ["Saturn urges disciplined health routines. Rest, hydrate and do not skip exercise.","Detox or intermittent fasting yields excellent results under today's planetary influence.","Outdoor movement — even a short walk — dramatically improves mood and clarity.","Mental wellness requires attention. Meditation or deep breathing offers real relief.","Old health matters resurface for resolution. Consult a professional rather than self-treating.","Pace yourself to prevent burnout. Consistent effort beats sporadic bursts of energy.","Digestive sensitivity is elevated. Opt for lighter, easily digestible meals today.","Sleep quality influences tomorrow's performance. Establish a wind-down routine tonight.","Stress is the root of today's health challenge. Address its source, not just its symptoms.","Your body signals are unusually clear today. Listen to them and rest when needed.","A small lifestyle adjustment — one you've delayed — yields outsized long-term benefits.","Joy is medicine. Schedule something genuinely pleasurable into your afternoon."],
};
const _HI = {
    positive: ["आज ग्रहों की अनुकूल स्थिति आपके पक्ष में है। किसी लक्ष्य पर साहसपूर्वक कदम बढ़ाएं।","आज आत्म-अभिव्यक्ति के लिए शक्तिशाली ग्रह-योग है। अपनी बात खुलकर कहें।","दुर्लभ शुभ ऊर्जा है आज। नई शुरुआत करें और प्रवृत्ति पर भरोसा करें।","आकाशीय शक्तियां आपके आकर्षण को बढ़ाती हैं। सम्बंध और अवसर दोनों फलते हैं।","अंदर से स्पष्टता आती है। एक पुरानी उलझन आज सुलझ जाएगी।","ब्रह्मांड अतिरिक्त साहस देता है — आराम क्षेत्र से बाहर निकलें।","अप्रत्याशित दिशा से सफलता मिल सकती है। बदलावों के लिए खुले रहें।","ऊर्जा का स्तर उच्च है। शारीरिक और मानसिक क्षमता महत्वाकांक्षी कार्यों का समर्थन करती है।","नेतृत्व गुण चमकते हैं आज। लोग स्वाभाविक रूप से आपसे मार्गदर्शन चाहते हैं।","कृतज्ञता से प्रचुरता बढ़ती है। आज की छोटी जीत कल बड़ी उपलब्धि बनती है।","रचनात्मकता के लिए ग्रह-योग अनुकूल है। प्रतिभा को खुलकर व्यक्त करें।","तर्क से अधिक अंतर्ज्ञान काम आता है आज — आंतरिक आवाज़ सुनें।"],
    negative: ["अनिश्चितता में वित्तीय प्रतिबद्धताओं से बचें। कोई भी अनुबंध दो बार जांचें।","भावनात्मक प्रतिक्रियाशीलता क्षणिक रूप से बढ़ती है — तनावपूर्ण बातचीत में विराम लें।","छोटी देरी या गलतफहमियां हो सकती हैं। महत्वपूर्ण कार्यक्रमों में अतिरिक्त समय रखें।","दोपहर में ऊर्जा कम हो सकती है। पानी पिएं और छोटे ब्रेक लें।","ज़रूरत से ज़्यादा वादा करने से बचें। कम वादा, ज़्यादा प्रदर्शन।","पुरानी चिंताएं फिर उभर सकती हैं। उन्हें स्वीकार करें लेकिन निर्णय पर हावी न होने दें।","छोटी बातों पर विवाद बड़ा रूप ले सकता है। समझदारी से व्यवहार करें।","ध्यान भटकाने से उत्पादकता कम होती है। एक समय में एक काम पर ध्यान दें।","योजनाओं में बाधा पुनर्निर्देशन है, असफलता नहीं। लचीले रहें।","अति-आत्मविश्वास से ग़लती हो सकती है। कार्य करने से पहले जानकारी जांचें।","आवेगी खर्च से बचें। इच्छाएं और ज़रूरतें एक जैसी लग सकती हैं आज।","यात्रा में अप्रत्याशित देरी हो सकती है। अतिरिक्त समय का बफर रखें।"],
    career: ["सूर्य व्यावसायिक क्षेत्र को रोशन करता है — विचार निडरता से प्रस्तुत करें।","कार्यस्थल पर भावनात्मक बुद्धिमत्ता आज ताकत है। ध्यान से सुनें।","बुध संचार को तीव्र करता है — अनुबंध और प्रस्तुतियां विशेष महत्वपूर्ण हैं।","मंगल दृढ़ता बढ़ाता है। रुके हुए प्रोजेक्ट को आज निपटाएं।","गुरु अवसर का विस्तार करता है। मार्गदर्शक एक महत्वपूर्ण दरवाज़ा खोलता है।","विश्लेषणात्मक कार्य से आज सफलता मिलती है। शोध और रणनीति फलदायी हैं।","करियर में साहसी कदम अनुकूल है। बातचीत का साहस उच्च है।","सहयोगात्मक प्रयास एकल कार्य से बेहतर है आज। टीम को शामिल करें।","नेतृत्व कार्य सहजता से प्रवाहित होते हैं। दृश्यता और विश्वसनीयता बढ़ती है।","विलंबित परिणाम या मान्यता अंततः आती है। प्रयास देखे जा रहे हैं।","दीर्घकालिक रणनीतियों पर ध्यान दें — बड़ी तस्वीर की सोच जीतती है।","नेटवर्किंग आश्चर्यजनक परिणाम देती है। पुराने संपर्क से जुड़ें।"],
    love: ["शुक्र रिश्ते क्षेत्र को आशीर्वाद देता है — रोमांटिक भावनाएं गहरी होती हैं।","साथी के साथ साझा गतिविधियां आज यादगार पल बनाती हैं।","एकल जातकों को अप्रत्याशित सामाजिक स्थान में कोई रोचक मिल सकता है।","खुला संवाद रिश्ते में पुरानी गलतफहमी सुलझाता है।","आकर्षण मौसमी शिखर पर है। सामाजिक अवसरों का लाभ उठाएं।","साथी के साथ वित्तीय सामंजस्य उत्पादक निर्णय की ओर ले जाता है।","पुरानी दोस्तियां गहरी होती हैं। वास्तव में मायने रखने वाले लोगों को प्राथमिकता दें।","करुणा और धैर्य सफल रिश्ते के अनुभव को परिभाषित करता है आज।","एक छोटा इशारा — निकटतम बंधन को मज़बूत करता है।","रोमांटिक आश्चर्य संभव हैं। शाम को हल्का और सहज रखें।","पारिवारिक सामंजस्य में सुधार होता है। बुजुर्ग की सलाह अप्रत्याशित रूप से सहायक।","भावनात्मक उपलब्धता आज उपहार है। बातचीत में उपस्थित रहें।"],
    health: ["शनि स्वास्थ्य दिनचर्या में अनुशासन की याद दिलाता है। आराम, पानी और व्यायाम न छोड़ें।","ग्रह प्रभाव में डिटॉक्स या उपवास उत्कृष्ट परिणाम देता है।","बाहरी गतिविधि — छोटी सैर भी — मनोदशा और स्पष्टता में सुधार करती है।","मानसिक स्वास्थ्य पर ध्यान दें। ध्यान या गहरी सांस से राहत मिलती है।","पुरानी स्वास्थ्य समस्याएं उभरती हैं। पेशेवर से परामर्श लें।","जलन से बचने के लिए खुद को गति दें। स्थिर प्रयास बेहतर है।","पाचन संवेदनशीलता बढ़ी है। हल्के, आसानी से पचने वाले भोजन का चुनाव करें।","नींद की गुणवत्ता कल के प्रदर्शन को प्रभावित करती है। शांत दिनचर्या स्थापित करें।","तनाव स्वास्थ्य चुनौती की जड़ है। स्रोत को संबोधित करें।","शरीर के संकेत स्पष्ट हैं आज। सुनें और ज़रूरत पड़ने पर आराम करें।","छोटा जीवनशैली समायोजन — दीर्घकालिक लाभ देता है।","आनंद दवा है। दोपहर में कुछ आनंददायक निर्धारित करें।"],
};

const _MR = {
    positive: ["ग्रहांची स्थिती अनुकूल आहे — एखाद्या योजनेवर धाडसी पाऊल उचलण्यासाठी आजचा दिवस उत्तम आहे.","शक्तिशाली ग्रहयोग आत्म-अभिव्यक्तीसाठी पोषक आहे. आपले विचार स्पष्टपणे मांडा.","आज दुर्मिळ शुभ ऊर्जा आहे. नवीन कामाची सुरुवात करा आणि आपल्या अंतर्ज्ञानावर विश्वास ठेवा.","अव्याहत वैश्विक शक्ती आपले आकर्षण वाढवत आहेत. नातेसंबंध आणि संधी दोन्ही बहरतील.","अनपेक्षितपणे अंतर्मन स्पष्ट होईल. दीर्घकाळ चाललेली कोंडी आज फुटेल.","ब्रह्मांड आपल्याला अतिरिक्त धैर्य देत आहे — आपल्या सुरक्षित परिघाबाहेर पडून काहीतरी नवीन करा.","एका वेगळ्या दिशेतून यश मिळण्याची शक्यता आहे. बदलांसाठी तयार राहा.","ऊर्जा पातळी उच्च आहे. शारीरिक आणि मानसिक क्षमता मोठी उद्दिष्टे साध्य करण्यास मदत करतील.","आपले नेतृत्व गुण आज चमकतील. लोक मार्गदर्शनासाठी आपल्याकडे पाहतील.","कृतज्ञतेने समृद्धी वाढते. आजचा छोटा विजय उद्याच्या मोठ्या यशाची पायाभरणी करेल.","सर्जनशीलतेसाठी आजचा दिवस अनुकूल आहे. आपली कला आणि कौशल्ये मुक्तपणे मांडा.","आज तर्कापेक्षा अंतर्ज्ञान अधिक प्रभावी ठरेल — आपल्या मनाचा आवाज ऐका."],
    negative: ["अनिश्चिततेच्या काळात आर्थिक गुंतवणूक टाळा. करार पत्रावर स्वाक्षरी करण्यापूर्वी दोनदा तपासा.","भावनिक संवेदनशीलता वाढू शकते — तणावाच्या वेळी बोलण्यापूर्वी थोडा वेळ शांत राहा.","काही कामात विलंब किंवा गैरसमज होण्याची शक्यता आहे. महत्त्वाच्या कामांसाठी जास्तीचा वेळ ठेवा.","दुपारच्या वेळी उत्साह कमी वाटू शकतो. पुरेसे पाणी प्या आणि मध्ये मध्ये विश्रांती घ्या.","गरजेपेक्षा जास्त काम हाती घेऊ नका. जे शक्य आहे तेच पूर्ण करण्यावर भर द्या.","जुन्या चिंता पुन्हा सतावू शकतात. त्यांना स्वीकारून पुढे जा, निर्णयांवर परिणाम होऊ देऊ नका.","छोट्या कारणावरून वाद मोठे होऊ शकतात. आपले शब्द जपून वापरा.","एकाग्रता भंग झाल्यामुळे उत्पादकता कमी होऊ शकते. एका वेळी एकाच कामावर लक्ष केंद्रित करा.","योजनांमध्ये येणारे अडथळे म्हणजे अपयश नाही, तर ती नवीन दिशा आहे. लवचिक राहा.","अति-आत्मविश्वासामुळे चूक होऊ शकते. कोणतीही कृती करण्यापूर्वी माहितीची खात्री करा.","आवेगी खर्चावर नियंत्रण ठेवा. इच्छा आणि गरज यातील फरक ओळखा.","प्रवासात अनपेक्षित विलंब होऊ शकतो. अतिरिक्त वेळ हाताशी ठेवून घराबाहेर पडा."],
    career: ["सूर्य आपल्या व्यावसायिक क्षेत्राला प्रकाशित करत आहे — आपले विचार आत्मविश्वासाने मांडा.","कामाच्या ठिकाणी आपली भावनिक बुद्धिमत्ता आज आपली ताकद ठरेल. शांतपणे ऐकून घ्या.","बुध ग्रहामुळे संवाद कौशल्य वाढेल — करार आणि सादरीकरण अत्यंत महत्त्वाचे ठरतील.","मंगळ आपल्यातील जिद्द वाढवेल. रखडलेले प्रकल्प आज पूर्ण करा.","गुरूच्या कृपेने नवीन संधी उपलब्ध होतील. एखादा मार्गदर्शक नवीन दरवाजे उघडेल.","आज केलेल्या विश्लेषणात्मक कामाला यश मिळेल. संशोधन आणि रणनीति फायदेशीर ठरेल.","करिअरमध्ये मोठे पाऊल उचलण्यासाठी वेळ अनुकूल आहे. वाटाघाटीसाठी आत्मविश्वास वाढेल.","सामूहिक प्रयत्न वैयक्तिक कामापेक्षा अधिक फलदायी ठरतील. सहकाऱ्यांना सोबत घ्या.","नेतृत्व संबंधित कामे सहज पूर्ण होतील. आपली प्रतिष्ठा आणि विश्वासार्हता वाढेल.","प्रलंबित निकाल किंवा कामाला अखेर दाद मिळेल. आपल्या कष्टाची दखल घेतली जात आहे.","दीर्घकालीन नियोजनावर लक्ष केंद्रित करा — मोठी स्वप्ने पाहणे आणि त्यावर काम करणे महत्त्वाचे आहे.","नेटवर्किंगमधून आश्चर्यकारक निकाल मिळतील. जुन्या संपर्कांकडे पुन्हा वळा."],
    love: ["शुक्र ग्रहाच्या आशीर्वादाने नातेसंबंधांमध्ये गोडवा येईल — रोमँटिक भावना गडद होतील.","जोडीदारासोबत घालवलेला वेळ आज अविस्मरणीय आठवणी तयार करेल.","अविवाहित व्यक्तींना अचानक एखाद्या सामाजिक कार्यक्रमात खास व्यक्ती भेटू शकते.","मोकळा संवाद नात्यातील जुने गैरसमज दूर करण्यास मदत करेल.","आपले आकर्षण आज शिखरावर आहे. सामाजिक संधींचा पूर्ण फायदा घ्या.","जोडीदारासोबतचे आर्थिक समन्वय महत्त्वाचे निर्णय घेण्यास मदत करेल.","जुन्या मैत्रीचे धागे घट्ट होतील. आपल्यासाठी महत्त्वाच्या असणाऱ्या व्यक्तींना वेळ द्या.","दयाळूपणा आणि संयम यामुळे आज नातेसंबंध अधिक समृद्ध होतील.","एखादी छोटी कृती किंवा शब्द आपल्या जवळच्या नात्याला अधिक मजबुती देईल.","रोमँटिक सरप्राईज मिळण्याची शक्यता आहे. संध्याकाळ आनंदी आणि उत्साही ठेवा.","कौटुंबिक सुसंवाद वाढेल. घरातील मोठ्यांचा सल्ला अनपेक्षितपणे उपयुक्त ठरेल.","भावनिक उपलब्धता आज महत्त्वाची आहे. संभाषणात पूर्णपणे मन लावून सहभागी व्हा."],
    health: ["शनि शिस्तबद्ध दिनचर्या राखण्याचे आवाहन करत आहे. विश्रांती, पाणी आणि व्यायाम चुकवू नका.","ग्रहमान डिटॉक्स किंवा उपवासासाठी पोषक आहे, ज्यामुळे उत्कृष्ट निकाल मिळतील.","बाहेरची हालचाल — अगदी थोडी चालणे सुद्धा — आपले मन प्रसन्न आणि विचार स्पष्ट करेल.","मानसिक आरोग्याकडे लक्ष देण्याची गरज आहे. ध्यान किंवा दीर्घ श्वास घेतल्याने नक्कीच आराम मिळेल.","जुन्या आरोग्याच्या तक्रारी पुन्हा उद्भवण्याची शक्यता आहे. स्वतः उपचार करण्यापेक्षा तज्ज्ञांचा सल्ला घ्या.","थकवा टाळण्यासाठी कामाची गती मर्यादित ठेवा. सातत्य राखणे महत्त्वाचे आहे.","पचनसंस्थेशी संबंधित समस्या जाणवू शकतात. आज हलका आणि सकस आहार घ्या.","झोपेची गुणवत्ता उद्याच्या कामगिरीवर परिणाम करेल. आज लवकर निवांत होण्याची सवय लावा.","तणाव हे आरोग्याच्या समस्यांचे मूळ असू शकते. तणावाच्या कारणांवर काम करा.","आपले शरीर आज स्पष्ट संकेत देईल. त्याकडे दुर्लक्ष करू नका आणि गरज असेल तेव्हा विश्रांती घ्या.","छोटा जीवनशैली समायोजन — दीर्घकालिक लाभ देते.","आनंद हेच सर्वोत्तम औषध आहे. दुपारच्या वेळी काहीतरी आनंददायक निर्धारित करा."],
};

const _GU = {
    positive: ["ગ્રહોની સ્થિતિ અનુકૂળ છે — કોઈ મોટા લક્ષ્ય પર સાહસિક પગલું ભરો.","આત્મ-અભિવ્યક્તિ માટે આજે શક્તિશાળી ગ્રહ-યોગ છે. મન મૂકીને બોલો.","આજનો દિવસ દુર્લભ શુભ ઉર્જાથી ભરેલો છે. નવી શરૂઆત કરો.","આકાશી શક્તિઓ તમારા આકર્ષણમાં વધારો કરે છે. સંબંધોમાં મધુરતા આવશે.","આંતરિક સ્પષ્ટતા અચાનક આવશે. એક જૂની મૂંઝવણ આજે ઉકેલાઈ જશે.","બ્રહ્માંડ તમને વધારાની હિંમત આપે છે — કમ્ફર્ટ ઝોનમાંથી બહાર આવો.","ન ધારેલી દિશામાંથી સફળતા મળી શકે છે. ફેરફારો માટે તૈયાર રહો.","ઉર્જાનું સ્તર ઊંચું છે. શારીરિક અને માનસિક ક્ષમતા સાથ આપશે.","તમારા નેતૃત્વના ગુણો આજે ચમકશે. લોકો તમારું માર્ગદર્શન લેશે.","કૃતજ્ઞતાથી સમૃદ્ધિ વધે છે. આજની નાની જીત કાલે મોટી સિદ્ધિ લાવશે.","સર્જનાત્મકતા માટે ગ્રહ-યોગ અનુકૂળ છે. પ્રતિભાને વ્યક્ત કરો.","તર્ક કરતાં અંતર્જ્ઞાન વધુ કામ આવશે — મનનો અવાજ સાંભળો."],
    negative: ["અનિશ્ચિતતામાં આર્થિક જોખમ લેવાનું ટાળો. કરાર બે વાર તપાસો.","ભાવનાત્મક પ્રતિક્રિયાશીલતા વધી શકે છે — શાંત રહીને વિચારજો.","નાની વિલંબ કે ભૂલ થઈ શકે છે. મહત્વના કામમાં સમય હાથમાં રાખો.","બપોર પછી ઉર્જા ઓછી થઈ શકે છે. પાણી પીઓ અને ટૂંકો આરામ લો.","વધારે પડતા વચન આપવાથી બચો. ઓછું કહીને વધારે કામ કરો.","જૂની ચિંતાઓ ફરી ઉભરી શકે છે. તેને સ્વીકારીને આગળ વધો.","નાની બાબતોમાં વિવાદ મોટું સ્વરૂપ લઈ શકે છે. સમજદારી રાખો.","ધ્યાન ભટકી જવાથી કામમાં ઢીલ થઈ શકે છે. એકાગ્ર રહો.","યોજનાઓમાં અવરોધ એ નિષ્ફળતા નથી પણ નવો રસ્તો છે. લવચીક રહો.","અતિ-વિશ્વાસથી ભૂલ થઈ શકે છે. કામ કરતાં પહેલાં વિગતો તપાસો.","આડેધડ ખર્ચ કરવાથી બચો. જરૂરિયાત મુજબ જ ખર્ચ કરો.","પ્રવાસમાં અણધારી વિલંબ થઈ શકે છે. વહેલા નીકળવાનું રાખજો."],
    career: ["સૂર્ય વ્યાવસાયિક ક્ષેત્રને પ્રકાશિત કરે છે — વિચારો નિડરતાથી રજૂ કરો.","કાર્યસ્થળ પર ભાવનાત્મક સમજદારી આજે તમારી તાકાત છે.","બુધ સંચારને તીવ્ર કરે છે — દરખાસ્તો વિશેષ મહત્વની રહેશે.","મંગળ મક્કમતા વધારે છે. અટકેલા પ્રોજેક્ટ આજે પૂરા કરો.","ગુરુ તકનો વિસ્તાર કરે છે. કોઈ માર્ગદર્શક નવો રસ્તો ખોલશે.","વિશ્લેષણાત્મક કાર્યમાં આજે સફળતા મળશે. વ્યૂહરચના ફળદાયી છે.","કરિયરમાં સાહસિક પગલું ભરવા માટે સમય અનુકૂળ છે.","સહયોગી પ્રયાસો સફળ થશે. ટીમને સાથે લઈને ચાલો.","નેતૃત્વના કામો સહજતાથી પાર પડશે. તમારી વિશ્વસનીયતા વધશે.","થોભી ગયેલા પરિણામો હવે આવવા લાગશે. તમારા પ્રયત્નો દેખાશે.","લાંબા ગાળાની વ્યુહરચના પર ધ્યાન આપો — મોટી દ્રષ્ટિ જીતશે.","નેટવર્કિંગ આશ્ચર્યજનક પરિણામ આપશે. જૂના સંપર્કો તાજા કરો."],
    love: ["શુક્ર સંબંધોના ક્ષેત્રમાં આશીર્વાદ આપે છે — લાગણીઓ ઊંડી બનશે.","સાથી સાથેની પ્રવૃત્તિઓ આજે યાદગાર પળો બનાવશે.","અવિવાહિતોને અચાનક કોઈ રસપ્રદ વ્યક્તિ મળી શકે છે.","ખુલ્લેઆમ વાત કરવાથી સંબંધોની જૂની ગેરસમજ દૂર થશે.","આકર્ષણ તેની ચરમસીમાએ છે. સામાજિક તકોનો લાભ લો.","સાથી સાથે આર્થિક તાલમેલ સારો રહેશે, જે નિર્ણય લેવામાં મદદ કરશે.","જૂની મિત્રતા ગાઢ બનશે. સાચા સંબંધોને પ્રાથમિકતા આપો.","કરુણા અને ધીરજ આજે તમારા સંબંધોને મજબૂત બનાવશે.","માત્ર એક નાનો સંકેત — નજીકના સંબંધોને વધુ ગાઢ બનાવશે.","રોમેન્ટિક સરપ્રાઈઝ મળી શકે છે. સાંજને હળવી રાખો.","પારિવારિક સુમેળમાં સુધારો થશે. વડીલોની સલાહ કામ આવશે.","ભાવનાત્મક હાજરી આજે શ્રેષ્ઠ ભેટ છે. હાજર રહીને વાત કરો."],
    health: ["શનિ સ્વાસ્થ્ય દિનચર્યામાં શિસ્તની યાદ અપાવે છે. આરામ લો.","ગ્રહ પ્રભાવમાં ઉપવાસ કે ડિટોક્સ ઉત્તમ પરિણામ આપશે.","થોડો સમય બહાર ફરવાથી માનસિક સ્પષ્ટતા વધશે.","માનસિક સ્વાસ્થ્ય પર ધ્યાન આપો. ધ્યાન કે પ્રાણાયામ કરો.","જૂની સ્વાસ્થ્ય સમસ્યાઓ ઉભરી શકે છે. નિષ્ણાતની સલાહ લો.","થાક ટાળવા માટે તમારી ગતિ જાળવી રાખો. સતત પ્રયાસ કરો.","પાચન સંબંધી તકલીફ થઈ શકે છે. હળવો ખોરાક લેવો.","ઊંઘની ગુણવત્તા આવતીકાલના કામ પર અસર કરશે. વહેલા સૂવો.","તણાવ એ સ્વાસ્થ્યની સમસ્યાનું મૂળ હોઈ શકે છે. મન શાંત રાખો.","શરીરના સંકેતો આજે સ્પષ્ટ છે. જરૂર પડે ત્યારે આરામ કરો.","જીવનશૈલીમાં કરેલો નાનો ફેરફાર લાંબા ગાળે ફાયદો કરાવશે.","ખુશ રહેવું એ જ દવા છે. બપોરે કંઈક આનંદદાયક કામ કરો."],
};

const _TA = {
    positive: ["கோள்களின் நிலை உங்களுக்கு சாதகமாக உள்ளது — தைரியமாக ஒரு இலக்கை நோக்கி நகருங்கள்.","சுய வெளிப்பாட்டிற்கு இன்று வலிமையான யோகம் உள்ளது. உங்கள் கருத்தை முன்வைக்கவும்.","இன்று அரிய சுப ஆற்றல் உள்ளது. புதிய தொடக்கங்களை முன்னெடுக்கவும்.","உங்களின் ஈர்ப்பு விசி கூடுகிறது. உறவுகளும் வாய்ப்புகளும் உங்களைத் தேடி வரும்.","மனத்தெளிவு இன்று தற்செயலாக உண்டாகும். நீண்ட நாள் குழப்பம் தீரும்.","பிரபஞ்சம் உங்களுக்கு கூடுதல் தைரியத்தை அளிக்கிறது — தயக்கமின்றி செயல்படுங்கள்.","எதிர்பாராத திசையிலிருந்து வெற்றி கிடைக்கும். மாற்றங்களுக்குத் தயாராக இருங்கள்.","ஆற்றல் நிலை அதிகமாக உள்ளது. உடல் மற்றும் மன உறுதி வேலைகளுக்கு துணை நிற்கும்.","தலைமைப் பண்புகள் இன்று வெளிப்படும். மற்றவர்கள் உங்களை வழிகாட்டியாகக் கருதுவார்கள்.","நன்றி உணர்வு முன்னேற்றத்தைத் தரும். இன்றைய சிறு வெற்றி நாளை பெரிய சாதனையாகும்.","படைப்பாற்றலுக்கு கோள்கள் சாதகமாக உள்ளன. உங்கள் திறமையை வெளிப்படுத்துங்கள்.","உள்ளுணர்வு இன்று சிறப்பாகச் செயல்படும் — உங்கள் மனசாட்சியின் படி நடக்கவும்."],
    negative: ["நிச்சயமற்ற நிலையில் நிதி முடிவுகளைத் தவிர்க்கவும். ஒப்பந்தங்களைச் சரிபார்க்கவும்.","உணர்ச்சிவசப்படுவதைத் தவிர்க்கவும் — பேசும் முன் சற்று நிதானமாகச் சிந்திக்கவும்.","சிறிய தாமதம் அல்லது கருத்து வேறுபாடு ஏற்படலாம். கூடுதல் நேரம் ஒதுக்குங்கள்.","மதிய நேரங்களில் சோர்வு ஏற்படலாம். தண்ணீர் குடித்து சிறிது ஓய்வு எடுக்கவும்.","தேவையில்லாத வாக்குறுதிகளைத் தவிர்க்கவும். வேலையில் கவனம் செலுத்துங்கள்.","பய உணர்வுகள் வந்து போகலாம். அவற்றைக் கடந்து நம்பிக்கையுடன் செயல்படுங்கள்.","சிறிய விஷயங்களில் வாக்குவாாதங்களைத் தவிர்க்கவும். பொறுமையாக இருக்கவும்.","கவனம் சிதறுவதால் வேலை தாமதமாகலாம். ஒருமுகப்பட்டுச் செயல்படுங்கள்.","திட்டங்களில் ஏற்படும் தடை தோல்வியல்ல, அது ஒரு அனுபவம். நெகிழ்வாக இருங்கள்.","அதிக தன்னம்பிக்கை தவறுக்கு வழிவகுக்கலாம். தகவல்களைச் சரிபார்க்கவும்.","தேவையற்றச் செலவுகளைத் தவிர்க்கவும். சிக்கனமாக இருப்பது நல்லது.","பயணங்களில் எதிர்பாராத தாமதங்கள் ஏற்படலாம். முன் கூட்டியே கிளம்பவும்."],
    career: ["சூரியன் உங்கள் தொழில் நிலையை உயர்த்துகிறது — தைரியமாக கருத்துக்களைக் கூறவும்.","பணியிடத்தில் சாமர்த்தியமாக நடந்து கொள்ளவும். மற்றவர்களின் கருத்தையும் கேட்கவும்.","புதன் உங்கள் தகவல் தொடர்பை வலுப்படுத்துகிறது — ஒப்பந்தங்கள் சாதகமாகும்.","செவ்வாய் உங்களுக்கு ஊக்கத்தைத் தரும். நிலுவையில் உள்ள வேலைகளை முடிக்கவும்.","குரு வாய்ப்புகளை விரிவாக்குகிறார். ஒரு நபர் உங்களுக்கு வழிகாட்டுவார்.","ஆராய்ச்சி மற்றும் திட்டமிடல் இன்று வெற்றியைத் தரும். வியூகம் அமைக்கவும்.","தொழிலில் ஒரு பெரிய மாற்றத்திற்கு இன்று ஏற்ற நாள். பேச்சுவார்த்தை வெற்றி தரும்.","கூட்டு முயற்சிகள் இன்று சிறப்பாக அமையும். குழுவை ஒருங்கிணைத்துச் செயல்படவும்.","தலைமைப் பொறுப்புகள் எளிதாகக் கூடி வரும். உங்கள் மரியாதை உயரும்.","தாமதமான பலன்கள் இன்று தேடி வரும். உங்கள் உழைப்பு அங்கீகரிக்கப்படும்.","நீண்ட காலத் திட்டங்களில் கவனம் செலுத்துங்கள் — பெரிய இலக்கு வெற்றி தரும்.","புதிய தொடர்புகள் ஆச்சரியமான பலன்களைத் தரும். பழைய நண்பர்களைத் தொடர்பு கொள்ளவும்."],
    love: ["சுக்கிரன் உறவுகளில் இனிமையைத் தருகிறார் — அன்பு இன்று ஆழமாக இருக்கும்.","துணையுடன் நேரத்தை செலவிடுவது மகிழ்ச்சியான நினைவுகளை உருவாக்கும்.","தனிமையில் இருப்பவர்களுக்குத் தற்செயலாக ஒரு அறிமுகம் கிடைக்கலாம்.","மனம் விட்டுப் பேசுவது உறவில் உள்ள விரிசல்களைச் சரிசெய்யும்.","உங்களின் கவர்ச்சி இன்று சிறப்பாக இருக்கும். சமூக வாய்ப்புகளைப் பயன்படுத்தவும்.","துணையுடன் நிதி ரீதியாக இணக்கம் ஏற்படும். ஒரு கூட்டு முடிவு பலன் தரும்.","பழைய நட்புகள் இன்று பலப்படும். உண்மையான உறவுகளுக்கு முக்கியத்துவம் அளிக்கவும்.","இரக்கமும் பொறுமையும் இன்று உங்கள் உறவை மேன்மையடையச் செய்யும்.","சிறிய அன்பான செய்கை — நெருங்கிய பிணைப்பை இன்னும் வலுவாக்கும்.","ரொமாண்டிக் ஆச்சரியங்கள் ஏற்படலாம். மாலை நேரத்தை மகிழ்ச்சியாகக் கழிக்கவும்.","குடும்ப ஒற்றுமை உயரும். பெரியவர்களின் ஆலோசனை இன்று கைகொடுக்கும்.","இன்று அன்புக்கு முக்கியத்துவம் கொடுங்கள். பேச்சில் கனிவு இருக்கட்டும்."],
    health: ["சனி ஆரோக்கியத்தில் ஒழுக்கத்தை எதிர்பார்க்கிறார். உடற்பயிற்சியைத் தவறவிடாதீர்கள்.","கோள்களின் சஞ்சாரம் நச்சு நீக்கத்திற்கு (Detox) ஏற்றதாக உள்ளது.","வெளியே நடைப்பயிற்சி மேற்கொள்வது மனத்தெளிவைத் தரும்.","மன ஆரோக்கியத்தில் கவனம் செலுத்துங்கள். தியானம் அல்லது மூச்சுப்பயிற்சி செய்யவும்.","பழைய ஆரோக்கியப் பிரச்சனைகள் வரலாம். மருத்துவரை அணுகுவது நல்லது.","சோர்வைத் தவிர்க்க வேலையில் வேகம் குறைக்காமல் சீராகச் செயல்படுங்கள்.","செரிமானக் கோளாறுகள் ஏற்படலாம். எளிதான ஆகாரங்களை உட்கொள்ளவும்.","தூக்கமின்மை மறுநாள் வேலையைப் பாதிக்கும். நன்கு ஓய்வு எடுக்கவும்.","மன அழுத்தம் தான் உடல் உபாதைக்குக் காரணம். மனதை அமைதியாக வைத்திருக்கவும்.","உடல் தரும் சமிக்ஞைகளைக் கவனியுங்கள். தேவைப்படும் போது ஓய்வு எடுக்கவும்.","சிறிய வாழ்க்கை முறை மாற்றம் எதிர்காலத்தில் பெரிய பலனைத் தரும்.","மகிழ்ச்சியே சிறந்த மருந்து. உங்களுக்குப் பிடித்த வேலையைச் செய்யவும்."],
};

const _TE = {
    positive: ["గ్రహాల స్థితి మీకు అనుకూలంగా ఉంది — మీ లక్ష్యం వైపు ధైర్యంగా అడుగు వేయండి.","స్వయం వ్యక్తతకు నేడు శక్తివంతమైన యోగం ఉంది. మీ అభిప్రాయాన్ని చెప్పండి.","నేడు అరుదైన శుభ శక్తి ఉంది. కొత్త పనులను ప్రారంభించండి.","ఆకాశ శక్తులు మీ ఆకర్షణను పెంచుతాయి. సంబంధాలు మరియు అవకాశాలు పెరుగుతాయి.","అంతర్గత స్పష్టత అకస్మాత్తుగా వస్తుంది. పాత అయోమయం నేడు తొలగిపోతుంది.","విశ్వం మీకు అదనపు ధైర్యాన్ని ఇస్తోంది — మీ కంఫర్ట్ జోన్ నుండి బయటకు రండి.","అనుకోని దిశ నుండి విజయం లభిస్తుంది. మార్పులకు సిద్ధంగా ఉండండి.","శక్తి స్థాయిలు ఎక్కువగా ఉన్నాయి. శారీరక మరియు మానస బలంతో పనులు పూర్తి చేయగలరు.","మీ నాయకత్వ లక్షణాలు నేడు మెరుస్తాయి. ఇతరులు మిమ్మల్ని మార్గదర్శిగా చూస్తారు.","కృతజ్ఞతతో శ్రేయస్సు పెరుగుతుంది. నేటి చిన్న విజయం రేపటి పెద్ద విజయానికి పునాది.","సృజనాత్మకతకు గ్రహాలు అనుకూలంగా ఉన్నాయి. ప్రతిభను వెలికితీయండి.","తర్కం కంటే అంతర్ దృష్టి నేడు బాగా పనిచేస్తుంది — మీ మనసు చెప్పింది వినండి."],
    negative: ["అనిశ్చిత సమయంలో ఆర్థిక నిర్ణయాలు తీసుకోవద్దు. ఒప్పందాలను సరిచూసుకోండి.","భావోద్వేగాలకు లోనుకావద్దు — మాట్లాడే ముందు కాస్త నిదానంగా ఆలోచించండి.","చిన్నపాటి జాప్యం లేదా అవగాహన లోపం ఉండవచ్చు. పనుల కోసం అదనపు సమయం కేటాయించండి.","మధ్యాహ్న సమయాల్లో శక్తి తగ్గుతుంది. నీరు ఎక్కువగా తాగి విరామం తీసుకోండి.","అనవసరమైన వాగ్దానాలు చేయవద్దు. పనిపై దృష్టి పెట్టండి.","పాత ఆందోళనలు తిరిగి రావచ్చు. వాటిని అధిగమించి ఆత్మవిశ్వాసంతో ఉండండి.","చిన్న చిన్న విషయాల్లో గొడవలకు దూరంగా ఉండండి. ఓపికతో వ్యవహరించండి.","ఏకాగ్రత కోల్పోవడం వల్ల పని ఆలస్యం కావచ్చు. ఏకాగ్రతతో ఉండండి.","పథకాల్లో అడ్డంకులు అంటే పరాజయం కాదు, అది ఒక కొత్త అనుభవం.","అతి విశ్వాసం పొరపాటుకు దారితీయవచ్చు. సమాచారాన్ని సరిచూసుకోండి.","అనవసర ఖర్చులను తగ్గించుకోండి. పొదుపుగా ఉండటం మంచిది.","ప్రయాణాల్లో ఊహించని జాప్యం కలగవచ్చు. ముందే బయలుదేరండి."],
    career: ["సూర్యుడు మీ వృత్తి స్థితిని పెంచుతాడు — ధైర్యంగా ఆలోచనలను చెప్పండి.","పని ప్రదేశంలో చాకచక్యంగా వ్యవహరించండి. ఇతరుల అభిప్రాయాలను వినండి.","బుధుడు మీ సంభాషణలను బలపరుస్తాడు — ఒప్పందాలు సానుకూలమవుతాయి.","మంగళ గ్రహం మీకు ఉత్సాహాన్ని ఇస్తుంది. పెండింగ్ పనులను పూర్తి చేయండి.","గురువు అవకాశాలను పెంచుతాడు. ఒక వ్యక్తి మీకు మార్గదర్శనం చేస్తారు.","పరిశోధన మరియు ప్రణాళిక నేడు విజయాన్ని ఇస్తాయి. వ్యూహాలను సిద్ధం చేయండి.","కెరీర్ లో ఒక పెద్ద మార్పుకు నేడు అనుకూలమైన రోజు. చర్చలు ఫలిస్తాయి.","సామూహిక ప్రయత్నాలు నేడు విజయవంతవుతాయి. బృందాన్ని సమన్వయం చేయండి.","నాయకత్వ బాధ్యతలు సులభంగా లభిస్తాయి. మీ గౌరవం పెరుగుతుంది.","ఆలస్యమైన ఫలితాలు నేడు అందుతాయి. మీ శ్రమకు గుర్తింపు లభిస్తుంది.","దీర్ఘకాలిక ప్రణాళికలపై దృష్టి పెట్టండి — పెద్ద లక్ష్యం విజయం ఇస్తుంది.","కొత్త పరిచయాలు ఆశ్చర్యకరమైన ఫలితాలను ఇస్తాయి. పాత స్నేహితులను కలవండి."],
    love: ["శుక్రుడు సంబంధాలలో మధురానుభూతిని ఇస్తాడు — ప్రేమ నేడు లోతుగా ఉంటుంది.","భాగస్వామితో సమయం గడపడం సంతోషకరమైన జ్ఞాపకాలను ఇస్తుంది.","ఒంటరిగా ఉన్న వారికి అనుకోని పరిచయాలు కలగవచ్చు.","మనసు విప్పి మాట్లాడటం వల్ల సంబంధాలలో లోపాలు సరిదిద్దుకోవచ్చు.","మీ ఆకర్షణ నేడు అద్భుతంగా ఉంటుంది. సామాజిక అవకాశాలను వాడుకోండి.","భాగస్వామితో ఆర్థిక సమన్వయం కలుగుతుంది. ఉమ్మడి నిర్ణయం మేలు చేస్తుంది.","పాత స్నేహాలు నేడు బలపడతాయి. నిజమైన బంధాలకు ప్రాధాన్యత ఇవ్వండి.","కరుణ మరియు ఓపిక నేడు మీ సంబంధాన్ని మెరుగుపరుస్తాయి.","చిన్నపాటి ప్రేమపూర్వక చర్య — సన్నిహిత బంధాన్ని ఇంకా బలపరుస్తుంది.","రొమాంటిక్ సర్ ప్రైజెస్ ఉండవచ్చు. సాయంత్రం వేళను సంతోషంగా గడపండి.","కుటుంబ ఐక్యత పెరుగుతుంది. పెద్దల సలహాలు నేడు కలిసి వస్తాయి.","నేడు ప్రేమకు ప్రాధాన్యత ఇవ్వండి. మాటలో మెత్తదనం ఉండనివ్వండి."],
    health: ["శని ఆరోగ్యంలో క్రమశిక్షణను కోరుతున్నాడు. వ్యాయామాన్ని వదిలిపెట్టవద్దు.","గ్రహాల స్థితి శరీరాన్ని శుద్ధి చేయడానికి (Detox) అనుకూలంగా ఉంది.","బయట నడవడం వల్ల మానసిక స్పష్టత పెరుగుతుంది.","మానసిక ఆరోగ్యంపై దృష్టి పెట్టండి. ధ్యానం లేదా శ్వాస వ్యాయామం చేయండి.","పాత ఆరోగ్య సమస్యలు రావచ్చు. సంప్రదించడం మంచిది.","అలసటను నివారించడానికి పనులను సీరియస్ గా కాకుండా నిదానంగా చేయండి.","జీర్ణక్రియ సమస్యలు ఉండవచ్చు. తేలికపాటి ఆహారం తీసుకోండి.","నిద్ర లేమి మరుసటి రోజు పనిపై ప్రభావం చూపుతుంది. బాగా విశ్రాంతి తీసుకోండి.","మానసిక ఒత్తిడి ఆరోగ్య సమస్యలకు కారణం. మనసును ప్రశాంతంగా ఉంచుకోండి.","శరీర సంకేతాలను గమనించండి. అవసరమైనప్పుడు విశ్రాంతి తీసుకోండి.","చిన్నపాటి జీవనశైలి మార్పు భవిష్యంలో పెద్ద ఫలితాన్ని ఇస్తుంది.","సంతోషమే మంచి మందు. మీకు నచ్చిన పనిని చేయండి."],
};

const _BN = {
    positive: ["গ্রহের অবস্থান আপনার অনুকূল — সাহসের সাথে কোনো লক্ষ্যের দিকে এগিয়ে যান।","আত্মপ্রকাশের জন্য আজ শক্তিশালী যোগ রয়েছে। মন খুলে নিজের কথা বলুন।","আজ বিরল শুভ শক্তি রয়েছে। নতুন কোনো কাজের সূচনা করুন।","মহাজাগতিক শক্তি আপনার আকর্ষণ বাড়াবে। সম্পর্ক ও সুযোগ উভয়ই বৃদ্ধি পাবে।","এক অজ্ঞাত স্বচ্ছতা আজ অনুভব করবেন। দীর্ঘদিনের বিভ্রান্তি কেটে যাবে।","মহাবিশ্ব আপনাকে অতিরিক্ত সাহস দিচ্ছে — দ্বিধা কাটিয়ে কাজে নামুন।","অপ্রত্যাশিত দিক থেকে সাফল্য আসতে পারে। পরিবর্তনের জন্য প্রস্তুত থাকুন।","শক্তির মাত্রা আজ তুঙ্গে। শারীরিক ও মানসিক দৃঢ়তা কাজে সাহায্য করবে।","আপনার নেতৃত্বগুণ আজ প্রকাশ পাবে। অন্যরা আপনার পরামর্শ চাইবে।","কৃতজ্ঞতাবোধ সমৃদ্ধি আনে। আজকের ছোট জয় আগামীকালের বড় সাফল্যের চাবিকাঠি।","সৃজনশীল কাজের জন্য গ্রহ অত্যন্ত অনুকূল। নিজের প্রতিভাকে বিকশিত করুন।","যুক্তি নয়, আজ অন্তর্দৃষ্টি ভালো কাজ করবে — নিজের মনের কথা শুনুন।"],
    negative: ["অনিশ্চয়তার মধ্যে কোনো আর্থিক সিদ্ধান্ত নেবেন না। চুক্তিপত্র ভালো করে পরীক্ষা করুন।","আবেগপ্রবণ হওয়া এড়িয়ে চলুন — কথা বলার আগে একটু সময় নিয়ে ভাবুন।","সামান্য বিলম্ব বা ভুল বোঝাবুঝি হতে পারে। গুরুত্বপূর্ণ কাজের জন্য অতিরিক্ত সময় রাখুন।","দুপুরের পর শক্তির অভাব বোধ হতে পারে। জল পান করুন ও একটু বিশ্রাম নিন।","সাধ্যের অতিরিক্ত প্রতিজ্ঞা করবেন না। নিজের কাজের দিকে নজর দিন।","পুরানো দুশ্চিন্তা ফিরে আসতে পারে। সেটাকে কাটিয়ে আত্মবিশ্বাসের সাথে এগিয়ে যান।","ছোটখাটো বিষয়ে তর্ক এড়িয়ে চলুন। ধৈর্য ও সংযম রাখুন।","মনোযোগের অভাবে কাজ দেরি হতে পারে। কাজে মন সংযোগ করুন।","পরিকল্পনায় বাধা মানেই ব্যর্থতা নয়, এটি একটি নতুন অভিজ্ঞতা।","অতিরিক্ত আত্মবিশ্বাস ভুল পথে নিয়ে যেতে পারে। তথ্য যাচাই করে নিন।","অহেতুক খরচ এড়িয়ে চলুন। সঞ্চয়ের দিকে নজর দেওয়া ভালো হবে।","ভ্রমণে অপ্রত্যাশিত দেরি হতে পারে। সময়ের আগেই গন্তব্যে রওনা দিন।"],
    career: ["সূর্য আপনার পেশাদার ক্ষেত্রকে উজ্জ্বল করবে — নির্ভয়ে নিজের আইডিয়া প্রকাশ করুন।","কর্মেক্ষেত্রে বিচক্ষণতার সাথে কাজ করুন। অন্যদের কথা মন দিয়ে শুনুন।","বুধ আপনার যোগাযোগ ব্যবস্থাকে শক্তিশালী করবে — চুক্তিগুলো সফল হওয়ার সম্ভাবনা।","মঙ্গল আপনাকে কাজের উদ্যম দেবে। ফেলে রাখা কাজগুলো আজ শেষ করুন।","বৃহস্পতি নতুন সুযোগের দরজা খুলে দেবে। কোনো অভিজ্ঞ ব্যক্তি আপনাকে পথ দেখাবে।","গবেষণা ও পরিকল্পনা আজ সাফল্য দেবে। সঠিক কৌশল তৈরি করুন।","ক্যারিয়ারে বড় কোনো পরিবর্তনের জন্য আজ উপযুক্ত দিন। আলোচনা ইতিবাচক হবে।","যৌথ প্রচেষ্টায় কর্মক্ষেত্রে সাফল্য আসবে। দলের সাথে মিলে কাজ করুন।","নেতৃত্বের দায়িত্ব সহজেই আপনার কাছে আসবে। আপনার সম্মান বৃদ্ধি পাবে।","অনেক দিনের অপেক্ষার ফল আজ পেতে পারেন। আপনার পরিশ্রম স্বীকৃত হবে।","দীর্ঘমেয়াদী পরিকল্পনায় মনোযোগ দিন — বড় লক্ষ্য আজ জয়ী হবে।","নতুন যোগাযোগ আজ আশ্চর্যজনক ফল দেবে। পুরানো বন্ধুদের সাথে যোগাযোগ করুন।"],
    love: ["শুক্র সম্পর্কের ক্ষেত্রে শুভফল দেবে — আজ ভালোবাসার গভীরতা বাড়বে।","সাথীর সাথে সময় কাটানো আজ স্মরণীয় হয়ে থাকবে।","অবিবাহিতদের জীবনে অপ্রত্যাশিতভাবে কারোর আগমন ঘটতে পারে।","খোলামেলা আলোচনা সম্পর্কের তিক্ততা কমিয়ে দেবে।","আপনার আকর্ষণ আজ তুঙ্গে থাকবে। সামাজিক যোগাযোগ বাড়ানোর চেষ্টা করুন।","সাথীর সাথে আর্থিক বোঝাপড়া ভালো হবে। যৌথ কোনো সিদ্ধান্ত লাভজনক হবে।","পুরানো বন্ধুত্ব আজ আরও গভীর হবে। আসল সম্পর্কের গুরুত্ব দিন।","সহানুভূতি ও ধৈর্য আজ আপনার সম্পর্কের বাঁধন শক্ত করবে।","একটি ছোট্ট ভালোবাসার প্রকাশ — কাছের সম্পর্ককে আরও মজবুত করে তুলবে।","রোমান্টিক কোনো চমক থাকতে পারে। সন্ধ্যাবেলা খুশিতে কাটান।","পারিবারিক ঐক্য বৃদ্ধি পাবে। বড়দের পরামর্শ আজ কাজে আসবে।","আজ ভালোবাসাকে গুরুত্ব দিন। প্রিয়জনের সাথে কথা বলার সময় নম্রতা বজায় রাখুন।"],
    health: ["শনি স্বাস্থ্যের প্রতি শৃঙ্খলার কথা মনে করাচ্ছে। শরীরচর্চা একদম ছাড়বেন না।","গ্রহের অবস্থান শরীর শুদ্ধির (Detox) জন্য অত্যন্ত উপযুক্ত।","বাইরে কিছুক্ষণ হাঁটাহাঁটি করলে মনের স্বচ্ছতা বাড়বে।","মানসিক স্বাস্থ্যের দিকে নজর দিন। ধ্যান বা প্রাণায়াম করলে শান্তি পাবেন।","পুরানো কোনো স্বাস্থ্য সমস্যা দেখা দিতে পারে। চিকিৎসকের পরামর্শ নেওয়া ভালো।","কাজের মাঝে বিরতি নিন। একঘেয়েমি এড়াতে নিজের গতির ভারসাম্য বজায় রাখুন।","আজ হজমের সমস্যা দেখা দিতে পারে। হালকা ও পুষ্টিকর খাবার খাওয়ার চেষ্টা করুন।","ঘুমের অভাব পরের দিনের কাজে ব্যাঘাত ঘটাতে পারে। পর্যাপ্ত বিশ্রাম নিন।","মানসিক চাপ স্বাস্থ্যের ক্ষতি করতে পারে। মনকে শান্ত রাখার চেষ্টা করুন।","শরীরের সংকেত বুঝুন। ক্লান্ত বোধ করলে আজ বিশ্রাম নেওয়াই ভালো।","জীবনযাত্রায় সামান্য পরিবর্তন ভবিষ্যতে বড় সুফল বয়ে আনবে।","হাসিখুশি থাকাই সেরা ওষুধ। আজ নিজের পছন্দের কোনো কাজ করুন।"],
};

const _KN = {
    positive: ["ಗ್ರಹಗಳ ಸ್ಥಿತಿ ನಿಮಗೆ ಅನುಕೂಲಕರವಾಗಿದೆ — ಈ ದಿನ ನಿಮ್ಮ ಗುರಿಯತ್ತ ಧೈರ್ಯವಾಗಿ ಹೆಜ್ಜೆ ಹಾಕಿ.","ಆತ್ಮ-ಅಭಿವ್ಯಕ್ತಿಗೆ ಇಂದು ಶಕ್ತಿಯುತವಾದ ಯೋಗವಿದೆ. ನಿಮ್ಮ ಅಭಿಪ್ರಾಯವನ್ನು ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ.","ಇಂದು ಅಪರೂಪದ ಶುಭ ಶಕ್ತಿ ಇದೆ. ಹೊಸ ಕೆಲಸಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲು ಇದು ಸಕಾಲ.","ಆಕಾಶ ಶಕ್ತಿಗಳು ನಿಮ್ಮ ಆಕರ್ಷಣೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ. ಸಂಬಂಧಗಳು ಮತ್ತು ಅವಕಾಶಗಳು ಎರಡೂ ವೃದ್ಧಿಯಾಗುತ್ತವೆ.","ಆಂತರಿಕ ಸ್ಪಷ್ಟತೆ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಬರುತ್ತದೆ. ದೀರ್ಘಕಾಲದ ಗೊಂದಲಗಳು ಇಂದು ಬಗೆಹರಿಯುತ್ತವೆ.","ಬ್ರಹ್ಮಾಂಡವು ನಿಮಗೆ ಹೆಚ್ಚಿನ ಧೈರ್ಯವನ್ನು ನೀಡುತ್ತಿದೆ — ನಿಮ್ಮ ಕಂಫರ್ಟ್ ಜೋನ್‌ನಿಂದ ಹೊರಬನ್ನಿ.","ಅನಿರೀಕ್ಷಿತ ದಿಕ್ಕಿನಿಂದ ಯಶಸ್ಸು ದೊರೆಯಬಹುದು. ಬದಲಾವಣೆಗಳಿಗೆ ಮುಕ್ತವಾಗಿರಿ.","ಶಕ್ತಿಯ ಮಟ್ಟ ಹೆಚ್ಚಾಗಿರುತ್ತದೆ. ದೈಹಿಕ ಮತ್ತು ಮಾನಸಿಕ ಸಾಮರ್ಥ್ಯವು ನಿಮ್ಮ ಕೆಲಸಗಳಿಗೆ ಪೂರಕವಾಗಿರುತ್ತದೆ.","ನಿಮ್ಮ ನಾಯಕತ್ವದ ಗುಣಗಳು ಇಂದು ಮೆರುಗನ್ನು ಪಡೆಯುತ್ತವೆ. ಜನರು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ನಿಮ್ಮತ್ತ ನೋಡುತ್ತಾರೆ.","ಕೃತಜ್ಞತೆಯಿಂದ ಸಮೃದ್ಧಿ ಹೆಚ್ಚಾಗುತ್ತದೆ. ಇಂದಿನ ಸಣ್ಣ ಗೆಲುವು ನಾಳೆಯ ದೊಡ್ಡ ಯಶಸ್ಸಿಗೆ ನಾಂದಿ.","ಸೃಜನಶೀಲತೆಗೆ ಗ್ರಹಗಳು ಪೂರಕವಾಗಿವೆ. ನಿಮ್ಮ ಪ್ರತಿಭೆಯನ್ನು ಧೈರ್ಯದಿಂದ ವ್ಯಕ್ತಪಡಿಸಿ.","ತರ್ಕಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ಇಂದು ನಿಮ್ಮ ಅಂತರಾತ್ಮದ ಧ್ವನಿಯನ್ನು ನಂಬಿ — ಅದು ಸರಿಯಾದ ದಾರಿ ತೋರಿಸುತ್ತದೆ."],
    negative: ["ಅನಿಶ್ಚಿತತೆಯ ಸಮಯದಲ್ಲಿ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ಒಪ್ಪಂದಗಳನ್ನು ಸರಿಯಾಗಿ ಪರಿಶೀಲಿಸಿ.","ಭಾವನಾತ್ಮಕವಾಗಿ ಪ್ರತಿಕ್ರಿಯಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ — ಮಾತನಾಡುವ ಮೊದಲು ಸ್ವಲ್ಪ ಸಮಯ ವಿರಾಮ ತೆಗೆದುಕೊಳ್ಳಿ.","ಸಣ್ಣ ವಿಳಂಬ ಅಥವಾ ತಪ್ಪು ತಿಳುವಳಿಕೆ ಸಂಭವಿಸಬಹುದು. ಪ್ರಮುಖ ಕೆಲಸಗಳಿಗಾಗಿ ಹೆಚ್ಚಿನ ಸಮಯ ಮೀಸಲಿಡಿ.","ಮಧ್ಯಾಹ್ನದ ಸಮಯದಲ್ಲಿ ಉತ್ಸಾಹ ಕಡಿಮೆಯಾಗಬಹುದು. ನೀರು ಹೆಚ್ಚಾಗಿ ಕುಡಿಯಿರಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.","ಸಾಧ್ಯವಾಗದ ವಾಗ್ದಾನಗಳನ್ನು ಮಾಡಬೇಡಿ. ಹೇಳಿದಷ್ಟೇ ಕೆಲಸ ಮಾಡುವ ಬದಲು, ಮಾಡಿದ ಮೇಲೆ ಹೇಳಿ.","ಹಳೆಯ ಆತಂಕಗಳು ಮರುಕಳಿಸಬಹುದು. ಅವುಗಳನ್ನು ಎದುರಿಸಿ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮುನ್ನಡೆಯಿರಿ.","ಸಣ್ಣ ವಿಷಯಗಳ ಬಗ್ಗೆ ವಾದಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ. ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಉತ್ತಮ.","ಗಮನ ಬೇರೆಡೆಗೆ ಸರಿಯುವುದರಿಂದ ಕೆಲಸ ವಿಳಂಬವಾಗಬಹುದು. ಏಕಾಗ್ರತೆಯಿಂದಿರಿ.","ಯೋಜನೆಗಳಲ್ಲಿನ ಅಡಚಣೆ ಎಂದರೆ ಸೋಲಲ್ಲ, ಅದು ಒಂದು ಹೊಸ ಅನುಭವ.","ಅತಿಯಾದ ಆತ್ಮವಿಶ್ವಾಸ ತಪ್ಪು ದಾರಿಗೆ ಎಳೆಯಬಹುದು. ಮಾಹಿತಿಯನ್ನು ಸರಿಯಾಗಿ ಪರೀಕ್ಷಿಸಿ.","ಅನಗತ್ಯ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ. ಅವಶ್ಯಕತೆ ಮತ್ತು ಆಸೆಗಳ ನಡುವಿನ ವ್ಯತ್ಯાસ ತಿಳಿಯಿರಿ.","ಪ್ರಯಾಣದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬವಾಗಬಹುದು. ಮುಂಚಿತವಾಗಿ ಹೊರಡುವುದು ಉತ್ತಮ."],
    career: ["ಸೂರ್ಯನು ನಿಮ್ಮ ವೃತ್ತಿಜೀವನವನ್ನು ಬೆಳಗುತ್ತಿದ್ದಾನೆ — ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಧೈರ್ಯದಿಂದ ಮಂಡಿಸಿ.","ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಬುದ್ಧಿವಂತಿಕೆಯೇ ಇಂದು ನಿಮ್ಮ ಶಕ್ತಿ. ಇತರೆ ಅಭಿಪ್ರಾಯಗಳನ್ನು ಆಲಿಸಿ.","ಬುಧನು ನಿಮ್ಮ ಸಂವಹನವನ್ನು ಬಲಪಡಿಸುತ್ತানে — ಒಪ್ಪಂದಗಳು ಮತ್ತು ಪತ್ರ ವ್ಯವಹಾರಗಳು ಲಾಭದಾಯಕವಾಗಿರುತ್ತವೆ.","ಮಂಗಳನು ನಿಮಗೆ ಕೆಲಸದಲ್ಲಿ ಅದಮ್ಯ ಉತ್ಸಾಹ ನೀಡುತ್ತಾನೆ. ಬಾಕಿ ಇರುವ ಕೆಲಸಗಳನ್ನು ಇಂದು ಪೂರ್ಣಗೊಳಿಸಿ.","ಗುರುವು ಹೊಸ ಅವಕಾಶಗಳನ್ನು ನೀಡುತ್ತಾನೆ. ಒಬ್ಬ ಮಾರ್ಗದರ್ಶಕ ನಿಮಗೆ ಸರಿಯಾದ ದಾರಿ ತೋರಿಸಬಹುದು.","ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಕೆಲಸಗಳು ಇಂದು ಯಶಸ್ವಿಯಾಗುತ್ತವೆ. ಸಂಶೋಧನೆ ಮತ್ತು ಯೋಜನೆಗಳು ಫಲ ನೀಡುತ್ತವೆ.","ವೃತ್ತಿಜೀವನದಲ್ಲಿ ದೊಡ್ಡ ಬದಲಾವಣೆಗೆ ಇಂದು ಸೂಕ್ತ ದಿನ. ಮಾತುಕತೆಗಳು ಯಶಸ್ವಿಯಾಗುತ್ತವೆ.","ಒಂಟಿಯಾಗಿ ಕೆಲಸ ಮಾಡುವ ಬದಲು ತಂಡದೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುವುದು ಇಂದು ಶ್ರೇಯಸ್ಕರ.","ನಾಯಕತ್ವದ ಜವಾಬ್ದಾರಿಗಳು ಸುಲಭವಾಗಿ ಒದಗಿ ಬರುತ್ತವೆ. ನಿಮ್ಮ ಗೌರವ ಹೆಚ್ಚಾಗುತ್ತದೆ.","ವಿಳಂಬವಾದ ಫಲಿತಾಂಶಗಳು ಇಂದು ಲಭ್ಯವಾಗುತ್ತವೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ಮನ್ನಣೆ ಸಿಗಲಿದೆ.","ದೀರ್ಘಕಾಲದ ಉದ್ಯೋಗ ಯೋಜನೆಗಳ ಮೇಲೆ ಗಮನವಿರಲಿ — ದೂರದೃಷ್ಟಿ ಇಂದು ಗೆಲುವು ತರುತ್ತದೆ.","ಹೊಸ ಸಂಪರ್ಕಗಳು ಆಶ್ಚರ್ಯಕರ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡುತ್ತವೆ. ಹಳೆಯ ಸ್ನೇಹಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ."],
    love: ["ಶುಕ್ರನು ಸಂಬಂಧಗಳಲ್ಲಿ ಪ್ರೀತಿಯನ್ನು ತುಂಬುತ್ತಿದ್ದಾನೆ — ಪ್ರೇಮ ಇಂದು ಗಾಢವಾಗಿರುತ್ತದೆ.","ಜೊತೆಗಾರನೊಂದಿಗೆ ಕಾಲ ಕಳೆಯುವುದು ಸ್ಮರಣೀಯ ಕ್ಷಣಗಳನ್ನು ನೀಡುತ್ತದೆ.","ಅವಿವಾಹಿತರಿಗೆ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಹೊಸ ಪರಿಚಯಗಳು ಉಂಟಾಗಬಹುದು.","ಮನಬಿಚ್ಚಿ ಮಾತನಾಡುವುದರಿಂದ ಸಂಬಂಧದಲ್ಲಿನ ಹಳೆಯ ಗೊಂದಲಗಳು ಬಗೆಹರಿಯುತ್ತವೆ.","ನಿಮ್ಮ ಆಕರ್ಷಣೆ ಇಂದು ಅತ್ಯುತ್ತಮವಾಗಿರುತ್ತದೆ. ಸಾಮಾಜಿಕ ಅವಕಾಶಗಳನ್ನು ಬಳಸಿಕೊಳ್ಳಿ.","ಜೊತೆಗಾರನೊಂದಿಗೆ ಆರ್ಥಿಕ ಹೊಂದಾಣಿಕೆ ಉಂಟಾಗುತ್ತದೆ. ಜಂಟಿ ನಿರ್ಧಾರಗಳು ಲಾಭದಾಯಕ.","ಹಳೆಯ ಸ್ನೇಹಗಳು ಇಂದು ಬಲಗೊಳ್ಳಲಿವೆ. ನಿಜವಾದ ಸಂಬಂಧಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.","ಕರುಣೆ ಮತ್ತು ತಾಳ್ಮೆ ಇಂದು ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ಸುಧಾರಿಸುತ್ತದೆ.","ಒಂದು ಸಣ್ಣ ಪ್ರೀತಿಯ ಮಾತು — ಆಪ್ತ ಬಾಂಧವ್ಯವನ್ನು ಇನ್ನಷ್ಟು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.","ಪ್ರೇಮ ಜೀವನದಲ್ಲಿ ಆಶ್ಚರ್ಯಕರ ಸಂಗতিಗಳು ಘಟಿಸಬಹುದು. ಸಂಜೆಯನ್ನು ಸಂತೋಷದಿಂದ ಕಳೆಯಿರಿ.","ಕುಟುಂಬದಲ್ಲಿ ಸಾಮರಸ್ಯ ಹೆಚ್ಚಾಗುತ್ತದೆ. ಹಿರಿಯರ ಸಲಹೆ ಇಂದು ಉಪಯುಕ್ತವಾಗಲಿದೆ.","भावनात्मक ಲಭ್ಯತೆ ಇಂದು ಅತ್ಯಗತ್ಯ. ಸಂಭಾಷಣೆಗಳಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಭಾಗಿಗಳಾಗಿ."],
    health: ["ಶನಿಯು ಆರೋಗ್ಯದಲ್ಲಿ ಶಿಸ್ತನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತಾನೆ. ವ್ಯಾಯಾಮ ಮತ್ತು ಸರಿಯಾದ ಆಹಾರ ಕ್ರಮವನ್ನು ಮರೆಯಬೇಡಿ.","ಗ್ರಹಗಳ ಪ್ರಭಾವವು ದೇಹವನ್ನು ಶುದ್ಧೀಕರಿಸಲು (Detox) ಪೂರಕವಾಗಿದೆ.","ಹೊರಗೆ ಸ್ವಲ್ಪ ಸಮಯ ಕಳೆಯುವುದು ಮತ್ತು ನಡೆಯುವುದು ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡುತ್ತದೆ.","ಮಾನಸಿಕ ಆರೋಗ್ಯದ ಕಡೆಗೆ ಗಮನವಿರಲಿ. ಧ್ಯಾನ ಅಥವಾ ಪ್ರಾಣಾಯಾಮ ಮಾಡುವುದರಿಂದ ಲಾಭದಾಯಕ.","ಹಳೆಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಕಾಡಬಹುದು. ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯುವುದು ಉತ್ತಮ.","ಸುಸ್ತು ಉಂಟಾಗದಂತೆ ಕೆಲಸ ಮತ್ತು ವಿಶ್ರಾಂತಿಯ ನಡುವೆ ಸಮತೋಲನವಿರಲಿ.","ಜೀರ್ಣಕ್ರಿಯೆಯಲ್ಲಿ ವ್ಯತ್ಯಯವಾಗಬಹುದು. ಹಗುರವಾದ ಆಹಾರ ಸೇವಿಸುವುದು ಒಳ್ಳೆಯದು.","ನಿದ್ರೆಯ ಕೊರತೆಯು ಮರುದಿನದ ಕೆಲಸದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು. ಸರಿಯಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.","ಮಾನಸಿಕ ಒತ್ತಡವೇ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗೆ ಮೂಲವಾಗಬಹುದು. ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತವಾಗಿಡಿ.","ದೇಹದ ಸೂಚನೆಗಳನ್ನು ನಿರ್ಲಕ್ಷಿಸಬೇಡಿ. ಅಗತ್ಯವಿದ್ದಾಗ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.","ಜೀವನಶೈಲಿಯಲ್ಲಿನ ಸಣ್ಣ ಬದಲಾವಣೆ ಭವಿಷ್ಯದಲ್ಲಿ ದೊಡ್ಡ ಲಾಭ ತರಲಿದೆ.","ಸಂತೋಷವೇ ದೊಡ್ಡ ಮದ್ದು. ನಿಮಗೆ ಇಷ್ಟವಾದ ಕೆಲಸಗಳನ್ನು ಮಾಡಿ."],
};

const _COLORS_EN  = ["Ruby Red","Golden Yellow","Emerald Green","Sapphire Blue","Pearl White","Coral Orange","Violet Purple","Silver Grey","Rose Pink","Deep Teal","Amber","Ivory","Turquoise","Sand Beige","Crimson"];
const _COLORS_HI  = ["रूबी लाल","सोनेरी पीला","पन्ना हरा","नीलम नीला","मोती सफेद","मूंगा नारंगी","बैंगनी","चाँदी ग्रे","गुलाबी","गहरा नीला","एम्बर","हाथीदांत","फ़िरोज़ा","सैंड बेज","गहरा लाल"];
const _COLORS_MR  = ["रुबी लाल","सोनेरी पिवळी","पन्ना हिरवा","नीलम निळा","मोती पांढरा","प्रवाळ नारंगी","जांभळा","चांदी राखाडी","गुलाबी","खोल निळा","अंबर","हस्तिदंती","फिरोजी","वाळू बेज","गडद लाल"];
const _COLORS_GU  = ["રૂબી લાલ","સોનેરી પીળો","પન્ના લીલો","નીલમ વાદળી","મોતી સફેદ","પવાલું નારંગી","જાંબલી","ચાંદી ગ્રે","ગુલાબી","ઘેરો વાદળી","એમ્બર","હાથીદાંત","ફિરોઝી","રેતી બેજ","ઘેરો લાલ"];
const _COLORS_TA  = ["ரூபி சிவப்பு","தંગ மஞ்சள்","மரகத பச்சை","நீலக்கல் நீலம்","முத்து வெள்ளை","பவள ஆரஞ்சு","ஊதா","வெள்ளி சாம்பல்","இளஞ்சிவப்பு","கருநீலம்","அம்பர்","யானைத்தந்தம்","ফিরোজি","மணல் பழுப்பு","கருஞ்சிவப்பு"];
const _TE_COLORS = ["రూబీ రెడ్","గోల్డెన్ ఎల్లో","ఎమరాల్డ్ గ్రీన్","సఫైర్ బ్లూ","పెర్ల్ వైట్","కోరల్ ఆరెంజ్","వైలెట్ పర్పుల్","సిల్వర్ గ్రే","రోజ్ పింక్","డీప్ టీల్","అంబర్","ఐవరీ","టర్కోయిస్","శాండ్ బీజ్","క్రిమ్సన్"];
const _BN_COLORS = ["চুনি লাল","সোনালী হলুদ","পান্না সবুজ","নীলকান্ত নীল","মুক্তো সাদা","কোরাল কমলা","বেগুনী","রুপোলি ধূসর","গোলাপী","গাঢ় নীল","অ্যাম্বার","হাতির দাঁত","ফিরোজি","বেলে বাদামী","গাঢ় লাল"];

export function generateDailyHoroscope(sign: string, planets: any[], lang: string) {
    const si  = _SIGNS.indexOf(sign);
    const doy = _doy();
    const moon = planets?.find((p: any) => p.name === "Moon")?.sign || "";
    const mi   = _SIGNS.indexOf(moon);
    const seed = doy * 37 + si * 13 + (mi >= 0 ? mi * 7 : 0);

    const P = lang === 'hi' ? _HI : 
              lang === 'mr' ? _MR : 
              lang === 'gu' ? _GU : 
              lang === 'ta' ? _TA : 
              lang === 'te' ? _TE : 
              lang === 'bn' ? _BN :
              lang === 'kn' ? _KN : _EN;

    const sunS  = planets?.find((p: any) => p.name === "Sun")?.sign || "";
    const moonS = moon;
    const mercS = planets?.find((p: any) => p.name === "Mercury")?.sign || "";
    const parts = [sunS && `☀ ${sunS}`, moonS && `☽ ${moonS}`, mercS && `☿ ${mercS}`].filter(Boolean);
    const transitInfo = parts.join(" · ") || `${sign} Daily`;

    const colorArr = lang === 'hi' ? _COLORS_HI : 
                    lang === 'mr' ? _COLORS_MR : 
                    lang === 'gu' ? _COLORS_GU : 
                    lang === 'ta' ? _COLORS_TA : 
                    lang === 'te' ? _TE_COLORS : 
                    lang === 'bn' ? _BN_COLORS :
                    lang === 'kn' ? ["ಕೆಂಪು", "ಹಳದಿ", "ಹಸಿರು", "ನೀಲಿ", "ಬಿಳಿ", "ಕಿತ್ತಳೆ", "ನೇರಳೆ", "ಬೂದು", "ಗುಲಾಬಿ", "ಗಾಢ ನೀಲಿ", "ಅಂಬರ್", "ಐವರಿ", "ಟರ್ಕೋಯಿಸ್", "ಮರಳು ಬಣ್ಣ", "ಕಡು ಕೆಂಪು"] : _COLORS_EN;

    const lMap: any = {
        en: { career:"Career", love:"Love & Relations", health:"Health", positive:"✨ Positive", negative:"⚠ Challenges", color:"Lucky Color", number:"Lucky No." },
        hi: { career:"करियर", love:"प्रेम और संबंध", health:"स्वास्थ्य", positive:"✨ शुभ", negative:"⚠ चुनौतियां", color:"शुभ रंग", number:"शुभ अंक" },
        mr: { career:"करिअर", love:"प्रेम आणि नाते", health:"आरोग्य", positive:"✨ शुभ", negative:"⚠ आव्हाने", color:"शुभ रंग", number:"शुभ अंक" },
        gu: { career:"કરિયર", love:"પ્રેમ અને સંબંધો", health:"સ્વાસ્થ્ય", positive:"✨ શુભ", negative:"⚠ પડકારો", color:"શુભ રંગ", number:"શુભ અંક" },
        ta: { career:"தொழில்", love:"காதல் & உறவுகள்", health:"ஆரோக்கியம்", positive:"✨ சாதகமானவை", negative:"⚠ சவால்கள்", color:"அதிர்ஷ்ட நிறம்", number:"அதிர்ஷ்ட எண்" },
        te: { career:"కెరీర్", love:"ప్రేమ & సంబంధాలు", health:"ఆరోగ్యం", positive:"✨ సానుకూలత", negative:"⚠ సవాళ్లు", color:"అదృష్ట రంగు", number:"అదృష్ట సంఖ్య" },
        bn: { career:"ಕರಿಯರ್", love:"ಪ್ರೀತಿ ಮತ್ತು ಸಂಬಂಧ", health:"ಆರೋಗ್ಯ", positive:"✨ ಶುಭ", negative:"⚠ ಸವಾಲುಗಳು", color:"ಅದೃಷ್ಟ ಬಣ್ಣ", number:"ಅದೃಷ್ಟ ಸಂಖ್ಯೆ" },
        kn: { career:"ವೃತ್ತಿ", love:"ಪ್ರೀತಿ ಮತ್ತು ಸಂಬಂಧ", health:"ಆರೋಗ್ಯ", positive:"✨ ಶುಭ", negative:"⚠ ಸವಾಲುಗಳು", color:"ಅದೃಷ್ಟ ಬಣ್ಣ", number:"ಅದೃಷ್ಟ ಸಂಖ್ಯೆ" },
    };

    return {
        positive:     _pick(P.positive, seed),
        negative:     _pick(P.negative, seed + 11),
        career:       _pick(P.career,   seed + 23),
        love:         _pick(P.love,     seed + 37),
        health:       _pick(P.health,   seed + 53),
        luckyNumber:  (seed % 9) + 1,
        luckyColor:   _pick(colorArr, seed + 71),
        transitInfo,
        labels: lMap[lang] || lMap.en,
    };
}
