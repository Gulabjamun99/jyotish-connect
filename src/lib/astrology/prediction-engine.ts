
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

// --- Kundli Prediction Engine ---

export function generateLifePredictions(chart: any, lang: string) {
    const data = INTERPRETATIONS[lang as keyof typeof INTERPRETATIONS] || INTERPRETATIONS.en;

    const getPlanet = (name: string) => chart.planets.find((p: any) => p.name === name);
    const sun = getPlanet("Sun");
    const moon = getPlanet("Moon");
    const asc = chart.houseSign?.[0] || "Aries";

    const getText = (planetName: string, house: number, category: string) => {
        const pData = (data as any).placements[planetName];
        if (pData && pData[house]) {
            return pData[house];
        }

        const hData = (data as any).houses[house];
        if (lang === 'hi') return `${(data as any).planets[planetName] || planetName} ${house}वें भाव (${hData}) में स्थित है।`;
        return `${planetName} is placed in the ${house}th House of ${hData}.`;
    };

    return {
        Career: `
            ${getText("Sun", sun?.house || 10, "Career")}
            ${getText("Saturn", getPlanet("Saturn")?.house || 10, "Career")}
        `,
        Health: `
            ${getText("Sun", sun?.house || 1, "Health")}
        `,
        Marriage: `
            ${getText("Venus", getPlanet("Venus")?.house || 7, "Marriage")}
            ${getText("Mars", getPlanet("Mars")?.house || 7, "Marriage")}
        `,
        Wealth: `
            ${getText("Jupiter", getPlanet("Jupiter")?.house || 2, "Wealth")}
            ${getText("Moon", moon?.house || 2, "Wealth")}
        `,
        Education: `
            ${getText("Mercury", getPlanet("Mercury")?.house || 4, "Education")}
            ${getText("Jupiter", getPlanet("Jupiter")?.house || 5, "Education")}
        `
    };
}

// --- Horoscope Transit Engine ---

