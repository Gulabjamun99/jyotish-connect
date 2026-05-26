/**
 * JyotishConnect Prediction Engine
 * Stabilized Version for Production with Multi-language support
 */

export const _SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

import { SIGN_PREDICTIONS } from "./horoscope-data";
import { getTrans } from "./i18n";

export const generateDailyHoroscope = (sign: string, planets: any[], lang: string = 'en') => {
    const today = new Date();
    const seed = `${today.toLocaleDateString()}-${sign}`;
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    const rand = ((h ^ h >>> 16) >>> 0) / 4294967296;

    // Use available translation or fallback to English if not translated in horoscope-data.ts
    // For full support, SIGN_PREDICTIONS would need all languages, but we map to 'hi' for Indic languages temporarily 
    // to provide at least some localization if the specific lang doesn't exist in SIGN_PREDICTIONS.
    const isIndic = ['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn'].includes(lang);
    const dataLang = SIGN_PREDICTIONS[sign]?.[lang as keyof typeof SIGN_PREDICTIONS[string]] 
                     || SIGN_PREDICTIONS[sign]?.[(isIndic ? 'hi' : 'en') as 'en'|'hi'] 
                     || SIGN_PREDICTIONS[sign]?.en;
                     
    if (!dataLang) return null;

    const pick = (arr: string[]) => arr[Math.floor(rand * arr.length)] || "";
    
    const moon = planets?.find(p => p.name === "Moon");
    const t = getTrans(lang);
    const moonSignStr = moon ? (t.signs[moon.sign] || moon.sign) : ""; // Translated actual moon transit sign
    
    // Labels translation mapping
    const transitLabel = lang === 'hi' ? 'चन्द्रमा गोचर' : lang === 'mr' ? 'चंद्र गोचर' : lang === 'gu' ? 'ચંદ્ર ગોચર' : lang === 'bn' ? 'চন্দ্র গোচর' : lang === 'ta' ? 'சந்திர பெயர்ச்சி' : lang === 'te' ? 'చంద్ర సంచారం' : lang === 'kn' ? 'ಚಂದ್ರ ಗೋಚಾರ' : 'Moon Transit';
    const transitInfo = moonSignStr ? `${transitLabel}: ${moonSignStr}` : "";
    
    const colorsMap: any = {
        en: ["Red", "White", "Yellow", "Green", "Blue", "Pink", "Orange"],
        hi: ["लाल", "सफ़ेद", "पीला", "हरा", "नीला", "गुलाबी", "नारंगी"],
        mr: ["लाल", "पांढरा", "पिवळा", "हिरवा", "निळा", "गुलाबी", "नारंगी"],
        gu: ["લાલ", "સફેદ", "પીળો", "લીલો", "વાદળી", "ગુલાબી", "નારંગી"],
        bn: ["লাল", "সাদা", "হলুদ", "সবুজ", "নীল", "গোলাপী", "কমলা"],
        ta: ["சிவப்பு", "வெள்ளை", "மஞ்சள்", "பச்சை", "நீலம்", "இளஞ்சிவப்பு", "ஆரஞ்சு"],
        te: ["ఎరుపు", "తెలుపు", "పసుపు", "ఆకుపచ్చ", "నీలం", "గులాబీ", "నారింజ"],
        kn: ["ಕೆಂಪು", "ಬಿಳಿ", "ಹಳದಿ", "ಹಸಿರು", "ನೀಲಿ", "ಗುಲಾಬಿ", "ಕಿತ್ತಳೆ"]
    };
    const colors = colorsMap[lang] || colorsMap.en;
    
    const negativeMap: any = {
        en: "Avoid stress and haste today.", hi: "तनाव और जल्दबाजी से बचें।", mr: "तणाव आणि घाई टाळा.", gu: "તણાવ અને ઉતાવળ ટાળો.",
        bn: "চাপ এবং তাড়াহুড়ো এড়িয়ে চলুন।", ta: "மன அழுத்தம் மற்றும் அவசரத்தை தவிர்க்கவும்.", te: "ఒత్తిడి మరియు తొందరపాటును నివారించండి.", kn: "ಒತ್ತಡ ಮತ್ತು ಆತುರವನ್ನು ತಪ್ಪಿಸಿ."
    };

    return {
        positive: pick(dataLang.personal),
        negative: negativeMap[lang] || negativeMap.en,
        career: pick(dataLang.career),
        health: pick(dataLang.health),
        love: pick(dataLang.love),
        luckyNumber: Math.floor(rand * 9) + 1,
        luckyColor: pick(colors),
        labels: {
            color: lang === 'hi' ? "शुभ रंग" : lang === 'mr' ? "शुभ रंग" : lang === 'gu' ? "શુભ રંગ" : lang === 'bn' ? "শুভ রঙ" : lang === 'ta' ? "அதிர்ஷ்ட நிறம்" : lang === 'te' ? "అదృష్ట రంగు" : lang === 'kn' ? "ಅದೃಷ್ಟ ಬಣ್ಣ" : "Lucky Color",
            number: lang === 'hi' ? "शुभ अंक" : lang === 'mr' ? "शुभ अंक" : lang === 'gu' ? "શુભ અંક" : lang === 'bn' ? "শুভ সংখ্যা" : lang === 'ta' ? "அதிர்ஷ்ட எண்" : lang === 'te' ? "అదృష్ట సంఖ్య" : lang === 'kn' ? "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ" : "Lucky Number"
        },
        transitInfo
    };
};

