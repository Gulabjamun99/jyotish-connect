import { GoogleGenerativeAI } from "@google/genai";

/**
 * JyotishConnect Prediction Engine
 * Stabilized Version for Production
 */

// --- Constants & Data Maps ---

export const _SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export const _pick = (arr: any[], seed: number) => arr[seed % arr.length];

export const _doy = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

// --- Translation Maps for Daily Horoscope ---

const _EN = {
    positive: ["The cosmic alignment favors you — proceed with confidence toward a goal.", "Powerful yoga today for self-expression. Make your point clearly.", "Rare auspicious energy today. Initiate new beginnings.", "Universal forces boost your charm. Relationships and opportunities grow.", "Sudden clarity on a long-standing confusion arrives today.", "The universe grants extra courage — step out of your comfort zone.", "Success comes from an unexpected direction. Be ready for shifts.", "Energy levels are high. Physical and mental stamina support your work.", "Leadership qualities shine today. Others look to you for guidance.", "Gratitude brings prosperity. Today's small win is tomorrow's big success."],
    negative: ["Avoid financial decisions under uncertainty. Check contracts.", "Don't succumb to emotions — think calmly before speaking.", "Small delays or misunderstandings possible. Allocate extra time.", "Energy dip in afternoons. Stay hydrated and take a short break.", "Avoid making unnecessary promises. Focus on the task at hand.", "Old anxieties might surface. Overcome them with confidence.", "Avoid arguments on trivial matters. Stay patient.", "Distractions may delay work. Stay focused on one thing at a time.", "Obstacles in plans are just experiences, not failures.", "Overconfidence might lead to errors. Verify all information."],
    career: ["The Sun boosts your professional status — voice your ideas boldly.", "Be diplomatic at work. Listen to other perspectives.", "Mercury strengthens your communication — contracts become favorable.", "Mars gives you the drive to finish pending tasks.", "Jupiter expands opportunities. A mentor-like figure may guide you.", "Research and planning yield success today. Build your strategy.", "Ideal day for a significant career shift or discussion.", "Collaborative efforts succeed today. Sync with your team.", "Leadership roles come easily. Your respect grows.", "Delayed results finally reach you. Your hard work is recognized."],
    love: ["Venus brings sweetness to relations — love is deep today.", "Spending time with your partner creates happy memories.", "A chance encounter for singles might lead to a meaningful intro.", "Speaking your heart out heals gaps in relationships.", "Your charisma is at its peak. Use social opportunities.", "Financial sync with partner is likely. A joint decision helps.", "Old friendships might strengthen today. Value true bonds.", "Compassion and patience improve your connection today.", "Small acts of love — a gesture strengthens a close bond.", "Romantic surprises likely. Spend the evening in joy."],
    health: ["Saturn demands discipline in health. Don't skip your routine.", "Planetary transits are good for a detox or clean eating.", "Walking outdoors brings mental clarity.", "Focus on mental health. Meditate or do breathing exercises.", "Old health issues might recur. Seek professional advice.", "Avoid fatigue by balancing work speed. Stay steady.", "Digestive issues possible. Eat light and nutritious food.", "Lack of sleep might affect next day. Rest well.", "Stress is the cause of ailments. Keep a calm mind.", "Listen to your body's signals. Rest when needed."]
};

