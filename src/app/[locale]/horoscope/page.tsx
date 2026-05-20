"use client";

import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { translateSign, getTrans } from "@/lib/astrology/i18n";

// ─── Zodiac Sign Metadata ─────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
    { name: "Aries",       icon: "♈", dates: "Mar 21 – Apr 19", element: "Fire",  lord: "Mars"    },
    { name: "Taurus",      icon: "♉", dates: "Apr 20 – May 20", element: "Earth", lord: "Venus"   },
    { name: "Gemini",      icon: "♊", dates: "May 21 – Jun 20", element: "Air",   lord: "Mercury" },
    { name: "Cancer",      icon: "♋", dates: "Jun 21 – Jul 22", element: "Water", lord: "Moon"    },
    { name: "Leo",         icon: "♌", dates: "Jul 23 – Aug 22", element: "Fire",  lord: "Sun"     },
    { name: "Virgo",       icon: "♍", dates: "Aug 23 – Sep 22", element: "Earth", lord: "Mercury" },
    { name: "Libra",       icon: "♎", dates: "Sep 23 – Oct 22", element: "Air",   lord: "Venus"   },
    { name: "Scorpio",     icon: "♏", dates: "Oct 23 – Nov 21", element: "Water", lord: "Mars"    },
    { name: "Sagittarius", icon: "♐", dates: "Nov 22 – Dec 21", element: "Fire",  lord: "Jupiter" },
    { name: "Capricorn",   icon: "♑", dates: "Dec 22 – Jan 19", element: "Earth", lord: "Saturn"  },
    { name: "Aquarius",    icon: "♒", dates: "Jan 20 – Feb 18", element: "Air",   lord: "Saturn"  },
    { name: "Pisces",      icon: "♓", dates: "Feb 19 – Mar 20", element: "Water", lord: "Jupiter" },
];

// ─── Vedic Transit Engine ─────────────────────────────────────────────────────
// Computes approximate planetary sidereal longitudes for today using
// standard mean-longitude formulas with Lahiri ayanamsha correction.
// Moon moves ~13°/day → different house for each rashi every day.

interface Transits {
    moonSign: number;       // 0=Aries … 11=Pisces (sidereal)
    sunSign: number;
    jupiterSign: number;
    saturnSign: number;
    moonDeg: number;        // degree within sign 0-29 (for nakshatra info)
}

function computeTransits(): Transits {
    const now = new Date();
    // Days since J2000.0 (2000 Jan 1.5 UT)
    const d = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
              + 2440587.5 - 2451545.0;

    // Lahiri ayanamsha ≈ 23.85° + 50.27"/yr
    const ayanDeg = 23.85 + (d / 365.25) * (50.27 / 3600);

    const sid = (lon: number) => ((lon - ayanDeg) % 360 + 360) % 360;

    // ── Sun (tropical → sidereal) ──────────────────────────────────────────
    const sunL   = (280.46646 + 0.98564736 * d) % 360;
    const sunGr  = ((357.52911 + 0.98560028 * d) % 360) * Math.PI / 180;
    const sunLon = sid(sunL + 1.914602 * Math.sin(sunGr) + 0.019993 * Math.sin(2 * sunGr));

    // ── Moon (tropical → sidereal, Brown's abridged theory) ───────────────
    const moonLo = (218.3165 + 13.17639646 * d) % 360;
    const mM  = ((134.9634 + 13.06499295 * d) % 360) * Math.PI / 180;
    const mD  = ((297.8502 + 12.19074912 * d) % 360) * Math.PI / 180;
    const mF  = ((93.2721  + 13.22935022 * d) % 360) * Math.PI / 180;
    const moonLon = sid(moonLo
        + 6.2888 * Math.sin(mM)
        - 1.2740 * Math.sin(2 * mD - mM)
        + 0.6583 * Math.sin(2 * mD)
        - 0.2136 * Math.sin(2 * mM)
        + 0.1851 * Math.sin(mM - 2 * mD)
        - 0.1143 * Math.sin(2 * mF));

    // ── Outer planets (mean longitude, sufficient precision for sign) ──────
    // Jupiter: sidereal period ≈ 11.86 yr; ref 2000-Jan-01 ≈ 11° sidereal (Aries)
    const jupLon  = sid((11  + (d / 4332.59) * 360) % 360);
    // Saturn: sidereal period ≈ 29.46 yr; ref 2000-Jan-01 ≈ 22° sidereal (Aries)
    const satLon  = sid((22  + (d / 10759.22) * 360) % 360);

    return {
        moonSign:    Math.floor(moonLon / 30),
        sunSign:     Math.floor(sunLon  / 30),
        jupiterSign: Math.floor(jupLon  / 30),
        saturnSign:  Math.floor(satLon  / 30),
        moonDeg:     moonLon % 30,
    };
}

/** Vedic house of planet (1-12) counted from rashiIdx */
function house(rashiIdx: number, planetSign: number): number {
    return ((planetSign - rashiIdx + 12) % 12) + 1;
}

// ─── Prediction Texts (Moon house from each rashi) ───────────────────────────
// Moon's house determines the MAIN daily theme for each rashi.
// Since Moon sign is fixed for today but rashiIdx differs → 12 unique themes.