const _INTL: any = {
    en: {
        manglikBalanced: "Both are Manglik, so the dosha is balanced.",
        noCancellation: "No specific cancellation found.",
        soulBond: "Planetary alignment in Navamsa indicates a soul-level connection.",
        marriageYoga: "Strong marriage yoga within the next 18 to 24 months.",
        happinessForecast: "Coming years will be full of happiness, prosperity, and mutual support.",
        patienceForecast: "Patience and mutual understanding will be required for stability.",
        remedyVishnu: "Worship Lord Vishnu on Thursdays.",
        remedyDonate: "Donate yellow clothes to the needy.",
        excellent: "Excellent match! High mental and emotional understanding.",
        good: "Good match. Solid foundation for marriage.",
        average: "Average match. Adjustments required.",
        bad: "Low compatibility. Differences likely.",
        manglikIssue: "Manglik mismatch. Professional consultation advised.",
        manglikOkay: "Manglik balanced.",
        conclusionGood: "Marriage recommended.",
        conclusionCaution: "Marriage recommended with remedies.",
        conclusionBad: "Marriage not recommended without remedies.",
        strong: "Strong", sensitive: "Sensitive", compatible: "Compatible",
        prosperous: "Prosperous", balanced: "Balanced", auspicious: "Auspicious",
        varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", maitri: "Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi"
    },
    hi: {
        manglikBalanced: "दोनों मांगलिक हैं, इसलिए दोष संतुलित हो जाता है।",
        noCancellation: "कोई विशेष रद्दीकरण नहीं पाया गया।",
        soulBond: "नवांश कुंडली में ग्रहों का तालमेल आत्मिक जुड़ाव का संकेत देता है।",
        marriageYoga: "अगले १८ से २४ महीनों के भीतर विवाह के प्रबल योग हैं।",
        happinessForecast: "आने वाले वर्ष सुख, समृद्धि और आपसी सहयोग से भरपूर रहेंगे।",
        patienceForecast: "स्थिरता के लिए धैर्य और आपसी समझ की आवश्यकता होगी।",
        remedyVishnu: "गुरुवार को भगवान विष्णु की पूजा करें।",
        remedyDonate: "जरूरतमंदों को पीले वस्त्र दान करें।",
        excellent: "उत्कृष्ट मिलान! उच्च मानसिक और भावनात्मक समझ।",
        good: "अच्छा मिलान। विवाह के लिए ठोस आधार।",
        average: "औसत मिलान। समायोजन की आवश्यकता।",
        bad: "कम अनुकूलता। मतभेद होने की संभावना।",
        manglikIssue: "मांगलिक असंगति। पेशेवर परामर्श की सलाह दी जाती है।",
        manglikOkay: "मांगलिक संतुलित।",
        conclusionGood: "विवाह की सिफारिश की जाती है।",
        conclusionCaution: "उपायों के साथ विवाह की सिफारिश की जाती है।",
        conclusionBad: "उपायों के बिना विवाह की सिफारिश नहीं की जाती है।",
        strong: "मजबूत", sensitive: "संवेदनशील", compatible: "अनुकूल",
        prosperous: "समृद्ध", balanced: "संतुलित", auspicious: "शुभ",
        varna: "वर्ण", vashya: "वश्य", tara: "तारा", yoni: "योनि", maitri: "मैत्री", gana: "गण", bhakoot: "भकूट", nadi: "नाड़ी"
    },
    mr: {
        manglikBalanced: "दोघेही मांगलिक आहेत, त्यामुळे दोष संतुलित होतो.",
        noCancellation: "कोणताही विशेष रद्दबातल आढळला नाही.",
        soulBond: "नवांश कुंडलीतील ग्रहांची स्थिती आत्मिक बंध दर्शवते.",
        marriageYoga: "पुढील १८ ते २४ महिन्यांत विवाहाचे प्रबळ योग आहेत.",
        happinessForecast: "येणारी वर्षे सुख, समृद्धी आणि परस्पर सहकार्याने भरलेली असतील.",
        patienceForecast: "स्थिरतेसाठी संयम आणि परस्पर सामंजस्याची आवश्यकता असेल.",
        remedyVishnu: "गुरुवारी भगवान विष्णूची पूजा करा.",
        remedyDonate: "गरजूूंना पिवळे वस्त्र दान करा.",
        excellent: "उत्कृष्ट मिलन! उच्च मानसिक आणि भावनिक समज.",
        good: "चांगले मिलन. विवाहासाठी भक्कम पाया.",
        average: "सरासरी मिलन. तडजोड आवश्यक आहे.",
        bad: "कमी सुसंगतता. मतभेद होण्याची शक्यता.",
        manglikIssue: "मांगलिक विसंगती. तज्ञांचा सल्ला घ्यावा.",
        manglikOkay: "मांगलिक संतुलित.",
        conclusionGood: "विवाहासाठी शिफारस केली जाते.",
        conclusionCaution: "उपाययोजनांसह विवाहाची शिफारस केली जाते.",
        conclusionBad: "उपाययोजनांशिवाय विवाहाची शिफारस केली जात नाही.",
        strong: "मजबूत", sensitive: "संवेदनशील", compatible: "अनुकूल",
        prosperous: "समृद्ध", balanced: "संतुलित", auspicious: "शुभ",
        varna: "वर्ण", vashya: "वश्य", tara: "तारा", yoni: "योनी", maitri: "मैत्री", gana: "गण", bhakoot: "भकूट", nadi: "नाडी"
    },
    bn: {
        manglikBalanced: "উভয়ই মাঙ্গলিক, তাই দোষ সুষম হয়।",
        noCancellation: "কোন বিশেষ বাতিল পাওয়া যায়নি।",
        soulBond: "নবাংশ কুণ্ডলীতে গ্রহের অবস্থান আত্মিক বন্ধন নির্দেশ করে।",
        marriageYoga: "আগামী ১৮ থেকে ২৪ মাসের মধ্যে বিবাহের প্রবল যোগ রয়েছে।",
        happinessForecast: "আগামী বছরগুলি সুখ, সমৃদ্ধি এবং পারস্পরিক সহযোগিতায় পূর্ণ হবে।",
        patienceForecast: "স্থিতিশীলতার জন্য ধৈর্য এবং পারস্পরিক বোঝাপড়া প্রয়োজন হবে।",
        remedyVishnu: "বৃহস্পতিবার ভগবান বিষ্ণুর পূজা করুন।",
        remedyDonate: "অসহায়দের হলুদ বস্ত্র দান করুন।",
        excellent: "চমৎকার মিলন! উচ্চ মানসিক এবং আবেগীয় বোঝাপড়া।",
        good: "ভালো মিলন। বিবাহের জন্য মজবুত ভিত্তি।",
        average: "গড় মিলন। সমন্বয় প্রয়োজন।",
        bad: "কম সামঞ্জস্য। মতভেদের সম্ভাবনা।",
        manglikIssue: "মাঙ্গলিক অমিল। বিশেষজ্ঞের পরামর্শ নিন।",
        manglikOkay: "মাঙ্গলিক সুষম।",
        conclusionGood: "বিবাহের সুপারিশ করা হয়।",
        conclusionCaution: "প্রতিকার সহ বিবাহের সুপারিশ করা হয়।",
        conclusionBad: "প্রতিকার ছাড়া বিবাহের সুপারিশ করা হয় না।",
        strong: "শক্তিশালী", sensitive: "সংবেদনশীল", compatible: "সামঞ্জস্যপূর্ণ",
        prosperous: "সমৃদ্ধ", balanced: "ভারসাম্যপূর্ণ", auspicious: "শুভ",
        varna: "বর্ণ", vashya: "বশ্য", tara: "তারা", yoni: "যোনি", maitri: "মৈত্রী", gana: "গণ", bhakoot: "ভকুট", nadi: "নাড়ী"
    },
    gu: {
        manglikBalanced: "બંને માંગલિક છે, તેથી દોષ સંતુલિત થાય છે.",
        noCancellation: "કોઈ વિશેષ રદબાતલ મળ્યું નથી.",
        soulBond: "નવાંશ કુંડળીમાં ગ્રહોનું જોડાણ આત્મિક સંબંધ સૂચવે છે.",
        marriageYoga: "આગામી 18 થી 24 મહિનામાં લગ્નના પ્રબળ યોગ છે.",
        happinessForecast: "આવનારા વર્ષો સુખ, સમૃદ્ધિ અને પરસ્પર સહયોગથી ભરેલા રહેશે.",
        patienceForecast: "સ્થિરતા માટે ધીરજ અને પરસ્પર સમજણની જરૂર પડશે.",
        remedyVishnu: "ગુરુવારે ભગવાન વિષ્ણુની પૂજા કરો.",
        remedyDonate: "જરૂરિયાતમંદોને પીળા વસ્ત્રો દાન કરો.",
        excellent: "ઉત્તમ મેળાપ! ઉચ્ચ માનસિક અને ભાવનાત્મક સમજ.",
        good: "સારો મેળાપ. લગ્ન માટે મજબૂત પાયો.",
        average: "સાધારણ મેળાપ. સમાયોજન જરૂરી છે.",
        bad: "ઓછી સુસંગતતા. મતભેદની શક્યતા.",
        manglikIssue: "માંગલિક અસંગતતા. નિષ્ણાતની સલાહ લેવી.",
        manglikOkay: "માંગલિક સંતુલિત.",
        conclusionGood: "લગ્નની ભલામણ કરવામાં આવે છે.",
        conclusionCaution: "ઉપાયો સાથે લગ્નની ભલામણ કરવામાં આવે છે.",
        conclusionBad: "ઉપાયો વગર લગ્નની ભલામણ કરવામાં આવતી નથી.",
        strong: "મજબૂત", sensitive: "સંવેદનશીલ", compatible: "અનુકૂળ",
        prosperous: "સમૃદ્ધ", balanced: "સંતુલિત", auspicious: "શુભ",
        varna: "વર્ણ", vashya: "વશ્ય", tara: "તારા", yoni: "યોનિ", maitri: "મૈત્રી", gana: "ગણ", bhakoot: "ભકૂટ", nadi: "નાડી"
    },
    kn: {
        manglikBalanced: "ಇಬ್ಬರೂ ಮಾಂಗ್ಲಿಕ್ ಆಗಿರುವುದರಿಂದ ದೋಷವು ಸಮತೋಲನಗೊಳ್ಳುತ್ತದೆ.",
        noCancellation: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ರದ್ದತಿ ಕಂಡುಬಂದಿಲ್ಲ.",
        soulBond: "ನವಾಂಶ ಕುಂಡಲಿಯಲ್ಲಿನ ಗ್ರಹಗಳ ಜೋಡಣೆಯು ಆತ್ಮದ ಮಟ್ಟದ ಸಂಬಂಧವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        marriageYoga: "ಮುಂದಿನ 18 ರಿಂದ 24 ತಿಂಗಳುಗಳಲ್ಲಿ ಬಲವಾದ ವಿವಾಹ ಯೋಗವಿದೆ.",
        happinessForecast: "ಬರುವ ವರ್ಷಗಳು ಸಂತೋಷ, ಸಮೃದ್ಧಿ ಮತ್ತು ಪರಸ್ಪರ ಸಹಕಾರದಿಂದ ಕೂಡಿರುತ್ತವೆ.",
        patienceForecast: "ಸ್ಥಿರತೆಗಾಗಿ ತಾಳ್ಮೆ ಮತ್ತು ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಅಗತ್ಯವಿರುತ್ತದೆ.",
        remedyVishnu: "ಗುರುವಾರ ಭಗವಾನ್ ವಿಷ್ಣುವನ್ನು ಪೂಜಿಸಿ.",
        remedyDonate: "ಅಗತ್ಯವಿರುವವರಿಗೆ ಹಳದಿ ಬಟ್ಟೆಗಳನ್ನು ದಾನ ಮಾಡಿ.",
        excellent: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ! ಹೆಚ್ಚಿನ ಮಾನಸಿಕ ಮತ್ತು ಭಾವನಾತ್ಮಕ ತಿಳುವಳಿಕೆ.",
        good: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ. ವಿವಾಹಕ್ಕೆ ಭದ್ರ ಬುನಾದಿ.",
        average: "ಸರಾಸರಿ ಹೊಂದಾಣಿಕೆ. ಹೊಂದಾಣಿಕೆ ಅಗತ್ಯವಿದೆ.",
        bad: "ಕಡಿಮೆ ಹೊಂದಾಣಿಕೆ. ಭಿನ್ನಾಭಿಪ್ರಾಯ ಸಾಧ್ಯತೆ.",
        manglikIssue: "ಮಾಂಗ್ಲಿಕ್ ಅಸಮತೋಲನ. ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
        manglikOkay: "ಮಾಂಗ್ಲಿಕ್ ಸಮತೋಲನ.",
        conclusionGood: "ವಿವಾಹಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
        conclusionCaution: "ಪರಿಹಾರಗಳೊಂದಿಗೆ ವಿವಾಹಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
        conclusionBad: "ಪರಿಹಾರಗಳಿಲ್ಲದೆ ವಿವಾಹವನ್ನು ಶಿಫಾರಸು ಮಾಡುವುದಿಲ್ಲ.",
        strong: "ಬಲವಾದ", sensitive: "ಸೂಕ್ಷ್ಮ", compatible: "ಹೊಂದಾಣಿಕೆಯ",
        prosperous: "ಸಮೃದ್ಧ", balanced: "ಸಮತೋಲಿತ", auspicious: "ಶುಭ",
        varna: "ವರ್ಣ", vashya: "ವಶ್ಯ", tara: "ತಾರಾ", yoni: "ಯೋನಿ", maitri: "ಮೈತ್ರಿ", gana: "ಗಣ", bhakoot: "ಭಕೂಟ", nadi: "ನಾಡಿ"
    },
    ta: {
        manglikBalanced: "இருவரும் மாங்லிக் என்பதால் தோஷம் சமமாகிறது.",
        noCancellation: "குறிப்பிட்ட ரத்து எதுவும் காணப்படவில்லை.",
        soulBond: "நவாம்ச ஜாதகத்தில் கிரகங்களின் சீரமைப்பு ஆத்மார்த்தமான தொடர்பைக் குறிக்கிறது.",
        marriageYoga: "அடுத்த 18 முதல் 24 மாதங்களுக்குள் பலமான திருமண யோகம் உள்ளது.",
        happinessForecast: "வரும் ஆண்டுகள் மகிழ்ச்சಿ, செழிப்பு மற்றும் பரஸ்பர ஒத்துழைப்புடன் இருக்கும்.",
        patienceForecast: "ஸ்திரத்தன்மைக்கு பொறுமை மற்றும் பரஸ்பர புரிதல் தேவைப்படும்.",
        remedyVishnu: "வியாழக்கிழமைகளில் விஷ்ணு பகவானை வழிபடவும்.",
        remedyDonate: "தேவையுள்ளவர்களுக்கு மஞ்சள் நிற ஆடைகளை தானம் செய்யவும்.",
        excellent: "சிறந்த பொருத்தம்! அதிக மன மற்றும் உணர்ச்சி ரீதியான புரிதல்.",
        good: "நல்ல பொருத்தம். திருமணத்திற்கு வலுவான அடித்தளம்.",
        average: "சராசரி பொருத்தம். சில மாற்றங்கள் தேவைப்படலாம்.",
        bad: "குறைந்த பொருத்தம். கருத்து வேறுபாடுகள் ஏற்பட வாய்ப்பு.",
        manglikIssue: "மாங்லிக் பொருத்தமின்மை. நிபுணரின் ஆலோசனை பெறவும்.",
        manglikOkay: "மாங்லிக் சமநிலை.",
        conclusionGood: "திருமணம் செய்ய பரிந்துரைக்கப்படுகிறது.",
        conclusionCaution: "பரிகாரங்களுடன் திருமணம் செய்ய பரிந்துரைக்கப்படுகிறது.",
        conclusionBad: "பரிகாரங்கள் இன்றி திருமணம் செய்ய பரிந்துரைக்கப்படவில்லை.",
        strong: "வலிமையான", sensitive: "உணர்ச்சிவசப்படக்கூடிய", compatible: "பொருத்தமான",
        prosperous: "செழிப்பான", balanced: "சமநிலையான", auspicious: "சுப",
        varna: "வர்ணம்", vashya: "வசியம்", tara: "தாரா", yoni: "யோனி", maitri: "மைத்ரி", gana: "கணம்", bhakoot: "பகூட்", nadi: "நாடி"
    },
    te: {
        manglikBalanced: "ఇద్దరూ మాంగ్లిక్ అయినందున దోషం సమతుల్యం అవుతుంది.",
        noCancellation: "ఎటువంటి ప్రత్యేక రద్దు కనుగొనబడలేదు.",
        soulBond: "నవాంశ చక్రంలో గ్రహాల అమరిక ఆత్మ స్థాయి అనుబంధాన్ని సూచిస్తుంది.",
        marriageYoga: "ಮುಂದಿನ 18 ರಿಂದ 24 ತಿಂಗಳಲ್ಲಿ బలమైన వివాహ యోగం ఉంది.",
        happinessForecast: "రాబోయే సంవత్సరాలు సంతోషం, శ్రేయస్సు మరియు పరస్పర సహకారంతో నిండి ఉంటాయి.",
        patienceForecast: "స్థిరత్వం కోసం ఓపిక మరియు పరస్పర అవగాహన అవసరం.",
        remedyVishnu: "గురువారాల్లో విష్ణుమూర్తిని పూజించండి.",
        remedyDonate: "అవసరమైన వారికి పసుపు బట్టలు దానం చేయండి.",
        excellent: "అద్భుతమైన జత! అధిక మానసిక మరియు భావోద్వేగ అవగాహన.",
        good: "మంచి జత. వివాహానికి బలమైన పునాది.",
        average: "సగటు జత. సర్దుబాట్లు అవసరం.",
        bad: "తక్కువ అనుకూలత. భేదాభిప్రాయాలు వచ్చే అవకాశం ఉంది.",
        manglikIssue: "మాంగ్లిక్ అసమతుల్యత. నిపుణుడిని సంప్రదించండి.",
        manglikOkay: "మాంగ్లిక్ సమతుల్యం.",
        conclusionGood: "వివాహం సిఫార్సు చేయబడింది.",
        conclusionCaution: "పరిష్కారాలతో వివాహం సిఫార్సు చేయబడింది.",
        conclusionBad: "పరిష్కారాలు లేకుండా వివాహం సిఫార్సు చేయబడదు.",
        strong: "బలమైన", sensitive: "సున్నితమైన", compatible: "అనుకూలమైన",
        prosperous: "సంపన్నమైన", balanced: "సమతుల్యమైన", auspicious: "శుభ",
        varna: "వర్ణ", vashya: "వశ్య", tara: "తార", yoni: "యోని", maitri: "మైత్రి", gana: "గణ", bhakoot: "భకూట", nadi: "నాడి"
    }
};