const _HI = {
    positive: ["ग्रहों की स्थिति आपके पक्ष में है — आत्मविश्वास के साथ आगे बढ़ें।", "आत्म-अभिव्यक्ति के लिए आज शक्तिशाली योग है। अपनी बात स्पष्ट रूप से कहें।", "आज दुर्लभ शुभ ऊर्जा है। नई शुरुआत करें।", "ब्रह्मांडीय शक्तियां आपके आकर्षण को बढ़ाती हैं। संबंध और अवसर बढ़ेंगे।", "लंबे समय से चली आ रही उलझन पर आज अचानक स्पष्टता आएगी।", "ब्रह्मांड अतिरिक्त साहस प्रदान करता है — अपने कंफर्ट ज़ोन से बाहर निकलें।", "सफलता अप्रत्याशित दिशा से आती है। बदलावों के लिए तैयार रहें।", "ऊर्जा का स्तर ऊंचा है। शारीरिक और मानसिक सहनशक्ति आपके काम में मदद करेगी।", "नेतृत्व के गुण आज चमकते हैं। दूसरे मार्गदर्शन के लिए आपकी ओर देखते हैं।", "कृतज्ञता समृद्धि लाती है। आज की छोटी जीत कल की बड़ी सफलता है।"],
    negative: ["अनिश्चितता में वित्तीय निर्णय लेने से बचें। अनुबंधों की जांच करें।", "भावुक न हों — बोलने से पहले शांति से सोचें।", "छोटी देरी या गलतफहमी संभव है। अतिरिक्त समय आवंटित करें।", "दोपहर में ऊर्जा की कमी। हाइड्रेटेड रहें और थोड़ा आराम करें।", "अनावश्यक वादे करने से बचें। वर्तमान कार्य पर ध्यान दें।", "पुरानी चिंताएं उभर सकती हैं। आत्मविश्वास से उन्हें दूर करें।", "तुच्छ मामलों पर बहस से बचें। धैर्य बनाए रखें।", "विकर्षण कार्य में देरी कर सकते हैं। एक समय में एक ही चीज़ पर ध्यान दें।", "योजनाओं में बाधाएं केवल अनुभव हैं, असफलता नहीं।", "अति-आत्मविश्वास से त्रुटियां हो सकती हैं। सभी जानकारी सत्यापित करें।"],
    career: ["सूर्य आपकी पेशेवर स्थिति को बढ़ाता है — अपने विचार निर्भीकता से रखें।", "काम पर कूटनीतिक बनें। अन्य दृष्टिकोणों को सुनें।", "बुध आपके संचार को मजबूत करता है — अनुबंध अनुकूल हो जाते हैं।", "मंगल आपको लंबित कार्यों को पूरा करने की प्रेरणा देता है।", "गुरु अवसरों का विस्तार करता है। एक गुरु जैसा व्यक्ति आपका मार्गदर्शन कर सकता है।", "अनुसंधान और योजना आज सफलता दिलाती है। अपनी रणनीति बनाएं।", "करियर में महत्वपूर्ण बदलाव या चर्चा के लिए आदर्श दिन।", "सहयोगात्मक प्रयास आज सफल होते हैं। अपनी टीम के साथ तालमेल बिठाएं।", "नेतृत्व की भूमिकाएं आसानी से आती हैं। आपका सम्मान बढ़ता है।", "विलंबित परिणाम अंततः आप तक पहुँचते हैं। आपकी मेहनत पहचानी जाती है।"],
    love: ["शुक्र संबंधों में मधुरता लाता है — आज प्रेम गहरा है।", "साथी के साथ समय बिताने से सुखद यादें बनती हैं।", "अकेले लोगों के लिए अचानक मुलाकात एक सार्थक परिचय दे सकती है।", "दिल की बात कहने से रिश्तों की दूरियां खत्म होती हैं।", "आपका आकर्षण चरम पर है। सामाजिक अवसरों का लाभ उठाएं।", "साथी के साथ वित्तीय तालमेल की संभावना है। संयुक्त निर्णय मदद करता है।", "पुरानी दोस्ती आज मजबूत हो सकती है। सच्चे रिश्तों को महत्व दें।", "करुणा और धैर्य आज आपके संबंध को बेहतर बनाते हैं।", "प्रेम के छोटे कार्य — एक इशारा करीबी बंधन को मजबूत करता है।", "रोमांटिक सरप्राइज की संभावना। शाम खुशी में बिताएं।"],
    health: ["शनि स्वास्थ्य में अनुशासन की मांग करता है। अपनी दिनचर्या न छोड़ें।", "ग्रहों का गोचर डिटॉक्स या शुद्ध भोजन के लिए अच्छा है।", "बाहर टहलना मानसिक स्पष्टता लाता है।", "मानसिक स्वास्थ्य पर ध्यान दें। ध्यान या श्वास व्यायाम करें।", "पुरानी स्वास्थ्य समस्याएं फिर से उभर सकती हैं। पेशेवर सलाह लें।", "काम की गति को संतुलित करके थकान से बचें। स्थिर रहें।", "पाचन संबंधी समस्याएं संभव हैं। हल्का और पौष्टिक भोजन करें।", "नींद की कमी अगले दिन को प्रभावित कर सकती है। अच्छी तरह आराम करें।", "तनाव बीमारियों का कारण है। मन शांत रखें।", "अपने शरीर के संकेतों को सुनें। जरूरत पड़ने पर आराम करें।"]
};

