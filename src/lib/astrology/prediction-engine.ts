
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

const _COLORS_EN  = ["Ruby Red","Golden Yellow","Emerald Green","Sapphire Blue","Pearl White","Coral Orange","Violet Purple","Silver Grey","Rose Pink","Deep Teal","Amber","Ivory","Turquoise","Sand Beige","Crimson"];
const _COLORS_HI  = ["रूबी लाल","सोनेरी पीला","पन्ना हरा","नीलम नीला","मोती सफेद","मूंगा नारंगी","बैंगनी","चाँदी ग्रे","गुलाबी","गहरा नीला","एम्बर","हाथीदांत","फ़िरोज़ा","सैंड बेज","गहरा लाल"];
const _COLORS_MR  = ["रुबी लाल","सोनेरी पिवळी","पन्ना हिरवा","नीलम निळा","मोती पांढरा","प्रवाळ नारंगी","जांभळा","चांदी राखाडी","गुलाबी","खोल निळा","अंबर","हस्तिदंती","फिरोजी","वाळू बेज","गडद लाल"];

export function generateDailyHoroscope(sign: string, planets: any[], lang: string) {
    const si  = _SIGNS.indexOf(sign);
    const doy = _doy();
    const moon = planets?.find((p: any) => p.name === "Moon")?.sign || "";
    const mi   = _SIGNS.indexOf(moon);
    const seed = doy * 37 + si * 13 + (mi >= 0 ? mi * 7 : 0);

    const P = lang === 'hi' ? _HI : _EN; // mr falls back to en for now

    const sunS  = planets?.find((p: any) => p.name === "Sun")?.sign || "";
    const moonS = moon;
    const mercS = planets?.find((p: any) => p.name === "Mercury")?.sign || "";
    const parts = [sunS && `☀ ${sunS}`, moonS && `☽ ${moonS}`, mercS && `☿ ${mercS}`].filter(Boolean);
    const transitInfo = parts.join(" · ") || `${sign} Daily`;

    const colorArr = lang === 'hi' ? _COLORS_HI : lang === 'mr' ? _COLORS_MR : _COLORS_EN;

    const lMap: any = {
        en: { career:"Career", love:"Love & Relations", health:"Health", positive:"✨ Positive", negative:"⚠ Challenges", color:"Lucky Color", number:"Lucky No." },
        hi: { career:"करियर", love:"प्रेम और संबंध", health:"स्वास्थ्य", positive:"✨ शुभ", negative:"⚠ चुनौतियां", color:"शुभ रंग", number:"शुभ अंक" },
        mr: { career:"करिअर", love:"प्रेम आणि नाते", health:"आरोग्य", positive:"✨ शुभ", negative:"⚠ आव्हाने", color:"शुभ रंग", number:"शुभ अंक" },
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