const _get = (lang: string, key: string) => {
    const l = _INTL[lang] || _INTL.en;
    return l[key] || _INTL.en[key] || key;
};

export const analyzeManglikCancellation = (boy: any, girl: any, lang: string = 'en') => {
    const hasBoy = boy?.doshas?.Manglik?.present || false;
    const hasGirl = girl?.doshas?.Manglik?.present || false;
    if (hasBoy && hasGirl) return _get(lang, "manglikBalanced");
    return _get(lang, "noCancellation");
};

export const analyzeNavamsaBond = (boy: any, girl: any, lang: string = 'en') => {
    return _get(lang, "soulBond");
};

export const calculateLikelyMarriagePeriod = (boy: any, girl: any, lang: string = 'en') => {
    const currentYear = new Date().getFullYear();
    if (lang === 'hi') {
        return `वर्तमान ग्रहों की स्थिति और गोचर (विशेष रूप से बृहस्पति के राशि गोचर) के अनुसार, वर्ष ${currentYear} के मध्य से वर्ष ${currentYear + 1} के अंत के बीच विवाह के अत्यधिक प्रबल और शुभ योग बन रहे हैं।`;
    }
    return `According to current planetary transits (particularly Jupiter's auspicious alignment), highly favorable marriage yogas are forming between the middle of ${currentYear} and the end of ${currentYear + 1}.`;
};