const _MR = {
    positive: ["ग्रहांची स्थिती तुमच्या बाजूने आहे — ध्येयाकडे आत्मविश्वासाने पुढे जा.", "आत्म-अभिव्यक्तीसाठी आज शक्तिशाली योग आहे. तुमचे मत स्पष्टपणे मांडा.", "आज दुर्मिळ शुभ ऊर्जा आहे. नवीन कामांची सुरुवात करा.", "ब्रह्मांडीय शक्ती तुमच्या आकर्षणात वाढ करतात. संबंध आणि संधी दोन्ही वाढतील.", "दीर्घकाळापासून असलेल्या गोंधळावर आज अचानक स्पष्टता येईल.", "ब्रह्मांड तुम्हाला अतिरिक्त धैर्य देत आहे — तुमच्या कम्फर्ट झोनमधून बाहेर पडा.", "यश अनपेक्षित दिशेने येईल. बदलांसाठी तयार राहा.", "ऊर्जेची पातळी उच्च आहे. शारीरिक आणि मानसिक क्षमता तुमच्या कामात मदत करतील.", "नेतृत्व गुण आज चमकतील. इतर मार्गदर्शनासाठी तुमच्याकडे पाहतील.", "कृतज्ञता समृद्धी आणते. आजचा छोटा विजय उद्याचे मोठे यश आहे."],
    negative: ["अनिश्चिततेमध्ये आर्थिक निर्णय घेणे टाळा. करार तपासा.", "भावनेच्या आहारी जाऊ नका — बोलण्यापूर्वी शांतपणे विचार करा.", "लहान विलंब किंवा गैरसमज होण्याची शक्यता. अतिरिक्त वेळ द्या.", "दुपारी ऊर्जेत घट जाणवू शकते. पाणी भरपूर प्या आणि थोडा वेळ विश्रांती घ्या.", "अनावश्यक आश्वासने देणे टाळा. हातातील कामावर लक्ष द्या.", "जुन्या चिंता पुन्हा उफाळून येऊ शकतात. आत्मविश्वासाने त्यावर मात करा.", "क्षुल्लक कारणावरून वाद टाळा. संयम ठेवा.", "लक्ष विचलित झाल्यामुळे कामात उशीर होऊ शकतो. एका वेळी एकाच गोष्टीवर लक्ष द्या.", "योजनांमधील अडथळे हे केवळ अनुभव आहेत, अपयश नाही.", "अति-आत्मविश्वासामुळे चुका होऊ शकतात. सर्व माहितीची खात्री करा."],
    career: ["सूर्य तुमची व्यावसायिक स्थिती सुधारतो — तुमचे विचार धडाडीने मांडा.", "कामाच्या ठिकाणी मुत्सद्दी बना. इतरांचे दृष्टिकोन ऐकून घ्या.", "बुध तुमचा संवाद मजबूत करतो — करार तुमच्या बाजूने होतील.", "मंगळ तुम्हाला प्रलंबित कामे पूर्ण करण्याची प्रेरणा देतो.", "गुरु संधींचा विस्तार करतो. एखादी अनुभवी व्यक्ती तुम्हाला मार्गदर्शन करू शकते.", "संशोधन आणि नियोजन आज यश देईल. तुमची रणनीती तयार करा.", "करिअरमधील मोठ्या बदलासाठी किंवा चर्चेसाठी आजचा दिवस उत्तम आहे.", "सहयोगात्मक प्रयत्न आज यशस्वी होतील. तुमच्या टीमशी जुळवून घ्या.", "नेतृत्व भूमिका सहज मिळतील. तुमचा आदर वाढेल.", "विलंब झालेली फळे अखेर तुम्हाला मिळतील. तुमच्या कष्टाची दखल घेतली जाईल."],
    love: ["शुक्र संबंधांमध्ये गोडवा आणतो — आज प्रेम अधिक खोल आहे.", "जोडीदारासोबत वेळ घालवल्याने आनंददायी आठवणी तयार होतात.", "सिंगल्ससाठी अचानक झालेली भेट एक अर्थपूर्ण ओळख देऊ शकते.", "मनातील भावना व्यक्त केल्याने नात्यातील अंतर कमी होईल.", "तुमचे आकर्षण शिखरावर आहे. सामाजिक संधींचा फायदा घ्या.", "जोडीदारासोबत आर्थिक ताळमेळ बसण्याची शक्यता आहे. संयुक्त निर्णय मदतीचा ठरेल.", "जुनी मैत्री आज दृढ होऊ शकते. खऱ्या नात्यांना महत्त्व द्या.", "करुणा आणि संयम आज तुमचे नाते सुधारतील.", "प्रेमाची छोटी कृती — एक छोटीशी गोष्ट नाते अधिक मजबूत करते.", "रोमँटिक सरप्राइजेस मिळण्याची शक्यता. संध्याकाळ आनंदात घालवा."],
    health: ["शनि आरोग्यामध्ये शिस्तीची मागणी करतो. तुमची दिनचर्या सोडू नका.", "ग्रहांचे गोचर डिटॉक्स किंवा शुद्ध आहारासाठी चांगले आहे.", "बाहर फिरल्याने मानसिक स्पष्टता येते.", "मानसिक आरोग्यावर लक्ष द्या. ध्यान किंवा श्वसनाचे व्यायाम करा.", "आरोग्याच्या जुन्या समस्या पुन्हा उद्भवू शकतात. डॉक्टरांचा सल्ला घ्या.", "कामाचा वेग संतुलित ठेवून थकवा टाळा. स्थिर राहा.", "पचनाच्या समस्या उद्भवू शकतात. हलका आणि पौष्टिक आहार घ्या.", "झोप पूर्ण न झाल्यामुळे पुढच्या दिवसावर परिणाम होऊ शकतो. चांगली विश्रांती घ्या.", "तणाव हे आजारांचे कारण आहे. मन शांत ठेवा.", "तुमच्या शरीराचे संकेत ऐका. गरज पडल्यास विश्रांती घ्या."]
};