type Lang2 = { hi: string; en: string };

const MOON_GENERAL: Record<number, Lang2> = {
    1:  { hi: "चंद्रमा आपकी राशि में विराजमान हैं — आज का दिन आपके लिए विशेष रूप से शुभ है। आत्मविश्वास और ऊर्जा अपने चरम पर है। नए कार्यों की शुरुआत करें, लोग आपकी बातों को ध्यान से सुनेंगे।", en: "Moon transits your own sign today — a powerfully personal day. Your energy is magnetic, your confidence is at its peak. Launch new initiatives; people naturally gravitate toward your leadership." },
    2:  { hi: "चंद्रमा आपके धन भाव में है। आर्थिक लेन-देन में सतर्कता रखें। परिवार के साथ मधुर संबंध बनाए रखना आज प्राथमिकता होनी चाहिए। वाणी में मिठास और संयम रखें।", en: "Moon in your 2nd house focuses energy on finances and family. Choose words carefully — your speech carries more weight today. Strengthen bonds with loved ones and review your savings plan." },
    3:  { hi: "चंद्रमा तृतीय भाव में है — साहस और पराक्रम का दिन। भाई-बहनों से सहयोग मिलेगा। छोटी यात्राएं शुभ फल देंगी। नए कौशल सीखने का उत्तम समय है।", en: "Moon in the 3rd house brings courage and communication. Siblings or neighbors offer support. Short journeys are favorable. This is an excellent day to learn a new skill or express a bold idea." },
    4:  { hi: "चंद्रमा चतुर्थ भाव में है। घर और माता से संबंधित विषय प्रमुख रहेंगे। भावनात्मक संवेदनशीलता अधिक रहेगी — इसे कमज़ोरी नहीं, शक्ति समझें। संपत्ति से जुड़े मामले सुलझ सकते हैं।", en: "Moon in the 4th brings home and maternal matters to the forefront. Emotional sensitivity is heightened; honor your feelings rather than suppress them. Property decisions can be resolved favorably today." },
    5:  { hi: "चंद्रमा पंचम भाव में है — रचनात्मकता, प्रेम और संतान से जुड़े मामले आज विशेष रूप से शुभ हैं। विद्यार्थियों के लिए उत्तम दिन। मन प्रफुल्लित रहेगा और सकारात्मक ऊर्जा चारों ओर से मिलेगी।", en: "Moon in the 5th illuminates romance, creativity, and children. Students will find today particularly productive. Your mind is sharp and joyful. Creative pursuits yield beautiful results." },
    6:  { hi: "चंद्रमा षष्ठ भाव में है — स्वास्थ्य और कार्यक्षेत्र पर ध्यान दें। परिश्रम से आज बड़े काम सिद्ध होंगे। शत्रुओं पर नजर रखें, परंतु घबराएं नहीं — आपकी मेहनत विजय दिलाएगी।", en: "Moon in the 6th calls for health awareness and disciplined work. Obstacles can be overcome with focused effort. Rivals lose ground today. Stick to your routine and you will prevail." },
    7:  { hi: "चंद्रमा सप्तम भाव में है। जीवनसाथी और व्यापारिक साझेदारों से आज विशेष सहयोग मिलेगा। विवाह संबंधी शुभ समाचार मिल सकते हैं। बातचीत और समझौते के लिए उत्तम दिन।", en: "Moon in the 7th shines on partnerships and marriage. Your spouse or business partner brings vital support. Negotiations go smoothly today. Existing relationships deepen beautifully." },
    8:  { hi: "चंद्रमा अष्टम भाव में है — अचानक परिवर्तन संभव है। गुप्त विद्या, शोध और रहस्यमय विषयों में रुचि बढ़ेगी। बड़े निर्णय टालें, धैर्य रखें। आत्मिक शक्ति आज आपका सबसे बड़ा हथियार है।", en: "Moon in the 8th brings unexpected changes and hidden revelations. Research and intuitive work flourish. Avoid major decisions today; instead, prepare quietly. Inner strength is your greatest asset now." },
    9:  { hi: "चंद्रमा भाग्य भाव में है — आज भाग्य आपका पूरा साथ दे रहा है! धार्मिक कार्य, तीर्थयात्रा और गुरु-सेवा विशेष फलदायी रहेगी। दीर्घकालीन लक्ष्यों की ओर आत्मविश्वास से बढ़ें।", en: "Moon in the 9th blesses you with fortune and divine grace today! Religious activities, long journeys, and guidance from mentors are especially auspicious. Move confidently toward your long-term goals." },
    10: { hi: "चंद्रमा दशम भाव में है — करियर और सामाजिक प्रतिष्ठा के लिए अत्यंत शुभ दिन! अधिकारी वर्ग का सहयोग मिलेगा। अपने काम को पूरे समर्पण से करें — पहचान और सम्मान आपकी प्रतीक्षा कर रहा है।", en: "Moon in the 10th — an outstanding day for career and public reputation! Superiors recognize your contributions. Put your best work forward; recognition and advancement are well within reach." },
    11: { hi: "चंद्रमा लाभ भाव में है — आज के दिन लाभ, सफलता और मनोकामना पूर्ति के उत्तम योग हैं! मित्रों से खुशखबरी मिल सकती है। सामाजिक संपर्क बढ़ाएं, आपका नेटवर्क आज विशेष रूप से सक्रिय रहेगा।", en: "Moon in the 11th — one of the most auspicious positions. Gains materialize, wishes are fulfilled, and friends bring unexpected opportunities. Expand your network; social connections bear fruit today." },
    12: { hi: "चंद्रमा व्यय भाव में है। खर्चों पर नियंत्रण रखें। एकांत और आत्म-चिंतन के लिए यह उत्तम समय है। ध्यान, योग और आध्यात्मिक साधना आज विशेष फलदायी रहेगी।", en: "Moon in the 12th invites introspection and spiritual practice. Control unnecessary expenses. Solitude and meditation are deeply rewarding today. Creative and charitable work brings inner fulfilment." },
};