export const generateLifeForecastSummary = (score: number, lang: string = 'en') => {
    if (score >= 25) return _get(lang, "happinessForecast");
    return _get(lang, "patienceForecast");
};

export const getContextualRemedies = (result: any, lang: string = 'en') => {
    return [
        _get(lang, "remedyVishnu"),
        _get(lang, "remedyDonate")
    ];
};

export function generateMatchVerdict(score: number, boyManglik: boolean, girlManglik: boolean, lang: string) {
    const isManglikMatch = (boyManglik === girlManglik);
    
    let res = (score >= 28 ? _get(lang, "excellent") : score >= 18 ? _get(lang, "good") : score >= 10 ? _get(lang, "average") : _get(lang, "bad"));
    res += " " + (isManglikMatch ? _get(lang, "manglikOkay") : _get(lang, "manglikIssue"));
    res += " " + (score >= 18 ? (isManglikMatch ? _get(lang, "conclusionGood") : _get(lang, "conclusionCaution")) : _get(lang, "conclusionBad"));
    return res;
}

export const generateDetailedMatchingReport = (result: any, lang: string = "en") => {
    if (!result || !result.milan) return null;
    const score = result.milan.totalScore || 0;
    const boyData = result.boy;
    const girlData = result.girl;
    const ash = result.milan.ashtakoot || {};

    const l = (key: string) => _get(lang, key);

    return {
        marriage: { title: l("labels_life_predictions_Marriage") || (lang === 'hi' ? "विवाह अनुकूलता" : "Marriage Compatibility"), rating: score >= 24 ? l("excellent") : l("good"), verdict: score >= 24 ? l("marriageYoga") : l("good") },
        nature: { title: l("labels_life_predictions_Nature") || (lang === 'hi' ? "प्रकृति और स्वभाव" : "Nature & Temperament"), verdict: (ash.gana?.score || 0) >= 5 ? l("excellent") : l("average") },
        family: { title: l("labels_life_predictions_Family") || (lang === 'hi' ? "परिवार और संतान" : "Family & Children"), verdict: (ash.nadi?.score || 0) === 8 ? l("excellent") : l("average") },
        finance: { title: l("labels_life_predictions_Wealth") || (lang === 'hi' ? "धन और समृद्धि" : "Wealth & Prosperity"), verdict: (ash.bhakoot?.score || 0) === 7 ? l("prosperous") : l("average") },
        bond: { title: l("labels_life_predictions_Spirituality") || (lang === 'hi' ? "नवांश तालमेल" : "Navamsa Synergy"), verdict: analyzeNavamsaBond(boyData, girlData, lang) },
        timing: { title: l("marriageYoga") || (lang === 'hi' ? "विवाह समय" : "Marriage Timing"), verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang) },
        forecast: { title: l("labels_life_predictions_Forecast") || (lang === 'hi' ? "जीवन पूर्वानुमान" : "Life Forecast"), verdict: generateLifeForecastSummary(score, lang) },
        remedies: { title: l("labels_life_predictions_Remedies") || (lang === 'hi' ? "उपाय" : "Remedies"), list: getContextualRemedies(result, lang) },
        summary: { verdict: score >= 18 ? l("conclusionGood") : l("conclusionCaution"), confidence: 60 + score, nextSteps: score >= 24 ? l("auspicious") : l("remedyVishnu") }
    };
};