const _COLORS_EN = ["Ruby Red", "Golden Yellow", "Emerald Green", "Sapphire Blue", "Pearl White", "Coral Orange", "Violet Purple", "Silver Grey", "Rose Pink", "Deep Teal", "Amber", "Ivory", "Turquoise", "Sand Beige", "Crimson"];
const _COLORS_HI = ["रूबी लाल", "सुनहरा पीला", "पन्ना हरा", "नीलम नीला", "मोती सफेद", "मूंगा नारंगी", "बैंगनी", "चांदी जैसा ग्रे", "गुलाबी", "गहरा नीला", "एम्बर", "हाथीदांत", "फ़िरोज़ा", "सैंड बेज", "गहरा लाल"];
const _COLORS_MR = ["रुबी लाल", "सोनेरी पिवळा", "पाचू हिरवा", "नीलम निळा", "मोती पांढरा", "प्रवाळ नारंगी", "जांभळा", "चांदी ग्रे", "गुलाबी", "गडद निळा", "अंबर", "हस्तिदंती", "फिरोजी", "सँड बेज", "गडद लाल"];

// --- Helper Functions (Stubs and Logic) ---

export const analyzeManglikCancellation = (boy: any, girl: any, lang: string = 'en') => {
    const hasBoy = boy?.doshas?.Manglik || false;
    const hasGirl = girl?.doshas?.Manglik || false;
    if (hasBoy && hasGirl) return lang === 'hi' ? "दोनों मांगलिक हैं, इसलिए दोष संतुलित हो जाता है।" : "Both are Manglik, so the dosha is balanced.";
    return lang === 'hi' ? "कोई विशेष रद्दीकरण नहीं पाया गया।" : "No specific cancellation found.";
};