const MOON_CAREER: Record<number, Lang2> = {
    1:  { hi: "आज आप पेशेवर जीवन में केंद्र बिंदु रहेंगे। बड़े निर्णय लेने का, नई जिम्मेदारी स्वीकारने का यह सर्वोत्तम समय है। आपकी उपस्थिति प्रभावशाली रहेगी।", en: "You are center stage professionally today. Accept new responsibilities with confidence. Your presence commands respect and drives results." },
    2:  { hi: "आय और संसाधन से जुड़े कार्यों में ध्यान लगाएं। बचत एवं निवेश के प्रस्ताव सोच-समझकर स्वीकार करें। वित्त क्षेत्र से जुड़े लोगों के लिए विशेष अवसर है।", en: "Financial matters dominate your professional life today. Evaluate investment proposals carefully. Those in finance, banking, or accounting find excellent opportunities." },
    3:  { hi: "संवाद-कौशल और नेटवर्किंग से करियर आगे बढ़ेगा। लेखन, मीडिया, शिक्षण या बिक्री से जुड़े लोगों के लिए उत्तम दिन। मोबाइल और यात्रा से काम बनेगा।", en: "Communication and networking advance your career today. Writers, educators, salespeople, and media professionals find this day particularly productive. Travel or calls unlock new deals." },
    4:  { hi: "कार्यस्थल पर स्थिरता और सुरक्षा महसूस होगी। घर से काम करना या रियल एस्टेट से जुड़े मामले आज सफल रहेंगे। टीम के भीतर सद्भाव बनाए रखें।", en: "Stability defines your work environment today. Working from home suits you perfectly. Real estate dealings and team harmony initiatives succeed well." },
    5:  { hi: "रचनात्मक और कलात्मक क्षेत्रों में उत्कृष्ट परिणाम मिलेंगे। बच्चों या युवाओं से संबंधित उद्योगों में विशेष अवसर है। शेयर बाज़ार में सोच-समझकर कदम रखें।", en: "Creative fields shine brightly today — arts, entertainment, education, and design all flourish. Opportunities in youth-focused industries are especially highlighted." },
    6:  { hi: "कड़ी मेहनत से आज असाधारण परिणाम प्राप्त होंगे। स्वास्थ्य, सेवा या सरकारी क्षेत्र में अवसर हैं। प्रतिस्पर्धियों से सावधान रहें लेकिन डरें नहीं।", en: "Hard work delivers extraordinary results today. Health, service, government, and legal fields offer opportunities. Stay alert to rivals but press forward with discipline." },
    7:  { hi: "साझेदारी, अनुबंध और व्यावसायिक बातचीत के लिए आज का दिन अत्यंत शुभ है। विदेशी संपर्कों से व्यापार में लाभ संभव है।", en: "Partnerships, contracts, and business negotiations are strongly favored today. International connections bring profitable opportunities. Sign that agreement confidently." },
    8:  { hi: "गुप्त योजनाओं और दीर्घकालीन रणनीति पर काम करें। बीमा, शोध, खनन या जांच से जुड़े क्षेत्रों में अवसर हैं। नए निवेश में जल्दी न करें।", en: "Work on long-term strategies and confidential projects. Research, insurance, investigation, and transformation-based industries hold opportunities. Avoid rushed financial commitments." },
    9:  { hi: "उच्च शिक्षा, कानून, प्रकाशन, धर्म या विदेश से जुड़े कार्यों में सफलता मिलेगी। किसी गुरु या वरिष्ठ की सलाह आपका करियर बदल सकती है।", en: "Higher education, law, publishing, international trade, and spiritual fields all flourish. A mentor's advice today could be career-defining — seek guidance." },
    10: { hi: "करियर का सर्वोत्तम समय चल रहा है! पदोन्नति, नए अनुबंध और सरकारी मान्यता के योग हैं। अधिकारियों का पूरा सहयोग मिलेगा।", en: "This is your career's peak moment! Promotion, new contracts, and official recognition are all on the table. Superiors are fully supportive — step forward boldly." },
    11: { hi: "बड़े संगठनों, NGO और सामाजिक मंचों पर आज आपकी पहचान बढ़ेगी। दीर्घकालीन लक्ष्य आज एक बड़ी छलांग के करीब हैं।", en: "Your profile rises within large organizations and social platforms today. Long-term professional goals are very close to a major breakthrough — push through." },
    12: { hi: "परदे के पीछे किए गए कार्य आज फलीभूत होंगे। विदेश से जुड़े व्यापार, अस्पताल, आश्रम या गुप्त संस्थाओं में सफलता मिलेगी।", en: "Behind-the-scenes work bears fruit today. Overseas business, healthcare, research institutions, and confidential projects move forward successfully." },
};