export const calculateDynamicMarriagePeriods = (result: any, score: number, lang: string = 'en') => {
    const currentYear = new Date().getFullYear();
    const isHindi = lang === 'hi';
    
    // Check if there is Manglik mismatch
    const boyManglik = result.boy?.doshas?.Manglik?.present || result.is_manglik_boy || false;
    const girlManglik = result.girl?.doshas?.Manglik?.present || result.is_manglik_girl || false;
    const manglikMismatch = boyManglik !== girlManglik;
    
    // Check if there is Nadi or Bhakoot Dosha
    const ash = result.milan?.ashtakoot || result.ashtakoot || {};
    const nadiScore = ash.nadi?.score ?? 8;
    const bhakootScore = ash.bhakoot?.score ?? 7;
    const hasSevereDosha = nadiScore === 0 || bhakootScore === 0;

    let p1_time = "";
    let p1_strength = "";
    let p2_time = "";
    let p2_strength = "";
    let p3_time = "";
    let p3_strength = "";

    if (isHindi) {
        if (manglikMismatch) {
            p1_time = `जून ${currentYear} - दिसंबर ${currentYear}`;
            p1_strength = "सामान्य (उपाय आवश्यक)";
            p2_time = `जनवरी ${currentYear + 1} - जून ${currentYear + 1}`;
            p2_strength = "मध्यम (पूजा के बाद)";
            p3_time = `जुलाई ${currentYear + 1} - दिसंबर ${currentYear + 1}`;
            p3_strength = "उच्च अनुकूलता";
        } else if (hasSevereDosha) {
            p1_time = `जून ${currentYear} - दिसंबर ${currentYear}`;
            p1_strength = "मध्यम (नाड़ी/भकूट शांति आवश्यक)";
            p2_time = `जनवरी ${currentYear + 1} - जून ${currentYear + 1}`;
            p2_strength = "उच्च (दोष निवारण पश्चात)";
            p3_time = `जुलाई ${currentYear + 1} - दिसंबर ${currentYear + 1}`;
            p3_strength = "अति उच्च";
        } else if (score >= 28) {
            p1_time = `जून ${currentYear} - दिसंबर ${currentYear}`;
            p1_strength = "अति उच्च (सर्वोत्तम समय)";
            p2_time = `जनवरी ${currentYear + 1} - जून ${currentYear + 1}`;
            p2_strength = "उच्च";
            p3_time = `जुलाई ${currentYear + 1} - दिसंबर ${currentYear + 1}`;
            p3_strength = "मध्यम";
        } else {
            p1_time = `जून ${currentYear} - दिसंबर ${currentYear}`;
            p1_strength = "उच्च";
            p2_time = `जनवरी ${currentYear + 1} - जून ${currentYear + 1}`;
            p2_strength = "अति उच्च (अनुकूल बृहस्पति गोचर)";
            p3_time = `जुलाई ${currentYear + 1} - दिसंबर ${currentYear + 1}`;
            p3_strength = "उच्च";
        }
    } else {
        if (manglikMismatch) {
            p1_time = `June ${currentYear} - Dec ${currentYear}`;
            p1_strength = "Moderate (Remedies Required)";
            p2_time = `Jan ${currentYear + 1} - June ${currentYear + 1}`;
            p2_strength = "High (Post Puja)";
            p3_time = `July ${currentYear + 1} - Dec ${currentYear + 1}`;
            p3_strength = "Very High Compatibility";
        } else if (hasSevereDosha) {
            p1_time = `June ${currentYear} - Dec ${currentYear}`;
            p1_strength = "Moderate (Nadi/Bhakoot Shanti required)";
            p2_time = `Jan ${currentYear + 1} - June ${currentYear + 1}`;
            p2_strength = "High (Post Rectification)";
            p3_time = `July ${currentYear + 1} - Dec ${currentYear + 1}`;
            p3_strength = "Very High";
        } else if (score >= 28) {
            p1_time = `June ${currentYear} - Dec ${currentYear}`;
            p1_strength = "Very High (Highly Auspicious)";
            p2_time = `Jan ${currentYear + 1} - June ${currentYear + 1}`;
            p2_strength = "High";
            p3_time = `July ${currentYear + 1} - Dec ${currentYear + 1}`;
            p3_strength = "Moderate";
        } else {
            p1_time = `June ${currentYear} - Dec ${currentYear}`;
            p1_strength = "High";
            p2_time = `Jan ${currentYear + 1} - June ${currentYear + 1}`;
            p2_strength = "Very High (Favorable Jupiter Transit)";
            p3_time = `July ${currentYear + 1} - Dec ${currentYear + 1}`;
            p3_strength = "High";
        }
    }

    return [
        { time: p1_time, strength: p1_strength },
        { time: p2_time, strength: p2_strength },
        { time: p3_time, strength: p3_strength }
    ];
};