export const analyzeNavamsaBond = (boy: any, girl: any, lang: string = 'en') => {
    return lang === 'hi' ? "नवांश कुंडली में ग्रहों का तालमेल आत्मिक जुड़ाव का संकेत देता है।" : "Planetary alignment in Navamsa indicates a soul-level connection.";
};

export const calculateLikelyMarriagePeriod = (boy: any, girl: any, lang: string = 'en') => {
    return lang === 'hi' ? "अगले १८ से २४ महीनों के भीतर विवाह के प्रबल योग हैं।" : "Strong marriage yoga within the next 18 to 24 months.";
};

export const generateLifeForecastSummary = (score: number, lang: string = 'en') => {
    if (score >= 25) return lang === 'hi' ? "आने वाले वर्ष सुख, समृद्धि और आपसी सहयोग से भरपूर रहेंगे।" : "Coming years will be full of happiness, prosperity, and mutual support.";
    return lang === 'hi' ? "स्थिरता के लिए धैर्य और आपसी समझ की आवश्यकता होगी।" : "Patience and mutual understanding will be required for stability.";
};

export const getContextualRemedies = (result: any, lang: string = 'en') => {
    return [
        lang === 'hi' ? "गुरुवार को भगवान विष्णु की पूजा करें।" : "Worship Lord Vishnu on Thursdays.",
        lang === 'hi' ? "जरूरतमंदों को पीले वस्त्र दान करें।" : "Donate yellow clothes to the needy."
    ];
};

// --- Exported Engine Functions ---

export function generateDailyHoroscope(sign: string, planets: any[], lang: string) {
    const si = _SIGNS.indexOf(sign);
    const doy = _doy();
    const moon = planets?.find((p: any) => p.name === "Moon")?.sign || "";
    const mi = _SIGNS.indexOf(moon);
    const seed = doy * 37 + si * 13 + (mi >= 0 ? mi * 7 : 0);

    const P = lang === 'hi' ? _HI : lang === 'mr' ? _MR : _EN;
    const colors = lang === 'hi' ? _COLORS_HI : lang === 'mr' ? _COLORS_MR : _COLORS_EN;

    const sunS = planets?.find((p: any) => p.name === "Sun")?.sign || "";
    const transitInfo = (lang === 'hi' ? `सूर्य ${sunS} में, चंद्रमा ${moon} में` : `Sun in ${sunS}, Moon in ${moon}`);

    const lMap: any = {
        en: { career: "Career", love: "Love", health: "Health", positive: "✨ Positive", negative: "⚠ Challenges", color: "Lucky Color", number: "Lucky No." },
        hi: { career: "करियर", love: "प्रेम", health: "स्वास्थ्य", positive: "✨ शुभ", negative: "⚠ चुनौतियां", color: "शुभ रंग", number: "शुभ अंक" },
        mr: { career: "करिअर", love: "प्रेम", health: "आरोग्य", positive: "✨ शुभ", negative: "⚠ आव्हाने", color: "शुभ रंग", number: "शुभ अंक" }
    };

    return {
        positive: _pick(P.positive, seed),
        negative: _pick(P.negative, seed + 11),
        career: _pick(P.career, seed + 23),
        love: _pick(P.love, seed + 37),
        health: _pick(P.health, seed + 53),
        luckyNumber: (seed % 9) + 1,
        luckyColor: _pick(colors, seed + 71),
        transitInfo,
        labels: lMap[lang] || lMap.en
    };
}

