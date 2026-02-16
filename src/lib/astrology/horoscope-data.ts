// Sign-specific horoscope prediction database
// Each sign has unique characteristics and predictions

export interface SignPredictions {
    en: {
        personal: string[];
        career: string[];
        health: string[];
        love: string[];
    };
    hi: {
        personal: string[];
        career: string[];
        health: string[];
        love: string[];
    };
}

export const SIGN_PREDICTIONS: Record<string, SignPredictions> = {
    Aries: {
        en: {
            personal: [
                "Your natural leadership qualities shine brightly today. Take initiative in matters close to your heart.",
                "Mars energizes your spirit, making this an excellent day for new beginnings and bold decisions.",
                "Your enthusiasm is contagious. Channel this energy into productive activities.",
                "Trust your instincts today - they're particularly sharp and will guide you well."
            ],
            career: [
                "Your competitive edge gives you an advantage in professional matters. Don't hesitate to showcase your skills.",
                "A new project or responsibility may come your way. Embrace it with your characteristic courage.",
                "Your direct approach impresses superiors. Speak up in meetings and share your innovative ideas.",
                "Financial gains through your own efforts are indicated. Hard work pays off today."
            ],
            health: [
                "High energy levels today. Channel them through physical exercise or sports activities.",
                "Be mindful of minor headaches or stress. Take short breaks to maintain balance.",
                "Your vitality is strong. This is a good day to start a new fitness routine.",
                "Stay hydrated and avoid rushing through meals despite your busy schedule."
            ],
            love: [
                "Passion runs high in romantic relationships. Express your feelings openly.",
                "Singles may attract attention through their confident demeanor.",
                "Plan something adventurous with your partner to keep the spark alive.",
                "Honest communication strengthens bonds. Don't hold back your emotions."
            ]
        },
        hi: {
            personal: [
                "आज आपके स्वाभाविक नेतृत्व गुण चमकेंगे। अपने दिल के करीब के मामलों में पहल करें।",
                "मंगल आपकी आत्मा को ऊर्जावान बनाता है, यह नई शुरुआत और साहसिक निर्णयों के लिए उत्तम दिन है।",
                "आपका उत्साह संक्रामक है। इस ऊर्जा को उत्पादक गतिविधियों में लगाएं।",
                "आज अपनी प्रवृत्ति पर भरोसा करें - वे विशेष रूप से तीक्ष्ण हैं और आपका अच्छी तरह मार्गदर्शन करेंगी।"
            ],
            career: [
                "आपकी प्रतिस्पर्धी बढ़त आपको व्यावसायिक मामलों में लाभ देती है। अपने कौशल दिखाने में संकोच न करें।",
                "एक नई परियोजना या जिम्मेदारी आपके रास्ते में आ सकती है। इसे अपने विशिष्ट साहस के साथ स्वीकार करें।",
                "आपका सीधा दृष्टिकोण वरिष्ठों को प्रभावित करता है। बैठकों में बोलें और अपने नवीन विचार साझा करें।",
                "अपने प्रयासों से वित्तीय लाभ के संकेत हैं। आज कड़ी मेहनत रंग लाती है।"
            ],
            health: [
                "आज उच्च ऊर्जा स्तर। इन्हें शारीरिक व्यायाम या खेल गतिविधियों के माध्यम से प्रसारित करें।",
                "मामूली सिरदर्द या तनाव के प्रति सचेत रहें। संतुलन बनाए रखने के लिए छोटे ब्रेक लें।",
                "आपकी जीवन शक्ति मजबूत है। यह एक नई फिटनेस दिनचर्या शुरू करने का अच्छा दिन है।",
                "हाइड्रेटेड रहें और अपने व्यस्त कार्यक्रम के बावजूद भोजन में जल्दबाजी से बचें।"
            ],
            love: [
                "रोमांटिक रिश्तों में जुनून उच्च है। अपनी भावनाओं को खुलकर व्यक्त करें।",
                "अविवाहित लोग अपने आत्मविश्वासी व्यवहार के माध्यम से ध्यान आकर्षित कर सकते हैं।",
                "चिंगारी को जीवित रखने के लिए अपने साथी के साथ कुछ साहसिक योजना बनाएं।",
                "ईमानदार संवाद बंधन को मजबूत करता है। अपनी भावनाओं को रोकें नहीं।"
            ]
        }
    },
    Taurus: {
        en: {
            personal: [
                "Venus blesses you with harmony and grace. Focus on beautifying your surroundings.",
                "Your practical nature helps you make sound decisions today. Trust your grounded wisdom.",
                "Patience and persistence are your strengths. Use them to overcome any obstacles.",
                "Comfort and stability matter to you. Create a peaceful environment at home."
            ],
            career: [
                "Your reliable nature earns recognition at work. Colleagues depend on your steady approach.",
                "Financial planning yields positive results. Consider long-term investments.",
                "Your attention to detail prevents errors. Quality over speed is your mantra today.",
                "A stable income source may present itself. Evaluate opportunities carefully."
            ],
            health: [
                "Focus on throat and neck area. Warm beverages and gentle stretches help.",
                "Your love for good food is strong, but maintain portion control for better health.",
                "Grounding exercises like walking in nature restore your energy.",
                "Adequate rest is essential. Don't compromise on sleep quality."
            ],
            love: [
                "Sensuality and affection deepen romantic bonds. Show love through thoughtful gestures.",
                "Loyalty and commitment are highlighted. Your partner appreciates your steadfast nature.",
                "Singles attract stable, reliable partners. Look for genuine connections.",
                "Create romantic moments through shared meals or comfortable settings."
            ]
        },
        hi: {
            personal: [
                "शुक्र आपको सामंजस्य और अनुग्रह से आशीर्वाद देता है। अपने परिवेश को सुंदर बनाने पर ध्यान दें।",
                "आपका व्यावहारिक स्वभाव आज आपको सही निर्णय लेने में मदद करता है। अपनी ठोस बुद्धि पर भरोसा करें।",
                "धैर्य और दृढ़ता आपकी ताकत हैं। किसी भी बाधा को दूर करने के लिए उनका उपयोग करें।",
                "आराम और स्थिरता आपके लिए मायने रखती है। घर पर शांतिपूर्ण वातावरण बनाएं।"
            ],
            career: [
                "आपका विश्वसनीय स्वभाव काम पर मान्यता अर्जित करता है। सहकर्मी आपके स्थिर दृष्टिकोण पर निर्भर करते हैं।",
                "वित्तीय योजना सकारात्मक परिणाम देती है। दीर्घकालिक निवेश पर विचार करें।",
                "विवरण पर आपका ध्यान त्रुटियों को रोकता है। गति से अधिक गुणवत्ता आज आपका मंत्र है।",
                "एक स्थिर आय स्रोत प्रस्तुत हो सकता है। अवसरों का सावधानीपूर्वक मूल्यांकन करें।"
            ],
            health: [
                "गले और गर्दन के क्षेत्र पर ध्यान दें। गर्म पेय और कोमल स्ट्रेच मदद करते हैं।",
                "अच्छे भोजन के लिए आपका प्यार मजबूत है, लेकिन बेहतर स्वास्थ्य के लिए भाग नियंत्रण बनाए रखें।",
                "प्रकृति में चलने जैसे ग्राउंडिंग व्यायाम आपकी ऊर्जा को बहाल करते हैं।",
                "पर्याप्त आराम आवश्यक है। नींद की गुणवत्ता से समझौता न करें।"
            ],
            love: [
                "कामुकता और स्नेह रोमांटिक बंधन को गहरा करते हैं। विचारशील इशारों के माध्यम से प्यार दिखाएं।",
                "वफादारी और प्रतिबद्धता पर प्रकाश डाला गया है। आपका साथी आपके दृढ़ स्वभाव की सराहना करता है।",
                "अविवाहित स्थिर, विश्वसनीय साझेदारों को आकर्षित करते हैं। वास्तविक कनेक्शन की तलाश करें।",
                "साझा भोजन या आरामदायक सेटिंग्स के माध्यम से रोमांटिक क्षण बनाएं।"
            ]
        }
    },
    Gemini: {
        en: {
            personal: [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            career: [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            health: [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            love: [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        hi: {
            personal: [
                "बुध आपके संचार कौशल को बढ़ाता है। स्पष्ट और आत्मविश्वास से खुद को व्यक्त करें।",
                "आपका जिज्ञासु मन नई जानकारी की तलाश करता है। आज कुछ नया सीखना खुशी लाता है।",
                "बहुमुखी प्रतिभा आपकी ताकत है। बदलती परिस्थितियों के अनुकूल जल्दी से ढलें।",
                "सामाजिक बातचीत आपको ऊर्जावान बनाती है। दोस्तों से जुड़ें और अपने नेटवर्क का विस्तार करें।"
            ],
            career: [
                "आपकी मल्टीटास्किंग क्षमताएं सहकर्मियों को प्रभावित करती हैं। कई परियोजनाओं को कुशलता से संभालें।",
                "संचार-आधारित काम फलता-फूलता है। लेखन, बोलना या पढ़ाना सफलता लाता है।",
                "नेटवर्किंग नए अवसर खोलती है। बैठकों में भाग लें और मूल्यवान कनेक्शन बनाएं।",
                "त्वरित सोच जटिल समस्याओं को हल करने में मदद करती है। आपकी मानसिक चपलता एक संपत्ति है।"
            ],
            health: [
                "तंत्रिका ऊर्जा को उचित चैनलिंग की आवश्यकता है। शांति के लिए श्वास व्यायाम का अभ्यास करें।",
                "अपने हाथों और बाहों को सक्रिय रखें। कोमल व्यायाम कठोरता को रोकते हैं।",
                "मानसिक उत्तेजना महत्वपूर्ण है, लेकिन सूचना अधिभार से बचें।",
                "छोटी सैर और ताजी हवा आपके दिमाग को साफ करती है और ऊर्जा बढ़ाती है।"
            ],
            love: [
                "बौद्धिक संबंध रिश्तों को मजबूत करता है। सार्थक बातचीत में संलग्न हों।",
                "विविधता रोमांस को रोमांचक रखती है। अपने साथी के साथ नई गतिविधियों का प्रयास करें।",
                "अविवाहित मजाकिया संचार और आकर्षण के माध्यम से साझेदारों को आकर्षित करते हैं।",
                "शब्दों के माध्यम से भावनाओं को व्यक्त करें - एक संदेश लिखें या विचार खुलकर साझा करें।"
            ]
        }
    },
    Cancer: {
        en: {
            personal: [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            career: [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            health: [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            love: [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        hi: {
            personal: [
                "चंद्रमा आज आपकी भावनाओं को गहराई से प्रभावित करता है। अपनी भावनाओं और अंतर्ज्ञान का सम्मान करें।",
                "घर और परिवार आराम लाते हैं। प्रियजनों के साथ गुणवत्तापूर्ण समय बिताएं।",
                "आपके पोषण स्वभाव की सराहना की जाती है। दूसरों की देखभाल करते हुए खुद की देखभाल करें।",
                "भावनात्मक सुरक्षा मायने रखती है। अपने चारों ओर एक सुरक्षित, आरामदायक वातावरण बनाएं।"
            ],
            career: [
                "आपका सहानुभूतिपूर्ण दृष्टिकोण टीम की गतिशीलता में मदद करता है। सहकर्मी आपके समर्थन को महत्व देते हैं।",
                "व्यावसायिक निर्णयों में अपनी आंत की भावनाओं पर भरोसा करें। अंतर्ज्ञान आपका अच्छी तरह मार्गदर्शन करता है।",
                "देखभाल या आतिथ्य में करियर वादा दिखाता है। आपकी करुणा एक संपत्ति है।",
                "संपत्ति या पारिवारिक व्यवसाय के माध्यम से वित्तीय सुरक्षा पर प्रकाश डाला गया है।"
            ],
            health: [
                "पाचन स्वास्थ्य पर ध्यान देने की आवश्यकता है। घर का बना, पौष्टिक भोजन खाएं।",
                "भावनात्मक कल्याण शारीरिक स्वास्थ्य को प्रभावित करता है। आत्म-देखभाल और विश्राम का अभ्यास करें।",
                "पानी का सेवन महत्वपूर्ण है। दिन भर अच्छी तरह से हाइड्रेटेड रहें।",
                "तैराकी या योग जैसे कोमल व्यायाम आपके संवेदनशील स्वभाव के अनुकूल हैं।"
            ],
            love: [
                "गहरे भावनात्मक बंधन मजबूत होते हैं। अपने साथी के साथ अपनी भावनाओं को साझा करें।",
                "एक प्रेमपूर्ण घरेलू वातावरण बनाना रोमांस को बढ़ाता है।",
                "अविवाहित देखभाल करने वाले, परिवार-उन्मुख साझेदारों को आकर्षित करते हैं।",
                "पुरानी यादें और यादें जोड़ों को करीब लाती हैं। विशेष क्षणों को एक साथ फिर से देखें।"
            ]
        }
    },
    Leo: {
        en: {
            personal: [
                "The Sun empowers your confidence and charisma. Shine brightly in all you do.",
                "Your generous spirit attracts admiration. Lead with warmth and authenticity.",
                "Creative expression brings joy. Engage in artistic or performative activities.",
                "Pride in your achievements is natural. Celebrate your successes today."
            ],
            career: [
                "Leadership opportunities arise. Step into the spotlight with confidence.",
                "Your creative solutions impress superiors. Innovation is rewarded.",
                "Public recognition for your work is likely. Accept praise graciously.",
                "Entrepreneurial ventures show promise. Your bold vision attracts support."
            ],
            health: [
                "Heart health is important. Engage in cardiovascular exercises.",
                "Your vitality is strong, but avoid overexertion. Balance activity with rest.",
                "Sunshine and outdoor activities boost your mood and energy.",
                "Maintain a regal posture. Back and spine care prevents discomfort."
            ],
            love: [
                "Romance flourishes with grand gestures. Express love dramatically and sincerely.",
                "Your magnetic personality attracts admirers. Singles enjoy attention.",
                "Loyalty and devotion deepen committed relationships.",
                "Plan something special and memorable with your partner."
            ]
        },
        hi: {
            personal: [
                "सूर्य आपके आत्मविश्वास और करिश्मे को सशक्त बनाता है। आप जो भी करें उसमें उज्ज्वल रूप से चमकें।",
                "आपकी उदार भावना प्रशंसा को आकर्षित करती है। गर्मजोशी और प्रामाणिकता के साथ नेतृत्व करें।",
                "रचनात्मक अभिव्यक्ति खुशी लाती है। कलात्मक या प्रदर्शनकारी गतिविधियों में संलग्न हों।",
                "अपनी उपलब्धियों पर गर्व स्वाभाविक है। आज अपनी सफलताओं का जश्न मनाएं।"
            ],
            career: [
                "नेतृत्व के अवसर उत्पन्न होते हैं। आत्मविश्वास के साथ सुर्खियों में कदम रखें।",
                "आपके रचनात्मक समाधान वरिष्ठों को प्रभावित करते हैं। नवाचार को पुरस्कृत किया जाता है।",
                "आपके काम के लिए सार्वजनिक मान्यता की संभावना है। प्रशंसा को शालीनता से स्वीकार करें।",
                "उद्यमशीलता उद्यम वादा दिखाते हैं। आपकी साहसिक दृष्टि समर्थन को आकर्षित करती है।"
            ],
            health: [
                "हृदय स्वास्थ्य महत्वपूर्ण है। हृदय व्यायाम में संलग्न हों।",
                "आपकी जीवन शक्ति मजबूत है, लेकिन अत्यधिक परिश्रम से बचें। गतिविधि को आराम के साथ संतुलित करें।",
                "धूप और बाहरी गतिविधियां आपके मूड और ऊर्जा को बढ़ावा देती हैं।",
                "एक शाही मुद्रा बनाए रखें। पीठ और रीढ़ की देखभाल असुविधा को रोकती है।"
            ],
            love: [
                "भव्य इशारों के साथ रोमांस फलता-फूलता है। नाटकीय और ईमानदारी से प्यार व्यक्त करें।",
                "आपका चुंबकीय व्यक्तित्व प्रशंसकों को आकर्षित करता है। अविवाहित ध्यान का आनंद लेते हैं।",
                "वफादारी और भक्ति प्रतिबद्ध रिश्तों को गहरा करती है।",
                "अपने साथी के साथ कुछ विशेष और यादगार योजना बनाएं।"
            ]
        }
    },
    Virgo: {
        en: {
            personal: [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            career: [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            health: [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            love: [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        hi: {
            personal: [
                "बुध आपके विश्लेषणात्मक दिमाग को तेज करता है। अधिकतम दक्षता के लिए व्यवस्थित और योजना बनाएं।",
                "विवरण पर ध्यान आपकी अच्छी सेवा करता है। छोटी चीजों को नोटिस करें जो दूसरे चूक जाते हैं।",
                "आपकी व्यावहारिक बुद्धि रोजमर्रा की समस्याओं को हल करने में मदद करती है। सहायक सलाह दें।",
                "पूर्णतावाद का अपना स्थान है, लेकिन खुद पर बहुत कठोर न हों।"
            ],
            career: [
                "आपका सावधानीपूर्वक काम सम्मान अर्जित करता है। गुणवत्ता और सटीकता आपके ट्रेडमार्क हैं।",
                "स्वास्थ्य-संबंधित या सेवा-उन्मुख करियर फलते-फूलते हैं। आपका समर्पण दिखता है।",
                "समस्या-समाधान कौशल की मांग है। सहकर्मी आपके विश्लेषणात्मक इनपुट की तलाश करते हैं।",
                "आपके द्वारा सुझाए गए दक्षता सुधार लागू किए जाते हैं। आपके तरीके काम करते हैं।"
            ],
            health: [
                "पाचन तंत्र को देखभाल की आवश्यकता है। एक स्वच्छ, संतुलित आहार बनाए रखें।",
                "चिंता को अपनी भलाई को प्रभावित न करने दें। तनाव-कमी तकनीकों का अभ्यास करें।",
                "नियमित दिनचर्या आपके स्वास्थ्य का समर्थन करती है। लगातार नींद और भोजन के समय पर टिके रहें।",
                "मध्यम व्यायाम और स्वच्छता की आदतें आपको अपना सर्वश्रेष्ठ महसूस कराती हैं।"
            ],
            love: [
                "सेवा के कार्यों के माध्यम से प्यार दिखाएं। छोटे, विचारशील इशारे सब कुछ मायने रखते हैं।",
                "व्यावहारिक समर्थन रिश्तों को मजबूत करता है। अपने साथी की मूर्त तरीकों से मदद करें।",
                "अविवाहित साझेदारों को आकर्षित करते हैं जो आपकी विश्वसनीयता और देखभाल की सराहना करते हैं।",
                "जरूरतों और अपेक्षाओं के बारे में खुला संचार अंतरंगता में सुधार करता है।"
            ]
        }
    },
    Libra: {
        en: {
            personal: [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            career: [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            health: [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            love: [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        hi: {
            personal: [
                "शुक्र आपको अनुग्रह और आकर्षण से आशीर्वाद देता है। आपका कूटनीतिक स्वभाव सामंजस्य बनाता है।",
                "आज संतुलन महत्वपूर्ण है। काम, आराम और खेल के बीच संतुलन खोजें।",
                "आपकी निष्पक्षता की भावना महत्वपूर्ण निर्णयों का मार्गदर्शन करती है। अपने निर्णय पर भरोसा करें।",
                "सौंदर्य प्रशंसा खुशी लाती है। अपने आप को सुंदरता से घेरें।"
            ],
            career: [
                "साझेदारी और सहयोग सफलता देते हैं। दूसरों के साथ अच्छी तरह से काम करें।",
                "आपके बातचीत कौशल मूल्यवान हैं। संघर्षों की मध्यस्थता करें और जीत-जीत समाधान खोजें।",
                "रचनात्मक क्षेत्र और डिजाइन कार्य फलते-फूलते हैं। सुंदरता के लिए आपकी नजर एक संपत्ति है।",
                "निष्पक्ष व्यवहार और नैतिक प्रथाएं आपकी पेशेवर प्रतिष्ठा को बढ़ाती हैं।"
            ],
            health: [
                "गुर्दे और निचली पीठ के स्वास्थ्य पर ध्यान देने की आवश्यकता है। हाइड्रेटेड रहें और नियमित रूप से खिंचाव करें।",
                "आहार और व्यायाम में संतुलन महत्वपूर्ण है। चरम सीमाओं से बचें।",
                "सामाजिक गतिविधियां मानसिक स्वास्थ्य को बढ़ावा देती हैं। कल्याण के लिए दोस्तों से जुड़ें।",
                "शांतिपूर्ण वातावरण आपके संवेदनशील स्वभाव का समर्थन करता है। शोर और अराजकता को कम करें।"
            ],
            love: [
                "रोमांस और साझेदारी पर प्रकाश डाला गया है। गुणवत्तापूर्ण समय के माध्यम से बंधन को मजबूत करें।",
                "आपका आकर्षण प्रशंसकों को आकर्षित करता है। अविवाहित किसी विशेष से मिल सकते हैं।",
                "रिश्तों में सामंजस्य आवश्यक है। अनुग्रह और कुशलता के साथ संघर्षों को संबोधित करें।",
                "रोमांटिक इशारे और सुंदर सेटिंग्स अंतरंगता को बढ़ाते हैं।"
            ]
        }
    },
    Scorpio: {
        en: {
            personal: [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            career: [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            health: [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            love: [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        hi: {
            personal: [
                "प्लूटो आपकी परिवर्तनकारी शक्ति को तीव्र करता है। गहरे व्यक्तिगत विकास को अपनाएं।",
                "आपका अंतर्ज्ञान असाधारण रूप से मजबूत है। अपनी प्रवृत्ति पर पूरी तरह से भरोसा करें।",
                "जुनून और तीव्रता आपके दिन को परिभाषित करती है। भावनाओं को उत्पादक रूप से प्रसारित करें।",
                "रहस्य और गहराई आपको आकर्षित करती है। छिपे हुए सत्य और गहन अंतर्दृष्टि का अन्वेषण करें।"
            ],
            career: [
                "अनुसंधान और जांच परिणाम देती है। आपके जासूस जैसे कौशल चमकते हैं।",
                "काम पर शक्ति की गतिशीलता आपके पक्ष में बदल जाती है। रणनीतिक रूप से खुद को जोर दें।",
                "निवेश या साझा संसाधनों के माध्यम से वित्तीय लाभ संभव है।",
                "आपका दृढ़ संकल्प बाधाओं को दूर करता है। दृढ़ता अच्छी तरह से भुगतान करती है।"
            ],
            health: [
                "प्रजनन और उन्मूलन प्रणालियों को देखभाल की आवश्यकता है। उचित स्वच्छता बनाए रखें।",
                "भावनात्मक तीव्रता शारीरिक स्वास्थ्य को प्रभावित करती है। भावनाओं के लिए स्वस्थ आउटलेट खोजें।",
                "गहरी सांस लेना और ध्यान तनाव को प्रभावी ढंग से प्रबंधित करने में मदद करता है।",
                "विषहरण और सफाई प्रथाएं अब आपको लाभ पहुंचाती हैं।"
            ],
            love: [
                "जुनून और अंतरंगता गहरी होती है। भावनात्मक और शारीरिक बंधन मजबूत होते हैं।",
                "ईर्ष्या या अधिकार उत्पन्न हो सकता है। विश्वास और संचार आवश्यक हैं।",
                "अविवाहित तीव्र, परिवर्तनकारी रिश्तों को आकर्षित करते हैं।",
                "भेद्यता गहरा संबंध बनाती है। अपने साथी के साथ अपना सच्चा स्व साझा करें।"
            ]
        }
    },
    Sagittarius: {
        en: {
            personal: [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            career: [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            health: [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            love: [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        hi: {
            personal: [
                "बृहस्पति आपके क्षितिज का विस्तार करता है। ज्ञान और नए अनुभवों की तलाश करें।",
                "आशावाद और उत्साह आपकी ताकत हैं। जहां भी जाएं सकारात्मकता फैलाएं।",
                "स्वतंत्रता और रोमांच आपको बुलाते हैं। नए क्षेत्रों का अन्वेषण करें, शाब्दिक या रूपक।",
                "आपका दार्शनिक स्वभाव अर्थ की तलाश करता है। जीवन के बड़े सवालों पर विचार करें।"
            ],
            career: [
                "शिक्षण, प्रकाशन, या यात्रा-संबंधित काम फलता-फूलता है। अपनी बुद्धि साझा करें।",
                "उच्च शिक्षा या प्रमाणन कार्यक्रम आपके करियर विकास को लाभ पहुंचाते हैं।",
                "अंतर्राष्ट्रीय कनेक्शन या विदेशी अवसर उत्पन्न हो सकते हैं।",
                "आपका ईमानदार, सीधा दृष्टिकोण विश्वास और सम्मान अर्जित करता है।"
            ],
            health: [
                "यकृत और कूल्हे के स्वास्थ्य पर ध्यान देने की आवश्यकता है। बेहतर कल्याण के लिए मध्यम भोग।",
                "बाहरी गतिविधियां और खेल आपको ऊर्जावान बनाते हैं। सक्रिय और साहसिक रहें।",
                "खुद को शारीरिक रूप से अधिक विस्तारित न करें। उत्साह को आराम के साथ संतुलित करें।",
                "खिंचाव के माध्यम से लचीलापन बनाए रखें। कूल्हों और जांघों में कठोरता को रोकें।"
            ],
            love: [
                "प्रतिबद्धता के भीतर स्वतंत्रता महत्वपूर्ण है। रिश्तों में स्थान दें और प्राप्त करें।",
                "ईमानदारी और प्रत्यक्षता बंधन को मजबूत करती है। दयालुता के साथ अपना सच बोलें।",
                "अविवाहित साहसिक, खुले विचारों वाले साझेदारों को आकर्षित करते हैं।",
                "रोमांस को जीवित रखने के लिए अपने साथी के साथ रोमांचक गतिविधियों या यात्राओं की योजना बनाएं।"
            ]
        }
    },
    Capricorn: {
        en: {
            personal: [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            career: [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            health: [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            love: [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        hi: {
            personal: [
                "शनि अनुशासन और जिम्मेदारी सिखाता है। आपकी कड़ी मेहनत स्थायी नींव बनाती है।",
                "धैर्य और दृढ़ता आपके गुण हैं। दीर्घकालिक लक्ष्य ध्यान में आते हैं।",
                "पारंपरिक मूल्य आपके निर्णयों का मार्गदर्शन करते हैं। अपनी प्रतिबद्धताओं का सम्मान करें।",
                "महत्वाकांक्षा आपको आगे बढ़ाती है। उच्च मानक निर्धारित करें और उन्हें व्यवस्थित रूप से प्राप्त करें।"
            ],
            career: [
                "समर्पण के माध्यम से पेशेवर उन्नति। आपकी विश्वसनीयता को मान्यता दी जाती है।",
                "नेतृत्व की भूमिकाएं आपके लिए अच्छी तरह से अनुकूल हैं। आत्मविश्वास से अधिक जिम्मेदारी लें।",
                "दीर्घकालिक योजना परिणाम देती है। रणनीतिक सोच भुगतान करती है।",
                "व्यावसायिक कौशल और व्यावहारिक बुद्धि वित्तीय सफलता को बढ़ाती है।"
            ],
            health: [
                "हड्डी और जोड़ों के स्वास्थ्य पर ध्यान देने की आवश्यकता है। कैल्शियम का सेवन और कोमल व्यायाम मदद करते हैं।",
                "काम के तनाव को कल्याण को प्रभावित न करने दें। नियमित ब्रेक शेड्यूल करें।",
                "दंत स्वास्थ्य महत्वपूर्ण है। अच्छी मौखिक स्वच्छता बनाए रखें।",
                "संरचित दिनचर्या आपके स्वास्थ्य का समर्थन करती है। स्थिरता महत्वपूर्ण है।"
            ],
            love: [
                "प्रतिबद्धता और वफादारी आपके रिश्तों को परिभाषित करती है। समय के साथ विश्वास बनाएं।",
                "कार्यों और जिम्मेदारी के माध्यम से प्यार दिखाएं। अपने साथी के लिए भरोसेमंद बनें।",
                "अविवाहित परिपक्व, स्थिर साझेदारों को आकर्षित करते हैं जो आपके मूल्यों को साझा करते हैं।",
                "गुणवत्तापूर्ण समय और पारंपरिक इशारे रोमांटिक बंधन को मजबूत करते हैं।"
            ]
        }
    },
    Aquarius: {
        en: {
            personal: [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            career: [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            health: [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            love: [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        hi: {
            personal: [
                "यूरेनस नवाचार और मौलिकता को प्रेरित करता है। आज बॉक्स के बाहर सोचें।",
                "आपका मानवीय स्वभाव दूसरों की मदद करना चाहता है। सामूहिक कल्याण में योगदान दें।",
                "स्वतंत्रता और स्वतंत्रता आवश्यक हैं। अपने अनूठे मार्ग का सम्मान करें।",
                "बौद्धिक गतिविधियां और प्रगतिशील विचार आपको ऊर्जावान बनाते हैं।"
            ],
            career: [
                "प्रौद्योगिकी और नवाचार-संबंधित काम फलता-फूलता है। आपकी दूरदर्शी सोच को महत्व दिया जाता है।",
                "टीम वर्क और नेटवर्किंग अवसर लाते हैं। समान विचारधारा वाले व्यक्तियों के साथ सहयोग करें।",
                "अपरंपरागत दृष्टिकोण समस्याओं को हल करते हैं। अलग होने से डरो मत।",
                "सामाजिक कारण या सामुदायिक परियोजनाएं आपके मूल्यों और कौशल के साथ संरेखित होती हैं।"
            ],
            health: [
                "परिसंचरण प्रणाली और टखनों पर ध्यान देने की आवश्यकता है। आंदोलन के साथ रक्त प्रवाह रखें।",
                "मानसिक उत्तेजना महत्वपूर्ण है, लेकिन अधिक सोचने से बचें। तर्क को विश्राम के साथ संतुलित करें।",
                "समूह फिटनेस गतिविधियां या टीम खेल आपके सामाजिक स्वभाव के अनुकूल हैं।",
                "नवीन स्वास्थ्य दृष्टिकोण आपकी रुचि रखते हैं। वैकल्पिक कल्याण विधियों का अन्वेषण करें।"
            ],
            love: [
                "दोस्ती रोमांस की नींव बनाती है। बौद्धिक संबंध सबसे अधिक मायने रखता है।",
                "रिश्तों के भीतर स्वतंत्रता और स्वतंत्रता आवश्यक हैं। सीमाओं का सम्मान करें।",
                "अविवाहित अनूठे, अपरंपरागत साझेदारों को आकर्षित करते हैं जो आपके आदर्शों को साझा करते हैं।",
                "अपने साथी को कुछ अप्रत्याशित और मूल के साथ आश्चर्यचकित करें।"
            ]
        }
    },
    Pisces: {
        en: {
            personal: [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            career: [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            health: [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            love: [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        hi: {
            personal: [
                "नेपच्यून आपके अंतर्ज्ञान और रचनात्मकता को बढ़ाता है। अपने आंतरिक मार्गदर्शन पर भरोसा करें।",
                "करुणा और सहानुभूति आपके उपहार हैं। जरूरतमंदों की मदद करें।",
                "कल्पना और सपने आपको प्रेरित करते हैं। कलात्मक या आध्यात्मिक गतिविधियों में संलग्न हों।",
                "सीमाएं महत्वपूर्ण हैं। अपनी संवेदनशील ऊर्जा को नकारात्मकता से बचाएं।"
            ],
            career: [
                "रचनात्मक, उपचार, या आध्यात्मिक काम फलता-फूलता है। आपकी करुणा एक संपत्ति है।",
                "सहज निर्णय लेना आपकी अच्छी सेवा करता है। अपनी आंत की भावनाओं पर भरोसा करें।",
                "कलात्मक प्रतिभा मान्यता लाती है। दुनिया के साथ अपने रचनात्मक उपहार साझा करें।",
                "मदद करने वाले पेशे या धर्मार्थ काम आपके मूल्यों के साथ संरेखित होते हैं।"
            ],
            health: [
                "पैर और प्रतिरक्षा प्रणाली को देखभाल की आवश्यकता है। आरामदायक जूते और आराम आवश्यक हैं।",
                "भावनात्मक संवेदनशीलता शारीरिक स्वास्थ्य को प्रभावित करती है। आत्म-देखभाल और सीमाओं का अभ्यास करें।",
                "तैराकी जैसी पानी आधारित गतिविधियां आपकी आत्मा को शांत करती हैं।",
                "पर्याप्त नींद और सपने का समय आपकी भलाई के लिए महत्वपूर्ण है।"
            ],
            love: [
                "रोमांस और आदर्शवाद आपके रिश्तों को रंग देते हैं। जादुई क्षण बनाएं।",
                "भावनात्मक गहराई और आध्यात्मिक संबंध सबसे अधिक मायने रखते हैं।",
                "अविवाहित आत्मीय, कलात्मक साझेदारों को आकर्षित करते हैं जो आपकी संवेदनशीलता को समझते हैं।",
                "कविता, संगीत, या अन्य रचनात्मक साधनों के माध्यम से प्यार व्यक्त करें।"
            ]
        }
    }
};