export const generateFullMatchAnalysis = (result: any, lang: string = "en") => {
    if (!result || !result.boy || !result.girl || !result.milan) return null;

    const score = result.milan.totalScore || 0;
    const l = (key: string) => _get(lang, key);
    
    // Safely extract ashtakoot scores
    const ash = result.milan.ashtakoot || {};
    const getAsh = (key: string) => ({
        score: ash[key]?.score || 0,
        interpretation: ash[key]?.interpretation || ""
    });

    const table = [
        { name: l("varna"), max: 1, got: getAsh('varna').score, interp: getAsh('varna').interpretation },
        { name: l("vashya"), max: 2, got: getAsh('vashya').score, interp: getAsh('vashya').interpretation },
        { name: l("tara"), max: 3, got: getAsh('tara').score, interp: getAsh('tara').interpretation },
        { name: l("yoni"), max: 4, got: getAsh('yoni').score, interp: getAsh('yoni').interpretation },
        { name: l("maitri"), max: 5, got: getAsh('maitri').score, interp: getAsh('maitri').interpretation },
        { name: l("gana"), max: 6, got: getAsh('gana').score, interp: getAsh('gana').interpretation },
        { name: l("bhakoot"), max: 7, got: getAsh('bhakoot').score, interp: getAsh('bhakoot').interpretation },
        { name: l("nadi"), max: 8, got: getAsh('nadi').score, interp: getAsh('nadi').interpretation },
    ];

    return {
        section1: {
            groom: { 
                name: result.boy.name || "Groom", 
                dob: result.boy.dob || "", 
                tob: result.boy.tob || "", 
                pob: result.boy.pob || "", 
                rashi: result.boy.moonSign || "", 
                nakshatra: result.boy.nakshatra || "", 
                lagna: result.boy.ascendant || ""
            },
            bride: { 
                name: result.girl.name || "Bride", 
                dob: result.girl.dob || "", 
                tob: result.girl.tob || "", 
                pob: result.girl.pob || "", 
                rashi: result.girl.moonSign || "", 
                nakshatra: result.girl.nakshatra || "", 
                lagna: result.girl.ascendant || ""
            }
        },
        section2: {
            emotional: (ash.maitri?.score || 0) >= 3 ? l("strong") : l("sensitive"),
            physical: (ash.yoni?.score || 0) >= 2 ? l("compatible") : "Average",
            financial: ash.bhakoot?.score === 7 ? l("prosperous") : l("balanced"),
            longevity: ash.nadi?.score === 8 ? "Excellent" : "Caution",
            family: (ash.gana?.score || 0) >= 4 ? "Harmonious" : "Adjustable",
            quality: score >= 28 ? l("excellent") : score >= 18 ? l("auspicious") : "Average",
            recommendation: score >= 18 ? "Recommended" : "Consult Expert"
        },
        section3: { table },
        section4: {
            groomTraits: ["Confident", "Ambitious", "Reliable"],
            brideTraits: ["Intelligent", "Compassionate", "Creative"]
        },
        section7: {
            boyStatus: result.boy.doshas?.Manglik?.present ? l("manglik") : "Non-Manglik",
            girlStatus: result.girl.doshas?.Manglik?.present ? l("manglik") : "Non-Manglik",
            verdict: analyzeManglikCancellation(result.boy, result.girl, lang)
        },
        section14: {
            periods: calculateDynamicMarriagePeriods(result, score, lang)
        },
        section15: {
            boyRemedies: getContextualRemedies(result, lang),
            girlRemedies: getContextualRemedies(result, lang)
        },
        finalVerdict: {
            recommendation: generateMatchVerdict(score, result.boy.doshas?.Manglik?.present || false, result.girl.doshas?.Manglik?.present || false, lang)
        }
    };
};

/** 
 * NEW: Detailed Kundli Analysis Logic 
 */

export const generateAvakahadaChakra = (chart: any, lang: string = 'en') => {
    // This extracts essential birth attributes from the chart data
    const p = chart.planets?.find((p: any) => p.name === 'Moon') || {};
    return {
        varna: p.varna || "Brahmin",
        vashya: p.vashya || "Jalchar",
        tara: p.tara || "Janma",
        yoni: p.yoni || "Gaja",
        rashish: p.rashish || "Jupiter",
        gana: p.gana || "Deva",
        bhakoot: p.bhakoot || "Meena",
        nadi: p.nadi || "Antya"
    };
};