const MOON_HEALTH: Record<number, Lang2> = {
    1:  { hi: "शारीरिक ऊर्जा और मानसिक तेज दोनों ऊंचाई पर हैं। सिर और आंखों का विशेष ध्यान रखें। नियमित व्यायाम से ऊर्जा का सदुपयोग करें।", en: "Physical energy and mental sharpness are both elevated. Pay attention to your head and eyes. Channel your high vitality through regular exercise." },
    2:  { hi: "गले और पाचन तंत्र का ध्यान रखें। खानपान में संयम बरतें। घर के बुजुर्गों के स्वास्थ्य का भी ख़याल रखें।", en: "Guard your throat and digestive system today. Moderate your diet carefully. Keep an eye on elder family members' health as well." },
    3:  { hi: "फेफड़े और कंधों पर ध्यान दें। हल्का व्यायाम और ताजी हवा स्वास्थ्य के लिए लाभदायक रहेगी। श्वास संबंधी समस्याओं में सावधानी रखें।", en: "Lungs and shoulders need attention. Light exercise and fresh air are highly beneficial. If you have respiratory concerns, take extra precautions today." },
    4:  { hi: "मानसिक शांति और भावनात्मक संतुलन पर ध्यान दें। सीने और पेट से जुड़ी समस्याओं में सावधान रहें। ध्यान और योग आज विशेष लाभकारी हैं।", en: "Mental peace and emotional balance require attention. Be careful with chest and stomach issues. Meditation and yoga provide exceptional benefits today." },
    5:  { hi: "हृदय और पीठ के स्वास्थ्य पर विशेष ध्यान दें। शारीरिक गतिविधि उचित मात्रा में करें। मानसिक खुशी और प्रसन्नता स्वास्थ्य को बेहतर बनाएगी।", en: "Heart and spine deserve special attention. Engage in moderate physical activity. Your joy and positive emotional state directly support your physical vitality today." },
    6:  { hi: "पाचन और प्रतिरोधक क्षमता पर ध्यान दें। खानपान में शुद्धता बनाए रखें। किसी पुरानी बीमारी के उपचार के लिए आज शुभ मुहूर्त है।", en: "Digestive health and immunity need care. Maintain purity in diet and environment. Today is an auspicious time to begin treatment for any chronic health condition." },
    7:  { hi: "गुर्दे और मधुमेह संबंधी स्वास्थ्य पर ध्यान रखें। साझेदार के स्वास्थ्य का भी ख़याल करें। हाइड्रेशन बनाए रखें।", en: "Kidneys and hormonal balance deserve attention. Stay well hydrated throughout the day. Your partner's health may also require your care and consideration." },
    8:  { hi: "प्रजनन और उत्सर्जन तंत्र का ध्यान रखें। गुप्त रोगों की जांच करवाना आज उचित रहेगा। मानसिक तनाव से बचें — यह शरीर को नुकसान पहुंचा सकता है।", en: "Reproductive and excretory systems need attention today. Medical check-ups are favorable. Avoid mental stress — it has a stronger-than-usual physical impact now." },
    9:  { hi: "कूल्हे और जंघाओं का विशेष ध्यान रखें। लंबी यात्राओं में स्वास्थ्य का ख़याल रखें। प्रकृति में समय बिताना आज विशेष लाभकारी होगा।", en: "Hips and thighs need extra care, especially during travel. Spending time in nature provides exceptional healing energy today." },
    10: { hi: "हड्डियों और जोड़ों का ध्यान रखें। कार्य के बोझ से अधिक तनाव न लें। करियर की व्यस्तता में स्वास्थ्य की अनदेखी न करें।", en: "Bones and joints deserve attention. Don't let professional ambition lead to physical neglect. Schedule rest amidst your career push today." },
    11: { hi: "रक्त संचार और शिराओं पर ध्यान दें। मित्रों की संगत और सकारात्मक वातावरण स्वास्थ्य को बेहतर बनाएगा।", en: "Circulation and blood health need attention. Positive social energy from friends actively supports your wellbeing today — do connect with loved ones." },
    12: { hi: "नींद और मानसिक विश्राम पर विशेष ध्यान दें। एकांत और ध्यान से छुपी हुई स्वास्थ्य समस्याएं स्पष्ट हो सकती हैं। पैरों की देखभाल करें।", en: "Sleep and mental rest are essential today. Quiet reflection can reveal hidden health matters that have been overlooked. Take special care of your feet." },
};

