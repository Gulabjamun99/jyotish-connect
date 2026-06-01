/**
 * JyotishConnect Prediction Engine
 * Stabilized Version for Production with Multi-language support
 */

export const _SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

import { SIGN_PREDICTIONS } from "./horoscope-data";
import { getTrans } from "./i18n";

// ─── Supported Transit Maps ──────────────────────────────────────────────────
const MOON_GENERAL: Record<number, { hi: string; en: string }> = {
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

const MOON_CAREER: Record<number, { hi: string; en: string }> = {
    1:  { hi: "आज आप पेशेवर जीवन में केंद्र बिंदु रहेंगे। बड़े निर्णय लेने का, नई जिम्मेदारी स्वीकारने का यह सर्वोत्तम समय है। आपकी उपस्थिति प्रभावशाली रहेगी।", en: "You are center stage professionally today. Accept new responsibilities with confidence. Your presence commands respect and drives results." },
    2:  { hi: "आय and संसाधन से जुड़े कार्यों में ध्यान लगाएं। बचत एवं निवेश के प्रस्ताव सोच-समझकर स्वीकार करें। वित्त क्षेत्र से जुड़े लोगों के लिए विशेष अवसर है।", en: "Financial matters dominate your professional life today. Evaluate investment proposals carefully. Those in finance, banking, or accounting find excellent opportunities." },
    3:  { hi: "संवाद-कौशल और नेटवर्किंग से करियर आगे बढ़ेगा। लेखन, मीडिया, शिक्षण या बिक्री से जुड़े लोगों के लिए उत्तम दिन। मोबाइल और यात्रा से काम बनेगा।", en: "Communication and networking advance your career today. Writers, educators, salespeople, and media professionals find this day particularly productive. Travel or calls unlock new deals." },
    4:  { hi: "कार्यस्थल पर स्थिरता और सुरक्षा महसूस होगी। घर से काम करना या रियल एस्टेट से जुड़े मामले आज सफल रहेंगे। टीम के भीतर सद्भाव बनाए रखें।", en: "Stability defines your work environment today. Working from home suits you perfectly. Real estate dealings and team harmony initiatives succeed well." },
    5:  { hi: "रचनात्मक और कलात्मक क्षेत्रों में उत्कृष्ट परिणाम मिलेंगे। बच्चों या युवाओं से संबंधित उद्योगों में विशेष अवसर है। शेयर बाज़ार में सोच-समझकर कदम रखें।", en: "Creative fields shine brightly today — arts, entertainment, education, and design all flourish. Opportunities in youth-focused industries are especially highlighted." },
    6:  { hi: "कड़ी मेहनत से आज असाधारण परिणाम प्राप्त होंगे। स्वास्थ्य, सेवा या सरकारी क्षेत्र में अवसर हैं। प्रतिस्पर्धियों से सावधान रहें लेकिन डरें नहीं।", en: "Hard work delivers extraordinary results today. Health, service, government, and legal fields offer opportunities. Stay alert to rivals but press forward with discipline." },
    7:  { hi: "साझेदारी, अनुबंध और व्यावसायिक बातचीत के लिए आज का दिन अत्यंत शुभ है। विदेशी संपर्कों से व्यापार में लाभ संभव है।", en: "Partnerships, contracts, and business negotiations are strongly favored today. International connections bring profitable opportunities. Sign that agreement confidently." },
    8:  { hi: "गुप्त योजनाओं और दीर्घकालीन रणनीति पर काम करें। बीमा, शोध, खनन या जांच से जुड़े क्षेत्रों में अवसर हैं। नए निवेश में जल्दी न करें।", en: "Work on long-term strategies and confidential projects. Research, insurance, investigation, and transformation-based industries hold opportunities. Avoid rushed financial commitments." },
    9:  { hi: "उच्च शिक्षा, कानून, प्रकाशन, धर्म या विदेश से जुड़े कार्यों में सफलता मिलेगी। किसी गुरु या वरिष्ठ की सलाह आपका करियर बदल सकती है।", en: "Higher education, law, publishing, international trade, and spiritual fields all flourish. A mentor's advice today could be career-defining — seek guidance." },
    10: { hi: "करियर का सर्वोत्तम समय चल रहा है! पदोन्नতি, नए अनुबंध और सरकारी मान्यता के योग हैं। अधिकारियों का पूरा सहयोग मिलेगा।", en: "This is your career's peak moment! Promotion, new contracts, and official recognition are all on the table. Superiors are fully supportive — step forward boldly." },
    11: { hi: "बड़े संगठनों, NGO और सामाजिक मंचों पर आज आपकी पहचान बढ़ेगी। दीर्घकालीन लक्ष्य आज एक बड़ी छलांग के करीब हैं।", en: "Your profile rises within large organizations and social platforms today. Long-term professional goals are very close to a major breakthrough — push through." },
    12: { hi: "परदे के पीछे किए गए कार्य आज फलीभूत होंगे। विदेश से जुड़े व्यापार, अस्पताल, आश्रम या गुप्त संस्थाओं में सफलता मिलेगी।", en: "Behind-the-scenes work bears fruit today. Overseas business, healthcare, research institutions, and confidential projects move forward successfully." },
};

const MOON_HEALTH: Record<number, { hi: string; en: string }> = {
    1:  { hi: "शारीरिक ऊर्जा और मानसिक तेज दोनों ऊंचाई पर हैं। सिर और आंखों का विशेष ध्यान रखें। नियमित व्यायाम से ऊर्जा का सदुपयोग करें।", en: "Physical energy and mental sharpness are both elevated. Pay attention to your head and eyes. Channel your high vitality through regular exercise." },
    2:  { hi: "गले और पाचन तंत्र का ध्यान रखें। खानपान में संयम बरतें। घर के बुजुर्गों के स्वास्थ्य का भी ख़याल रखें।", en: "Guard your throat and digestive system today. Moderate your diet carefully. Keep an eye on elder family members' health as well." },
    3:  { hi: "फेफड़े और कंधों पर ध्यान दें। हल्का व्यायाम और ताजी हवा स्वास्थ्य के लिए लाभदायक रहेगी। श्वास संबंधी समस्याओं में सावधानी रखें।", en: "Lungs and shoulders need attention. Light exercise and fresh air are highly beneficial. If you have respiratory concerns, take extra precautions today." },
    4:  { hi: "मानसिक शांति और भावनात्मक संतुलन पर ध्यान दें। सीने और पेट से जुड़ी समस्याओं में सावधान रहें। ध्यान और योग आज विशेष लाभकारी हैं।", en: "Mental peace and emotional balance require attention. Be careful with chest and stomach issues. Meditation and yoga provide exceptional benefits today." },
    5:  { hi: "हृदय और पीठ के स्वास्थ्य पर विशेष ध्यान दें। शारीरिक गतिविधि उचित मात्रा में करें। मानसिक खुशी और प्रसन्नता स्वास्थ्य को बेहतर बनाएगी।", en: "Heart and spine deserve special attention. Engage in moderate physical activity. Your joy and positive emotional state directly support your physical vitality today." },
    6:  { hi: "पाचन और प्रतिरोधक क्षमता पर ध्यान दें। खानपान में शुद्धता बनाए रखें। किसी पुरानी बीमारी के उपचार के लिए आज शुभ मुहूर्त है।", en: "Digestive health and immunity need care. Maintain purity in diet and environment. Today is an auspicious time to begin treatment for any chronic health condition." },
    7:  { hi: "गुर्दे और मधुमेह संबंधी स्वास्थ्य पर ध्यान रखें। साझेदार के स्वास्थ्य का भी ख़याल करें। हाइड्रेशन बनाए रखें।", en: "Kidneys and hormonal balance deserve attention. Stay well hydrated throughout the day. Your partner's health may also require your care and consideration." },
    8:  { hi: "प्रजनन और उत्सर्जन तंत्र का ध्यान रखें। गुप्त रोगों की जांच करवाना आज उचित रहेगा। मानसिक तनाव से बचें — यह शरीर को नुकसान पहुंचा सकता है।", en: "Reproductive and excretory systems need attention today. Medical check-ups are favorable. Avoid mental stress — it has a stronger-than-usual physical impact now." },
    9:  { hi: "कूल्हे और जंघाओं का विशेष ध्यान रखें। लंबी यात्राओं में स्वास्थ्य का ख़याल रखें। प्रकृति में समय बिताना आज विशेष लाभकारी होगा।", en: "Hips and thighs need extra care, especially during travel. Spending time in nature provides exceptional healing energy today." },
    10: { hi: "हड्डियों और जोड़ों का ध्यान रखें। कार्य के बोझ से अधिक तनाव न लें। career की व्यस्तता में स्वास्थ्य की अनदेखी न करें।", en: "Bones and joints deserve attention. Don't let professional ambition lead to physical neglect. Schedule rest amidst your career push today." },
    11: { hi: "रक्त संचार और शिराओं पर ध्यान दें। मित्रों की संगत और सकारात्मक वातावरण स्वास्थ्य को बेहतर बनाएगा।", en: "Circulation and blood health need attention. Positive social energy from friends actively supports your wellbeing today — do connect with loved ones." },
    12: { hi: "नींद और मानसिक विश्राम पर विशेष ध्यान दें। एकांत और ध्यान से छुपी हुई स्वास्थ्य समस्याएं स्पष्ट हो सकती हैं। पैरों की देखभाल करें।", en: "Sleep and mental rest are essential today. Quiet reflection can reveal hidden health matters that have been overlooked. Take special care of your feet." },
};

const MOON_LOVE: Record<number, { hi: string; en: string }> = {
    1:  { hi: "आत्मविश्वासी व्यक्तित्व आज प्रेम संबंधों में चुंबक की तरह काम करेगा। अपनी भावनाएं खुलकर व्यक्त करें — प्रतिक्रिया सकारात्मक रहेगी।", en: "Your magnetic personality draws romantic energy toward you today. Express your feelings openly and confidently — the response will be positive and warm." },
    2:  { hi: "प्रेम में स्थिरता और सुरक्षा की भावना आज प्रमुख रहेगी। साथी के साथ आर्थिक और भावनात्मक बंधनों को मजबूत करने का उत्तम समय है।", en: "Stability and security in love are today's themes. Strengthen financial and emotional foundations with your partner. Shared plans for the future deepen your bond." },
    3:  { hi: "संवाद और खुलकर बात करना आज प्रेम संबंधों को नई ऊंचाई देगा। साथी के साथ किसी छोटी यात्रा पर जाना संबंध को ताजगी देगा।", en: "Open communication transforms your romantic life today. A short trip or spontaneous adventure with your partner creates beautiful new memories." },
    4:  { hi: "भावनाओं की गहराई में उतरने का समय है। साथी के साथ घर में समय बिताना और पुरानी यादें ताजा करना रिश्ते को और मजबूत बनाएगा।", en: "Deep emotional intimacy characterizes your love life today. Quality time at home — sharing memories and cooking together — strengthens bonds more than any grand gesture." },
    5:  { hi: "रोमांस और उत्साह से भरा दिन है! प्रेमी/प्रेमिका के साथ किसी रोमांटिक गतिविधि की योजना बनाएं। अविवाहितों के लिए विशेष आकर्षण का दिन।", en: "A day brimming with romance and excitement! Plan something special with your partner. Singles radiate irresistible charm today — meaningful connections are very likely." },
    6:  { hi: "प्रेम में वफादारी और समर्पण आज सबसे बड़ा उपहार है। साथी की परवाह और सेवा रिश्ते को अटूट बनाती है। छोटी-छोटी गलतफहमियों को सुलझाएं।", en: "Loyalty and devoted service are love's highest expressions today. Caring for your partner's needs strengthens an unbreakable bond. Clear minor misunderstandings gently." },
    7:  { hi: "साझेदारी और सहयोग से प्रेम आज अपनी पूर्णता पाएगा। विवाह के विचार मन में आ सकते हैं। रिश्ते में संतुलन और परस्पर सम्मान बनाए रखें।", en: "Partnership reaches its fullest expression today. Thoughts of marriage or deeper commitment may arise naturally. Mutual respect and balance define your love's strength." },
    8:  { hi: "प्रेम में गहराई, रहस्य और परिवर्तन का समय है। पुराने रिश्ते नई दिशा ले सकते हैं। भावनाओं को दबाएं नहीं, उन्हें परिपक्वता से सामने रखें।", en: "Deep, transformative love energy surrounds you today. Old relationships can take new directions. Don't suppress emotions — expressing them maturely leads to beautiful breakthroughs." },
    9:  { hi: "प्रेम में आज खुशहाली और विस्तार के योग हैं। दूर-जराज के प्रेमी से मुलाकात हो सकती है। विचारों का आदान-प्रदान रिश्ते को नई ऊंचाई देगा।", en: "Love expands joyfully today. A long-distance romantic meeting may occur. Sharing philosophical ideas and dreams with your partner brings your souls closer together." },
    10: { hi: "करियर और प्रेम के बीच संतुलन बनाना आज जरूरी है। साथी को समय और ध्यान देना न भूलें — आपकी उपस्थिति उन्हें सबसे ज्यादा चाहिए।", en: "Balance between career ambition and romantic attention is key today. Your partner needs your presence and focus — a small loving gesture will mean the world to them." },
    11: { hi: "मित्रता से प्रेम का जन्म हो सकता है आज। अविवाहितों के लिए किसी मित्र-मंडली से विशेष मुलाकात हो सकती है। प्रेम में आशाएं पूरी होने के योग हैं।", en: "Friendship blossoms into romance today. Singles may meet someone special through social circles. Romantic wishes and hopes are on the verge of beautiful fulfillment." },
    12: { hi: "प्रेम में एकांत और आत्मिक जुड़ाव का समय है। साथी के साथ आध्यात्मिक या सांस्कृतिक गतिविधि करना रिश्ते को गहराई देगा। अनकही बातें आज कहें।", en: "Love takes on a spiritual and deeply personal quality today. Shared meditation, art, or cultural experience with your partner creates profound intimacy. Say what has been left unsaid." },
};

const SUN_CAREER_SUFFIX: Record<number, { hi: string; en: string }> = {
    1:  { hi: " स्वतंत्र पहल और उद्यमिता के लिए सूर्य अनुकूल है।", en: " Sun supports independent initiative and entrepreneurship." },
    2:  { hi: " आय वृद्धि और वित्तीय नियोजन के लिए सूर्य सहायक है।", en: " Sun supports income growth and financial planning." },
    3:  { hi: " लेखन, मीडिया और बिक्री में सूर्य विशेष बल दे रहे हैं।", en: " Sun boosts writing, media, and sales activities." },
    4:  { hi: " रियल एस्टेट और गृह उद्योग में सूर्य की कृपा है।", en: " Sun favors real estate and home-based businesses." },
    5:  { hi: " कला, शिक्षा और मनोरंजन क्षेत्र में सूर्य की विशेष कृपा है।", en: " Sun brings favor to arts, education, and entertainment fields." },
    6:  { hi: " सेवा और स्वास्थ्य क्षेत्र में सूर्य उन्नति का संकेत दे रहे हैं।", en: " Sun signals advancement in service and healthcare sectors." },
    7:  { hi: " अंतरराष्ट्रीय व्यापार में सूर्य लाभकारी स्थिति में है।", en: " Sun is in a beneficial position for international business." },
    8:  { hi: " शोध और गुप्त परियोजनाओं में सूर्य की विशेष दृष्टि है।", en: " Sun casts special focus on research and confidential projects." },
    9:  { hi: " कानून, शिक्षा और विदेश-व्यापार में सूर्य सहायक है।", en: " Sun supports law, education, and foreign trade endeavors." },
    10: { hi: " सूर्य दशम भाव में होने से career में असाधारण उन्नति का समय है।", en: " Sun in the 10th house signals an exceptional period of career advancement." },
    11: { hi: " बड़े संगठनों और सामाजिक मंचों में सूर्य आपको विशेष प्रतिष्ठा दिला रहे हैं।", en: " Sun raises your profile in large organizations and social platforms." },
    12: { hi: " विदेश और अनुसंधान में सूर्य की विशेष कृपा है।", en: " Sun favors overseas work and academic/spiritual research." },
};

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

const negativeByHouse: Record<number, { hi: string; en: string }> = {
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

function house(rashiIdx: number, planetSign: number): number {
    return ((planetSign - rashiIdx + 12) % 12) + 1;
}

export const generateDailyHoroscope = (sign: string, planets: any[], lang: string = 'en') => {
    const signIdx = _SIGNS.indexOf(sign);
    if (signIdx < 0) return null;

    const isHi = ["hi", "mr", "gu", "bn", "ta", "te", "kn"].includes(lang);
    const L = (obj: { hi: string; en: string }) => (isHi ? obj.hi : obj.en);

    // Extract planet positions for dynamic transits
    const moon = planets?.find(p => p.name === "Moon");
    const sun = planets?.find(p => p.name === "Sun");
    const jup = planets?.find(p => p.name === "Jupiter");
    const sat = planets?.find(p => p.name === "Saturn");

    const moonSign = moon ? moon.signId - 1 : 0;
    const sunSign = sun ? sun.signId - 1 : 0;
    const jupiterSign = jup ? jup.signId - 1 : 0;
    const saturnSign = sat ? sat.signId - 1 : 0;

    const moonH = house(signIdx, moonSign);
    const sunH  = house(signIdx, sunSign);
    const jupH  = house(signIdx, jupiterSign);
    const satH  = house(signIdx, saturnSign);

    // Lucky number: Moon-house base ± Jupiter modification
    const baseNums = LUCKY_NUMBERS_BY_HOUSE[moonH] || [moonH, moonH + 9];
    const luckyNum = jupH >= 9 ? baseNums[1] : baseNums[0];

    // Lucky color: Moon house primary, Saturn shifts it slightly
    const colorHouse = satH >= 6 ? ((moonH % 12) + 1) : moonH;
    const luckyColor = isHi ? LUCKY_COLORS_HI[colorHouse] : LUCKY_COLORS_EN[colorHouse];

    // Retrieve sign-specific horoscope data
    const signData = SIGN_PREDICTIONS[sign];
    const predictionsForLocale = signData?.[lang as keyof typeof signData]
                              || signData?.hi
                              || signData?.en;

    // Stable daily seed index to choose 1 of 4 unique options
    const now = new Date();
    const daySeed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const idx = (daySeed + signIdx) % 4;

    const corePersonal = predictionsForLocale?.personal?.[idx] || "";
    const coreCareer   = predictionsForLocale?.career?.[idx]   || "";
    const coreHealth   = predictionsForLocale?.health?.[idx]   || "";
    const coreLove     = predictionsForLocale?.love?.[idx]     || "";

    const positive = corePersonal 
        ? `${corePersonal} ${L(MOON_GENERAL[moonH])}`
        : L(MOON_GENERAL[moonH]);

    const negative = L(negativeByHouse[satH] || negativeByHouse[1]);

    const career = coreCareer
        ? `${coreCareer} ${L(MOON_CAREER[moonH])}${L(SUN_CAREER_SUFFIX[sunH] || { hi: "", en: "" })}`
        : L(MOON_CAREER[moonH]) + L(SUN_CAREER_SUFFIX[sunH] || { hi: "", en: "" });

    const health = coreHealth
        ? `${coreHealth} ${L(MOON_HEALTH[moonH])}`
        : L(MOON_HEALTH[moonH]);

    const love = coreLove
        ? `${coreLove} ${L(MOON_LOVE[moonH])}`
        : L(MOON_LOVE[moonH]);

    const trans = getTrans(lang);
    const moonSignName = trans?.signs?.[_SIGNS[moonSign]] || _SIGNS[moonSign];
    const transitLabel = lang === 'hi' ? "चन्द्रमा गोचर" : lang === 'mr' ? "चंद्र गोचर" : lang === 'gu' ? "ચંદ્ર ગોચર" : lang === 'bn' ? "চন্দ্র গোচর" : lang === 'ta' ? "சந்திர பெயர்ச்சி" : lang === 'te' ? "చంద్ర సంచారం" : lang === 'kn' ? "ಚಂದ್ರ ಗೋಚಾರ" : "Moon Transit";
    const transitInfo = moonSignName ? `${transitLabel}: ${moonSignName}` : "";

    return {
        positive,
        negative,
        career,
        health,
        love,
        luckyNumber: luckyNum,
        luckyColor,
        labels: {
            color:  isHi ? "शुभ रंग"  : "Lucky Color",
            number: isHi ? "शुभ अंक"  : "Lucky Number",
        },
        transitInfo,
        moonH, sunH, jupH, satH
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

    const signsEn = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const signsLocal = {
        en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
        hi: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
        mr: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
        gu: ["મેષ", "વૃષભ", "મિથુન", "કર્ક", "સિંહ", "કન્યા", "તુલા", "વૃશ્ચિક", "ધનુ", "મકર", "કુંભ", "મીન"],
        bn: ["মেষ", "বৃষ", "মিথুন", "কর্কট", "সিংহ", "কন্যা", "তুলা", "বৃশ্চিক", "ধনু", "মকর", "কুম্ভ", "মীন"],
        ta: ["மேஷ", "ரிஷப", "மிதுன", "கடக", "சிம்ம", "கன்னி", "துலாம்", "விருச்சிக", "தனுசு", "மகர", "கும்ப", "மீன"],
        te: ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"],
        kn: ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"]
    };

    const lcode = (signsLocal[lang] ? lang : "en");
    const sList = signsLocal[lcode];

    const ascSign = chart.ascendantSign || "Aries";
    const ascIdx = signsEn.indexOf(ascSign) >= 0 ? signsEn.indexOf(ascSign) : 0;
    const lagnaLabel = sList[ascIdx];

    const sign10Idx = (ascIdx + 9) % 12;
    const sign10Label = sList[sign10Idx];

    const planetNamesLocal = {
        en: { Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury", Jupiter: "Jupiter", Venus: "Venus", Saturn: "Saturn", Rahu: "Rahu", Ketu: "Ketu" },
        hi: { Sun: "सूर्य", Moon: "चंद्रमा", Mars: "मंगल", Mercury: "बुध", Jupiter: "बृहस्पति (गुरु)", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" },
        mr: { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगळ", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनी", Rahu: "राहू", Ketu: "केतू" },
        gu: { Sun: "સૂર્ય", Moon: "ચંદ્ર", Mars: "મંગળ", Mercury: "બુધ", Jupiter: "ગુરુ", Venus: "શુક્ર", Saturn: "શનિ", Rahu: "રાહુ", Ketu: "કેતુ" },
        bn: { Sun: "সূর্য", Moon: "চন্দ্র", Mars: "মঙ্গল", Mercury: "বুধ", Jupiter: "বৃহস্পতি", Venus: "শুক্র", Saturn: "শনি", Rahu: "রাহু", Ketu: "কেতু" },
        ta: { Sun: "சூரியன்", Moon: "சந்திரன்", Mars: "செவ்வாய்", Mercury: "புதன்", Jupiter: "குரு", Venus: "சுக்கிரன்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது" },
        te: { Sun: "సూర్యుడు", Moon: "చంద్రుడు", Mars: "కుజుడు", Mercury: "బుధుడు", Jupiter: "గురువు", Venus: "శుక్రుడు", Saturn: "శని", Rahu: "రాహువు", Ketu: "కేతువు" },
        kn: { Sun: "ಸೂರ್ಯ", Moon: "ಚಂದ್ರ", Mars: "ಕುಜ", Mercury: "ಬುಧ", Jupiter: "ಗುರು", Venus: "ಶುಕ್ರ", Saturn: "ಶನಿ", Rahu: "ರಾಹು", Ketu: "ಕೇತು" }
    };

    const pNames = planetNamesLocal[lcode];

    const getPlanetsInHouse = (houseNum) => {
        return chart.planets
            ?.filter((p) => p.house === houseNum && p.name !== 'Asc')
            .map((p) => pNames[p.name] || p.name) || [];
    };

    // Dictionary of fully translated template components for 8 locales
    const dict = {
        en: {
            carIntro: "Your Lagna (Ascendant) is **{lagna}**, which places your 10th house of profession and career in the sign of **{sign10}**. ",
            carSunMars: "The presence of {planets} in the 10th house is a highly powerful combination indicating administrative authority, government roles, leadership, or law enforcement. You possess executive decision-making skills that command respect.",
            carMercVen: "The influence of {planets} in your house of profession indicates success in business, finance, creative arts, media, or communication. Your intellect, presentation skills, and commercial acumen will be the pillars of your professional rise.",
            carJup: "Jupiter transiting your 10th house promises an honorable career in education, consulting, legal affairs, mentorship, or high-level advisory positions. You will be looked up to as a figure of wisdom and integrity.",
            carOther: "The placement of {planets} in the 10th house points toward a career in technology, engineering, information systems, or deep research. While initial years may require intense hard work, you will secure high professional status in the long run.",
            carNone: "With the 10th house free from major afflictions, the lord of your profession promises a stable, secure, and progressive career path. You are naturally geared toward leadership, independent consulting, or entrepreneurship as you mature.",
            
            wealthIntro: "The 2nd house of accumulated assets and the 11th house of regular gains are the key indicators of your financial prosperity. ",
            wealthBenefics: "A highly auspicious placement of benefic planets ({planets}) in your money houses guarantees steady flow of income, financial comfort, and gains from investments or ancestral inheritance. You are bound to enjoy material luxuries in life.",
            wealthMercSun: "The influence of {planets} in these houses emphasizes that your speech, strategic investment choices, trade connections, and intellectual skills will be primary sources of your wealth generation.",
            wealthOther: "The presence of {planets} in your financial houses indicates that wealth building requires highly disciplined savings and realistic budgets. Avoid speculative risks and focus on long-term assets to enjoy solid financial security.",
            wealthNone: "The lords of your wealth and income houses are well-placed. Your financial trajectory shows robust growth after the age of 30, paving the way for purchasing permanent properties, land, and vehicles.",
            
            healthIntro: "The 6th house governs acute diseases and daily vitality, while the 8th house rules longevity, transformation, and chronic conditions. ",
            healthSadeSati: "You are currently under the astrological influence of Saturn's Sade Sati. Take extra care of your joint health, skeletal system, and avoid mental over-stress through meditation. ",
            healthPlanets: "With {planets} occupying your health houses, you are advised to maintain healthy dietary habits to avoid minor digestive issues, skin sensitivities, or fatigue. Regular physical exercise will act as a natural shield.",
            healthNone: "Your Lagna Lord and the 6th lord hold strong positions, signifying excellent immunity, robust physical stamina, and the capacity to recover quickly from minor seasonal ailments.",
            
            marriageIntro: "The 7th house and its planetary ruler define your marital compatibility, partnerships, and relationship dynamics. ",
            marriageManglik: "Since Manglik Dosha is present in your chart, it is scripturally advised to perform proper Kundli matching before finalizing a marriage. This will guarantee immense marital harmony and prevent conflicts. ",
            marriagePlanets: "The presence of {planets} in the 7th house suggests that your spouse will be an intelligent, highly responsible, and charismatic individual. Fostering transparent communication and mutual respect will keep your bond unbreakable.",
            marriageNone: "Your 7th house is highly stable and free from severe afflictions. Marriage will trigger a highly fortunate phase of life, bringing emotional security, prosperity, and a deeply cooperative life partner.",
            
            eduIntro: "The 4th house rules primary education and domestic peace, while the 5th house rules higher learning, memory, intelligence, and cognitive creativity. ",
            eduBenefics: "The strong influence of benefic planets ({planets}) indicates excellent memory retention, logical skills, and high academic performance. You are likely to pursue research, law, corporate advisory, or professional education.",
            eduSunMars: "The presence of {planets} in your houses of education points toward strong technical aptitude, mathematical reasoning, and a powerful competitive spirit that ensures success in major examinations.",
            eduOther: "The placement of {planets} indicates minor interruptions or changes in your subjects early on. However, your deep-seated practical intelligence and curiosity will enable you to gain supreme expertise in your chosen field later.",
            eduNone: "Your chart suggests a highly practical and standard academic path. You learn best through experiential and hands-on methods rather than rote memorization, which will serve you exceptionally well in your professional life."
        },
        hi: {
            carIntro: "आपकी जन्म कुंडली में लग्न **{lagna}** है और दशम (करियर) भाव **{sign10}** राशि में स्थित है। ",
            carSunMars: "दशम भाव में {planets} की उपस्थिति प्रशासनिक शक्ति, सरकारी सेवा, कानून प्रवर्तन या संगठन के नेतृत्व क्षेत्र में असाधारण सफलता का संकेत देती है। आपकी निर्णय क्षमता और नेतृत्व शैली बहुत मजबूत है, जो आपको समाज में उच्च पद दिलाएगी।",
            carMercVen: "दशम भाव में {planets} का प्रभाव व्यापार, वित्तीय प्रबंधन, कला, रचनात्मक मीडिया या संचार के क्षेत्र में उत्कृष्ट करियर का संकेत देता है। आप अपने कौशल, वाणी और तीक्ष्ण बुद्धि से उच्च प्रतिष्ठा और धन अर्जित करेंगे।",
            carJup: "दशम भाव में देवगुरु बृहस्पति की शुभ उपस्थिति दर्शाती है कि आप शिक्षण, परामर्श, कानून, दर्शन या उच्च सलाहकार (Advisory) के रूप में एक अत्यंत सम्मानित और प्रतिष्ठित करियर प्राप्त करेंगे। लोग आपके ज्ञान का आदर करेंगे।",
            carOther: "दशम भाव में {planets} का गोचर/स्थान तकनीकी क्षेत्रों, आईटी, इंजीनियरिंग, या गहन अनुसंधान में प्रगति कराता है। करियर की शुरुआत में कुछ संघर्ष के बाद आप निरंतर सफलता की ओर अग्रसर रहेंगे।",
            carNone: "दशम भाव में किसी क्रूर ग्रह का अशुभ प्रभाव नहीं है। दशमेश की स्थिति के अनुसार आपका करियर स्वतंत्र उद्यमों, पेशेवर स्थिरता और व्यावसायिक सूझबूझ की ओर सकारात्मक इशारा करता है। आप जीवन के मध्य में एक सफल अधिकारी या उद्यमी बनेंगे।",
            
            wealthIntro: "द्वितीय भाव (संचित धन व परिवार) और एकादश भाव (आय व लाभ) आपके वित्तीय भाग्य को निर्धारित करते हैं। ",
            wealthBenefics: "आपकी कुंडली के धन/लाभ स्थान पर अत्यंत शुभ ग्रह ({planets}) की उपस्थिति जीवन में निरंतर धन के प्रवाह, पैतृक संपत्ति के लाभ और वित्तीय विलासिता को दर्शाती है। आपका हाथ हमेशा तंग नहीं रहेगा और आप आरामदेह जीवन जीएंगे।",
            wealthMercSun: "धन या आय भाव में {planets} का प्रभाव आपके व्यावसायिक कौशल, कुशल वाणी, कुशल वित्तीय निवेश और व्यापार के माध्यम से समृद्धि प्राप्त करने की आपकी अद्भुत क्षमता को दर्शाता है।",
            wealthOther: "इन भावों में {planets} की उपस्थिति संकेत देती है कि जीवन में धन संचय के लिए आपको अनुशासित प्रयास करने होंगे। शुरुआती जीवन में खर्चों पर नियंत्रण और समझदारी से किया गया दीर्घकालिक निवेश आपको बड़ी वित्तीय सुरक्षा प्रदान करेगा।",
            wealthNone: "आपके धन और आय भाव के स्वामी अनुकूल स्थिति में हैं। जीवन के मध्यकाल (32 वर्ष की आयु) के बाद आपकी आर्थिक स्थिति में तेजी से सुधार होगा और आप स्थायी संपत्ति तथा वाहनों का सुख प्राप्त करेंगे।",
            
            healthIntro: "षष्ठ भाव तीव्र रोगों का और अष्टम भाव दीर्घायु व गूढ़ शारीरिक प्रवृत्तियों का प्रतिनिधित्व करता है। ",
            healthSadeSati: "वर्तमान में आपकी कुंडली में शनि की साढ़ेसाती सक्रिय है। जोड़ों के दर्द, मानसिक तनाव, थकान और हड्डियों के स्वास्थ्य के प्रति विशेष सावधानी बरतें। प्रतिदिन योग और प्राणायाम आपके लिए अत्यंत आवश्यक है। ",
            healthPlanets: "आपके स्वास्थ्य भावों में {planets} की उपस्थिति दर्शाती है कि आपको वात या पित्त असंतुलन, पाचन संबंधी संवेदनशीलता या मौसमी एलर्जी जैसी समस्याएं हो सकती हैं। संतुलित शाकाहारी भोजन और समय पर नींद लेने से आप इन पर विजय प्राप्त कर सकते हैं।",
            healthNone: "आपका लग्नेश (Ascendant Lord) और छठे भाव का स्वामी बहुत मजबूत है, जो एक उत्कृष्ट रोग प्रतिरोधक क्षमता (Immunity) और मजबूत जीवन शक्ति का संकेत देता है। आप शारीरिक और मानसिक रूप से मजबूत बने रहेंगे।",
            
            marriageIntro: "सप्तम भाव और उसका अधिपति आपके दाम्पत्य जीवन, विवाह समय और साझेदारी की दिशा तय करते हैं। ",
            marriageManglik: "चूँकि आपकी कुंडली में मांगलिक योग (Manglik Dosha) उपस्थित है, इसलिए विवाह में जल्दबाजी करने से बचें। कुंडली मिलान के उपरांत विवाह करना आपके लिए अत्यंत शुभ, सुखद और स्थाई दाम्पत्य जीवन सुनिश्चित करेगा। ",
            marriagePlanets: "सप्तम भाव में {planets} की स्थिति दर्शाती है कि आपका जीवनसाथी बुद्धिमान, स्वतंत्र विचारों वाला और कर्तव्यनिष्ठ होगा। वैवाहिक जीवन में आदर और मधुर आपसी संवाद बनाए रखना रिश्ते को हमेशा मजबूत रखेगा।",
            marriageNone: "आपका सप्तम भाव संतुलित और शुभ प्रभावों में है। आपकी कुंडली के अनुसार, विवाह आपके जीवन में अपार भावनात्मक परिपक्वता, भाग्योदय और सामाजिक प्रतिष्ठा लेकर आएगा। आपका पार्टनर सहायक होगा।",
            
            eduIntro: "चतुर्थ भाव प्राथमिक शिक्षा व बौद्धिक आधार का है, तथा पंचम भाव उच्च शिक्षा, बुद्धिमत्ता व रचनात्मक विवेक का स्थान है। ",
            eduBenefics: "इन भावों में शुभ ग्रह ({planets}) की स्थिति आपकी तीव्र स्मरण शक्ति, अद्भुत सीखने की क्षमता और उत्कृष्ट अकादमिक रिकॉर्ड को दर्शाती है। आप अनुसंधान, कानून, परामर्श या शैक्षणिक क्षेत्रों में सर्वोच्च डिग्री प्राप्त कर सकते हैं।",
            eduSunMars: "शिक्षा भावों में {planets} का प्रभाव आपकी उत्कृष्ट तकनीकी समझ, गणितीय विश्लेषणात्मक कौशल और प्रतियोगी परीक्षाओं (Competitive Exams) में सफल होने के मजबूत इरादे को दर्शाता है।",
            eduOther: "इन भावों में {planets} की उपस्थिति पढ़ाई में शुरुआती ध्यान भटकाव या विषय में बदलाव का संकेत देती है, लेकिन आपकी गहरी खोजी और व्यावहारिक प्रकृति आपको बाद के वर्षों में विशेषज्ञ बनाएगी।",
            eduNone: "आपकी कुंडली के अनुसार आपकी शिक्षा संतुलित और व्यावहारिक रहेगी। आपका दिमाग किताबी ज्ञान की तुलना में व्यावहारिक और वास्तविक अनुभवों से सीखने की ओर अधिक आकर्षित होता है, जो भविष्य में बहुत काम आएगा।"
        },
        mr: {
            carIntro: "तुमच्या जन्मपत्रिकेत लग्न **{lagna}** आहे आणि दहावे (करिअर) स्थान **{sign10}** राशीत आहे. ",
            carSunMars: "दहाव्या स्थानात {planets} ची उपस्थिती प्रशासकीय सत्ता, सरकारी सेवा, कायदा अंमलबजावणी किंवा संस्थात्मक नेतृत्वात विलक्षण यशाचे संकेत देते. तुमची निर्णयक्षमता अत्यंत मजबूत आहे, जी तुम्हाला समाजात उच्च स्थान मिळवून देईल.",
            carMercVen: "दहाव्या स्थानात {planets} चा प्रभाव व्यवसाय, वित्तीय व्यवस्थापन, कला, रचनात्मक मीडिया किंवा संपर्काच्या क्षेत्रात उत्कृष्ट करिअर दर्शवतो. तुम्ही तुमच्या बुद्धिमत्तेने मोठी प्रतिष्ठा आणि संपत्ती मिळवाल.",
            carJup: "दहाव्या स्थानात देवगुरु बृहस्पतीची उपस्थिती दर्शवते की तुम्ही शिक्षण, सल्लागार, कायदा किंवा मार्गदर्शक म्हणून अत्यंत सन्माननीय करिअर प्राप्त कराल. लोक तुमच्या ज्ञानाचा आदर करतील.",
            carOther: "दहाव्या स्थानातील {planets} चे स्थान तंत्रज्ञान, आयटी, इंजिनिअरिंग किंवा संशोधनात प्रगती दर्शवते. सुरुवातीच्या संघर्षानंतर तुम्ही मोठी उंची गाठाल.",
            carNone: "दहाव्या स्थानावर कोणताही अशुभ प्रभाव नाही. तुमच्या करिअरमध्ये स्थिरता, स्वतंत्र व्यवसाय आणि व्यावसायिक प्रगतीचे सकारात्मक संकेत आहेत. तुम्ही एक यशस्वी उद्योजक किंवा अधिकारी व्हाल.",
            
            wealthIntro: "द्वितीय स्थान (संचित संपत्ती व कुटुंब) आणि अकरावे स्थान (उत्पन्न व लाभ) तुमचे आर्थिक भाग्य ठरवतात. ",
            wealthBenefics: "तुमच्या संपत्ती/लाभ स्थानावर अत्यंत शुभ ग्रह ({planets}) उपस्थित असल्याने जीवनात पैशांचा सतत ओघ, वारसा हक्काने मिळणारी संपत्ती आणि सुखी जीवन सुनिश्चित होते. तुमचे जीवन समृद्ध राहील.",
            wealthMercSun: "संपत्ती किंवा उत्पन्न स्थानात {planets} चा प्रभाव तुमच्या व्यावसायिक कौशल्यामुळे आणि हुशारीने धनलाभ दर्शवतो.",
            wealthOther: "या स्थानात {planets} ची उपस्थिती दर्शवते की तुम्हाला पैशांची बचत करण्यासाठी अनुशासित प्रयत्न करावे लागतील. योग्य गुंतवणूक फायदेशीर ठरेल.",
            wealthNone: "तुमच्या संपत्ती आणि उत्पन्न स्थानाचे स्वामी अनुकूल आहेत. वयाच्या ३० नंतर तुमची आर्थिक स्थिती वेगाने सुधारेल आणि स्थिर मालमत्ता निर्माण होईल.",
            
            healthIntro: "सहावे स्थान तीव्र आजारांचे आणि आठवे स्थान दीर्घायुष्य व आरोग्याचे प्रतिनिधित्व करते. ",
            healthSadeSati: "सध्या तुमच्या पत्रिकेत शनीची साडेसाती सुरू आहे. सांधेदुखी, मानसिक ताण आणि हाडांच्या आरोग्याबाबत विशेष काळजी घ्या. ध्यानधारणा करणे अत्यंत गरजेचे आहे. ",
            healthPlanets: "तुमच्या आरोग्य स्थानात {planets} ची उपस्थिती दर्शवते की पचनक्रिया किंवा शारीरिक थकवा यासारख्या किरकोळ समस्या उद्भवू शकतात. योग्य आहाराने तुम्ही निरोगी राहाल.",
            healthNone: "तुमचा लग्नेश आणि सहाव्या स्थानाचा स्वामी अत्यंत मजबूत आहे, जे उत्तम रोगप्रतिकारक शक्ती आणि चांगल्या आरोग्याचे संकेत देते.",
            
            marriageIntro: "सप्तम स्थान आणि त्याचा स्वामी तुमच्या वैवाहिक जीवनाची दिशा ठरवतात. ",
            marriageManglik: "तुमच्या पत्रिकेत मांगलिक योग असल्यामुळे विवाह ठरवताना घाई करू नका. कुंडली जुळवून लग्न करणे वैवाहिक सुखासाठी अत्यंत आवश्यक आहे. ",
            marriagePlanets: "सप्तम स्थानात {planets} ची उपस्थिती दर्शवते की तुमचा जोडीदार बुद्धिमान, स्वतंत्र विचारांचा आणि कर्तव्यदक्ष असेल. वैवाहिक नात्यात आदर ठेवावा.",
            marriageNone: "तुमचे सप्तम स्थान संतुलित आहे. लग्नानंतर तुमच्या भाग्योदयात आणि वैवाहिक जीवनात प्रचंड स्थैर्य आणि आनंद येईल.",
            
            eduIntro: "चौथे स्थान प्राथमिक शिक्षणाचे आणि पाचवे स्थान उच्च शिक्षण व बुद्धिमत्तेचे प्रतिनिधित्व करते. ",
            eduBenefics: "या स्थानात शुभ ग्रह ({planets}) असल्याने तुमची स्मरणशक्ती तीव्र राहील आणि शिक्षण क्षेत्रात तुम्ही उच्च यश मिळवाल.",
            eduSunMars: "शिक्षण स्थानावर {planets} चा प्रभाव तुमची तांत्रिक समज आणि स्पर्धा परीक्षेत यश मिळवण्याची जिद्द दर्शवतो.",
            eduOther: "या स्थानात {planets} ची उपस्थिती शिक्षणात काही अडथळे किंवा विषय बदलण्याचे संकेत देते, पण नंतर तुम्ही त्यात यश मिळवाल.",
            eduNone: "शिक्षणाचा प्रवास सामान्य व चांगला राहील. तुमचे मन पुस्तकी ज्ञानापेक्षा व्यावहारिक ज्ञानाकडे अधिक आकर्षित होईल."
        },
        gu: {
            carIntro: "તમારી જન્મકુંડળીમાં લગ્ન **{lagna}** છે અને દશમ (કરિયર) ભાવ **{sign10}** રાશિમાં છે. ",
            carSunMars: "દશમ ભાવમાં {planets} ની હાજરી વહીવટી સત્તા, સરકારી નોકરી કે સંગઠન નેતૃત્વના ક્ષેત્રમાં અસાધારણ સફળતા સૂચવે છે. તમારી નિર્ણય ક્ષમતા ઉત્તમ રહેશે, જે તમને ઉચ્ચ પદ અપાવશે.",
            carMercVen: "દશમ ભાવમાં {planets} નો પ્રભાવ વ્યાપાર, નાણાકીય વ્યવસ્થાપન, કલા અથવા સંચારના ક્ષેત્રમાં ઉત્તમ સફળતા અપાવશે. તમે તમારી બુદ્ધિથી ધન કમાશો.",
            carJup: "દશમ ભાવમાં દેવગુરુ બૃહસ્પતિની હાજરી દર્શાવે છે કે તમે શિક્ષણ, કાયદો અથવા સલાહકાર તરીકે ખૂબ જ આદરણીય પદ પ્રાપ્ત કરશો. લોકો તમારા જ્ઞાનનું સન્માન કરશે.",
            carOther: "દશમ ભાવમાં {planets} નું સ્થાન આઈટી, એન્જિનિયરિંગ અથવા વૈજ્ઞાનિક સંશોધનમાં પ્રગતિ કરાવશે. મહેનત પછી કરિયરમાં ઊંચાઈ પ્રાપ્ત કરશો.",
            carNone: "દશમ ભાવ પર કોઈ અશુભ ગ્રહનો પ્રભાવ નથી. તમારું કરિયર સ્થિર અને પ્રગતિશીલ રહેશે. વ્યાપારમાં સફળતાના પ્રબળ યોગ છે.",
            
            wealthIntro: "દ્વિતીય ભાવ (સંપત્તિ અને પરિવાર) અને અગિયારમો ભાવ (આવક અને લાભ) તમારું આર્થિક ભાગ્ય નક્કી કરે છે. ",
            wealthBenefics: "કુંડળીના ધન/લાભ સ્થાન પર શુભ ગ્રહ ({planets}) ની હાજરી જીવનમાં સતત ધન પ્રવાહ અને વૈભવી જીવન સુનિશ્ચિત કરે છે. તમને ભૌતિક સુખો પ્રાપ્ત થશે.",
            wealthMercSun: "ધન કે આવક ભાવમાં {planets} નો પ્રભાવ વ્યાપારિક કૌશલ્ય અને બુદ્ધિ દ્વારા ધન કમાવવાની તમારી ક્ષમતા દર્શાવે છે.",
            wealthOther: "આ ભાવોમાં {planets} ની હાજરી સૂચવે છે કે ધન સંચય માટે તમારે આયોજનપૂર્વક બચત કરવી પડશે અને બજેટનું પાલન કરવું પડશે.",
            wealthNone: "ધન અને આવક ભાવના સ્વામી સારી સ્થિતિમાં છે. ૩૦ વર્ષની ઉંમર પછી તમારી આર્થિક સ્થિતિ ઝડપથી સુધરશે અને સ્થાવર મિલકત બનશે.",
            
            healthIntro: "છઠ્ઠો ભાવ તીવ્ર રોગોનો અને આઠમો ભાવ દીર્ઘાયુષ્ય તેમજ આરોગ્યનો છે. ",
            healthSadeSati: "હાલમાં તમારી કુંડળીમાં શનિની સાડાસાતી સક્રિય છે. સાંધાના દુખાવા, માનસિક તણાવ અને હાડકાના સ્વાસ્થ્ય પ્રત્યે કાળજી રાખવી. યોગ કરવા જરૂરી છે. ",
            healthPlanets: "આરોગ્ય ભાવમાં {planets} ની હાજરી પાચન સંબંધી સંવેદનશીલતા દર્શાવે છે. નિયમિત અને સાત્વિક આહાર રાખવો.",
            healthNone: "તમારા લગ્નેશ અને છઠ્ઠા ભાવના સ્વામી ખૂબ મજબૂત છે, જે ઉત્તમ રોગપ્રતિકારક શક્તિ અને શારીરિક બળ દર્શાવે છે.",
            
            marriageIntro: "સપ્તમ ભાવ અને તેનો સ્વામી તમારા લગ્ન જીવનની દિશા નક્કી કરે છે. ",
            marriageManglik: "તમારી કુંડળીમાં માંગલિક દોષ હાજર હોવાથી, લગ્ન પહેલા કુંડળી મિલાન કરાવવું ખૂબ જ શુભ રહેશે અને સુખી ગૃહસ્થ જીવન સુનિશ્ચિત કરશે. ",
            marriagePlanets: "સપ્તમ ભાવમાં {planets} ની હાજરી દર્શાવે છે કે તમારા જીવનસાથી બુદ્ધિશાળી અને ખૂબ જ જવાબદાર વ્યક્તિ હશે. સંબંધોમાં મધુરતા રહેશે.",
            marriageNone: "તમારો સપ્તમ ભાવ સંતુલિત છે. લગ્ન તમારા જીવનમાં સ્થિરતા, પ્રગતિ અને ભાગ્યોદય લાવશે.",
            
            eduIntro: "ચોથો ભાવ પ્રાથમિક શિક્ષણનો અને પાંચમો ભાવ ઉચ્ચ શિક્ષણ તેમજ બુદ્ધિનો છે. ",
            eduBenefics: "આ ભાવોમાં શુભ ગ્રહ ({planets}) ની હાજરી તમારી તીવ્ર સ્મરણ શક્તિ અને ઉત્કૃષ્ટ શિક્ષણ કારકિર્દી સૂચવે છે. ઉચ્ચ ડિગ્રી મળશે.",
            eduSunMars: "શિક્ષણ ભાવોમાં {planets} નો પ્રભાવ તમારી એન્જિનિયરિંગ કે સ્પર્ધાત્મક પરીક્ષાઓમાં સફળતા અપાવશે.",
            eduOther: "આ ભાવોમાં {planets} ની હાજરી ભણવામાં નાની મોટી અડચણો પછી અંતે ઉચ્ચ જ્ઞાન અપાવશે.",
            eduNone: "તમારું શિક્ષણ સામાન્ય અને વ્યવહારિક રહેશે. તમે પ્રેક્ટિકલ નોલેજ દ્વારા વધુ શીખી શકશો."
        },
        bn: {
            carIntro: "আপনার জন্মকুণ্ডলীতে লগ্ন হল **{lagna}** এবং দশম (কর্ম) ভাব **{sign10}** রাশিতে অবস্থিত। ",
            carSunMars: "দশম ভাবে {planets}-এর উপস্থিতি প্রশাসনিক ক্ষমতা, সরকারি চাকরি, বা নেতৃত্বের ক্ষেত্রে অসাধারণ সাফল্যের ইঙ্গিত দেয়। আপনার সিদ্ধান্ত নেওয়ার ক্ষমতা দারুণ, যা সমাজে সম্মান বৃদ্ধি করবে।",
            carMercVen: "দশম ভাবে {planets}-এর প্রভাব ব্যবসা, আর্থিক ব্যবস্থাপনা, শিল্পকলা বা যোগাযোগের ক্ষেত্রে চমৎকার সাফল্য নিশ্চিত করবে। বুদ্ধিমত্তা দিয়ে আপনি অর্থ উপার্জন করবেন।",
            carJup: "দশম ভাবে দেবগুরু বৃহস্পতির শুভ অবস্থান নির্দেশ করে যে আপনি শিক্ষকতা, আইন, বা উচ্চ স্তরের পরামর্শদাতা হিসেবে সম্মানিত পেশা লাভ করবেন। জ্ঞান দ্বারা আপনি প্রশংসিত হবেন।",
            carOther: "দশম ভাবে {planets}-এর অবস্থান প্রযুক্তি, তথ্যপ্রযুক্তি, ইঞ্জিনিয়ারিং বা গবেষণার ক্ষেত্রে অগ্রগতির ইঙ্গিত দেয়। কঠোর পরিশ্রমের মাধ্যমে ক্যারিয়ার উন্নত হবে।",
            carNone: "দশম ভাবটি শুভ প্রভাব যুক্ত। আপনার পেশাগত জীবন অত্যন্ত স্থিতিশীল ও প্রগতিশীল হবে। ব্যবসায় বা স্বাধীন উদ্যোগের জোরালো সম্ভাবনা রয়েছে।",
            
            wealthIntro: "দ্বিতীয় ভাব (সঞ্চিত অর্থ ও পরিবার) এবং একাদশ ভাব (আয় ও লাভ) আপনার আর্থিক ভাগ্য নির্ধারণ করে। ",
            wealthBenefics: "আপনার অর্থ/লাভ স্থানে শুভ গ্রহের ({planets}) উপস্থিতি জীবনে নিয়মিত অর্থের প্রবাহ এবং সমৃদ্ধি নিশ্চিত করে। আপনি সব রকম জাগতিক সুখ ভোগ করবেন।",
            wealthMercSun: "ধন বা আয় ভাবে {planets}-এর প্রভাব আপনার ব্যবসায়িক দক্ষতা এবং বুদ্ধি দিয়ে অর্থ উপার্জনের ইঙ্গিত দেয়। বিনিয়োগ আপনার অনুকূলে থাকবে।",
            wealthOther: "এই ভাবগুলিতে {planets}-এর উপস্থিতি নির্দেশ করে যে সঞ্চয়ের জন্য আপনাকে একটু পরিশ্রম করতে হবে ও অতিরিক্ত ব্যয় নিয়ন্ত্রণ করতে হবে।",
            wealthNone: "আপনার অর্থ ও আয় ভাবের অধিপতি শুভ অবস্থানে রয়েছেন। ৩০ বছর বয়সের পর আপনার আর্থিক অবস্থার দ্রুত উন্নতি হবে এবং নিজস্ব বাড়ি বা গাড়ি হবে।",
            
            healthIntro: "ষষ্ঠ ভাব রোগব্যাধি এবং অষ্টম ভাব দীর্ঘায়ু ও স্বাস্থ্যের নির্দেশক। ",
            healthSadeSati: "বর্তমানে আপনার কুণ্ডলীতে শনির সাড়ে সাতি চলছে। গাঁটের ব্যথা, মানসিক চাপ এবং হাড়ের স্বাস্থ্যের প্রতি যত্ন নিন। প্রাণায়াম করা উপকারী হবে। ",
            healthPlanets: "আপনার স্বাস্থ্য ভাবগুলিতে {planets}-এর উপস্থিতি হজমের সমস্যা বা ক্লান্তি নির্দেশ করতে পারে। সঠিক ও সুষম খাদ্যাভ্যাস বজায় রাখুন।",
            healthNone: "আপনার লগ্নপতি এবং ষষ্ঠপতি অত্যন্ত শক্তিশালী, যা আপনার চমৎকার রোগ প্রতিরোধ ক্ষমতা ও কর্মশক্তি নির্দেশ করে।",
            
            marriageIntro: "সপ্তম ভাব এবং তার অধিপতি আপনার দাম্পত্য জীবন ও অংশীদারিত্বের দিক নির্ধারণ করে। ",
            marriageManglik: "যেহেতু আপনার কুণ্ডলীতে মাঙ্গলিক যোগ রয়েছে, তাই বিয়ের আগে কুষ্ঠি মিলিয়ে নেওয়া সুখের দাম্পত্যের জন্য অত্যন্ত শুভ হবে। ",
            marriagePlanets: "সপ্তম ভাবে {planets}-এর অবস্থান নির্দেশ করে যে আপনার জীবনসঙ্গী অত্যন্ত বুদ্ধিমান এবং দায়িত্বশীল হবেন। সম্পর্কে পারস্পরিক শ্রদ্ধা বজায় থাকবে।",
            marriageNone: "আপনার সপ্তম ভাবটি অত্যন্ত শুভ ও স্থিতিশীল। বিবাহ আপনার জীবনে মানসিক শান্তি, ভাগ্য উন্নতি এবং সৌভাগ্য বয়ে আনবে।",
            
            eduIntro: "চতুর্থ ভাব প্রাথমিক শিক্ষা এবং পঞ্চম ভাব উচ্চ শিক্ষা ও মেধার স্থান। ",
            eduBenefics: "এই ভাবগুলিতে শুভ গ্রহের ({planets}) অবস্থান আপনার প্রখর স্মৃতিশক্তি এবং শিক্ষাক্ষেত্রে অসাধারণ সাফল্যের নির্দেশক। উচ্চ ডিগ্রির সম্ভাবনা রয়েছে।",
            eduSunMars: "শিক্ষা ভাবে {planets}-এর প্রভাব কারিগরি বিদ্যা ও যেকোনো প্রতিযোগিতামূলক পরীক্ষায় সাফল্যের ইঙ্গিত দেয়।",
            eduOther: "এই ভাবগুলিতে {planets}-এর উপস্থিতি পড়াশোনায় সামান্য মনোযোগের অভাব নির্দেশ করলেও পরবর্তীতে আপনি সফল হবেন।",
            eduNone: "আপনার পড়াশোনা অত্যন্ত বাস্তবসম্মত ও ভালো হবে। আপনি বইয়ের চেয়ে বাস্তব অভিজ্ঞতা থেকে বেশি শিখবেন।"
        },
        ta: {
            carIntro: "உங்கள் ஜாதகத்தில் லக்னம் **{lagna}** ஆகவும், பத்தாம் (தொழில்) வீடு **{sign10}** ராசியிலும் அமைந்துள்ளது. ",
            carSunMars: "பத்தாம் வீட்டில் {planets} இருப்பு நிர்வாக அதிகாரம், அரசு வேலை, காவல்துறை அல்லது தலைமைப் பொறுப்புகளில் பெரும் வெற்றியைக் குறிக்கிறது. உங்கள் முடிவெடுக்கும் திறன் சிறந்தது.",
            carMercVen: "பத்தாம் வீட்டில் {planets} செல்வாக்கு வணிகம், நிதி மேலாண்மை, கலை அல்லது தகவல் தொடர்புத் துறையில் சிறந்த முன்னேற்றத்தை அளிக்கும். புத்தி கூர்மையால் புகழ் அடைவீர்கள்.",
            carJup: "பத்தாம் வீட்டில் குரு பகவான் இருப்பது கல்வி, சட்டம் அல்லது ஆலோசனைக் குழுக்களில் மிகவும் மதிக்கத்தக்க பதவிகளைப் பெற்றுத் தரும். உங்கள் அறிவை உலகம் போற்றும்.",
            carOther: "பத்தாம் வீட்டில் {planets} அமைவது தகவல் தொழில்நுட்பம், பொறியியல் அல்லது ஆராய்ச்சித் துறைகளில் சாதகமான முன்னேற்றத்தைக் காட்டும். உழைப்பு பலன் தரும்.",
            carNone: "பத்தாம் வீடு சுபத்துவமாக உள்ளது. உங்கள் தொழில் வாழ்க்கை நிலையானதாகவும், நல்ல தொழில் அதிபராக வளரவும் வழிகாட்டும். வியாபாரத்தில் முன்னேறுவீர்கள்.",
            
            wealthIntro: "இரண்டாம் வீடு (சேமிப்பு, குடும்பம்) மற்றும் பதினொன்றாம் வீடு (வருமானம், லாபம்) உங்கள் நிதி நிலையைத் தீர்மானிக்கின்றன. ",
            wealthBenefics: "உங்கள் தன/லாப வீட்டில் சுப கிரகங்கள் ({planets}) இருப்பது வாழ்க்கையில் தொடர்ச்சியான பணப்புழக்கம் மற்றும் வசதிகளைக் குறிக்கிறது. வசதியான வாழ்க்கை அமையும்.",
            wealthMercSun: "தன அல்லது லாப வீட்டில் {planets} இருப்பது உங்கள் பேச்சுத் திறமை மற்றும் வியாபார புத்தியால் தனலாபம் பெறுவதைக் காட்டுகிறது.",
            wealthOther: "இந்த வீடுகளில் {planets} இருப்பது சேமிப்பில் நீங்கள் கவனமாக இருக்க வேண்டும் என்பதைக் காட்டுகிறது. தேவையற்ற செலவுகளைக் குறைக்கவும்.",
            wealthNone: "உங்கள் தன மற்றும் லாப வீட்டின் அதிபதிகள் நல்ல நிலையில் உள்ளனர். உங்கள் 30 வயதுக்குப் பின் சொத்து மற்றும் வாகன யோகம் உண்டாகும்.",
            
            healthIntro: "ஆறாம் வீடு குறுகிய கால நோய்களையும் எட்டாம் வீடு நீண்ட கால நோய்களையும் ஆயுளையும் குறிக்கிறது. ",
            healthSadeSati: "தற்போது உங்கள் ஜாதகத்தில் ஏழரை சனி நடக்கிறது. மூட்டு வலி, மன உளைச்சல் மற்றும் எலும்பு ஆரோக்கியத்தில் கூடுதல் கவனம் செலுத்தவும். தியானம் நல்லது. ",
            healthPlanets: "உங்கள் ஆரோக்கிய வீட்டில் {planets} இருப்பது அஜீரணம் அல்லது உடல் சோர்வு போன்ற சிறு பிரச்சனைகளைக் காட்டலாம். சமச்சீர் உணவு தேவை.",
            healthNone: "உங்கள் லக்னாதிபதியும் ஆறாம் அதிபதியும் வலுவாக உள்ளதால், உங்களுக்கு சிறந்த நோய் எதிர்ப்புச் சக்தியும் நீண்ட ஆயுளும் அமையும்.",
            
            marriageIntro: "ஏழாம் வீடு மற்றும் அதன் அதிபதி உங்கள் திருமண வாழ்க்கையையும் கூட்டாளியையும் தீர்மானிக்கிறது. ",
            marriageManglik: "உங்கள் ஜாதகத்தில் செவ்வாய் தோஷம் உள்ளதால், திருமணத்திற்கு முன் ஜாதக பொருத்தம் பார்ப்பது மிகவும் அவசியமான ஒன்றாகும். இது திருமண வாழ்வில் அமைதி தரும். ",
            marriagePlanets: "ஏழாம் வீட்டில் {planets} இருப்பது உங்கள் வாழ்க்கைத்துணை புத்திசாலியாகவும், பொறுப்புள்ளவராகவும் இருப்பார் என்பதைக் காட்டுகிறது. அன்யோன்யம் கூடும்.",
            marriageNone: "உங்கள் ஏழாம் வீடு சுபத்துவமாக உள்ளது. திருமணம் உங்கள் வாழ்க்கையில் பெரும் ஸ்திரத்தன்மையையும் யோகத்தையும் தரும்.",
            
            eduIntro: "நான்காம் வீடு ஆரம்ப கல்வியையும் ஐந்தாம் வீடு உயர் கல்வி மற்றும் புத்தி கூர்மையையும் குறிக்கிறது. ",
            eduBenefics: "இந்த வீடுகளில் சுப கிரகங்கள் ({planets}) இருப்பது கூர்மையான நினைவாற்றல் மற்றும் கல்வித் துறையில் சிறந்த உயர் கல்வியைக் குறிக்கிறது. ஆராய்ச்சிப் படிப்புகள் அமையும்.",
            eduSunMars: "கல்வி வீட்டில் {planets} இருப்பது தொழில்நுட்பக் கல்வி மற்றும் போட்டித் தேர்வுகளில் வெற்றியைக் குறிக்கிறது.",
            eduOther: "இந்த வீடுகளில் {planets} இருப்பது ஆரம்ப கல்வியில் சிறு தடைகளுக்குப் பின் உயர் கல்வியை வெல்லுவதைக் குறிக்கும்.",
            eduNone: "உங்கள் கல்வி வாழ்க்கை சீராக இருக்கும். நீங்கள் புத்தக அறிவை விட அனுபவ அறிவைப் பெறுவதில் அதிக ஆர்வம் காட்டுவீர்கள்."
        },
        te: {
            carIntro: "మీ జన్మ కుండలిలో లగ్నం **{lagna}** మరియు పదవ (ఉద్యోగ) భావం **{sign10}** రాశిలో ఉన్నాయి. ",
            carSunMars: "పదవ భావంలో {planets} ఉండటం పరిపాలన అధికారం, ప్రభుత్వ ఉద్యోగం, లేదా నాయకత్వ రంగాలలో అద్భుతమైన విజయానికి సూచిక. మీ నిర్ణయాత్మక శక్తి సమాజంలో కీర్తిని ఇస్తుంది.",
            carMercVen: "పదవ భావంలో {planets} ప్రభావం వ్యాపారం, ఆర్థిక రంగం, కళలు లేదా కమ్యూనికేషన్ రంగాలలో గొప్ప వృత్తిని అందిస్తుంది. మీ చాతుర్యంతో ధనాన్ని ఆర్జిస్తారు.",
            carJup: "మీ పీఠికలో ఉన్న ప్లానెట్స్ ఆధారంగా దేవగురు బృహస్పతి అనుగ్రహం వల్ల మీరు బోధన, చట్టం, లేదా సలహాదారుగా సమాజంలో ఉన్నత గౌరవం పొందుతారు. మీ జ్ఞానాన్ని అందరూ గౌరవిస్తారు.",
            carOther: "పదవ భావంలో {planets} ఉండటం సాంకేతిక రంగం, ఐటీ, ఇంజనీరింగ్ లేదా పరిశోధనలలో పురోగతిని సూచిస్తుంది. శ్రమ తరువాత ఉన్నత శిఖరాలను చేరుకుంటారు.",
            carNone: "పదవ భావం శుభప్రదంగా ఉంది. మీ వృత్తి జీవితం స్థిరంగా మరియు స్వతంత్రంగా అభివృద్ధి చెందుతుంది. గొప్ప అధికారిగా ఎదుగుతారు.",
            
            wealthIntro: "ద్వితీయ భావం (ధనము, కుటుంబము) మరియు ఏకాదశ భావం (ఆదాయము, లాభము) మీ ఆర్థిక జీవితాన్ని నిర్ణయిస్తాయి. ",
            wealthBenefics: "మీ ధన లేదా లాభ స్థానాలలో శుభ గ్రహాల ({planets}) అనుగ్రహం వల్ల నిరంతర ధన ప్రవాహం మరియు భౌతిక సుఖాలు కలుగుతాయి. విలాసవంతమైన జీవితం మీ సొంతం.",
            wealthMercSun: "ధన భావంలో {planets} ప్రభావం మీ వ్యాపార నైపుణ్యం, వాక్చాతుర్యం ద్వారా గొప్పగా ధనాన్ని సంపాదించడాన్ని సూచిస్తుంది.",
            wealthOther: "ఈ భావాలలో {planets} ఉండటం వల్ల ఖర్చులను అదుపులో ఉంచుకుని, భవిష్యత్తు కోసం పొదుపు చేయవలసి ఉంటుంది.",
            wealthNone: "మీ ధన మరియు లాభ స్థానాల అధిపతులు అనుకూలంగా ఉన్నారు. 30 సంవత్సరాల వయస్సు తర్వాత మీకు సొంత ఇల్లు, వాహన యోగం కలుగుతాయి.",
            
            healthIntro: "ఆరవ భావం రోగాలను మరియు ఎనిమిదవ భావం దీర్ఘాయువు, ఆరోగ్య సమస్యలను సూచిస్తాయి. ",
            healthSadeSati: "ప్రస్తుతం మీ జాతకంలో ఏలినాటి శని నడుస్తోంది. కీళ్ల నొప్పులు, మానసిక ఒత్తిడి మరియు ఎముకల ఆరోగ్యం పట్ల జాగ్రత్త వహించండి. యోగా అవసరం. ",
            healthPlanets: "ఆరోగ్య భావాలలో {planets} ఉండటం వల్ల జీర్ణక్రియ సమస్యలు లేదా అలసట వచ్చే అవకాశం ఉంది. మంచి ఆహార నియమాలు పాటించండి.",
            healthNone: "మీ లగ్నాధిపతి మరియు ఆరవ స్థానాధిపతి బలంగా ఉండటం వల్ల మీకు అద్భుతమైన రోగనిరోధక శక్తి మరియు దీర్ఘాయువు లభిస్తాయి.",
            
            marriageIntro: "సప్తామ భావం మరియు దాని అధిపతి మీ వైవాహిక జీవితాన్ని, భాగస్వామిని నిర్ణయిస్తారు. ",
            marriageManglik: "మీ జాతకంలో మాంగళిక దోషం ఉన్నందున, వివాహానికి ముందే జాతక పొంతన (గుణ మేళనం) చేసుకోవడం చాలా అవసరం. ఇది దాంపత్య సౌఖ్యాన్ని ఇస్తుంది. ",
            marriagePlanets: "సప్తమ భావంలో {planets} ఉండటం వల్ల మీ జీవిత భాగస్వామి చాలా తెలివైనవారు, బాధ్యతాయుతమైనవారు అవుతారు. పరస్పర గౌరవం ఉంటుంది.",
            marriageNone: "మీ సగటు సప్తమ భావం చాలా అనుకూలంగా ఉంది. వివాహం మీ జీవితంలో గొప్ప స్థిరత్వాన్ని మరియు అదృష్టాన్ని తెస్తుంది.",
            
            eduIntro: "నాల్గవ భావం ప్రాథమిక విద్యను మరియు ఐదవ భావం ఉన్నత విద్య, బుద్ధిబలాన్ని సూచిస్తాయి. ",
            eduBenefics: "ఈ భావాలలో శుభ గ్రహాల ({planets}) అనుగ్రహం వల్ల మీకు అద్భుతమైన జ్ఞాపకశక్తి మరియు ఉన్నత విద్య లభిస్తాయి. రీసెర్చ్ యోగం ఉంది.",
            eduSunMars: "విద్య స్థానంలో {planets} ప్రభావం వల్ల సాంకేతిక విద్య లేదా పోటీ పరీక్షలలో విజయం సాధిస్తారు.",
            eduOther: "ఈ భావాలలో {planets} ఉండటం వల్ల చదువులో స్వల్ప అంతరాయాలు వచ్చినప్పటికీ, తర్వాత ఉన్నత విద్యను సాధిస్తారు.",
            eduNone: "మీ చదువు సాధారణంగా మరియు బాగుంటుంది. మీరు పుస్తక జ్ఞానం కంటే అనుభవ జ్ఞానాన్ని ఎక్కువగా ఇష్టపడతారు."
        },
        kn: {
            carIntro: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನವು **{lagna}** ಆಗಿದ್ದು, ಹತ್ತನೇ (ವೃತ್ತಿ) ಸ್ಥಾನವು **{sign10}** ರಾಶಿಯಲ್ಲಿದೆ. ",
            carSunMars: "ಹತ್ತನೇ ಮನೆಯಲ್ಲಿ {planets} ಇರುವುದು ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ, ಸರ್ಕಾರಿ ಸೇವೆ, ಕಾನೂನು ರಕ್ಷಣೆ ಅಥವಾ ನಾಯಕತ್ವದ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅದ್ಭುತ ಯಶಸ್ಸನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನಿಮ್ಮ ನಿರ್ಧಾರ ಶಕ್ತಿಯು ಗೌರವ ತರುತ್ತದೆ.",
            carMercVen: "ಹತ್ತನೇ ಮನೆಯಲ್ಲಿ {planets} ಪ್ರಭಾವವು ವ್ಯಾಪಾರ, ಹಣಕಾಸು ನಿರ್ವಹಣೆ, ಕಲೆ ಅಥವಾ ಸಂವಹನ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ವೃತ್ತಿಜೀವನವನ್ನು ನೀಡುತ್ತದೆ. ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಯಶಸ್ಸು ಕಾಣುವಿರಿ.",
            carJup: "ಹತ್ತನೇ ಮನೆಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಶುಭ ಸ್ಥಾನವು ನೀವು ಶಿಕ್ಷಣ, ಕಾನೂನು ಅಥವಾ ಉನ್ನತ ಸಲಹೆಗಾರರಾಗಿ ಗೌರವಾನ್ವಿತ ವೃತ್ತಿ ಪಡೆಯುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಜನ ನಿಮ್ಮನ್ನು ಗೌರವಿಸುತ್ತಾರೆ.",
            carOther: "ಹತ್ತನೇ ಮನೆಯಲ್ಲಿ {planets} ಇರುವುದು ಐಟಿ, ತಂತ್ರಜ್ಞಾನ, ಎಂಜಿನಿಯರಿಂಗ್ ಅಥವಾ ಸಂಶೋधನಾ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಗತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಆರಂಭಿಕ ಕಷ್ಟದ ನಂತರ ಉನ್ನತ ಸ್ಥಾನ ಸಿಗಲಿದೆ.",
            carNone: "ಹತ್ತನೇ ಮನೆ ಯಾವುದೇ ಅಶುಭ ಪ್ರಭಾವದಿಂದ ಮುಕ್ತವಾಗಿದೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಜೀವನವು ಸ್ಥಿರವಾಗಿ ಮತ್ತು ಯಶಸ್ವಿಯಾಗಿ ಮುನ್ನಡೆಯುತ್ತದೆ. ಹೊಸ ಉದ್ಯಮಗಳಿಗೆ ಉತ್ತಮ ಕಾಲವಿದೆ.",
            
            wealthIntro: "ದ್ವಿತೀಯ ಭಾವ (ಸಂಪತ್ತು ಮತ್ತು ಕುಟುಂಬ) ಮತ್ತು ಏಕಾದಶ ಭಾವ (ಲಾಭ) ನಿಮ್ಮ ಆರ್ಥಿಕ ಅದೃಷ್ಟವನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ. ",
            wealthBenefics: "ನಿಮ್ಮ ಧನ/ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ({planets}) ಉಪಸ್ಥಿತಿಯು ನಿರಂತರ ಧನ ಪ್ರವಾಹ ಮತ್ತು ಆರ್ಥಿಕ ಸುಖವನ್ನು ನೀಡುತ್ತದೆ. ಐಷಾರಾಮಿ ಜೀವನ ನಡೆಸುವಿರಿ.",
            wealthMercSun: "ಧನ ಅಥವಾ ಲಾಭ ಭಾವದಲ್ಲಿ {planets} ಪ್ರಭಾವವು ನಿಮ್ಮ ವ್ಯವಹಾರ ಕೌಶಲ ಮತ್ತು ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಧನ ಸಂಪಾದನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
            wealthOther: "ಈ ಭಾವಗಳಲ್ಲಿ {planets} ಇರುವುದರಿಂದ ನೀವು ಹಣದ ಉಳಿತಾಯಕ್ಕೆ ಮತ್ತು ಹೂಡಿಕೆಗೆ ಹೆಚ್ಚಿನ ಗಮನ ನೀಡಬೇಕಾಗುತ್ತದೆ.",
            wealthNone: "ನಿಮ್ಮ ಧನ ಮತ್ತು ಲಾಭ ಭಾವಗಳ ಅಧಿಪತಿಗಳು ಉತ್ತಮ ಸ್ಥಾನದಲ್ಲಿದ್ದಾರೆ. 30 ವರ್ಷಗಳ ನಂತರ ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿ ವೇಗವಾಗಿ ಸುಧಾರಿಸುತ್ತದೆ ಮತ್ತು ಆಸ್ತಿ ಯೋಗವಿದೆ.",
            
            healthIntro: "ಆರನೇ ಮನೆ ತೀವ್ರ ಕಾಯಿಲೆಗಳನ್ನು ಮತ್ತು ಎಂಟನೇ ಮನೆ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆರೋಗ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ",
            healthSadeSati: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಶನಿ ಸಾಡೇ ಸಾತಿ ಸಕ್ರಿಯವಾಗಿದೆ. ಕೀಲು ನೋವು, ಕೀಲುಗಳ ತೊಂದರೆ ಹಾಗೂ ಮೂಳೆಗಳ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ. ಧ್ಯಾನ ಅಗತ್ಯ. ",
            healthPlanets: "ಆರೋಗ್ಯ ಭಾವಗಳಲ್ಲಿ {planets} ಇರುವುದರಿಂದ ಜೀರ್ಣಕ್ರಿಯೆಯ समस्या ಅಥವಾ ದೈಹಿಕ ಆಯಾಸ ಉಂಟಾಗಬಹುದು. ಸಮತೋಲಿತ ಆಹಾರ ಪದ್ಧತಿ ರೂಢಿಸಿಕೊಳ್ಳಿ.",
            healthNone: "ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿ ಮತ್ತು ಆರನೇ ಮನೆಯ ಅಧಿಪತಿ ಬಲಶಾಲಿಯಾಗಿದ್ದು, ಇದು ಉತ್ತಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಮತ್ತು ನಿರಂತರ ಆರೋಗ್ಯವನ್ನು ನೀಡುತ್ತದೆ.",
            
            marriageIntro: "ಸಪ್ತಮ ಭಾವ ಮತ್ತು ಅದರ ಅಧಿಪತಿ ನಿಮ್ಮ ವೈವಾಹಿಕ ಜೀವನವನ್ನು ನಿರ್ಧರಿಸುತ್ತಾರೆ. ",
            marriageManglik: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಮಾಂಗ್ಲಿಕ್ ದೋಷ ಇರುವುದರಿಂದ, ವಿವಾಹದ ಮೊದಲು ಜಾತಕ ಹೊಂದಾಣಿಕೆ ಮಾಡಿಕೊಳ್ಳುವುದು ಸುಖಮಯ ಜೀವನಕ್ಕೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ. ",
            marriagePlanets: "ಸಪ್ತಮ ಭಾವದಲ್ಲಿ {planets} ಇರುವುದು ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿ ಬುದ್ಧಿವಂತರು ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ವ್ಯಕ್ತಿಯಾಗುತ್ತಾರೆ ಎಂಬುದನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಗೌರವ ಇರಲಿ.",
            marriageNone: "ನಿಮ್ಮ ಸಪ್ತಮ ಭಾವವು ಶುಭ ಪ್ರಭಾವದಲ್ಲಿದೆ. ವಿವಾಹವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆ ಮತ್ತು ಭಾಗ್ಯೋದಯವನ್ನು ತರುತ್ತದೆ.",
            
            eduIntro: "ನಾಲ್ಕನೇ ಮನೆ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ಮತ್ತು ಐದನೇ ಮನೆ ಉನ್ನತ ಶಿಕ್ಷಣ ಹಾಗೂ ಬುದ್ಧಿಶಕ್ತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ",
            eduBenefics: "ಈ ಭಾವಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ({planets}) ಸ್ಥಾನವು ತೀಕ್ಷ್ಣವಾದ ನೆನಪಿನ ಶಕ್ತಿ ಮತ್ತು ಉನ್ನತ ಶಿಕ್ಷಣದ ಯಶಸ್ಸನ್ನು ನೀಡುತ್ತದೆ. ಹೆಚ್ಚಿನ ಸಂಶೋಧನೆಗೆ ಅವಕಾಶವಿದೆ.",
            eduSunMars: "ಶಿಕ್ಷಣ ಭಾವದಲ್ಲಿ {planets} ಪ್ರಭಾವವು ತಾಂತ್ರಿಕ ಶಿಕ್ಷಣ ಮತ್ತು ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸನ್ನು ನೀಡುತ್ತದೆ.",
            eduOther: "ಈ ಭಾವಗಳಲ್ಲಿ {planets} ಇರುವುದು ಶಿಕ್ಷಣದಲ್ಲಿ ಸಣ್ಣ ಅಡಚಣೆಗಳ ನಂತರ ಉನ್ನತ ಶಿಕ್ಷಣ ಗಳಿಸುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
            eduNone: "ನಿಮ್ಮ ಶಿಕ್ಷಣವು ಸಾಮಾನ್ಯ ಮತ್ತು ಪ್ರಾಯೋಗಿಕವಾಗಿರುತ್ತದೆ. ನೀವು ಪುಸ್ತಕ ಜ್ಞಾನಕ್ಕಿಂತ ಅನುಭವದ ಮೂಲಕ ಹೆಚ್ಚು ಕಲಿಯುತ್ತೀರಿ."
        }
    };

    const d = dict[lcode] || dict.en;

    const render = (template, replacements) => {
        let res = template;
        for (const k in replacements) {
            res = res.split('{' + k + '}').join(replacements[k]);
        }
        return res;
    };

    // 1. CAREER PREDICTION
    let career = "";
    const p10 = getPlanetsInHouse(10);
    const p10Str = p10.join(", ");
    const hasSunMars = chart.planets?.some((p) => p.house === 10 && (p.name === 'Sun' || p.name === 'Mars'));
    const hasMercVen = chart.planets?.some((p) => p.house === 10 && (p.name === 'Mercury' || p.name === 'Venus'));
    const hasJup = chart.planets?.some((p) => p.house === 10 && p.name === 'Jupiter');

    career = render(d.carIntro, { lagna: lagnaLabel, sign10: sign10Label });
    if (p10.length > 0) {
        if (hasSunMars) {
            career += render(d.carSunMars, { planets: p10Str });
        } else if (hasMercVen) {
            career += render(d.carMercVen, { planets: p10Str });
        } else if (hasJup) {
            career += render(d.carJup, { planets: p10Str });
        } else {
            career += render(d.carOther, { planets: p10Str });
        }
    } else {
        career += d.carNone;
    }

    // 2. WEALTH PREDICTION
    let wealth = "";
    const p2 = getPlanetsInHouse(2);
    const p11 = getPlanetsInHouse(11);
    const wealthPlanets = [...p2, ...p11];
    const wealthPlanetsStr = wealthPlanets.join(", ");
    const hasWealthBenefics = chart.planets?.some((p) => (p.house === 2 || p.house === 11) && (p.name === 'Jupiter' || p.name === 'Venus'));
    const hasWealthMercSun = chart.planets?.some((p) => (p.house === 2 || p.house === 11) && (p.name === 'Mercury' || p.name === 'Sun'));

    wealth = d.wealthIntro;
    if (wealthPlanets.length > 0) {
        if (hasWealthBenefics) {
            wealth += render(d.wealthBenefics, { planets: wealthPlanetsStr });
        } else if (hasWealthMercSun) {
            wealth += render(d.wealthMercSun, { planets: wealthPlanetsStr });
        } else {
            wealth += render(d.wealthOther, { planets: wealthPlanetsStr });
        }
    } else {
        wealth += d.wealthNone;
    }

    // 3. HEALTH PREDICTION
    let health = d.healthIntro;
    const p6 = getPlanetsInHouse(6);
    const p8 = getPlanetsInHouse(8);
    const healthPlanets = [...p6, ...p8];
    const healthPlanetsStr = healthPlanets.join(", ");
    const isSadeSati = chart.doshas?.SadeSati?.present || false;

    if (isSadeSati) {
        health += d.healthSadeSati;
    }
    if (healthPlanets.length > 0) {
        health += render(d.healthPlanets, { planets: healthPlanetsStr });
    } else {
        health += d.healthNone;
    }

    // 4. MARRIAGE PREDICTION
    let marriage = d.marriageIntro;
    const p7 = getPlanetsInHouse(7);
    const p7Str = p7.join(", ");
    const isManglik = chart.doshas?.Manglik?.present || false;

    if (isManglik) {
        marriage += d.marriageManglik;
    }
    if (p7.length > 0) {
        marriage += render(d.marriagePlanets, { planets: p7Str });
    } else {
        marriage += d.marriageNone;
    }

    // 5. EDUCATION PREDICTION
    let education = d.eduIntro;
    const p4 = getPlanetsInHouse(4);
    const p5 = getPlanetsInHouse(5);
    const eduPlanets = [...p4, ...p5];
    const eduPlanetsStr = eduPlanets.join(", ");
    const hasEduBenefics = chart.planets?.some((p) => (p.house === 4 || p.house === 5) && (p.name === 'Mercury' || p.name === 'Jupiter'));
    const hasEduSunMars = chart.planets?.some((p) => (p.house === 4 || p.house === 5) && (p.name === 'Sun' || p.name === 'Mars'));

    if (eduPlanets.length > 0) {
        if (hasEduBenefics) {
            education += render(d.eduBenefics, { planets: eduPlanetsStr });
        } else if (hasEduSunMars) {
            education += render(d.eduSunMars, { planets: eduPlanetsStr });
        } else {
            education += render(d.eduOther, { planets: eduPlanetsStr });
        }
    } else {
        education += d.eduNone;
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