export function generateMatchVerdict(score: number, boyManglik: boolean, girlManglik: boolean, lang: string) {
    const isManglikMatch = (boyManglik === girlManglik);
    const v: any = {
        en: { 
            excellent: "Excellent match! High mental and emotional understanding.", 
            good: "Good match. Solid foundation for marriage.",
            average: "Average match. Adjustments required.",
            bad: "Low compatibility. Differences likely.",
            manglikIssue: "Manglik mismatch. Professional consultation advised.",
            manglikOkay: "Manglik balanced.",
            conclusionGood: "Marriage recommended.",
            conclusionCaution: "Marriage recommended with remedies.",
            conclusionBad: "Marriage not recommended without remedies."
        },
        hi: {
            excellent: "उत्कृष्ट मिलान! उच्च मानसिक और भावनात्मक समझ।",
            good: "अच्छा मिलान। विवाह के लिए ठोस आधार।",
            average: "औसत मिलान। समायोजन की आवश्यकता।",
            bad: "कम अनुकूलता। मतभेद होने की संभावना।",
            manglikIssue: "मांगलिक असंगति। पेशेवर परामर्श की सलाह दी जाती है।",
            manglikOkay: "मांगलिक संतुलित।",
            conclusionGood: "विवाह की सिफारिश की जाती है।",
            conclusionCaution: "उपायों के साथ विवाह की सिफारिश की जाती है।",
            conclusionBad: "उपायों के बिना विवाह की सिफारिश नहीं की जाती है।"
        }
    };

    const text = v[lang] || v.en;
    let res = (score >= 28 ? text.excellent : score >= 18 ? text.good : score >= 10 ? text.average : text.bad);
    res += " " + (isManglikMatch ? text.manglikOkay : text.manglikIssue);
    res += " " + (score >= 18 ? (isManglikMatch ? text.conclusionGood : text.conclusionCaution) : text.conclusionBad);
    return res;
}

export const generateDetailedMatchingReport = (result: any, lang: string = "en") => {
    const score = result.milan.totalScore;
    const boyData = result.boy;
    const girlData = result.girl;

    const r: any = {
        en: {
            marriage: { title: "Marriage Compatibility", rating: score >= 24 ? "Excellent" : "Good", verdict: score >= 24 ? "Highly favorable." : "Stable match." },
            nature: { title: "Nature & Temperament", verdict: result.milan.ashtakoot.gana.score >= 5 ? "Harmonious nature." : "Differences likely." },
            family: { title: "Family & Children", verdict: result.milan.ashtakoot.nadi.score === 8 ? "Excellent health match." : "Nadi considerations." },
            finance: { title: "Wealth & Prosperity", verdict: result.milan.ashtakoot.bhakoot.score === 7 ? "Steady wealth." : "Financial planning needed." },
            bond: { title: "Navamsa Synergy", verdict: analyzeNavamsaBond(boyData, girlData, lang) },
            timing: { title: "Marriage Timing", verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang) },
            forecast: { title: "Life Forecast", verdict: generateLifeForecastSummary(score, lang) },
            remedies: { title: "Remedies", list: getContextualRemedies(result, lang) },
            summary: { verdict: (score || 0) >= 18 ? "Proceed" : "Caution", confidence: 60 + (score || 0), nextSteps: (score || 0) >= 24 ? "Select Muhurat" : "Perform Remedies" }
        },
        hi: {
            marriage: { title: "विवाह अनुकूलता", rating: score >= 24 ? "उत्कृष्ट" : "अच्छा", verdict: score >= 24 ? "अत्यधिक अनुकूल।" : "स्थिर मिलान।" },
            nature: { title: "प्रकृति और स्वभाव", verdict: result.milan.ashtakoot.gana.score >= 5 ? "सामंजस्यपूर्ण स्वभाव।" : "मतभेद संभव।" },
            family: { title: "परिवार और संतान", verdict: result.milan.ashtakoot.nadi.score === 8 ? "उत्कृष्ट स्वास्थ्य मिलान।" : "नाड़ी विचार।" },
            finance: { title: "धन और समृद्धि", verdict: result.milan.ashtakoot.bhakoot.score === 7 ? "स्थिर धन।" : "वित्तीय नियोजन आवश्यक।" },
            bond: { title: "नवांश तालमेल", verdict: analyzeNavamsaBond(boyData, girlData, lang) },
            timing: { title: "विवाह समय", verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang) },
            forecast: { title: "जीवन पूर्वानुमान", verdict: generateLifeForecastSummary(score, lang) },
            remedies: { title: "उपाय", list: getContextualRemedies(result, lang) },
            summary: { verdict: score >= 18 ? "आगे बढ़ें" : "सावधानी", confidence: 60 + score, nextSteps: score >= 24 ? "मुहूर्त चुनें" : "उपाय करें" }
        }
    };
    return r[lang] || r.en;
};

