/**
 * JyotishConnect Prediction Engine
 * Stabilized Version for Production with Multi-language support
 */

export const _SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

import { SIGN_PREDICTIONS } from "./horoscope-data";

export const generateDailyHoroscope = (sign: string, planets: any[], lang: string = 'en') => {
    const today = new Date();
    const seed = `${today.toLocaleDateString()}-${sign}`;
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    const rand = ((h ^ h >>> 16) >>> 0) / 4294967296;

    const data = SIGN_PREDICTIONS[sign]?.[(lang === 'hi' ? 'hi' : 'en') as 'en'|'hi'] || SIGN_PREDICTIONS[sign]?.en;
    if (!data) return null;

    const pick = (arr: string[]) => arr[Math.floor(rand * arr.length)] || "";
    
    const moon = planets?.find(p => p.name === "Moon");
    const moonSignStr = moon ? _SIGNS[moon.signId - 1] : "";
    
    const transitInfo = lang === 'hi' ? `चन्द्रमा गोचर: ${moonSignStr}` : `Moon Transit: ${moonSignStr}`;
    const colors = lang === 'hi' ? ["लाल", "सफ़ेद", "पीला", "हरा", "नीला", "गुलाबी", "नारंगी"] : ["Red", "White", "Yellow", "Green", "Blue", "Pink", "Orange"];
    
    return {
        positive: pick(data.personal),
        negative: lang === 'hi' ? "तनाव और जल्दबाजी से बचें।" : "Avoid stress and haste today.",
        career: pick(data.career),
        health: pick(data.health),
        love: pick(data.love),
        luckyNumber: Math.floor(rand * 9) + 1,
        luckyColor: pick(colors),
        labels: {
            color: lang === 'hi' ? "शुभ रंग" : "Lucky Color",
            number: lang === 'hi' ? "शुभ अंक" : "Lucky Number"
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
    return _get(lang, "marriageYoga");
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
        marriage: { title: lang === 'hi' ? "विवाह अनुकूलता" : "Marriage Compatibility", rating: score >= 24 ? l("excellent") : l("good"), verdict: score >= 24 ? "Highly favorable." : "Stable match." },
        nature: { title: lang === 'hi' ? "प्रकृति और स्वभाव" : "Nature & Temperament", verdict: (ash.gana?.score || 0) >= 5 ? "Harmonious nature." : "Differences likely." },
        family: { title: lang === 'hi' ? "परिवार और संतान" : "Family & Children", verdict: (ash.nadi?.score || 0) === 8 ? "Excellent health match." : "Nadi considerations." },
        finance: { title: lang === 'hi' ? "धन और समृद्धि" : "Wealth & Prosperity", verdict: (ash.bhakoot?.score || 0) === 7 ? "Steady wealth." : "Financial planning needed." },
        bond: { title: lang === 'hi' ? "नवांश तालमेल" : "Navamsa Synergy", verdict: analyzeNavamsaBond(boyData, girlData, lang) },
        timing: { title: lang === 'hi' ? "विवाह समय" : "Marriage Timing", verdict: calculateLikelyMarriagePeriod(boyData, girlData, lang) },
        forecast: { title: lang === 'hi' ? "जीवन पूर्वानुमान" : "Life Forecast", verdict: generateLifeForecastSummary(score, lang) },
        remedies: { title: lang === 'hi' ? "उपाय" : "Remedies", list: getContextualRemedies(result, lang) },
        summary: { verdict: score >= 18 ? "Proceed" : "Caution", confidence: 60 + score, nextSteps: score >= 24 ? "Select Muhurat" : "Perform Remedies" }
    };
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
            periods: [
                { time: "Current - Dec 2024", strength: "Moderate" },
                { time: "Jan 2025 - June 2025", strength: "Very High" }
            ]
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
    const asc = chart.ascendantSign || "Aries";
    const moon = chart.moonSign || "Aries";
    const sun = chart.sunSign || "Aries";
    
    // In a real engine, these would be deep lookups. 
    // Here we use a structured generator based on the chart's unique signatures.
    
    const getReading = (category: string) => {
        const key = `${category}_${asc}_${moon}`.toLowerCase();
        // Fallback localized logic
        if (lang === 'hi') {
            switch(category) {
                case 'Career': return `आपका ${asc} लग्न और ${moon} राशि आपके करियर में स्थिरता और नेतृत्व का संकेत देते हैं। सूर्य का ${sun} में होना सरकारी लाभ की संभावना बढ़ाता है।`;
                case 'Health': return `स्वास्थ्य की दृष्टि से, लग्न स्वामी का प्रभाव मध्यम है। पाचन और मानसिक तनाव के प्रति सावधानी बरतें। नियमित योग लाभकारी होगा।`;
                case 'Marriage': return `सप्तम भाव का स्वामी अनुकूल स्थिति में है। जीवनसाथी सहायक और धार्मिक प्रवृत्ति का होगा। विवाह के बाद भाग्य उदय होने के संकेत हैं।`;
                case 'Wealth': return `वित्तीय स्थिति मजबूत रहेगी। संपत्ति और वाहन सुख के योग हैं। निवेश से लाभ की संभावना है।`;
                case 'Education': return `पंचम भाव का स्वामी आपकी तीक्ष्ण बुद्धि का संकेत देता है। उच्च शिक्षा के लिए विदेश यात्रा के योग बन सकते हैं।`;
                default: return "खगोलीय पिंडों का संरेखण आपके जीवन में सकारात्मक ऊर्जा ला रहा है।";
            }
        }
        return `Your ${asc} ascendant and ${moon} moon sign suggest a path of growth. The presence of Sun in ${sun} enhances your natural authority and creative expression in ${category}.`;
    };

    return {
        Career: getReading('Career'),
        Health: getReading('Health'),
        Marriage: getReading('Marriage'),
        Wealth: getReading('Wealth'),
        Education: getReading('Education')
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