const MOON_LOVE: Record<number, Lang2> = {
    1:  { hi: "आत्मविश्वासी व्यक्तित्व आज प्रेम संबंधों में चुंबक की तरह काम करेगा। अपनी भावनाएं खुलकर व्यक्त करें — प्रतिक्रिया सकारात्मक रहेगी।", en: "Your magnetic personality draws romantic energy toward you today. Express your feelings openly and confidently — the response will be positive and warm." },
    2:  { hi: "प्रेम में स्थिरता और सुरक्षा की भावना आज प्रमुख रहेगी। साथी के साथ आर्थिक और भावनात्मक बंधनों को मजबूत करने का उत्तम समय है।", en: "Stability and security in love are today's themes. Strengthen financial and emotional foundations with your partner. Shared plans for the future deepen your bond." },
    3:  { hi: "संवाद और खुलकर बात करना आज प्रेम संबंधों को नई ऊंचाई देगा। साथी के साथ किसी छोटी यात्रा पर जाना संबंध को ताजगी देगा।", en: "Open communication transforms your romantic life today. A short trip or spontaneous adventure with your partner creates beautiful new memories." },
    4:  { hi: "भावनाओं की गहराई में उतरने का समय है। साथी के साथ घर में समय बिताना और पुरानी यादें ताजा करना रिश्ते को और मजबूत बनाएगा।", en: "Deep emotional intimacy characterizes your love life today. Quality time at home — sharing memories and cooking together — strengthens bonds more than any grand gesture." },
    5:  { hi: "रोमांस और उत्साह से भरा दिन है! प्रेमी/प्रेमिका के साथ किसी रोमांटिक गतिविधि की योजना बनाएं। अविवाहितों के लिए विशेष आकर्षण का दिन।", en: "A day brimming with romance and excitement! Plan something special with your partner. Singles radiate irresistible charm today — meaningful connections are very likely." },
    6:  { hi: "प्रेम में वफादारी और समर्पण आज सबसे बड़ा उपहार है। साथी की परवाह और सेवा रिश्ते को अटूट बनाती है। छोटी-छोटी गलतफहमियों को सुलझाएं।", en: "Loyalty and devoted service are love's highest expressions today. Caring for your partner's needs strengthens an unbreakable bond. Clear minor misunderstandings gently." },
    7:  { hi: "साझेदारी और सहयोग से प्रेम आज अपनी पूर्णता पाएगा। विवाह के विचार मन में आ सकते हैं। रिश्ते में संतुलन और परस्पर सम्मान बनाए रखें।", en: "Partnership reaches its fullest expression today. Thoughts of marriage or deeper commitment may arise naturally. Mutual respect and balance define your love's strength." },
    8:  { hi: "प्रेम में गहराई, रहस्य और परिवर्तन का समय है। पुराने रिश्ते नई दिशा ले सकते हैं। भावनाओं को दबाएं नहीं, उन्हें परिपक्वता से सामने रखें।", en: "Deep, transformative love energy surrounds you today. Old relationships can take new directions. Don't suppress emotions — expressing them maturely leads to beautiful breakthroughs." },
    9:  { hi: "प्रेम में आज खुशहाली और विस्तार के योग हैं। दूर-दराज के प्रेमी से मुलाकात हो सकती है। विचारों का आदान-प्रदान रिश्ते को नई ऊंचाई देगा।", en: "Love expands joyfully today. A long-distance romantic meeting may occur. Sharing philosophical ideas and dreams with your partner brings your souls closer together." },
    10: { hi: "करियर और प्रेम के बीच संतुलन बनाना आज जरूरी है। साथी को समय और ध्यान देना न भूलें — आपकी उपस्थिति उन्हें सबसे ज्यादा चाहिए।", en: "Balance between career ambition and romantic attention is key today. Your partner needs your presence and focus — a small loving gesture will mean the world to them." },
    11: { hi: "मित्रता से प्रेम का जन्म हो सकता है आज। अविवाहितों के लिए किसी मित्र-मंडली से विशेष मुलाकात हो सकती है। प्रेम में आशाएं पूरी होने के योग हैं।", en: "Friendship blossoms into romance today. Singles may meet someone special through social circles. Romantic wishes and hopes are on the verge of beautiful fulfillment." },
    12: { hi: "प्रेम में एकांत और आत्मिक जुड़ाव का समय है। साथी के साथ आध्यात्मिक या सांस्कृतिक गतिविधि करना रिश्ते को गहराई देगा। अनकही बातें आज कहें।", en: "Love takes on a spiritual and deeply personal quality today. Shared meditation, art, or cultural experience with your partner creates profound intimacy. Say what has been left unsaid." },
};

// ─── Sun-house career modifier ────────────────────────────────────────────────
// Sun moves ~1°/day (changes sign monthly) — adds additional career nuance