export const generateFullMatchAnalysis = (result: any, lang: string = "en") => {
    const score = result.milan.totalScore;
    const t = (en: string, hi: string) => (lang === 'hi' ? hi : en);
    
    const table = [
        { name: t("Varna", "वर्ण"), max: 1, got: result.milan.ashtakoot.varna.score, interp: result.milan.ashtakoot.varna.interpretation },
        { name: t("Vashya", "वश्य"), max: 2, got: result.milan.ashtakoot.vashya.score, interp: result.milan.ashtakoot.vashya.interpretation },
        { name: t("Tara", "तारा"), max: 3, got: result.milan.ashtakoot.tara.score, interp: result.milan.ashtakoot.tara.interpretation },
        { name: t("Yoni", "योनि"), max: 4, got: result.milan.ashtakoot.yoni.score, interp: result.milan.ashtakoot.yoni.interpretation },
        { name: t("Maitri", "मैत्री"), max: 5, got: result.milan.ashtakoot.maitri.score, interp: result.milan.ashtakoot.maitri.interpretation },
        { name: t("Gana", "गण"), max: 6, got: result.milan.ashtakoot.gana.score, interp: result.milan.ashtakoot.gana.interpretation },
        { name: t("Bhakoot", "भकूट"), max: 7, got: result.milan.ashtakoot.bhakoot.score, interp: result.milan.ashtakoot.bhakoot.interpretation },
        { name: t("Nadi", "नाड़ी"), max: 8, got: result.milan.ashtakoot.nadi.score, interp: result.milan.ashtakoot.nadi.interpretation },
    ];

    return {
        section1: {
            groom: { 
                name: result.boy.name || "Groom", 
                dob: result.boy.dob || "", 
                tob: result.boy.tob || "", 
                pob: result.boy.pob || "", 
                rashi: result.boy.moonSign, 
                nakshatra: result.boy.nakshatra, 
                lagna: result.boy.ascendant 
            },
            bride: { 
                name: result.girl.name || "Bride", 
                dob: result.girl.dob || "", 
                tob: result.girl.tob || "", 
                pob: result.girl.pob || "", 
                rashi: result.girl.moonSign, 
                nakshatra: result.girl.nakshatra, 
                lagna: result.girl.ascendant 
            }
        },
        section2: {
            emotional: result.milan.ashtakoot.maitri.score >= 3 ? t("Strong", "मजबूत") : t("Sensitive", "संवेदनशील"),
            physical: result.milan.ashtakoot.yoni.score >= 2 ? t("Compatible", "अनुकूल") : t("Average", "औसत"),
            financial: result.milan.ashtakoot.bhakoot.score === 7 ? t("Prosperous", "समृद्ध") : t("Balanced", "संतुलित"),
            longevity: result.milan.ashtakoot.nadi.score === 8 ? t("Excellent", "उत्कृष्ट") : t("Caution", "सावधानी"),
            family: result.milan.ashtakoot.gana.score >= 4 ? t("Harmonious", "सामंजस्यपूर्ण") : t("Adjustable", "समायोज्य"),
            quality: score >= 28 ? t("Excellent Match", "उत्कृष्ट मिलान") : score >= 18 ? t("Auspicious Match", "शुभ मिलान") : t("Average Match", "औसत मिलान"),
            recommendation: score >= 18 ? t("Marriage Recommended", "विवाह की सिफारिश") : t("Consult Astrologer", "ज्योतिषी से परामर्श करें")
        },
        section3: { table },
        section4: {
            groomTraits: [t("Confident", "आत्मविश्वासी"), t("Ambitious", "महत्वाकांक्षी"), t("Reliable", "भरोसेमंद")],
            brideTraits: [t("Intelligent", "बुद्धिमान"), t("Compassionate", "दयालु"), t("Creative", "रचनात्मक")]
        },
        section7: {
            boyStatus: result.boy.doshas.Manglik.present ? t("Manglik", "मांगलिक") : t("Non-Manglik", "गैर-मांगलिक"),
            girlStatus: result.girl.doshas.Manglik.present ? t("Manglik", "मांगलिक") : t("Non-Manglik", "गैर-मांगलिक"),
            verdict: analyzeManglikCancellation(result.boy, result.girl, lang)
        },
        section14: {
            periods: [
                { time: t("Current - Dec 2024", "अभी - दिसंबर २०२४"), strength: t("Moderate", "मद्यम") },
                { time: t("Jan 2025 - June 2025", "जनवरी २०२५ - जून २०२५"), strength: t("Very High", "बहुत अधिक") }
            ]
        },
        section15: {
            boyRemedies: getContextualRemedies(result, lang),
            girlRemedies: getContextualRemedies(result, lang)
        },
        finalVerdict: {
            recommendation: generateMatchVerdict(score, result.boy.doshas.Manglik.present, result.girl.doshas.Manglik.present, lang)
        }
    };
};