export const generateLifePredictions = (chart: any, lang: string = 'en') => {
    if (!chart || !chart.planets) {
        return {
            Career: "Your career path is influenced by the 10th house and its lord. A strong Sun or Saturn indicates authority and government roles.",
            Health: "The 6th house governs acute illnesses, while the 8th house rules chronic conditions.",
            Marriage: "The 7th house and its lord define your marital life. Venus is the significator for men, and Jupiter for women.",
            Wealth: "Your financial status is determined by the 2nd house and the 11th house.",
            Education: "The 4th house rules primary education, and the 5th house rules intelligence and higher learning."
        };
    }

    const isHi = lang === 'hi';
    const signsEn = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const signsHi = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

    const ascSign = chart.ascendantSign || "Aries";
    const ascIdx = signsEn.indexOf(ascSign) >= 0 ? signsEn.indexOf(ascSign) : 0;
    const lagnaLabel = isHi ? signsHi[ascIdx] : signsEn[ascIdx];

    const sign10Idx = (ascIdx + 9) % 12;
    const sign10Label = isHi ? signsHi[sign10Idx] : signsEn[sign10Idx];

    const getPlanetsInHouse = (houseNum: number) => {
        return chart.planets
            ?.filter((p: any) => p.house === houseNum && p.name !== 'Asc')
            .map((p: any) => {
                const planetNamesHi: Record<string, string> = {
                    "Sun": "सूर्य", "Moon": "चंद्रमा", "Mars": "मंगल", "Mercury": "बुध",
                    "Jupiter": "बृहस्पति (गुरु)", "Venus": "शुक्र", "Saturn": "शनि",
                    "Rahu": "राहु", "Ketu": "केतु"
                };
                return isHi ? (planetNamesHi[p.name] || p.name) : p.name;
            }) || [];
    };

    // 1. CAREER PREDICTION
    let career = "";
    const p10 = getPlanetsInHouse(10);
    if (isHi) {
        career = `आपकी जन्म कुंडली में लग्न **${lagnaLabel}** है और दशम (करियर) भाव **${sign10Label}** राशि में स्थित है। `;
        if (p10.length > 0) {
            const listStr = p10.join(", ");
            if (p10.some(p => p.includes("सूर्य") || p.includes("मंगल"))) {
                career += `दशम भाव में ${listStr} की उपस्थिति प्रशासनिक शक्ति, सरकारी सेवा, कानून प्रवर्तन या संगठन के नेतृत्व क्षेत्र में असाधारण सफलता का संकेत देती है। आपकी निर्णय क्षमता और नेतृत्व शैली बहुत मजबूत है, जो आपको समाज में उच्च पद दिलाएगी।`;
            } else if (p10.some(p => p.includes("बुध") || p.includes("शुक्र"))) {
                career += `दशम भाव में ${listStr} का प्रभाव व्यापार, वित्तीय प्रबंधन, कला, रचनात्मक मीडिया या संचार के क्षेत्र में उत्कृष्ट करियर का संकेत देता है। आप अपने कौशल, वाणी और तीक्ष्ण बुद्धि से उच्च प्रतिष्ठा और धन अर्जित करेंगे।`;
            } else if (p10.some(p => p.includes("बृहस्पति"))) {
                career += `दशम भाव में देवगुरु बृहस्पति की शुभ उपस्थिति दर्शाती है कि आप शिक्षण, परामर्श, कानून, दर्शन या उच्च सलाहकार (Advisory) के रूप में एक अत्यंत सम्मानित और प्रतिष्ठित करियर प्राप्त करेंगे। लोग आपके ज्ञान का आदर करेंगे।`;
            } else {
                career += `दशम भाव में ${listStr} का गोचर/स्थान तकनीकी क्षेत्रों, आईटी, इंजीनियरिंग, या गहन अनुसंधान में प्रगति कराता है। करियर की शुरुआत में कुछ संघर्ष के बाद आप निरंतर सफलता की ओर अग्रसर रहेंगे।`;
            }
        } else {
            career += `दशम भाव में किसी क्रूर ग्रह का अशुभ प्रभाव नहीं है। दशमेश की स्थिति के अनुसार आपका करियर स्वतंत्र उद्यमों, पेशेवर स्थिरता और व्यावसायिक सूझबूझ की ओर सकारात्मक इशारा करता है। आप जीवन के मध्य में एक सफल अधिकारी या उद्यमी बनेंगे।`;
        }
    } else {
        career = `Your Lagna (Ascendant) is **${lagnaLabel}**, which places your 10th house of profession and career in the sign of **${sign10Label}**. `;
        if (p10.length > 0) {
            const listStr = p10.join(", ");
            if (p10.some(p => p.includes("Sun") || p.includes("Mars"))) {
                career += `The presence of ${listStr} in the 10th house is a highly powerful combination indicating administrative authority, government roles, leadership, or law enforcement. You possess executive decision-making skills that command respect.`;
            } else if (p10.some(p => p.includes("Mercury") || p.includes("Venus"))) {
                career += `The influence of ${listStr} in your house of profession indicates success in business, finance, creative arts, media, or communication. Your intellect, presentation skills, and commercial acumen will be the pillars of your professional rise.`;
            } else if (p10.some(p => p.includes("Jupiter"))) {
                career += `Jupiter transiting your 10th house promises an honorable career in education, consulting, legal affairs, mentorship, or high-level advisory positions. You will be looked up to as a figure of wisdom and integrity.`;
            } else {
                career += `The placement of ${listStr} in the 10th house points toward a career in technology, engineering, information systems, or deep research. While initial years may require intense hard work, you will secure high professional status in the long run.`;
            }
        } else {
            career += `With the 10th house free from major afflictions, the lord of your profession promises a stable, secure, and progressive career path. You are naturally geared toward leadership, independent consulting, or entrepreneurship as you mature.`;
        }
    }

    // 2. WEALTH PREDICTION
    let wealth = "";
    const p2 = getPlanetsInHouse(2);
    const p11 = getPlanetsInHouse(11);
    const wealthPlanets = [...p2, ...p11];
    if (isHi) {
        wealth = "द्वितीय भाव (संचित धन व परिवार) और एकादश भाव (आय व लाभ) आपके वित्तीय भाग्य को निर्धारित करते हैं। ";
        if (wealthPlanets.length > 0) {
            const listStr = wealthPlanets.join(", ");
            if (wealthPlanets.some(p => p.includes("बृहस्पति") || p.includes("शुक्र"))) {
                wealth += `आपकी कुंडली के धन/लाभ स्थान पर अत्यंत शुभ ग्रह (${listStr}) की उपस्थिति जीवन में निरंतर धन के प्रवाह, पैतृक संपत्ति के लाभ और वित्तीय विलासिता को दर्शाती है। आपका हाथ हमेशा तंग नहीं रहेगा और आप आरामदेह जीवन जीएंगे।`;
            } else if (wealthPlanets.some(p => p.includes("बुध") || p.includes("सूर्य"))) {
                wealth += `धन या आय भाव में ${listStr} का प्रभाव आपके व्यावसायिक कौशल, कुशल वाणी, कुशल वित्तीय निवेश और व्यापार के माध्यम से समृद्धि प्राप्त करने की आपकी अद्भुत क्षमता को दर्शाता है।`;
            } else {
                wealth += `इन भावों में ${listStr} की उपस्थिति संकेत देती है कि जीवन में धन संचय के लिए आपको अनुशासित प्रयास करने होंगे। शुरुआती जीवन में खर्चों पर नियंत्रण और समझदारी से किया गया दीर्घकालिक निवेश आपको बड़ी वित्तीय सुरक्षा प्रदान करेगा।`;
            }
        } else {
            wealth += "आपके धन और आय भाव के स्वामी अनुकूल स्थिति में हैं। जीवन के मध्यकाल (32 वर्ष की आयु) के बाद आपकी आर्थिक स्थिति में तेजी से सुधार होगा और आप स्थायी संपत्ति तथा वाहनों का सुख प्राप्त करेंगे।";
        }
    } else {
        wealth = "The 2nd house of accumulated assets and the 11th house of regular gains are the key indicators of your financial prosperity. ";
        if (wealthPlanets.length > 0) {
            const listStr = wealthPlanets.join(", ");
            if (wealthPlanets.some(p => p.includes("Jupiter") || p.includes("Venus"))) {
                wealth += `A highly auspicious placement of benefic planets (${listStr}) in your money houses guarantees steady flow of income, financial comfort, and gains from investments or ancestral inheritance. You are bound to enjoy material luxuries in life.`;
            } else if (wealthPlanets.some(p => p.includes("Mercury") || p.includes("Sun"))) {
                wealth += `The influence of ${listStr} in these houses emphasizes that your speech, strategic investment choices, trade connections, and intellectual skills will be primary sources of your wealth generation.`;
            } else {
                wealth += `The presence of ${listStr} in your financial houses indicates that wealth building requires highly disciplined savings and realistic budgets. Avoid speculative risks and focus on long-term assets to enjoy solid financial security.`;
            }
        } else {
            wealth += "The lords of your wealth and income houses are well-placed. Your financial trajectory shows robust growth after the age of 30, paving the way for purchasing permanent properties, land, and vehicles.";
        }
    }

    // 3. HEALTH PREDICTION
    let health = "";
    const p6 = getPlanetsInHouse(6);
    const p8 = getPlanetsInHouse(8);
    const healthPlanets = [...p6, ...p8];
    const isSadeSati = chart.doshas?.SadeSati?.present || false;
    if (isHi) {
        health = "षष्ठ भाव तीव्र रोगों का और अष्टम भाव दीर्घायु व गूढ़ शारीरिक प्रवृत्तियों का प्रतिनिधित्व करता है। ";
        if (isSadeSati) {
            health += "वर्तमान में आपकी कुंडली में शनि की साढ़ेसाती सक्रिय है। जोड़ों के दर्द, मानसिक तनाव, थकान और हड्डियों के स्वास्थ्य के प्रति विशेष सावधानी बरतें। प्रतिदिन योग और प्राणायाम आपके लिए अत्यंत आवश्यक है। ";
        }
        if (healthPlanets.length > 0) {
            const listStr = healthPlanets.join(", ");
            health += `आपके स्वास्थ्य भावों में ${listStr} की उपस्थिति दर्शाती है कि आपको वात या पित्त असंतुलन, पाचन संबंधी संवेदनशीलता या मौसमी एलर्जी जैसी समस्याएं हो सकती हैं। संतुलित शाकाहारी भोजन और समय पर नींद लेने से आप इन पर विजय प्राप्त कर सकते हैं।`;
        } else {
            health += "आपका लग्नेश (Ascendant Lord) और छठे भाव का स्वामी बहुत मजबूत है, जो एक उत्कृष्ट रोग प्रतिरोधक क्षमता (Immunity) और मजबूत जीवन शक्ति का संकेत देता है। आप शारीरिक और मानसिक रूप से मजबूत बने रहेंगे।";
        }
    } else {
        health = "The 6th house governs acute diseases and daily vitality, while the 8th house rules longevity, transformation, and chronic conditions. ";
        if (isSadeSati) {
            health += "You are currently under the astrological influence of Saturn's Sade Sati. Take extra care of your joint health, skeletal system, and avoid mental over-stress through meditation. ";
        }
        if (healthPlanets.length > 0) {
            const listStr = healthPlanets.join(", ");
            health += `With ${listStr} occupying your health houses, you are advised to maintain healthy dietary habits to avoid minor digestive issues, skin sensitivities, or fatigue. Regular physical exercise will act as a natural shield.`;
        } else {
            health += "Your Lagna Lord and the 6th lord hold strong positions, signifying excellent immunity, robust physical stamina, and the capacity to recover quickly from minor seasonal ailments.";
        }
    }

    // 4. MARRIAGE PREDICTION
    let marriage = "";
    const p7 = getPlanetsInHouse(7);
    const isManglik = chart.doshas?.Manglik?.present || false;
    if (isHi) {
        marriage = "सप्तम भाव और उसका अधिपति आपके दाम्पत्य जीवन, विवाह समय और साझेदारी की दिशा तय करते हैं। ";
        if (isManglik) {
            marriage += "चूँकि आपकी कुंडली में मांगलिक योग (Manglik Dosha) उपस्थित है, इसलिए विवाह में जल्दबाजी करने से बचें। कुंडली मिलान के उपरांत विवाह करना आपके लिए अत्यंत शुभ, सुखद और स्थाई दाम्पत्य जीवन सुनिश्चित करेगा। ";
        }
        if (p7.length > 0) {
            const listStr = p7.join(", ");
            marriage += `सप्तम भाव में ${listStr} की स्थिति दर्शाती है कि आपका जीवनसाथी बुद्धिमान, स्वतंत्र विचारों वाला और कर्तव्यनिष्ठ होगा। वैवाहिक जीवन में आदर और मधुर आपसी संवाद बनाए रखना रिश्ते को हमेशा मजबूत रखेगा।`;
        } else {
            marriage += "आपका सप्तम भाव संतुलित और शुभ प्रभावों में है। आपकी कुंडली के अनुसार, विवाह आपके जीवन में अपार भावनात्मक परिपक्वता, भाग्योदय और सामाजिक प्रतिष्ठा लेकर आएगा। आपका पार्टनर सहायक होगा।";
        }
    } else {
        marriage = "The 7th house and its planetary ruler define your marital compatibility, partnerships, and relationship dynamics. ";
        if (isManglik) {
            marriage += "Since Manglik Dosha is present in your chart, it is scripturally advised to perform proper Kundli matching before finalizing a marriage. This will guarantee immense marital harmony and prevent conflicts. ";
        }
        if (p7.length > 0) {
            const listStr = p7.join(", ");
            marriage += `The presence of ${listStr} in the 7th house suggests that your spouse will be an intelligent, highly responsible, and charismatic individual. Fostering transparent communication and mutual respect will keep your bond unbreakable.`;
        } else {
            marriage += "Your 7th house is highly stable and free from severe afflictions. Marriage will trigger a highly fortunate phase of life, bringing emotional security, prosperity, and a deeply cooperative life partner.";
        }
    }

    // 5. EDUCATION PREDICTION
    let education = "";
    const p4 = getPlanetsInHouse(4);
    const p5 = getPlanetsInHouse(5);
    const eduPlanets = [...p4, ...p5];
    if (isHi) {
        education = "चतुर्थ भाव प्राथमिक शिक्षा व बौद्धिक आधार का है, तथा पंचम भाव उच्च शिक्षा, बुद्धिमत्ता व रचनात्मक विवेक का स्थान है। ";
        if (eduPlanets.length > 0) {
            const listStr = eduPlanets.join(", ");
            if (eduPlanets.some(p => p.includes("बुध") || p.includes("बृहस्पति"))) {
                education += `इन भावों में शुभ ग्रह (${listStr}) की स्थिति आपकी तीव्र स्मरण शक्ति, अद्भुत सीखने की क्षमता और उत्कृष्ट अकादमिक रिकॉर्ड को दर्शाती है। आप अनुसंधान, कानून, परामर्श या शैक्षणिक क्षेत्रों में सर्वोच्च डिग्री प्राप्त कर सकते हैं।`;
            } else if (eduPlanets.some(p => p.includes("सूर्य") || p.includes("मंगल"))) {
                education += `शिक्षा भावों में ${listStr} का प्रभाव आपकी उत्कृष्ट तकनीकी समझ, गणितीय विश्लेषणात्मक कौशल और प्रतियोगी परीक्षाओं (Competitive Exams) में सफल होने के मजबूत इरादे को दर्शाता है।`;
            } else {
                education += `इन भावों में ${listStr} की उपस्थिति पढ़ाई में शुरुआती ध्यान भटकाव या विषय में बदलाव का संकेत देती है, लेकिन आपकी गहरी खोजी और व्यावहारिक प्रकृति आपको बाद के वर्षों में विशेषज्ञ बनाएगी।`;
            }
        } else {
            education += "आपकी कुंडली के अनुसार आपकी शिक्षा संतुलित और व्यावहारिक रहेगी। आपका दिमाग किताबी ज्ञान की तुलना में व्यावहारिक और वास्तविक अनुभवों से सीखने की ओर अधिक आकर्षित होता है, जो भविष्य में बहुत काम आएगा।";
        }
    } else {
        education = "The 4th house rules primary education and domestic peace, while the 5th house governs higher learning, memory, intelligence, and cognitive creativity. ";
        if (eduPlanets.length > 0) {
            const listStr = eduPlanets.join(", ");
            if (eduPlanets.some(p => p.includes("Mercury") || p.includes("Jupiter"))) {
                education += `The strong influence of benefic planets (${listStr}) indicates excellent memory retention, logical skills, and high academic performance. You are likely to pursue research, law, corporate advisory, or professional education.`;
            } else if (eduPlanets.some(p => p.includes("Sun") || p.includes("Mars"))) {
                education += `The presence of ${listStr} in your houses of education points toward strong technical aptitude, mathematical reasoning, and a powerful competitive spirit that ensures success in major examinations.`;
            } else {
                education += `The placement of ${listStr} indicates minor interruptions or changes in your subjects early on. However, your deep-seated practical intelligence and curiosity will enable you to gain supreme expertise in your chosen field later.`;
            }
        } else {
            education += "Your chart suggests a highly practical and standard academic path. You learn best through experiential and hands-on methods rather than rote memorization, which will serve you exceptionally well in your professional life.";
        }
    }

    return {
        Career: career,
        Wealth: wealth,
        Health: health,
        Marriage: marriage,
        Education: education
    };
};

export const generateDetailedKundliReport = (chart: any, lang: string = "en") => {
    if (!chart) return null;
    
    return {
        avakahada: generateAvakahadaChakra(chart, lang),
        planets: chart.planets.map((p: any) => ({
            ...p,
            status: p.longitude > 20 ? "Strong" : "Average", // Simplified logic
            isExalted: p.isExalted || false,
            isDebilitated: p.isDebilitated || false
        })),
        predictions: generateLifePredictions(chart, lang),
        doshas: chart.doshas,
        yogas: chart.yogas || [
            { name: "Gaja Kesari Yoga", description: "Presence of Jupiter in Kendra from Moon.", effects: "Success, fame, and wealth." }
        ],
        dasha: chart.dasha,
        ashtakvarga: chart.ashtakvarga || { sarva: [28, 30, 25, 32, 28, 27, 30, 22, 25, 28, 30, 28] }
    };
};
export const generateAIPredictions = generateLifePredictions;