const SUN_CAREER_SUFFIX: Record<number, Lang2> = {
    1:  { hi: " स्वतंत्र पहल और उद्यमिता के लिए सूर्य अनुकूल है।", en: " Sun supports independent initiative and entrepreneurship." },
    2:  { hi: " आय वृद्धि और वित्तीय नियोजन के लिए सूर्य सहायक है।", en: " Sun supports income growth and financial planning." },
    3:  { hi: " लेखन, मीडिया और बिक्री में सूर्य विशेष बल दे रहे हैं।", en: " Sun boosts writing, media, and sales activities." },
    4:  { hi: " रियल एस्टेट और गृह उद्योग में सूर्य की कृपा है।", en: " Sun favors real estate and home-based businesses." },
    5:  { hi: " कला, शिक्षा और मनोरंजन क्षेत्र में सूर्य की विशेष कृपा है।", en: " Sun brings favor to arts, education, and entertainment fields." },
    6:  { hi: " सेवा और स्वास्थ्य क्षेत्र में सूर्य उन्नति का संकेत दे रहे हैं।", en: " Sun signals advancement in service and healthcare sectors." },
    7:  { hi: " अंतरराष्ट्रीय व्यापार में सूर्य लाभकारी स्थिति में है।", en: " Sun is in a beneficial position for international business." },
    8:  { hi: " शोध और गुप्त परियोजनाओं में सूर्य की विशेष दृष्टि है।", en: " Sun casts special focus on research and confidential projects." },
    9:  { hi: " कानून, शिक्षा और विदेश-व्यापार में सूर्य सहायक है।", en: " Sun supports law, education, and foreign trade endeavors." },
    10: { hi: " सूर्य दशम भाव में होने से करियर में असाधारण उन्नति का समय है।", en: " Sun in the 10th house signals an exceptional period of career advancement." },
    11: { hi: " बड़े संगठनों और सामाजिक मंचों में सूर्य आपको विशेष प्रतिष्ठा दिला रहे हैं।", en: " Sun raises your profile in large organizations and social platforms." },
    12: { hi: " विदेश और अनुसंधान में सूर्य की विशेष कृपा है।", en: " Sun favors overseas work and academic/spiritual research." },
};

// ─── Jupiter / Saturn influence on lucky number & color ─────────────────────

const LUCKY_NUMBERS_BY_HOUSE: Record<number, number[]> = {
    1: [1, 10], 2: [2, 11], 3: [3, 12], 4: [4, 13],
    5: [5, 14], 6: [6, 15], 7: [7, 16], 8: [8, 17],
    9: [9, 18], 10: [1, 19], 11: [2, 20], 12: [3, 21],
};

const LUCKY_COLORS_HI: Record<number, string> = {
    1: "गेरुआ", 2: "सफ़ेद", 3: "हरा", 4: "चांदी", 5: "सुनहरा",
    6: "नेवी नीला", 7: "गुलाबी", 8: "गहरा लाल", 9: "पीला",
    10: "आसमानी", 11: "बैंगनी", 12: "समुद्री हरा",
};
const LUCKY_COLORS_EN: Record<number, string> = {
    1: "Saffron Orange", 2: "Pearl White", 3: "Emerald Green", 4: "Silver",
    5: "Golden Yellow", 6: "Navy Blue", 7: "Rose Pink", 8: "Deep Crimson",
    9: "Bright Yellow", 10: "Sky Blue", 11: "Royal Violet", 12: "Teal Green",
};

// ─── Panchang fallback (seeded, daily) ───────────────────────────────────────