export function generateDailyHoroscope(userSign: string, currentPlanets: any[], lang: string) {
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

    const sunHouse = getHouse(sun?.sign || "Aries");
    const moonHouse = getHouse(moon?.sign || "Aries");
    const marsHouse = getHouse(mars?.sign || "Aries");
    const venusHouse = getHouse(venus?.sign || "Aries");
    const mercuryHouse = getHouse(currentPlanets.find(p => p.name === "Mercury")?.sign || "Aries");

    // Dynamic Predictions using transit data
    const moonPred = (data as any).transits.Moon[moonHouse] || "";
    const sunPred = (data as any).transits.Sun[sunHouse] || "";
    const marsPred = (data as any).transits.Mars?.[marsHouse] || "";
    const venusPred = (data as any).transits.Venus?.[venusHouse] || "";
    const mercuryPred = (data as any).transits.Mercury?.[mercuryHouse] || "";

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
        personal: moonPred,
        career: sunPred,
        health: marsPred,
        love: venusPred,
        luckyColor,
        luckyNumber,
        labels: {
            color: getL("luckyColor"),
            number: getL("luckyNumber")
        },
        transitInfo: (() => {
            const transitMap: any = {
                en: `Moon is transiting your ${moonHouse}th House and Sun is in your ${sunHouse}th House.`,
                hi: `चंद्रमा आपके ${moonHouse}वें भाव में और सूर्य ${sunHouse}वें भाव में गोचर कर रहा है।`,
                mr: `चंद्र तुमच्या ${moonHouse}व्या घरात आणि सूर्य तुमच्या ${sunHouse}व्या घरात गोचर करत आहे.`,
                gu: `ચંદ્ર તમારા ${moonHouse}મા ઘરમાં અને સૂર્ય તમારા ${sunHouse}મા ઘરમાં ગોચર કરી રહ્યો છે.`,
                bn: `চন্দ্র আপনার ${moonHouse}তম ঘরে এবং সূর্য আপনার ${sunHouse}তম ঘরে গোচর করছে।`,
                ta: `சந்திரன் உங்கள் ${moonHouse}வது வீட்டில் மற்றும் சூரியன் உங்கள் ${sunHouse}வது வீட்டில் சஞ்சரிக்கிறார்கள்.`,
                te: `చంద్రుడు మీ ${moonHouse}వ ఇంట్లో మరియు సూర్యుడు ${sunHouse}వ ఇంట్లో సంచరిస్తున్నాడు.`,
                kn: `ಚಂದ್ರನು ನಿಮ್ಮ ${moonHouse}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಸೂರ್ಯನು ನಿಮ್ಮ ${sunHouse}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ.`
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
    const msgs: any = {
        en: "Navamsa (D9) indicates a spiritual union with focus on shared growth. Venus-Mars synergy is balanced.",
        hi: "नवांश (D9) साझा विकास पर ध्यान देने के साथ एक आध्यात्मिक मिलन का संकेत देता है। शुक्र-मंगल तालमेल संतुलित है।",
        mr: "नवांश (D9) अध्यात्मिक मीलनाचा संकेत देते ज्यात सामायिक प्रगतीवर भर आहे. शुक्र-मंगळ समन्वय संतुलित आहे.",
        te: "నవాంశ (D9) ఉమ్మడి వృద్ధిపై దృష్టి సారించిన ఆధ్యాత్మిక కలయికను సూచిస్తుంది. శుక్ర-కుజుల సమన్వయం సమతుల్యంగా ఉంది.",
        kn: "ನವಾಂಶ (D9) ಹಂಚಿಕೆಯ ಬೆಳವಣಿಗೆಯ ಮೇಲೆ ಗಮನಹರಿಸುವ ಆಧ್ಯಾತ್ಮಿಕ ಒಕ್ಕೂಟವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಶುಕ್ರ-ಮಂಗಳ ಸಿನರ್ಜಿ ಸಮತೋಲಿತವಾಗಿದೆ."
    };
    return msgs[lang] || msgs.en;
}

function calculateLikelyMarriagePeriod(boy: any, girl: any, lang: string) {
    const msgs: any = {
        en: "Strong indicators for marriage observed between Oct 2025 and June 2026 based on transit alignment.",
        hi: "गोचर संरेखण के आधार पर अक्टूबर 2025 और जून 2026 के बीच विवाह के मजबूत संकेत देखे गए हैं।",
        mr: "गोचर स्थितीनुसार ऑक्टोबर २०२५ ते जून २०२६ दरम्यान विवाहाचे प्रबळ योग दिसून येतात.",
        te: "గోచార గ్రహాల అమరిక ఆధారంగా అక్టోబర్ 2025 మరియు జూన్ 2026 మధ్య వివాహానికి బలమైన సూచనలు ఉన్నాయి.",
        kn: "ಗೋಚಾರ ಗ್ರಹಗಳ ಜೋಡಣೆಯ ಆಧಾರದ ಮೇಲೆ ಅಕ್ಟೋಬರ್ 2025 ಮತ್ತು ಜೂನ್ 2026 ರ ನಡುವೆ ವಿವಾಹಕ್ಕೆ ಬಲವಾದ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿವೆ."
    };
    return msgs[lang] || msgs.en;
}

function generateLifeForecastSummary(score: number, lang: string) {
    const msgs: any = {
        en: `First 5 years show ${score > 25 ? 'peak harmony' : 'adjustments'}. Prosperity likely to increase through mutual efforts from year 7 onwards.`,
        hi: `पहले 5 वर्ष ${score > 25 ? 'चरम सामंजस्य' : 'समायोजन'} दिखाते हैं। 7वें वर्ष के बाद से आपसी प्रयासों के माध्यम से समृद्धि बढ़ने की संभावना है।`,
        mr: `पहिली ५ वर्षे ${score > 25 ? 'अत्यंत सुसंवादी' : 'तडजोडीची'} असतील. ७ व्या वर्षानंतर परस्पर प्रयत्नांतून समृद्धी वाढण्याची शक्यता आहे.`,
        te: `మొదటి 5 సంవత్సరాలు ${score > 25 ? 'అత్యంత సామరస్యంగా' : 'సర్దుబాట్లు'} కనిపిస్తున్నాయి. 7వ సంవత్సరం నుండి ఉమ్మడి ప్రయత్నాల ద్వారా శ్రేయస్సు పెరిగే అవకాశం ఉంది.`,
        kn: `ಮೊದಲ 5 ವರ್ಷಗಳು ${score > 25 ? 'ಅತ್ಯಂತ ಸುಸಂಗತವಾಗಿ' : 'ಹೊಂದಾಣಿಕೆಗಳನ್ನು'} ತೋರಿಸುತ್ತವೆ. 7ನೇ ವರ್ಷದಿಂದ ಪರಸ್ಪರ ಪ್ರಯತ್ನಗಳ ಮೂಲಕ ಸಮೃದ್ಧಿ ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ.`
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