export const generateAshtakootAnalysis = (result: any, lang: string = "en") => {
    return result?.milan?.ashtakoot || {};
};

export const generateLifePredictions = (data: any, lang: string = "en") => {
    const t = (en: string, hi: string) => (lang === 'hi' ? hi : en);
    return {
        personality: t("You possess a dynamic and multi-faceted personality.", "आप एक गतिशील और बहुआयामी व्यक्तित्व के धनी हैं।"),
        career: t("Career shows growth through intellectual pursuits.", "करियर में बौद्धिक प्रयासों के माध्यम से वृद्धि दिखाई देती है।"),
        health: t("Maintain a balanced diet for long-term wellness.", "दीर्घकालिक कल्याण के लिए संतुलित आहार बनाए रखें।"),
        finance: t("Wealth accumulation will be steady over time.", "समय के साथ धन संचय स्थिर रहेगा।")
    };
};

export async function generateAIPredictions(data: any, lang: string = "en") {
    try {
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) return { summary: "AI analysis unavailable (Missing API Key)." };
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as an expert Vedic Astrologer. Analyze this birth data: ${JSON.stringify(data)}. 
        Provide a concise, professional life analysis in ${lang === 'hi' ? 'Hindi' : 'English'}.
        Focus on: Personality, Career, and Key Life Advice.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { summary: response.text() };
    } catch (e) {
        console.error("AI Generation Error:", e);
        return { summary: "The cosmic signals are currently faint. Please try again later." };
    }
}