function getPanchangFallback(trans: any): any {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
    return {
        tithi: trans?.panchang?.tithi?.[dayOfYear % 30]     || "",
        yoga:  trans?.panchang?.yoga?.[dayOfYear % 27]      || "",
        karan: trans?.panchang?.karan?.[(dayOfYear * 2) % 11] || "",
        vara:  trans?.panchang?.vara?.[now.getDay()]         || "",
        sunrise: "06:10", sunset: "18:42",
    };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

function buildHoroscopePrediction(sign: string, locale: string, apiData?: any) {
    const signIdx = ZODIAC_SIGNS.findIndex(s => s.name === sign);
    if (signIdx < 0) return null;

    const transits = computeTransits();
    const moonH    = house(signIdx, transits.moonSign);
    const sunH     = house(signIdx, transits.sunSign);
    const jupH     = house(signIdx, transits.jupiterSign);
    const satH     = house(signIdx, transits.saturnSign);

    const isHi = ["hi", "mr", "gu", "bn", "ta", "te", "kn"].includes(locale);
    const L     = (obj: Lang2) => (isHi ? obj.hi : obj.en);

    // Lucky number: Moon-house base ± Jupiter modification
    const baseNums = LUCKY_NUMBERS_BY_HOUSE[moonH] || [moonH, moonH + 9];
    const luckyNum = jupH >= 9 ? baseNums[1] : baseNums[0];   // Jupiter in 9th+ = higher num

    // Lucky color: Moon house primary, Saturn shifts it slightly
    const colorHouse = satH >= 6 ? ((moonH % 12) + 1) : moonH;
    const luckyColor = isHi ? LUCKY_COLORS_HI[colorHouse] : LUCKY_COLORS_EN[colorHouse];

    // Positive (general): pure Moon-house based
    const positive = L(MOON_GENERAL[moonH]);

    // Negative: based on Saturn house (universal Saturn wisdom)
    const negativeByHouse: Record<number, Lang2> = {
        1:  { hi: "अहंकार से बचें। दूसरों की राय का भी सम्मान करें।", en: "Guard against overconfidence. Others' perspectives hold real value today." },
        2:  { hi: "फिजूलखर्ची से बचें। वित्तीय निर्णय सोच-समझकर लें।", en: "Avoid unnecessary expenditure. Financial decisions need careful thought." },
        3:  { hi: "जल्दबाजी में लिए गए निर्णयों से बचें। पहले सुनें, फिर बोलें।", en: "Avoid hasty decisions. Listen carefully before you speak or act." },
        4:  { hi: "पुरानी बातों को मन में न रखें। क्षमा करना आपको हल्का बनाएगा।", en: "Let go of past grievances. Forgiveness frees you more than it helps others." },
        5:  { hi: "जोखिम भरे निवेश से बचें। भावनाओं को व्यापार से अलग रखें।", en: "Avoid speculative risks today. Keep emotions separate from financial decisions." },
        6:  { hi: "थकान और स्वास्थ्य की अनदेखी न करें। विश्राम भी काम का ही हिस्सा है।", en: "Do not ignore fatigue or health signals. Rest is as productive as work today." },
        7:  { hi: "किसी एक व्यक्ति पर अत्यधिक निर्भरता से बचें। स्वतंत्र निर्णय लेने की क्षमता बनाए रखें।", en: "Avoid over-dependence on one person. Maintain your capacity for independent judgment." },
        8:  { hi: "छुपे हुए शत्रुओं से सावधान रहें। किसी पर भी अत्यधिक विश्वास न करें।", en: "Be alert to hidden agendas. Extend trust cautiously and verify before committing." },
        9:  { hi: "अति आत्मविश्वास से बचें। भाग्य के साथ परिश्रम भी जरूरी है।", en: "Don't rely on luck alone. Even on fortunate days, consistent effort remains essential." },
        10: { hi: "काम के बोझ में स्वास्थ्य और परिवार की अनदेखी न हो।", en: "Amid career success, don't neglect your health and family relationships." },
        11: { hi: "हर व्यक्ति पर आंख मूंद कर भरोसा न करें। बड़े आर्थिक फैसलों में जल्दी न करें।", en: "Not every opportunity is as golden as it appears. Verify before committing to large deals." },
        12: { hi: "अत्यधिक एकांत से बचें। प्रियजनों से संपर्क बनाए रखें।", en: "Avoid excessive isolation. Staying connected with loved ones maintains your emotional strength." },
    };
    const negative = L(negativeByHouse[satH] || negativeByHouse[1]);

    // Career: Moon house + Sun suffix
    const career = L(MOON_CAREER[moonH]) + L(SUN_CAREER_SUFFIX[sunH] || { hi: "", en: "" });

    // Health: Moon house
    const health = L(MOON_HEALTH[moonH]);

    // Love: Moon house
    const love = L(MOON_LOVE[moonH]);

    // Transit info
    const trans = getTrans(locale);
    const signNames = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
    const moonSignName = trans?.signs?.[signNames[transits.moonSign]] || signNames[transits.moonSign];
    const transitLabel = isHi ? "चन्द्रमा गोचर" : "Moon Transit";
    const transitInfo = moonSignName ? `${transitLabel}: ${moonSignName}` : "";

    // Panchang
    let panchang: any;
    if (apiData?.panchang && trans?.panchang) {
        panchang = {
            tithi: trans.panchang.tithi?.[apiData.panchang.tithiId]    || "",
            yoga:  trans.panchang.yoga?.[apiData.panchang.yogaId]      || "",
            karan: trans.panchang.karan?.[apiData.panchang.karanaId]   || "",
            vara:  trans.panchang.vara?.[apiData.panchang.vara]        || "",
            sunrise: apiData.panchang.sunrise || "06:10",
            sunset:  apiData.panchang.sunset  || "18:42",
        };
    } else {
        panchang = getPanchangFallback(trans);
    }

    const labels = {
        color:  isHi ? "शुभ रंग"  : "Lucky Color",
        number: isHi ? "शुभ अंक"  : "Lucky Number",
    };

    return {
        sign, signIdx, moonH, sunH, jupH, satH,
        date: new Date().toLocaleDateString(locale === "en" ? "en-US" : `${locale}-IN`),
        positive, negative, career, health, love,
        lucky_number: luckyNum,
        lucky_color:  luckyColor,
        transitInfo, labels, panchang,
    };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HoroscopePage() {
    const locale = useLocale();
    const tNav = useTranslations("Nav");
    const t    = useTranslations("Index");

    const [selectedSign, setSelectedSign] = useState<string | null>(null);
    const [loading,      setLoading]      = useState(false);
    const [prediction,   setPrediction]   = useState<any>(null);

    const fetchHoroscope = useCallback(async (sign: string) => {
        setLoading(true);
        setSelectedSign(sign);
        setPrediction(null);

        // Show local prediction immediately (built from real transit math)
        const local = buildHoroscopePrediction(sign, locale);
        setPrediction(local);
        setLoading(false);

        // Silently try to enhance panchang from API
        try {
            const res = await fetch("/api/astrology/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "horoscope",
                    data: { sign, date: new Date(), lat: 22.9734, lng: 78.6569, locale }
                }),
                signal: AbortSignal.timeout(4000),
            });
            if (res.ok) {
                const apiData = await res.json();
                const enhanced = buildHoroscopePrediction(sign, locale, apiData);
                setPrediction(enhanced);
            }
        } catch { /* API optional — local prediction is already displayed */ }

        setTimeout(() => {
            document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }, [locale]);

    return (
        <main className="min-h-screen bg-slate-50 selection:bg-orange-500/30">
            <Navbar />

            <div className="container mx-auto px-4 py-12 md:py-20">
                {/* Header */}
                <header className="text-center space-y-4 mb-20 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 fill-orange-500" /> {tNav("horoscope")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        {t("horoscope_title")}
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        {t("horoscope_desc")}
                    </p>
                </header>

                {/* Zodiac Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 animate-slide-up">
                    {ZODIAC_SIGNS.map((sign) => (
                        <button
                            key={sign.name}
                            id={`sign-${sign.name.toLowerCase()}`}
                            onClick={() => fetchHoroscope(sign.name)}
                            className={`relative p-5 md:p-7 rounded-[2rem] transition-all duration-200 group overflow-hidden bg-white border ${
                                selectedSign === sign.name
                                    ? "border-orange-500 ring-4 ring-orange-500/10 shadow-xl scale-[1.02]"
                                    : "border-slate-100 hover:border-orange-200 hover:shadow-lg"
                            }`}
                        >
                            <div className="relative z-10 space-y-3">
                                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">
                                    {sign.icon}
                                </div>
                                <div className="space-y-1 text-left">
                                    <h3 className={`font-black text-base tracking-tight uppercase transition-colors ${selectedSign === sign.name ? "text-orange-600" : "text-slate-900"}`}>
                                        {translateSign(sign.name, locale)}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{sign.dates}</p>
                                    <div className="flex gap-1.5 items-center">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded font-bold uppercase tracking-widest">{sign.element}</span>
                                        <span className="text-[8px] text-slate-300 font-semibold">{sign.lord}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-32 text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t("decoding_starlight")}</p>
                    </div>
                )}

                {/* Prediction Result */}
                {prediction && !loading && (
                    <section
                        id="prediction-result"
                        className="mt-20 bg-white p-8 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden animate-slide-up"
                    >
                        {/* Debug strip (dev only) — shows house positions */}
                        <div className="hidden md:flex flex-wrap gap-2 mb-6 text-[9px] font-mono text-slate-400">
                            {[
                                `🌙 Moon H${prediction.moonH}`,
                                `☉ Sun H${prediction.sunH}`,
                                `♃ Jup H${prediction.jupH}`,
                                `♄ Sat H${prediction.satH}`,
                            ].map((v, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full">{v}</span>
                            ))}
                        </div>

                        {/* Sign + date header */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-slate-50 pb-12">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center text-5xl shadow-xl shadow-orange-200">
                                    {ZODIAC_SIGNS.find(s => s.name === prediction.sign)?.icon}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                                        {translateSign(prediction.sign, locale)}
                                    </h2>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{prediction.date}</p>
                                        {prediction.transitInfo && (
                                            <>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">{prediction.transitInfo}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    {prediction.labels?.color}
                                    <span className="text-orange-600 ml-2">{prediction.lucky_color}</span>
                                </div>
                                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    {prediction.labels?.number}
                                    <span className="text-orange-600 ml-2">{prediction.lucky_number}</span>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            {/* 5 prediction blocks */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { title: t("positive") || "Positive Highlights", content: prediction.positive,  icon: "✨", color: "text-amber-500",  bg: true  },
                                    { title: t("negative") || "Caution",             content: prediction.negative,  icon: "⚠️", color: "text-red-500",    bg: true  },
                                    { title: t("career"),                            content: prediction.career,    icon: "💼", color: "text-orange-500", bg: false },
                                    { title: t("health"),                            content: prediction.health,    icon: "💪", color: "text-rose-500",   bg: false },
                                    { title: t("love"),                              content: prediction.love,      icon: "❤️", color: "text-pink-500",   bg: false },
                                ].map((item, i) => (
                                    <div key={i} className={`space-y-4 ${item.bg ? "bg-slate-50 p-6 rounded-3xl border border-slate-100" : ""}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm">{item.icon}</div>
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.content}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Panchang */}
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">{t("todays_panchang")}</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: t("label_tithi"),   val: prediction.panchang.tithi   },
                                        { label: t("label_yoga"),    val: prediction.panchang.yoga    },
                                        { label: t("label_karan"),   val: prediction.panchang.karan   },
                                        { label: t("label_vara"),    val: prediction.panchang.vara    },
                                        { label: t("label_sunrise"), val: prediction.panchang.sunrise },
                                        { label: t("label_sunset"),  val: prediction.panchang.sunset  },
                                    ].map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</span>
                                            <span className="text-xs font-black text-slate-800">{p.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-16 pt-12 border-t border-slate-50 text-center space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-900 uppercase">{t("deep_analysis_title")}</h4>
                                <p className="text-sm text-slate-500 font-medium">{t("deep_analysis_desc")}</p>
                            </div>
                            <Button
                                onClick={() => window.location.href = "/search"}
                                className="h-14 px-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20"
                            >
                                {t("consult_expert")}
                            </Button>
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </main>
    );
}
