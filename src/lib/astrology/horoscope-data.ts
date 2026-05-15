// Sign-specific horoscope prediction database
// Each sign has unique characteristics and predictions

export interface SignPredictions {
    en: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    hi: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    mr?: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    ta?: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    te?: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    kn?: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    bn?: { personal: string[]; career: string[]; health: string[]; love: string[]; };
    gu?: { personal: string[]; career: string[]; health: string[]; love: string[]; };
}

export const SIGN_PREDICTIONS: Record<string, SignPredictions> = {
    "Aries": {
        "en": {
            "personal": [
                "Your natural leadership qualities shine brightly today. Take initiative in matters close to your heart.",
                "Mars energizes your spirit, making this an excellent day for new beginnings and bold decisions.",
                "Your enthusiasm is contagious. Channel this energy into productive activities.",
                "Trust your instincts today - they're particularly sharp and will guide you well."
            ],
            "career": [
                "Your competitive edge gives you an advantage in professional matters. Don't hesitate to showcase your skills.",
                "A new project or responsibility may come your way. Embrace it with your characteristic courage.",
                "Your direct approach impresses superiors. Speak up in meetings and share your innovative ideas.",
                "Financial gains through your own efforts are indicated. Hard work pays off today."
            ],
            "health": [
                "High energy levels today. Channel them through physical exercise or sports activities.",
                "Be mindful of minor headaches or stress. Take short breaks to maintain balance.",
                "Your vitality is strong. This is a good day to start a new fitness routine.",
                "Stay hydrated and avoid rushing through meals despite your busy schedule."
            ],
            "love": [
                "Passion runs high in romantic relationships. Express your feelings openly.",
                "Singles may attract attention through their confident demeanor.",
                "Plan something adventurous with your partner to keep the spark alive.",
                "Honest communication strengthens bonds. Don't hold back your emotions."
            ]
        },
        "hi": {
            "personal": [
                "आज आपके स्वाभाविक नेतृत्व गुण चमकेंगे। अपने दिल के करीब के मामलों में पहल करें।",
                "मंगल आपकी आत्मा को ऊर्जावान बनाता है, यह नई शुरुआत और साहसिक निर्णयों के लिए उत्तम दिन है।",
                "आपका उत्साह संक्रामक है। इस ऊर्जा को उत्पादक गतिविधियों में लगाएं।",
                "आज अपनी प्रवृत्ति पर भरोसा करें - वे विशेष रूप से तीक्ष्ण हैं और आपका अच्छी तरह मार्गदर्शन करेंगी।"
            ],
            "career": [
                "आपकी प्रतिस्पर्धी बढ़त आपको व्यावसायिक मामलों में लाभ देती है। अपने कौशल दिखाने में संकोच न करें।",
                "एक नई परियोजना या जिम्मेदारी आपके रास्ते में आ सकती है। इसे अपने विशिष्ट साहस के साथ स्वीकार करें।",
                "आपका सीधा दृष्टिकोण वरिष्ठों को प्रभावित करता है। बैठकों में बोलें और अपने नवीन विचार साझा करें।",
                "अपने प्रयासों से वित्तीय लाभ के संकेत हैं। आज कड़ी मेहनत रंग लाती है।"
            ],
            "health": [
                "आज उच्च ऊर्जा स्तर। इन्हें शारीरिक व्यायाम या खेल गतिविधियों के माध्यम से प्रसारित करें।",
                "मामूली सिरदर्द या तनाव के प्रति सचेत रहें। संतुलन बनाए रखने के लिए छोटे ब्रेक लें।",
                "आपकी जीवन शक्ति मजबूत है। यह एक नई फिटनेस दिनचर्या शुरू करने का अच्छा दिन है।",
                "हाइड्रेटेड रहें और अपने व्यस्त कार्यक्रम के बावजूद भोजन में जल्दबाजी से बचें।"
            ],
            "love": [
                "रोमांटिक रिश्तों में जुनून उच्च है। अपनी भावनाओं को खुलकर व्यक्त करें।",
                "अविवाहित लोग अपने आत्मविश्वासी व्यवहार के माध्यम से ध्यान आकर्षित कर सकते हैं।",
                "चिंगारी को जीवित रखने के लिए अपने साथी के साथ कुछ साहसिक योजना बनाएं।",
                "ईमानदार संवाद बंधन को मजबूत करता है। अपनी भावनाओं को रोकें नहीं।"
            ]
        },
        "mr": {
            "personal": [
                "तुमचे नैसर्गिक नेतृत्व गुण आज चमकत आहेत. तुमच्या मनाच्या जवळच्या गोष्टींमध्ये पुढाकार घ्या.",
                "मंगळ तुमच्या आत्म्याला उर्जा देतो, नवीन सुरुवात करण्यासाठी आणि धाडसी निर्णयांसाठी हा एक उत्कृष्ट दिवस आहे.",
                "तुमचा उत्साह संसर्गजन्य आहे. या ऊर्जेला उत्पादक क्रियाकलापांमध्ये चॅनल करा.",
                "आज तुमच्या अंतःप्रेरणेवर विश्वास ठेवा - ते विशेषतः तीक्ष्ण आहेत आणि तुम्हाला चांगले मार्गदर्शन करतील."
            ],
            "career": [
                "तुमची स्पर्धात्मक धार तुम्हाला व्यावसायिक बाबींमध्ये फायदा देते. आपले कौशल्य दाखविण्यास अजिबात संकोच करू नका.",
                "एखादा नवीन प्रकल्प किंवा जबाबदारी तुमच्या वाट्याला येऊ शकते. आपल्या वैशिष्ट्यपूर्ण धैर्याने ते स्वीकारा.",
                "तुमचा थेट दृष्टिकोन वरिष्ठांना प्रभावित करतो. मीटिंगमध्ये बोला आणि तुमच्या नाविन्यपूर्ण कल्पना शेअर करा.",
                "तुमच्या स्वतःच्या प्रयत्नातून आर्थिक नफा दर्शविला जातो. मेहनतीचे फळ आज मिळेल."
            ],
            "health": [
                "आज उच्च ऊर्जा पातळी. त्यांना शारीरिक व्यायाम किंवा क्रीडा क्रियाकलापांद्वारे चॅनेल करा.",
                "किरकोळ डोकेदुखी किंवा तणावाबद्दल सावध रहा. संतुलन राखण्यासाठी लहान ब्रेक घ्या.",
                "तुमची चैतन्य शक्ती मजबूत आहे. नवीन फिटनेस दिनचर्या सुरू करण्यासाठी हा चांगला दिवस आहे.",
                "हायड्रेटेड रहा आणि तुमचे व्यस्त वेळापत्रक असूनही जेवणात घाई करणे टाळा."
            ],
            "love": [
                "रोमँटिक संबंधांमध्ये उत्कटता जास्त असते. तुमच्या भावना उघडपणे व्यक्त करा.",
                "अविवाहित लोक त्यांच्या आत्मविश्वासपूर्ण वागण्याने लक्ष वेधून घेऊ शकतात.",
                "स्पार्क जिवंत ठेवण्यासाठी तुमच्या जोडीदारासोबत काहीतरी साहसी योजना करा.",
                "प्रामाणिक संवादामुळे बंध मजबूत होतात. आपल्या भावनांना रोखू नका."
            ]
        },
        "ta": {
            "personal": [
                "உங்களின் இயல்பான தலைமைப் பண்பு இன்று பிரகாசமாக பிரகாசிக்கிறது. உங்கள் இதயத்திற்கு நெருக்கமான விஷயங்களில் முன்முயற்சி எடுக்கவும்.",
                "செவ்வாய் உங்கள் ஆவியை உற்சாகப்படுத்துகிறது, இது புதிய தொடக்கங்களுக்கும் தைரியமான முடிவுகளுக்கும் சிறந்த நாளாக அமைகிறது.",
                "உங்கள் உற்சாகம் தொற்றிக்கொண்டது. இந்த ஆற்றலை உற்பத்தி நடவடிக்கைகளில் செலுத்துங்கள்.",
                "இன்று உங்கள் உள்ளுணர்வை நம்புங்கள் - அவை குறிப்பாக கூர்மையானவை மற்றும் உங்களுக்கு நன்றாக வழிகாட்டும்."
            ],
            "career": [
                "உங்களின் போட்டித்திறன் உங்களுக்கு தொழில்முறை விஷயங்களில் அனுகூலத்தை அளிக்கிறது. உங்கள் திறமைகளை வெளிப்படுத்த தயங்காதீர்கள்.",
                "ஒரு புதிய திட்டம் அல்லது பொறுப்பு உங்கள் வழியில் வரலாம். உங்கள் குணாதிசயமான தைரியத்துடன் அதை ஏற்றுக்கொள்ளுங்கள்.",
                "உங்களின் நேரடியான அணுகுமுறை மேலதிகாரிகளை ஈர்க்கும். கூட்டங்களில் பேசுங்கள் மற்றும் உங்கள் புதுமையான யோசனைகளைப் பகிர்ந்து கொள்ளுங்கள்.",
                "உங்கள் சொந்த முயற்சியின் மூலம் நிதி ஆதாயம் குறிக்கப்படுகிறது. கடின உழைப்புக்கு இன்று பலன் கிடைக்கும்."
            ],
            "health": [
                "இன்று உயர் ஆற்றல் நிலைகள். உடல் பயிற்சி அல்லது விளையாட்டு நடவடிக்கைகள் மூலம் அவர்களை அனுப்பவும்.",
                "சிறிய தலைவலி அல்லது மன அழுத்தத்தை கவனத்தில் கொள்ளுங்கள். சமநிலையை பராமரிக்க சிறிய இடைவெளிகளை எடுங்கள்.",
                "உங்கள் உயிர் பலமானது. புதிய உடற்பயிற்சி முறையைத் தொடங்க இது ஒரு நல்ல நாள்.",
                "நீரேற்றமாக இருங்கள் மற்றும் உங்களின் பிஸியான அட்டவணை இருந்தபோதிலும் அவசரமாக உணவைத் தவிர்க்கவும்."
            ],
            "love": [
                "காதல் உறவுகளில் பேரார்வம் அதிகமாக இருக்கும். உங்கள் உணர்வுகளை வெளிப்படையாக வெளிப்படுத்துங்கள்.",
                "ஒற்றையர் தங்கள் நம்பிக்கையான நடத்தை மூலம் கவனத்தை ஈர்க்கலாம்.",
                "தீப்பொறியை உயிர்ப்புடன் வைத்திருக்க உங்கள் துணையுடன் ஏதாவது சாகசத்தைத் திட்டமிடுங்கள்.",
                "நேர்மையான தொடர்பு உறவுகளை பலப்படுத்துகிறது. உங்கள் உணர்ச்சிகளைத் தடுத்து நிறுத்தாதீர்கள்."
            ]
        },
        "te": {
            "personal": [
                "మీ సహజ నాయకత్వ లక్షణాలు ఈరోజు ప్రకాశవంతంగా ప్రకాశిస్తాయి. మీ హృదయానికి దగ్గరగా ఉన్న విషయాలలో చొరవ తీసుకోండి.",
                "మార్స్ మీ ఆత్మను ఉత్తేజపరుస్తుంది, కొత్త ప్రారంభాలు మరియు ధైర్యమైన నిర్ణయాలకు ఇది అద్భుతమైన రోజు.",
                "మీ ఉత్సాహం అంటువ్యాధి. ఈ శక్తిని ఉత్పాదక కార్యకలాపాలలోకి మార్చండి.",
                "ఈ రోజు మీ ప్రవృత్తిని విశ్వసించండి - అవి చాలా పదునైనవి మరియు మీకు బాగా మార్గనిర్దేశం చేస్తాయి."
            ],
            "career": [
                "మీ పోటీతత్వం వృత్తిపరమైన విషయాలలో మీకు ప్రయోజనాన్ని ఇస్తుంది. మీ నైపుణ్యాలను ప్రదర్శించడానికి వెనుకాడరు.",
                "కొత్త ప్రాజెక్ట్ లేదా బాధ్యత మీకు రావచ్చు. మీ లక్షణ ధైర్యంతో దానిని స్వీకరించండి.",
                "మీ ప్రత్యక్ష విధానం ఉన్నతాధికారులను ఆకట్టుకుంటుంది. సమావేశాలలో మాట్లాడండి మరియు మీ వినూత్న ఆలోచనలను పంచుకోండి.",
                "మీ స్వంత ప్రయత్నాల ద్వారా ఆర్థిక లాభాలు సూచించబడతాయి. ఈరోజు శ్రమకు తగిన ప్రతిఫలం లభిస్తుంది."
            ],
            "health": [
                "నేడు అధిక శక్తి స్థాయిలు. శారీరక వ్యాయామం లేదా క్రీడా కార్యకలాపాల ద్వారా వాటిని ప్రసారం చేయండి.",
                "చిన్నపాటి తలనొప్పి లేదా ఒత్తిడి విషయంలో జాగ్రత్త వహించండి. సమతుల్యతను కాపాడుకోవడానికి చిన్న విరామం తీసుకోండి.",
                "మీ జీవశక్తి బలంగా ఉంది. కొత్త ఫిట్‌నెస్ రొటీన్‌ని ప్రారంభించడానికి ఇది మంచి రోజు.",
                "హైడ్రేటెడ్‌గా ఉండండి మరియు మీ బిజీ షెడ్యూల్‌లో ఉన్నప్పటికీ హడావిడిగా భోజనం చేయకుండా ఉండండి."
            ],
            "love": [
                "శృంగార సంబంధాలలో అభిరుచి ఎక్కువగా ఉంటుంది. మీ భావాలను బహిరంగంగా వ్యక్తపరచండి.",
                "సింగిల్స్ వారి నమ్మకమైన ప్రవర్తన ద్వారా దృష్టిని ఆకర్షించవచ్చు.",
                "స్పార్క్‌ను సజీవంగా ఉంచడానికి మీ భాగస్వామితో ఏదైనా సాహసోపేతమైన ప్రణాళిక చేయండి.",
                "నిజాయితీతో కూడిన సంభాషణ బంధాలను బలపరుస్తుంది. మీ భావోద్వేగాలను అరికట్టవద్దు."
            ]
        },
        "kn": {
            "personal": [
                "ನಿಮ್ಮ ಸಹಜ ನಾಯಕತ್ವದ ಗುಣಗಳು ಇಂದು ಪ್ರಕಾಶಮಾನವಾಗಿ ಹೊಳೆಯುತ್ತವೆ. ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ಹತ್ತಿರವಾದ ವಿಷಯಗಳಲ್ಲಿ ಉಪಕ್ರಮವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.",
                "ಮಂಗಳವು ನಿಮ್ಮ ಚೈತನ್ಯವನ್ನು ತುಂಬುತ್ತದೆ, ಹೊಸ ಆರಂಭಗಳು ಮತ್ತು ದಿಟ್ಟ ನಿರ್ಧಾರಗಳಿಗೆ ಇದು ಅತ್ಯುತ್ತಮ ದಿನವಾಗಿದೆ.",
                "ನಿಮ್ಮ ಉತ್ಸಾಹವು ಸಾಂಕ್ರಾಮಿಕವಾಗಿದೆ. ಈ ಶಕ್ತಿಯನ್ನು ಉತ್ಪಾದನಾ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ಚಾನೆಲ್ ಮಾಡಿ.",
                "ಇಂದು ನಿಮ್ಮ ಪ್ರವೃತ್ತಿಯನ್ನು ನಂಬಿರಿ - ಅವು ವಿಶೇಷವಾಗಿ ತೀಕ್ಷ್ಣವಾಗಿರುತ್ತವೆ ಮತ್ತು ನಿಮಗೆ ಉತ್ತಮ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತವೆ."
            ],
            "career": [
                "ನಿಮ್ಮ ಸ್ಪರ್ಧಾತ್ಮಕತೆಯು ವೃತ್ತಿಪರ ವಿಷಯಗಳಲ್ಲಿ ನಿಮಗೆ ಪ್ರಯೋಜನವನ್ನು ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲು ಹಿಂಜರಿಯಬೇಡಿ.",
                "ಹೊಸ ಯೋಜನೆ ಅಥವಾ ಜವಾಬ್ದಾರಿ ನಿಮ್ಮ ದಾರಿಗೆ ಬರಬಹುದು. ನಿಮ್ಮ ವಿಶಿಷ್ಟ ಧೈರ್ಯದಿಂದ ಅದನ್ನು ಸ್ವೀಕರಿಸಿ.",
                "ನಿಮ್ಮ ನೇರ ವಿಧಾನವು ಮೇಲಧಿಕಾರಿಗಳನ್ನು ಮೆಚ್ಚಿಸುತ್ತದೆ. ಸಭೆಗಳಲ್ಲಿ ಮಾತನಾಡಿ ಮತ್ತು ನಿಮ್ಮ ನವೀನ ವಿಚಾರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
                "ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಯತ್ನಗಳ ಮೂಲಕ ಹಣಕಾಸಿನ ಲಾಭವನ್ನು ಸೂಚಿಸಲಾಗಿದೆ. ಕಠಿಣ ಪರಿಶ್ರಮ ಇಂದು ಫಲ ನೀಡುತ್ತದೆ."
            ],
            "health": [
                "ಇಂದು ಹೆಚ್ಚಿನ ಶಕ್ತಿಯ ಮಟ್ಟಗಳು. ದೈಹಿಕ ವ್ಯಾಯಾಮ ಅಥವಾ ಕ್ರೀಡಾ ಚಟುವಟಿಕೆಗಳ ಮೂಲಕ ಅವುಗಳನ್ನು ಚಾನೆಲ್ ಮಾಡಿ.",
                "ಸಣ್ಣ ತಲೆನೋವು ಅಥವಾ ಒತ್ತಡದ ಬಗ್ಗೆ ಎಚ್ಚರದಿಂದಿರಿ. ಸಮತೋಲನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಸಣ್ಣ ವಿರಾಮಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.",
                "ನಿಮ್ಮ ಹುರುಪು ಬಲವಾಗಿದೆ. ಹೊಸ ಫಿಟ್ನೆಸ್ ದಿನಚರಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಇದು ಉತ್ತಮ ದಿನವಾಗಿದೆ.",
                "ಹೈಡ್ರೇಟೆಡ್ ಆಗಿರಿ ಮತ್ತು ನಿಮ್ಮ ಬಿಡುವಿಲ್ಲದ ವೇಳಾಪಟ್ಟಿಯ ಹೊರತಾಗಿಯೂ ಊಟದ ಮೂಲಕ ಹೊರದಬ್ಬುವುದನ್ನು ತಪ್ಪಿಸಿ."
            ],
            "love": [
                "ಪ್ರಣಯ ಸಂಬಂಧಗಳಲ್ಲಿ ಉತ್ಸಾಹವು ಅಧಿಕವಾಗಿರುತ್ತದೆ. ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಮುಕ್ತವಾಗಿ ವ್ಯಕ್ತಪಡಿಸಿ.",
                "ಸಿಂಗಲ್ಸ್ ತಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸದ ವರ್ತನೆಯ ಮೂಲಕ ಗಮನ ಸೆಳೆಯಬಹುದು.",
                "ಸ್ಪಾರ್ಕ್ ಅನ್ನು ಜೀವಂತವಾಗಿರಿಸಲು ನಿಮ್ಮ ಸಂಗಾತಿಯೊಂದಿಗೆ ಸಾಹಸಮಯವಾದದ್ದನ್ನು ಯೋಜಿಸಿ.",
                "ಪ್ರಾಮಾಣಿಕ ಸಂವಹನವು ಬಂಧಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ. ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ತಡೆಹಿಡಿಯಬೇಡಿ."
            ]
        },
        "bn": {
            "personal": [
                "আপনার স্বাভাবিক নেতৃত্বের গুণাবলী আজ উজ্জ্বলভাবে উজ্জ্বল। আপনার হৃদয়ের কাছাকাছি বিষয়গুলিতে উদ্যোগ নিন।",
                "মঙ্গল আপনার আত্মাকে উজ্জীবিত করে, এটিকে নতুন সূচনা এবং সাহসী সিদ্ধান্তের জন্য একটি দুর্দান্ত দিন করে তোলে।",
                "আপনার উদ্যম সংক্রামক. এই শক্তি উৎপাদনশীল কর্মকান্ডে চ্যানেল করুন।",
                "আজ আপনার প্রবৃত্তি বিশ্বাস করুন - তারা বিশেষভাবে তীক্ষ্ণ এবং আপনাকে ভাল গাইড করবে।"
            ],
            "career": [
                "আপনার প্রতিযোগিতামূলক প্রান্ত আপনাকে পেশাদার বিষয়ে একটি সুবিধা দেয়। আপনার দক্ষতা প্রদর্শন করতে দ্বিধা করবেন না।",
                "একটি নতুন প্রকল্প বা দায়িত্ব আপনার পথে আসতে পারে। আপনার চরিত্রগত সাহস সঙ্গে এটি আলিঙ্গন.",
                "আপনার সরাসরি দৃষ্টিভঙ্গি ঊর্ধ্বতনদের মুগ্ধ করে। মিটিংয়ে কথা বলুন এবং আপনার উদ্ভাবনী ধারণা শেয়ার করুন।",
                "আপনার নিজের প্রচেষ্টার মাধ্যমে আর্থিক লাভ নির্দেশিত হয়। কঠোর পরিশ্রম আজ ফল দেয়।"
            ],
            "health": [
                "আজ উচ্চ শক্তির মাত্রা। শারীরিক ব্যায়াম বা খেলাধুলার মাধ্যমে তাদের চ্যানেল করুন।",
                "ছোটখাটো মাথাব্যথা বা মানসিক চাপ সম্পর্কে সচেতন হন। ভারসাম্য বজায় রাখতে ছোট বিরতি নিন।",
                "আপনার জীবনীশক্তি শক্তিশালী. একটি নতুন ফিটনেস রুটিন শুরু করার জন্য এটি একটি ভাল দিন।",
                "হাইড্রেটেড থাকুন এবং আপনার ব্যস্ত সময়সূচী থাকা সত্ত্বেও তাড়াহুড়ো করা এড়িয়ে চলুন।"
            ],
            "love": [
                "রোমান্টিক সম্পর্কের মধ্যে আবেগ বেশি থাকে। আপনার অনুভূতি প্রকাশ্যে প্রকাশ করুন।",
                "অবিবাহিতরা তাদের আত্মবিশ্বাসী আচরণের মাধ্যমে মনোযোগ আকর্ষণ করতে পারে।",
                "স্পার্ককে বাঁচিয়ে রাখতে আপনার সঙ্গীর সাথে দুঃসাহসিক কিছু পরিকল্পনা করুন।",
                "সৎ যোগাযোগ বন্ধনকে শক্তিশালী করে। আপনার আবেগ আটকে রাখবেন না।"
            ]
        },
        "gu": {
            "personal": [
                "તમારા સ્વાભાવિક નેતૃત્વ ગુણો આજે તેજસ્વી રીતે ચમકે છે. તમારા હૃદયની નજીકની બાબતોમાં પહેલ કરો.",
                "મંગળ તમારા આત્માને ઉર્જા આપે છે, નવી શરૂઆત અને બોલ્ડ નિર્ણયો માટે આ એક ઉત્તમ દિવસ છે.",
                "તમારો ઉત્સાહ ચેપી છે. આ ઊર્જાને ઉત્પાદક પ્રવૃત્તિઓમાં જોડો.",
                "આજે તમારી વૃત્તિ પર વિશ્વાસ કરો - તે ખાસ કરીને તીક્ષ્ણ છે અને તમને સારી રીતે માર્ગદર્શન આપશે."
            ],
            "career": [
                "તમારી સ્પર્ધાત્મક ધાર તમને વ્યાવસાયિક બાબતોમાં લાભ આપે છે. તમારી કુશળતા દર્શાવવામાં અચકાશો નહીં.",
                "કોઈ નવો પ્રોજેક્ટ અથવા જવાબદારી તમારી સામે આવી શકે છે. તમારી લાક્ષણિક હિંમત સાથે તેને સ્વીકારો.",
                "તમારો સીધો અભિગમ ઉપરી અધિકારીઓને પ્રભાવિત કરે છે. મીટિંગમાં બોલો અને તમારા નવીન વિચારો શેર કરો.",
                "તમારા પોતાના પ્રયત્નો દ્વારા નાણાકીય લાભ સૂચવવામાં આવે છે. મહેનત આજે ફળ આપે છે."
            ],
            "health": [
                "આજે ઉચ્ચ ઊર્જા સ્તર. તેમને શારીરિક વ્યાયામ અથવા રમતગમતની પ્રવૃત્તિઓ દ્વારા ચેનલ કરો.",
                "નાના માથાના દુખાવા અથવા તણાવ પ્રત્યે ધ્યાન રાખો. સંતુલન જાળવવા માટે ટૂંકા વિરામ લો.",
                "તમારી જોમ મજબૂત છે. નવી ફિટનેસ દિનચર્યા શરૂ કરવા માટે આ સારો દિવસ છે.",
                "હાઇડ્રેટેડ રહો અને તમારા વ્યસ્ત શેડ્યૂલ છતાં ભોજનમાં ઉતાવળ કરવાનું ટાળો."
            ],
            "love": [
                "રોમેન્ટિક સંબંધોમાં જુસ્સો વધારે હોય છે. તમારી લાગણીઓને ખુલ્લેઆમ વ્યક્ત કરો.",
                "સિંગલ્સ તેમના આત્મવિશ્વાસભર્યા વર્તન દ્વારા ધ્યાન આકર્ષિત કરી શકે છે.",
                "સ્પાર્કને જીવંત રાખવા માટે તમારા જીવનસાથી સાથે કંઈક સાહસિક યોજના બનાવો.",
                "પ્રામાણિક વાતચીત બોન્ડ્સને મજબૂત બનાવે છે. તમારી લાગણીઓને રોકશો નહીં."
            ]
        }
    },
    "Taurus": {
        "en": {
            "personal": [
                "Venus blesses you with harmony and grace. Focus on beautifying your surroundings.",
                "Your practical nature helps you make sound decisions today. Trust your grounded wisdom.",
                "Patience and persistence are your strengths. Use them to overcome any obstacles.",
                "Comfort and stability matter to you. Create a peaceful environment at home."
            ],
            "career": [
                "Your reliable nature earns recognition at work. Colleagues depend on your steady approach.",
                "Financial planning yields positive results. Consider long-term investments.",
                "Your attention to detail prevents errors. Quality over speed is your mantra today.",
                "A stable income source may present itself. Evaluate opportunities carefully."
            ],
            "health": [
                "Focus on throat and neck area. Warm beverages and gentle stretches help.",
                "Your love for good food is strong, but maintain portion control for better health.",
                "Grounding exercises like walking in nature restore your energy.",
                "Adequate rest is essential. Don't compromise on sleep quality."
            ],
            "love": [
                "Sensuality and affection deepen romantic bonds. Show love through thoughtful gestures.",
                "Loyalty and commitment are highlighted. Your partner appreciates your steadfast nature.",
                "Singles attract stable, reliable partners. Look for genuine connections.",
                "Create romantic moments through shared meals or comfortable settings."
            ]
        },
        "hi": {
            "personal": [
                "शुक्र आपको सामंजस्य और अनुग्रह से आशीर्वाद देता है। अपने परिवेश को सुंदर बनाने पर ध्यान दें।",
                "आपका व्यावहारिक स्वभाव आज आपको सही निर्णय लेने में मदद करता है। अपनी ठोस बुद्धि पर भरोसा करें।",
                "धैर्य और दृढ़ता आपकी ताकत हैं। किसी भी बाधा को दूर करने के लिए उनका उपयोग करें।",
                "आराम और स्थिरता आपके लिए मायने रखती है। घर पर शांतिपूर्ण वातावरण बनाएं।"
            ],
            "career": [
                "आपका विश्वसनीय स्वभाव काम पर मान्यता अर्जित करता है। सहकर्मी आपके स्थिर दृष्टिकोण पर निर्भर करते हैं।",
                "वित्तीय योजना सकारात्मक परिणाम देती है। दीर्घकालिक निवेश पर विचार करें।",
                "विवरण पर आपका ध्यान त्रुटियों को रोकता है। गति से अधिक गुणवत्ता आज आपका मंत्र है।",
                "एक स्थिर आय स्रोत प्रस्तुत हो सकता है। अवसरों का सावधानीपूर्वक मूल्यांकन करें।"
            ],
            "health": [
                "गले और गर्दन के क्षेत्र पर ध्यान दें। गर्म पेय और कोमल स्ट्रेच मदद करते हैं।",
                "अच्छे भोजन के लिए आपका प्यार मजबूत है, लेकिन बेहतर स्वास्थ्य के लिए भाग नियंत्रण बनाए रखें।",
                "प्रकृति में चलने जैसे ग्राउंडिंग व्यायाम आपकी ऊर्जा को बहाल करते हैं।",
                "पर्याप्त आराम आवश्यक है। नींद की गुणवत्ता से समझौता न करें।"
            ],
            "love": [
                "कामुकता और स्नेह रोमांटिक बंधन को गहरा करते हैं। विचारशील इशारों के माध्यम से प्यार दिखाएं।",
                "वफादारी और प्रतिबद्धता पर प्रकाश डाला गया है। आपका साथी आपके दृढ़ स्वभाव की सराहना करता है।",
                "अविवाहित स्थिर, विश्वसनीय साझेदारों को आकर्षित करते हैं। वास्तविक कनेक्शन की तलाश करें।",
                "साझा भोजन या आरामदायक सेटिंग्स के माध्यम से रोमांटिक क्षण बनाएं।"
            ]
        },
        "mr": {
            "personal": [
                "शुक्र तुम्हाला सुसंवाद आणि कृपेने आशीर्वाद देईल. तुमचा परिसर सुशोभित करण्यावर भर द्या.",
                "तुमचा व्यावहारिक स्वभाव आज तुम्हाला योग्य निर्णय घेण्यास मदत करेल. तुमच्या पायाभूत शहाणपणावर विश्वास ठेवा.",
                "संयम आणि चिकाटी ही तुमची ताकद आहे. कोणत्याही अडथळ्यांवर मात करण्यासाठी त्यांचा वापर करा.",
                "आराम आणि स्थिरता तुमच्यासाठी महत्त्वाची आहे. घरात शांततापूर्ण वातावरण निर्माण करा."
            ],
            "career": [
                "तुमचा विश्वासार्ह स्वभाव कामात ओळख मिळवून देतो. सहकारी तुमच्या स्थिर दृष्टिकोनावर अवलंबून असतात.",
                "आर्थिक नियोजनाचे सकारात्मक परिणाम दिसून येतात. दीर्घकालीन गुंतवणुकीचा विचार करा.",
                "तपशीलाकडे आपले लक्ष त्रुटी टाळते. गुणवत्ता ओव्हर स्पीड हा आजचा तुमचा मंत्र आहे.",
                "एक स्थिर उत्पन्नाचा स्रोत स्वतः सादर करू शकतो. संधीचे काळजीपूर्वक मूल्यांकन करा."
            ],
            "health": [
                "घसा आणि मान क्षेत्रावर लक्ष केंद्रित करा. उबदार शीतपेये आणि सौम्य ताण मदत करतात.",
                "चांगले अन्नासाठी तुमचे प्रेम मजबूत आहे, परंतु चांगल्या आरोग्यासाठी भाग नियंत्रण ठेवा.",
                "ग्राउंडिंग व्यायाम जसे की निसर्गात चालणे तुमची ऊर्जा पुनर्संचयित करते.",
                "पुरेशी विश्रांती आवश्यक आहे. झोपेच्या गुणवत्तेशी तडजोड करू नका."
            ],
            "love": [
                "कामुकता आणि आपुलकी रोमँटिक बंध अधिक घट्ट करतात. विचारपूर्वक हावभाव करून प्रेम दाखवा.",
                "निष्ठा आणि बांधिलकी हायलाइट केली आहे. तुमचा जोडीदार तुमच्या स्थिर स्वभावाचे कौतुक करतो.",
                "अविवाहित लोक स्थिर, विश्वासार्ह भागीदारांना आकर्षित करतात. अस्सल कनेक्शन शोधा.",
                "सामायिक जेवण किंवा आरामदायक सेटिंग्जद्वारे रोमँटिक क्षण तयार करा."
            ]
        },
        "ta": {
            "personal": [
                "சுக்கிரன் உங்களுக்கு நல்லிணக்கத்தையும் கருணையையும் தருகிறார். உங்கள் சுற்றுப்புறத்தை அழகுபடுத்துவதில் கவனம் செலுத்துங்கள்.",
                "உங்களின் நடைமுறை இயல்பு இன்று நல்ல முடிவுகளை எடுக்க உதவுகிறது. உங்கள் அடிப்படை ஞானத்தை நம்புங்கள்.",
                "பொறுமையும் விடாமுயற்சியும் உங்கள் பலம். எந்த தடைகளையும் கடக்க அவற்றைப் பயன்படுத்தவும்.",
                "ஆறுதல் மற்றும் நிலைத்தன்மை உங்களுக்கு முக்கியம். வீட்டில் அமைதியான சூழலை உருவாக்குங்கள்."
            ],
            "career": [
                "உங்களின் நம்பகமான இயல்பு வேலையில் அங்கீகாரத்தைப் பெறுகிறது. சக ஊழியர்கள் உங்கள் நிலையான அணுகுமுறையை சார்ந்து இருப்பார்கள்.",
                "நிதி திட்டமிடல் நேர்மறையான முடிவுகளைத் தரும். நீண்ட கால முதலீடுகளை கருத்தில் கொள்ளுங்கள்.",
                "விவரங்களுக்கு உங்கள் கவனம் பிழைகளைத் தடுக்கிறது. வேகத்தை விட தரம் என்பது இன்றைய உங்கள் மந்திரம்.",
                "ஒரு நிலையான வருமான ஆதாரம் தன்னை முன்வைக்கலாம். வாய்ப்புகளை கவனமாக மதிப்பிடுங்கள்."
            ],
            "health": [
                "தொண்டை மற்றும் கழுத்து பகுதியில் கவனம் செலுத்துங்கள். சூடான பானங்கள் மற்றும் மென்மையான நீட்சிகள் உதவும்.",
                "நல்ல உணவின் மீதான உங்கள் அன்பு வலுவானது, ஆனால் சிறந்த ஆரோக்கியத்திற்காக பகுதியைக் கட்டுப்பாட்டில் வைத்திருங்கள்.",
                "இயற்கையில் நடப்பது போன்ற அடிப்படை பயிற்சிகள் உங்கள் ஆற்றலை மீட்டெடுக்கின்றன.",
                "போதுமான ஓய்வு அவசியம். தூக்கத்தின் தரத்தில் சமரசம் செய்து கொள்ளாதீர்கள்."
            ],
            "love": [
                "சிற்றின்பமும் பாசமும் காதல் பிணைப்பை ஆழமாக்குகின்றன. சிந்தனைமிக்க சைகைகள் மூலம் அன்பைக் காட்டுங்கள்.",
                "விசுவாசம் மற்றும் அர்ப்பணிப்பு சிறப்பிக்கப்படுகிறது. உங்கள் பங்குதாரர் உங்கள் உறுதியான தன்மையைப் பாராட்டுகிறார்.",
                "ஒற்றையர் நிலையான, நம்பகமான கூட்டாளர்களை ஈர்க்கிறார்கள். உண்மையான இணைப்புகளைத் தேடுங்கள்.",
                "பகிரப்பட்ட உணவுகள் அல்லது வசதியான அமைப்புகளின் மூலம் காதல் தருணங்களை உருவாக்கவும்."
            ]
        },
        "te": {
            "personal": [
                "శుక్రుడు మిమ్మల్ని సామరస్యం మరియు దయతో ఆశీర్వదిస్తాడు. మీ పరిసరాలను అందంగా తీర్చిదిద్దుకోవడంపై దృష్టి పెట్టండి.",
                "మీ ఆచరణాత్మక స్వభావం ఈరోజు సరైన నిర్ణయాలు తీసుకోవడానికి మీకు సహాయపడుతుంది. మీ ఆధారమైన జ్ఞానాన్ని విశ్వసించండి.",
                "సహనం మరియు పట్టుదల మీ బలాలు. ఏవైనా అడ్డంకులను అధిగమించడానికి వాటిని ఉపయోగించండి.",
                "సౌకర్యం మరియు స్థిరత్వం మీకు ముఖ్యమైనవి. ఇంట్లో ప్రశాంతమైన వాతావరణాన్ని సృష్టించుకోండి."
            ],
            "career": [
                "మీ విశ్వసనీయ స్వభావం పనిలో గుర్తింపును పొందుతుంది. సహోద్యోగులు మీ స్థిరమైన విధానంపై ఆధారపడి ఉంటారు.",
                "ఆర్థిక ప్రణాళిక సానుకూల ఫలితాలను ఇస్తుంది. దీర్ఘకాలిక పెట్టుబడులను పరిగణించండి.",
                "వివరాలపై మీ శ్రద్ధ లోపాలను నివారిస్తుంది. నాణ్యతపై వేగం ఈరోజు మీ మంత్రం.",
                "స్థిరమైన ఆదాయ వనరు స్వయంగా కనిపించవచ్చు. అవకాశాలను జాగ్రత్తగా అంచనా వేయండి."
            ],
            "health": [
                "Focus on throat and neck area. Warm beverages and gentle stretches help.",
                "Your love for good food is strong, but maintain portion control for better health.",
                "Grounding exercises like walking in nature restore your energy.",
                "Adequate rest is essential. Don't compromise on sleep quality."
            ],
            "love": [
                "Sensuality and affection deepen romantic bonds. Show love through thoughtful gestures.",
                "Loyalty and commitment are highlighted. Your partner appreciates your steadfast nature.",
                "Singles attract stable, reliable partners. Look for genuine connections.",
                "Create romantic moments through shared meals or comfortable settings."
            ]
        },
        "kn": {
            "personal": [
                "Venus blesses you with harmony and grace. Focus on beautifying your surroundings.",
                "Your practical nature helps you make sound decisions today. Trust your grounded wisdom.",
                "Patience and persistence are your strengths. Use them to overcome any obstacles.",
                "Comfort and stability matter to you. Create a peaceful environment at home."
            ],
            "career": [
                "Your reliable nature earns recognition at work. Colleagues depend on your steady approach.",
                "Financial planning yields positive results. Consider long-term investments.",
                "Your attention to detail prevents errors. Quality over speed is your mantra today.",
                "A stable income source may present itself. Evaluate opportunities carefully."
            ],
            "health": [
                "Focus on throat and neck area. Warm beverages and gentle stretches help.",
                "Your love for good food is strong, but maintain portion control for better health.",
                "Grounding exercises like walking in nature restore your energy.",
                "Adequate rest is essential. Don't compromise on sleep quality."
            ],
            "love": [
                "Sensuality and affection deepen romantic bonds. Show love through thoughtful gestures.",
                "Loyalty and commitment are highlighted. Your partner appreciates your steadfast nature.",
                "Singles attract stable, reliable partners. Look for genuine connections.",
                "Create romantic moments through shared meals or comfortable settings."
            ]
        },
        "bn": {
            "personal": [
                "Venus blesses you with harmony and grace. Focus on beautifying your surroundings.",
                "Your practical nature helps you make sound decisions today. Trust your grounded wisdom.",
                "Patience and persistence are your strengths. Use them to overcome any obstacles.",
                "Comfort and stability matter to you. Create a peaceful environment at home."
            ],
            "career": [
                "Your reliable nature earns recognition at work. Colleagues depend on your steady approach.",
                "Financial planning yields positive results. Consider long-term investments.",
                "Your attention to detail prevents errors. Quality over speed is your mantra today.",
                "A stable income source may present itself. Evaluate opportunities carefully."
            ],
            "health": [
                "Focus on throat and neck area. Warm beverages and gentle stretches help.",
                "Your love for good food is strong, but maintain portion control for better health.",
                "Grounding exercises like walking in nature restore your energy.",
                "Adequate rest is essential. Don't compromise on sleep quality."
            ],
            "love": [
                "Sensuality and affection deepen romantic bonds. Show love through thoughtful gestures.",
                "Loyalty and commitment are highlighted. Your partner appreciates your steadfast nature.",
                "Singles attract stable, reliable partners. Look for genuine connections.",
                "Create romantic moments through shared meals or comfortable settings."
            ]
        },
        "gu": {
            "personal": [
                "Venus blesses you with harmony and grace. Focus on beautifying your surroundings.",
                "Your practical nature helps you make sound decisions today. Trust your grounded wisdom.",
                "Patience and persistence are your strengths. Use them to overcome any obstacles.",
                "Comfort and stability matter to you. Create a peaceful environment at home."
            ],
            "career": [
                "Your reliable nature earns recognition at work. Colleagues depend on your steady approach.",
                "Financial planning yields positive results. Consider long-term investments.",
                "Your attention to detail prevents errors. Quality over speed is your mantra today.",
                "A stable income source may present itself. Evaluate opportunities carefully."
            ],
            "health": [
                "Focus on throat and neck area. Warm beverages and gentle stretches help.",
                "Your love for good food is strong, but maintain portion control for better health.",
                "Grounding exercises like walking in nature restore your energy.",
                "Adequate rest is essential. Don't compromise on sleep quality."
            ],
            "love": [
                "Sensuality and affection deepen romantic bonds. Show love through thoughtful gestures.",
                "Loyalty and commitment are highlighted. Your partner appreciates your steadfast nature.",
                "Singles attract stable, reliable partners. Look for genuine connections.",
                "Create romantic moments through shared meals or comfortable settings."
            ]
        }
    },
    "Gemini": {
        "en": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        "hi": {
            "personal": [
                "बुध आपके संचार कौशल को बढ़ाता है। स्पष्ट और आत्मविश्वास से खुद को व्यक्त करें।",
                "आपका जिज्ञासु मन नई जानकारी की तलाश करता है। आज कुछ नया सीखना खुशी लाता है।",
                "बहुमुखी प्रतिभा आपकी ताकत है। बदलती परिस्थितियों के अनुकूल जल्दी से ढलें।",
                "सामाजिक बातचीत आपको ऊर्जावान बनाती है। दोस्तों से जुड़ें और अपने नेटवर्क का विस्तार करें।"
            ],
            "career": [
                "आपकी मल्टीटास्किंग क्षमताएं सहकर्मियों को प्रभावित करती हैं। कई परियोजनाओं को कुशलता से संभालें।",
                "संचार-आधारित काम फलता-फूलता है। लेखन, बोलना या पढ़ाना सफलता लाता है।",
                "नेटवर्किंग नए अवसर खोलती है। बैठकों में भाग लें और मूल्यवान कनेक्शन बनाएं।",
                "त्वरित सोच जटिल समस्याओं को हल करने में मदद करती है। आपकी मानसिक चपलता एक संपत्ति है।"
            ],
            "health": [
                "तंत्रिका ऊर्जा को उचित चैनलिंग की आवश्यकता है। शांति के लिए श्वास व्यायाम का अभ्यास करें।",
                "अपने हाथों और बाहों को सक्रिय रखें। कोमल व्यायाम कठोरता को रोकते हैं।",
                "मानसिक उत्तेजना महत्वपूर्ण है, लेकिन सूचना अधिभार से बचें।",
                "छोटी सैर और ताजी हवा आपके दिमाग को साफ करती है और ऊर्जा बढ़ाती है।"
            ],
            "love": [
                "बौद्धिक संबंध रिश्तों को मजबूत करता है। सार्थक बातचीत में संलग्न हों।",
                "विविधता रोमांस को रोमांचक रखती है। अपने साथी के साथ नई गतिविधियों का प्रयास करें।",
                "अविवाहित मजाकिया संचार और आकर्षण के माध्यम से साझेदारों को आकर्षित करते हैं।",
                "शब्दों के माध्यम से भावनाओं को व्यक्त करें - एक संदेश लिखें या विचार खुलकर साझा करें।"
            ]
        },
        "mr": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        "ta": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        "te": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        "kn": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        "bn": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        },
        "gu": {
            "personal": [
                "Mercury enhances your communication skills. Express yourself clearly and confidently.",
                "Your curious mind seeks new information. Learning something new brings joy today.",
                "Versatility is your strength. Adapt quickly to changing circumstances.",
                "Social interactions energize you. Connect with friends and expand your network."
            ],
            "career": [
                "Your multitasking abilities impress colleagues. Handle multiple projects efficiently.",
                "Communication-based work flourishes. Writing, speaking, or teaching brings success.",
                "Networking opens new opportunities. Attend meetings and make valuable connections.",
                "Quick thinking helps solve complex problems. Your mental agility is an asset."
            ],
            "health": [
                "Nervous energy needs proper channeling. Practice breathing exercises for calm.",
                "Keep your hands and arms active. Gentle exercises prevent stiffness.",
                "Mental stimulation is important, but avoid information overload.",
                "Short walks and fresh air clear your mind and boost energy."
            ],
            "love": [
                "Intellectual connection strengthens relationships. Engage in meaningful conversations.",
                "Variety keeps romance exciting. Try new activities with your partner.",
                "Singles attract partners through witty communication and charm.",
                "Express feelings through words - write a message or share thoughts openly."
            ]
        }
    },
    "Cancer": {
        "en": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        "hi": {
            "personal": [
                "चंद्रमा आज आपकी भावनाओं को गहराई से प्रभावित करता है। अपनी भावनाओं और अंतर्ज्ञान का सम्मान करें।",
                "घर और परिवार आराम लाते हैं। प्रियजनों के साथ गुणवत्तापूर्ण समय बिताएं।",
                "आपके पोषण स्वभाव की सराहना की जाती है। दूसरों की देखभाल करते हुए खुद की देखभाल करें।",
                "भावनात्मक सुरक्षा मायने रखती है। अपने चारों ओर एक सुरक्षित, आरामदायक वातावरण बनाएं।"
            ],
            "career": [
                "आपका सहानुभूतिपूर्ण दृष्टिकोण टीम की गतिशीलता में मदद करता है। सहकर्मी आपके समर्थन को महत्व देते हैं।",
                "व्यावसायिक निर्णयों में अपनी आंत की भावनाओं पर भरोसा करें। अंतर्ज्ञान आपका अच्छी तरह मार्गदर्शन करता है।",
                "देखभाल या आतिथ्य में करियर वादा दिखाता है। आपकी करुणा एक संपत्ति है।",
                "संपत्ति या पारिवारिक व्यवसाय के माध्यम से वित्तीय सुरक्षा पर प्रकाश डाला गया है।"
            ],
            "health": [
                "पाचन स्वास्थ्य पर ध्यान देने की आवश्यकता है। घर का बना, पौष्टिक भोजन खाएं।",
                "भावनात्मक कल्याण शारीरिक स्वास्थ्य को प्रभावित करता है। आत्म-देखभाल और विश्राम का अभ्यास करें।",
                "पानी का सेवन महत्वपूर्ण है। दिन भर अच्छी तरह से हाइड्रेटेड रहें।",
                "तैराकी या योग जैसे कोमल व्यायाम आपके संवेदनशील स्वभाव के अनुकूल हैं।"
            ],
            "love": [
                "गहरे भावनात्मक बंधन मजबूत होते हैं। अपने साथी के साथ अपनी भावनाओं को साझा करें।",
                "एक प्रेमपूर्ण घरेलू वातावरण बनाना रोमांस को बढ़ाता है।",
                "अविवाहित देखभाल करने वाले, परिवार-उन्मुख साझेदारों को आकर्षित करते हैं।",
                "पुरानी यादें और यादें जोड़ों को करीब लाती हैं। विशेष क्षणों को एक साथ फिर से देखें।"
            ]
        },
        "mr": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        "ta": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        "te": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        "kn": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        "bn": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        },
        "gu": {
            "personal": [
                "The Moon influences your emotions deeply today. Honor your feelings and intuition.",
                "Home and family bring comfort. Spend quality time with loved ones.",
                "Your nurturing nature is appreciated. Care for others while caring for yourself.",
                "Emotional security matters. Create a safe, cozy environment around you."
            ],
            "career": [
                "Your empathetic approach helps in team dynamics. Colleagues value your support.",
                "Trust your gut feelings in business decisions. Intuition guides you well.",
                "Careers in caregiving or hospitality show promise. Your compassion is an asset.",
                "Financial security through property or family business is highlighted."
            ],
            "health": [
                "Digestive health needs attention. Eat home-cooked, nourishing meals.",
                "Emotional wellbeing affects physical health. Practice self-care and relaxation.",
                "Water intake is crucial. Stay well-hydrated throughout the day.",
                "Gentle exercises like swimming or yoga suit your sensitive nature."
            ],
            "love": [
                "Deep emotional bonds strengthen. Share your feelings with your partner.",
                "Creating a loving home environment enhances romance.",
                "Singles attract caring, family-oriented partners.",
                "Nostalgia and memories bring couples closer. Revisit special moments together."
            ]
        }
    },
    "Leo": {
        "en": {
            "personal": [
                "The Sun empowers your confidence and charisma. Shine brightly in all you do.",
                "Your generous spirit attracts admiration. Lead with warmth and authenticity.",
                "Creative expression brings joy. Engage in artistic or performative activities.",
                "Pride in your achievements is natural. Celebrate your successes today."
            ],
            "career": [
                "Leadership opportunities arise. Step into the spotlight with confidence.",
                "Your creative solutions impress superiors. Innovation is rewarded.",
                "Public recognition for your work is likely. Accept praise graciously.",
                "Entrepreneurial ventures show promise. Your bold vision attracts support."
            ],
            "health": [
                "Heart health is important. Engage in cardiovascular exercises.",
                "Your vitality is strong, but avoid overexertion. Balance activity with rest.",
                "Sunshine and outdoor activities boost your mood and energy.",
                "Maintain a regal posture. Back and spine care prevents discomfort."
            ],
            "love": [
                "Romance flourishes with grand gestures. Express love dramatically and sincerely.",
                "Your magnetic personality attracts admirers. Singles enjoy attention.",
                "Loyalty and devotion deepen committed relationships.",
                "Plan something special and memorable with your partner."
            ]
        },
        "hi": {
            "personal": [
                "सूर्य आपके आत्मविश्वास और करिश्मे को सशक्त बनाता है। आप जो भी करें उसमें उज्ज्वल रूप से चमकें।",
                "आपकी उदार भावना प्रशंसा को आकर्षित करती है। गर्मजोशी और प्रामाणिकता के साथ नेतृत्व करें।",
                "रचनात्मक अभिव्यक्ति खुशी लाती है। कलात्मक या प्रदर्शनकारी गतिविधियों में संलग्न हों।",
                "अपनी उपलब्धियों पर गर्व स्वाभाविक है। आज अपनी सफलताओं का जश्न मनाएं।"
            ],
            "career": [
                "नेतृत्व के अवसर उत्पन्न होते हैं। आत्मविश्वास के साथ सुर्खियों में कदम रखें।",
                "आपके रचनात्मक समाधान वरिष्ठों को प्रभावित करते हैं। नवाचार को पुरस्कृत किया जाता है।",
                "आपके काम के लिए सार्वजनिक मान्यता की संभावना है। प्रशंसा को शालीनता से स्वीकार करें।",
                "उद्यमशीलता उद्यम वादा दिखाते हैं। आपकी साहसिक दृष्टि समर्थन को आकर्षित करती है।"
            ],
            "health": [
                "हृदय स्वास्थ्य महत्वपूर्ण है। हृदय व्यायाम में संलग्न हों।",
                "आपकी जीवन शक्ति मजबूत है, लेकिन अत्यधिक परिश्रम से बचें। गतिविधि को आराम के साथ संतुलित करें।",
                "धूप और बाहरी गतिविधियां आपके मूड और ऊर्जा को बढ़ावा देती हैं।",
                "एक शाही मुद्रा बनाए रखें। पीठ और रीढ़ की देखभाल असुविधा को रोकती है।"
            ],
            "love": [
                "भव्य इशारों के साथ रोमांस फलता-फूलता है। नाटकीय और ईमानदारी से प्यार व्यक्त करें।",
                "आपका चुंबकीय व्यक्तित्व प्रशंसकों को आकर्षित करता है। अविवाहित ध्यान का आनंद लेते हैं।",
                "वफादारी और भक्ति प्रतिबद्ध रिश्तों को गहरा करती है।",
                "अपने साथी के साथ कुछ विशेष और यादगार योजना बनाएं।"
            ]
        },
        "mr": {
            "personal": [
                "सूर्य तुमच्या आत्मविश्वास आणि करिष्म्याला सशक्त करतो. तुम्ही जे काही कराल त्यात तेजस्वीपणे चमकून उठा.",
                "तुमचा उदार स्वभाव प्रशंसा आकर्षित करतो. उबदारपणा आणि प्रामाणिकपणाने नेतृत्व करा.",
                "सर्जनशील अभिव्यक्ती आनंद आणते. कलात्मक किंवा प्रदर्शनीय क्रियाकलापांमध्ये व्यस्त रहा.",
                "तुमच्या यशाचा अभिमान नैसर्गिक आहे. आज तुमचे यश साजरे करा."
            ],
            "career": [
                "नेतृत्वाच्या संधी निर्माण होतात. आत्मविश्वासाने प्रकाशझोतात या.",
                "तुमचे सर्जनशील उपाय वरिष्ठांना प्रभावित करतात. नाविन्याला पुरस्कार मिळतो.",
                "तुमच्या कामासाठी सार्वजनिक मान्यता मिळण्याची शक्यता आहे. कौतुकाचा मनापासून स्वीकार करा.",
                "उद्योजकीय उपक्रम आशादायक ठरतात. तुमची धाडसी दृष्टी समर्थनाला आकर्षित करते."
            ],
            "health": [
                "हृदयाचे आरोग्य महत्त्वाचे आहे. हृदय व रक्तवाहिन्यासंबंधी व्यायामात व्यस्त रहा.",
                "तुमची चैतन्य शक्ती मजबूत आहे, परंतु अतिश्रम टाळा. विश्रांतीसह क्रियाकलापांचा समतोल राखा.",
                "सूर्यप्रकाश आणि बाह्य क्रियाकलाप तुमचा मूड आणि ऊर्जा वाढवतात.",
                "एक राजेशाही मुद्रा राखा. पाठ आणि मणक्याची काळजी घेतल्यास अस्वस्थता टळते."
            ],
            "love": [
                "भव्य हावभावांसह प्रणय बहरतो. प्रेम नाट्यमयरीत्या आणि प्रामाणिकपणे व्यक्त करा.",
                "तुमचे चुंबकीय व्यक्तिमत्व प्रशंसकांना आकर्षित करते. अविवाहित लक्ष वेधून घेतात.",
                "निष्ठा आणि भक्ती वचनबद्ध नातेसंबंध अधिक दृढ करतात.",
                "तुमच्या जोडीदारासोबत काहीतरी खास आणि संस्मरणीय योजना करा."
            ]
        },
        "ta": {
            "personal": [
                "சூரியன் உங்கள் தன்னம்பிக்கையையும் கவர்ச்சியையும் மேம்படுத்துகிறது. நீங்கள் செய்யும் அனைத்திலும் பிரகாசமாக விளங்குங்கள்.",
                "உங்களின் தாராள குணம் மற்றவர்களின் பாராட்டைப் பெறுகிறது. கனிவுடனும் நேர்மையுடனும் தலைமை தாங்குங்கள்.",
                "படைப்பாற்றல் வெளிப்பாடு மகிழ்ச்சியைத் தருகிறது. கலை அல்லது கலைநிகழ்ச்சிகளில் ஈடுபடுங்கள்.",
                "உங்கள் சாதனைகளில் பெருமை கொள்வது இயல்பானது. இன்று உங்கள் வெற்றிகளைக் கொண்டாடுங்கள்."
            ],
            "career": [
                "தலைமைத்துவ வாய்ப்புகள் உருவாகின்றன. நம்பிக்கையுடன் முன்னணியில் செயல்படுங்கள்.",
                "உங்களின் ஆக்கபூர்வமான தீர்வுகள் மேலதிகாரிகளை ஈர்க்கும். புதுமைக்கு தகுந்த வெகுமதி கிடைக்கும்.",
                "உங்கள் பணிக்கான பொது அங்கீகாரம் கிடைக்க வாய்ப்புள்ளது. புகழ்ச்சியை கண்ணியத்துடன் ஏற்றுக்கொள்ளுங்கள்.",
                "தொழில்முனைவு முயற்சிகள் நம்பிக்கையளிக்கின்றன. உங்கள் தைரியமான பார்வை ஆதரவை ஈர்க்கிறது."
            ],
            "health": [
                "இதய ஆரோக்கியம் முக்கியமானது. இதய தசைகளுக்கான உடற்பயிற்சிகளில் ஈடுபடுங்கள்.",
                "உங்களின் உயிர் ஆற்றல் வலுவாக உள்ளது, ஆனால் அதிகப்படியான வேலையைத் தவிர்க்கவும். செயல்பாட்டிற்கும் ஓய்விற்கும் இடையே சமநிலையைப் பராமரிக்கவும்.",
                "சூரிய ஒளி மற்றும் வெளிப்புற நடவடிக்கைகள் உங்கள் மனநிலையையும் ஆற்றலையும் அதிகரிக்கும்.",
                "ராஜ நடையை பராமரிக்கவும். முதுகு மற்றும் தண்டுவட பராமரிப்பு அசௌகரியத்தைத் தடுக்கும்."
            ],
            "love": [
                "காதல் உணர்வுகள் பெருகும். அன்பை வெளிப்படையாகவும் உண்மையாகவும் வெளிப்படுத்துங்கள்.",
                "உங்கள் வசீகரமான ஆளுமை மற்றவர்களை ஈர்க்கும். தனிமையில் இருப்பவர்கள் கவனத்தைப் பெறுவார்கள்.",
                "விசுவாசமும் அர்ப்பணிப்பும் உறவுகளை ஆழப்படுத்தும்.",
                "உங்கள் துணையுடன் சிறப்பான மற்றும் மறக்கமுடியாத ஒன்றை திட்டமிடுங்கள்."
            ]
        },
        "te": {
            "personal": [
                "సూర్యుడు మీ ఆత్మవిశ్వాసాన్ని మరియు తేజస్సును పెంపొందిస్తాడు. మీరు చేసే ప్రతి పనిలో ప్రకాశవంతంగా మెరవండి.",
                "మీ ఉదార స్వభావం ఇతరుల ప్రశంసలను పొందుతుంది. ఆత్మీయతతో మరియు నిజాయితీతో నాయకత్వం వహించండి.",
                "సృజనాత్మక వ్యక్తీకరణ ఆనందాన్ని ఇస్తుంది. కళాత్మక లేదా ప్రదర్శన కార్యకలాపాలలో పాల్గొనండి.",
                "మీ విజయాల పట్ల గర్వపడటం సహజం. ఈరోజు మీ విజయాలను జరుపుకోండి."
            ],
            "career": [
                "నాయకత్వ అవకాశాలు లభిస్తాయి. ఆత్మవిశ్వాసంతో ముందడుగు వేయండి.",
                "మీ సృజనాత్మక పరిష్కారాలు ఉన్నతాధికారులను ఆకట్టుకుంటాయి. నూతన ఆవిష్కరణలకు తగిన ప్రతిఫలం లభిస్తుంది.",
                "మీ పనికి సామాజిక గుర్తింపు లభించే అవకాశం ఉంది. ప్రశంసలను వినయంగా స్వీకరించండి.",
                "వ్యాపార ప్రయత్నాలు ఆశాజనకంగా ఉన్నాయి. మీ సాహసోపేతమైన విజన్ మద్దతును పొందుతుంది."
            ],
            "health": [
                "గుండె ఆరోగ్యం ముఖ్యం. కార్డియో వ్యాయామాలు చేయండి.",
                "మీ జీవశక్తి బలంగా ఉంది, కానీ అతిగా శ్రమించకండి. విశ్రాంతిని మరియు పనిని సమతుల్యం చేసుకోండి.",
                "సూర్యరశ్మి మరియు బయటి కార్యకలాపాలు మీ ఉత్సాహాన్ని మరియు శక్తిని పెంచుతాయి.",
                "రాజసం ఉట్టిపడేలా నడవండి. వెన్ను మరియు వెన్నెముక సంరక్షణ అసౌకర్యాన్ని నివారిస్తుంది."
            ],
            "love": [
                "ప్రేమ సంబంధాలు బలపడతాయి. మీ ప్రేమను మనస్ఫూర్తిగా వ్యక్తపరచండి.",
                "మీ ఆకర్షణీయమైన వ్యక్తిత్వం ఇతరులను ఆకట్టుకుంటుంది. ఒంటరిగా ఉన్నవారికి మంచి గుర్তিంపు లభిస్తుంది.",
                "నిజాయితీ మరియు అంకితభావం సంబంధాలను మరింత దృఢపరుస్తాయి.",
                "మీ భాగస్వామితో కలిసి ఏదైనా ప్రత్యేకమైన ప్రణాళిక వేయండి."
            ]
        },
        "kn": {
            "personal": [
                "ಸೂರ್ಯನು ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ವರ್ಚಸ್ಸನ್ನು ಹೆಚ್ಚಿಸುತ್ತಾನೆ. ನೀವು ಮಾಡುವ ಪ್ರತಿಯೊಂದು ಕೆಲಸದಲ್ಲೂ ಪ್ರಕಾಶಮಾನವಾಗಿ ಹೊಳೆಯಿರಿ.",
                "ನಿಮ್ಮ ಉದಾರ ಮನೋಭಾವವು ಮೆಚ್ಚುಗೆಯನ್ನು ಸೆಳೆಯುತ್ತದೆ. ಆತ್ಮೀಯತೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಯಿಂದ ಮುನ್ನಡೆಸಿ.",
                "ಸೃಜನಶೀಲ ಅಭಿವ್ಯಕ್ತಿಯು ಸಂತೋಷವನ್ನು ತರುತ್ತದೆ. ಕಲಾತ್ಮಕ ಅಥವಾ ಪ್ರದರ್ಶನ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ.",
                "ನಿಮ್ಮ ಸಾಧನೆಗಳ ಬಗ್ಗೆ ಹೆಮ್ಮೆ ಪಡುವುದು ಸಹಜ. ಇಂದು ನಿಮ್ಮ ಯಶಸ್ಸನ್ನು ಆಚರಿಸಿ."
            ],
            "career": [
                "ನಾಯಕತ್ವದ ಅವಕಾಶಗಳು ಎದುರಾಗುತ್ತವೆ. ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮುನ್ನೆಲೆಗೆ ಬನ್ನಿ.",
                "ನಿಮ್ಮ ಸೃಜನಶೀಲ ಪರಿಹಾರಗಳು ಮೇಲಧಿಕಾರಿಗಳನ್ನು ಆಕರ್ಷಿಸುತ್ತವೆ. ನಾವೀನ್ಯತೆಗೆ ತಕ್ಕ ಪ್ರತಿಫಲ ದೊರೆಯುತ್ತದೆ.",
                "ನಿಮ್ಮ ಕೆಲಸಕ್ಕೆ ಸಾರ್ವಜನಿಕ ಮಾನ್ಯತೆ ಸಿಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಪ್ರಶಂಸೆಯನ್ನು ವಿನಯದಿಂದ ಸ್ವೀಕರಿಸಿ.",
                "ಉದ್ಯಮಶೀಲ ಪ್ರಯತ್ನಗಳು ಆಶಾದಾಯಕವಾಗಿವೆ. ನಿಮ್ಮ ಧೈರ್ಯಶಾಲಿ ದೃಷ್ಟಿಕોನವು ಬೆಂಬಲವನ್ನು ಸೆಳೆಯುತ್ತದೆ."
            ],
            "health": [
                "ಹೃದಯದ आरोग्य ಮುಖ್ಯವಾಗಿದೆ. ಕಾರ್ಡಿಯೋ ವ್ಯಾಯಾಮಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ.",
                "ನಿಮ್ಮ ಜೀವಶಕ್ತಿ ಪ್ರಬಲವಾಗಿದೆ, ಆದರೆ ಅತಿಯಾದ ಶ್ರಮವನ್ನು ತಪ್ಪಿಸಿ. ವಿಶ್ರಾಂತಿ ಮತ್ತು ಕೆಲಸದ ನಡುವೆ ಸಮತೋಲನ ಕಾಪಾಡಿ.",
                "ಸೂರ್ಯನ ಬೆಳಕು ಮತ್ತು ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳು ನಿಮ್ಮ ಮನಸ್ಥಿತಿ ಮತ್ತು ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.",
                "ರಾಜ ಗಾಂಭೀರ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. ಬೆನ್ನು ಮತ್ತು ಬೆನ್ನುಮೂಳೆಯ ಆರೈಕೆಯು ಅಸ್ವಸ್ಥತೆಯನ್ನು ತಡೆಯುತ್ತದೆ."
            ],
            "love": [
                "ಪ್ರೀತಿಯ ಸಂಬಂಧಗಳು ಹೊಸ ಹೊಳಪನ್ನು ಪಡೆಯುತ್ತವೆ. ನಿಮ್ಮ ಪ್ರೀತಿಯನ್ನು ಪ್ರಾಮಾಣಿಕವಾಗಿ ವ್ಯಕ್ತಪಡಿಸಿ.",
                "ನಿಮ್ಮ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವವು ಇತರರನ್ನು ಸೆಳೆಯುತ್ತದೆ. ಏಕಾಂಗಿಯಾಗಿರುವವರಿಗೆ ಹೆಚ್ಚಿನ ಗಮನ ಸಿಗುತ್ತದೆ.",
                "ನಿಷ್ಠೆ ಮತ್ತು ಭಕ್ತಿಯು ಸಂಬಂಧಗಳನ್ನು ಆಳಗೊಳಿಸುತ್ತದೆ.",
                "ನಿಮ್ಮ ಸಂಗಾತಿಯೊಂದಿಗೆ ಏನಾದರೂ ವಿಶೇಷ ಮತ್ತು ಸ್ಮರಣೀಯವಾದುದನ್ನು ಯೋಜಿಸಿ."
            ]
        },
        "bn": {
            "personal": [
                "সূর্য আপনার আত্মবিশ্বাস এবং সহজাত আকর্ষণকে আরও শক্তিশালী করে তোলে। আপনার প্রতিটি কাজে উজ্জ্বল হয়ে উঠুন।",
                "আপনার উদার মনোভাব প্রশংসা আকর্ষণ করে। আন্তরিকতা এবং সততার সাথে নেতৃত্ব দিন।",
                "সৃজনশীল প্রকাশ আনন্দ বয়ে আনে। শৈল্পিক বা প্রদর্শনমূলক কাজে নিযুক্ত হোন।",
                "নিজের অর্জনে গর্ববোধ করা স্বাভাবিক। আজ নিজের সাফল্য উদযাপন করুন।"
            ],
            "career": [
                "নেতৃত্ব দেওয়ার সুযোগ আসবে। আত্মবিশ্বাসের সাথে সামনের সারিতে আসুন।",
                "আপনার সৃজনশীল সমাধান ঊর্ধ্বতনদের মুগ্ধ করবে। নতুনত্বের জন্য পুরস্কার পাওয়ার সম্ভাবনা আছে।",
                "আপনার কাজের জন্য সামাজিক স্বীকৃতি পাওয়ার সম্ভাবনা রয়েছে। প্রশংসা বিনয়ের সাথে গ্রহণ করুন।",
                "নতুন ব্যবসায়িক উদ্যোগ সফল হতে পারে। আপনার সাহসী চিন্তাভাবনা সমর্থন জোগাবে।"
            ],
            "health": [
                "হার্টের স্বাস্থ্যের দিকে নজর দিন। কার্ডিও ব্যায়াম করার চেষ্টা করুন।",
                "আপনার জীবনীশক্তি প্রবল, তবে অতিরিক্ত পরিশ্রম এড়িয়ে চলুন। কাজ ও বিশ্রামের মধ্যে ভারসাম্য বজায় রাখুন।",
                "সূর্যালোক এবং বাইরের কাজ আপনার মেজাজ ও শক্তি বৃদ্ধি করবে।",
                "রাজকীয় ভঙ্গি বজায় রাখুন। পিঠ এবং শিরদাঁড়ার যত্ন নিলে অস্বস্তি এড়ানো যাবে।"
            ],
            "love": [
                "রোম্যান্স এবং ভালোবাসা বৃদ্ধি পাবে। মনের কথা স্পষ্ট করে এবং সততার সাথে প্রকাশ করুন।",
                "আপনার আকর্ষণীয় ব্যক্তিত্ব অন্যদের মুগ্ধ করবে। অবিবাহিতরা বিশেষ মনোযোগ পাবেন।",
                "নিষ্ঠা ও ভক্তি সম্পর্কের বাঁধনকে আরও দৃঢ় করবে।",
                "সঙ্গীর সাথে বিশেষ কোনো মুহূর্ত কাটানোর পরিকল্পনা করুন।"
            ]
        },
        "gu": {
            "personal": [
                "સૂર્ય તમારા આત્મવિશ્વાસ અને પ્રભાવને સશક્ત બનાવે છે. તમે જે પણ કરો તેમાં તેજસ્વી રીતે ચમકો.",
                "તમારો ઉદાર સ્વભાવ પ્રશંસા આકર્ષે છે. હૂંફ અને પ્રામાણિકતા સાથે નેતૃત્વ કરો.",
                "સર્જનાત્મક અભિવ્યક્તિ આનંદ લાવે છે. કલાત્મક અથવા પ્રદર્શનલક્ષી પ્રવૃત્તિઓમાં વ્યસ્ત રહો.",
                "તમારી સિદ્ધિઓ પર ગર્વ હોવો સ્વાભાવિક છે. આજે તમારી સફળતાની ઉજવણી કરો."
            ],
            "career": [
                "નેતૃત્વની તકો ઊભી થાય છે. આત્મવિશ્વાસ સાથે આગળ આવો.",
                "તમારા સર્જનાત્મક ઉકેલો ઉપરી અધિકારીઓને પ્રભાવિત કરે છે. નવા વિચારો માટે પુરસ્કાર મળી શકે છે.",
                "તમારા કામ માટે સામાજિક માન્યતા મળવાની સંભાવના છે. પ્રશંસાનો નમ્રતાથી સ્વીકાર કરો.",
                "નવા વ્યવસાયિક સાહસો આશાસ્પદ લાગે છે. તમારો સાહસિક દ્રષ્ટિકોણ સમર્થન આકર્ષે છે."
            ],
            "health": [
                "હૃદયનું સ્વાસ્થ્ય મહત્વનું છે. કાર્ડિયો કસરતોમાં વ્યસ્ત રહો.",
                "તમારી જીવનશક્તિ મજબૂત છે, પણ વધુ પડતા પરિશ્રમથી બચો. કામ અને આરામ વચ્ચે સંતુલન જાળવો.",
                "સૂર્યપ્રકાશ અને બહારની પ્રવૃત્તિઓ તમારા મૂડ અને ઉર્જામાં વધારો કરે છે.",
                "શાહી અદા જાળવી રાખો. પીઠ અને કરોડરજ્જુની સંભાળ અગવડતા અટકાવે છે."
            ],
            "love": [
                "રોમાંસ ખીલી ઉઠશે. તમારો પ્રેમ નિખાલસતાથી અને પ્રામાણિકતાથી વ્યક્ત કરો.",
                "તમારું આકર્ષક વ્યક્તિત્વ પ્રશંસકોને આકર્ષે છે. અપરિણીત લોકો ધ્યાન ખેંચશે.",
                "વફાદારી અને સમર્પણ સંબંધોને વધુ ગાઢ બનાવે છે.",
                "તમારા જીવનસાથી સાથે કંઈક વિશેષ અને યાદગार યોજના બનાવો."
            ]
        }
    },
    "Virgo": {
        "en": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        "hi": {
            "personal": [
                "बुध आपके विश्लेषणात्मक दिमाग को तेज करता है। अधिकतम दक्षता के लिए व्यवस्थित और योजना बनाएं।",
                "विवरण पर ध्यान आपकी अच्छी सेवा करता है। छोटी चीजों को नोटिस करें जो दूसरे चूक जाते हैं।",
                "आपकी व्यावहारिक बुद्धि रोजमर्रा की समस्याओं को हल करने में मदद करती है। सहायक सलाह दें।",
                "पूर्णतावाद का अपना स्थान है, लेकिन खुद पर बहुत कठोर न हों।"
            ],
            "career": [
                "आपका सावधानीपूर्वक काम सम्मान अर्जित करता है। गुणवत्ता और सटीकता आपके ट्रेडमार्क हैं।",
                "स्वास्थ्य-संबंधित या सेवा-उन्मुख करियर फलते-फूलते हैं। आपका समर्पण दिखता है।",
                "समस्या-समाधान कौशल की मांग है। सहकर्मी आपके विश्लेषणात्मक इनपुट की तलाश करते हैं।",
                "आपके द्वारा सुझाए गए दक्षता सुधार लागू किए जाते हैं। आपके तरीके काम करते हैं।"
            ],
            "health": [
                "पाचन तंत्र को देखभाल की आवश्यकता है। एक स्वच्छ, संतुलित आहार बनाए रखें।",
                "चिंता को अपनी भलाई को प्रभावित न करने दें। तनाव-कमी तकनीकों का अभ्यास करें।",
                "नियमित दिनचर्या आपके स्वास्थ्य का समर्थन करती है। लगातार नींद और भोजन के समय पर टिके रहें।",
                "मध्यम व्यायाम और स्वच्छता की आदतें आपको अपना सर्वश्रेष्ठ महसूस कराती हैं।"
            ],
            "love": [
                "सेवा के कार्यों के माध्यम से प्यार दिखाएं। छोटे, विचारशील इशारे सब कुछ मायने रखते हैं।",
                "व्यावहारिक समर्थन रिश्तों को मजबूत करता है। अपने साथी की मूर्त तरीकों से मदद करें।",
                "अविवाहित साझेदारों को आकर्षित करते हैं जो आपकी विश्वसनीयता और देखभाल की सराहना करते हैं।",
                "जरूरतों और अपेक्षाओं के बारे में खुला संचार अंतरंगता में सुधार करता है।"
            ]
        },
        "mr": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        "ta": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        "te": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        "kn": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        "bn": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        },
        "gu": {
            "personal": [
                "Mercury sharpens your analytical mind. Organize and plan for maximum efficiency.",
                "Attention to detail serves you well. Notice the small things others miss.",
                "Your practical wisdom helps solve everyday problems. Offer helpful advice.",
                "Perfectionism has its place, but don't be too hard on yourself."
            ],
            "career": [
                "Your meticulous work earns respect. Quality and precision are your trademarks.",
                "Health-related or service-oriented careers flourish. Your dedication shows.",
                "Problem-solving skills are in demand. Colleagues seek your analytical input.",
                "Efficiency improvements you suggest are implemented. Your methods work."
            ],
            "health": [
                "Digestive system needs care. Maintain a clean, balanced diet.",
                "Don't let worry affect your wellbeing. Practice stress-reduction techniques.",
                "Regular routines support your health. Stick to consistent sleep and meal times.",
                "Moderate exercise and cleanliness habits keep you feeling your best."
            ],
            "love": [
                "Show love through acts of service. Small, thoughtful gestures mean everything.",
                "Practical support strengthens relationships. Help your partner in tangible ways.",
                "Singles attract partners who appreciate your reliability and care.",
                "Open communication about needs and expectations improves intimacy."
            ]
        }
    },
    "Libra": {
        "en": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        "hi": {
            "personal": [
                "शुक्र आपको अनुग्रह और आकर्षण से आशीर्वाद देता है। आपका कूटनीतिक स्वभाव सामंजस्य बनाता है।",
                "आज संतुलन महत्वपूर्ण है। काम, आराम और खेल के बीच संतुलन खोजें।",
                "आपकी निष्पक्षता की भावना महत्वपूर्ण निर्णयों का मार्गदर्शन करती है। अपने निर्णय पर भरोसा करें।",
                "सौंदर्य प्रशंसा खुशी लाती है। अपने आप को सुंदरता से घेरें।"
            ],
            "career": [
                "साझेदारी और सहयोग सफलता देते हैं। दूसरों के साथ अच्छी तरह से काम करें।",
                "आपके बातचीत कौशल मूल्यवान हैं। संघर्षों की मध्यस्थता करें और जीत-जीत समाधान खोजें।",
                "रचनात्मक क्षेत्र और डिजाइन कार्य फलते-फूलते हैं। सुंदरता के लिए आपकी नजर एक संपत्ति है।",
                "निष्पक्ष व्यवहार और नैतिक प्रथाएं आपकी पेशेवर प्रतिष्ठा को बढ़ाती हैं।"
            ],
            "health": [
                "गुर्दे और निचली पीठ के स्वास्थ्य पर ध्यान देने की आवश्यकता है। हाइड्रेटेड रहें और नियमित रूप से खिंचाव करें।",
                "आहार और व्यायाम में संतुलन महत्वपूर्ण है। चरम सीमाओं से बचें।",
                "सामाजिक गतिविधियां मानसिक स्वास्थ्य को बढ़ावा देती हैं। कल्याण के लिए दोस्तों से जुड़ें।",
                "शांतिपूर्ण वातावरण आपके संवेदनशील स्वभाव का समर्थन करता है। शोर और अराजकता को कम करें।"
            ],
            "love": [
                "रोमांस और साझेदारी पर प्रकाश डाला गया है। गुणवत्तापूर्ण समय के माध्यम से बंधन को मजबूत करें।",
                "आपका आकर्षण प्रशंसकों को आकर्षित करता है। अविवाहित किसी विशेष से मिल सकते हैं।",
                "रिश्तों में सामंजस्य आवश्यक है। अनुग्रह और कुशलता के साथ संघर्षों को संबोधित करें।",
                "रोमांटिक इशारे और सुंदर सेटिंग्स अंतरंगता को बढ़ाते हैं।"
            ]
        },
        "mr": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        "ta": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        "te": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        "kn": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        "bn": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        },
        "gu": {
            "personal": [
                "Venus blesses you with grace and charm. Your diplomatic nature creates harmony.",
                "Balance is key today. Find equilibrium between work, rest, and play.",
                "Your sense of fairness guides important decisions. Trust your judgment.",
                "Aesthetic appreciation brings joy. Surround yourself with beauty."
            ],
            "career": [
                "Partnership and collaboration yield success. Work well with others.",
                "Your negotiation skills are valuable. Mediate conflicts and find win-win solutions.",
                "Creative fields and design work flourish. Your eye for beauty is an asset.",
                "Fair dealings and ethical practices enhance your professional reputation."
            ],
            "health": [
                "Kidney and lower back health need attention. Stay hydrated and stretch regularly.",
                "Balance in diet and exercise is crucial. Avoid extremes.",
                "Social activities boost mental health. Connect with friends for wellbeing.",
                "Peaceful environments support your sensitive nature. Reduce noise and chaos."
            ],
            "love": [
                "Romance and partnership are highlighted. Strengthen bonds through quality time.",
                "Your charm attracts admirers. Singles may meet someone special.",
                "Harmony in relationships is essential. Address conflicts with grace and tact.",
                "Romantic gestures and beautiful settings enhance intimacy."
            ]
        }
    },
    "Scorpio": {
        "en": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        "hi": {
            "personal": [
                "प्लूटो आपकी परिवर्तनकारी शक्ति को तीव्र करता है। गहरे व्यक्तिगत विकास को अपनाएं।",
                "आपका अंतर्ज्ञान असाधारण रूप से मजबूत है। अपनी प्रवृत्ति पर पूरी तरह से भरोसा करें।",
                "जुनून और तीव्रता आपके दिन को परिभाषित करती है। भावनाओं को उत्पादक रूप से प्रसारित करें।",
                "रहस्य और गहराई आपको आकर्षित करती है। छिपे हुए सत्य और गहन अंतर्दृष्टि का अन्वेषण करें।"
            ],
            "career": [
                "अनुसंधान और जांच परिणाम देती है। आपके जासूस जैसे कौशल चमकते हैं।",
                "काम पर शक्ति की गतिशीलता आपके पक्ष में बदल जाती है। रणनीतिक रूप से खुद को जोर दें।",
                "निवेश या साझा संसाधनों के माध्यम से वित्तीय लाभ संभव है।",
                "आपका दृढ़ संकल्प बाधाओं को दूर करता है। दृढ़ता अच्छी तरह से भुगतान करती है।"
            ],
            "health": [
                "प्रजनन और उन्मूलन प्रणालियों को देखभाल की आवश्यकता है। उचित स्वच्छता बनाए रखें।",
                "भावनात्मक तीव्रता शारीरिक स्वास्थ्य को प्रभावित करती है। भावनाओं के लिए स्वस्थ आउटलेट खोजें।",
                "गहरी सांस लेना और ध्यान तनाव को प्रभावी ढंग से प्रबंधित करने में मदद करता है।",
                "विषहरण और सफाई प्रथाएं अब आपको लाभ पहुंचाती हैं।"
            ],
            "love": [
                "जुनून और अंतरंगता गहरी होती है। भावनात्मक और शारीरिक बंधन मजबूत होते हैं।",
                "ईर्ष्या या अधिकार उत्पन्न हो सकता है। विश्वास और संचार आवश्यक हैं।",
                "अविवाहित तीव्र, परिवर्तनकारी रिश्तों को आकर्षित करते हैं।",
                "भेद्यता गहरा संबंध बनाती है। अपने साथी के साथ अपना सच्चा स्व साझा करें।"
            ]
        },
        "mr": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        "ta": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        "te": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        "kn": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        "bn": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        },
        "gu": {
            "personal": [
                "Pluto intensifies your transformative power. Embrace deep personal growth.",
                "Your intuition is exceptionally strong. Trust your instincts completely.",
                "Passion and intensity define your day. Channel emotions productively.",
                "Mystery and depth attract you. Explore hidden truths and profound insights."
            ],
            "career": [
                "Research and investigation yield results. Your detective-like skills shine.",
                "Power dynamics at work shift in your favor. Assert yourself strategically.",
                "Financial gains through investments or shared resources are possible.",
                "Your determination overcomes obstacles. Persistence pays off handsomely."
            ],
            "health": [
                "Reproductive and eliminative systems need care. Maintain proper hygiene.",
                "Emotional intensity affects physical health. Find healthy outlets for feelings.",
                "Deep breathing and meditation help manage stress effectively.",
                "Detoxification and cleansing practices benefit you now."
            ],
            "love": [
                "Passion and intimacy deepen. Emotional and physical bonds strengthen.",
                "Jealousy or possessiveness may arise. Trust and communication are essential.",
                "Singles attract intense, transformative relationships.",
                "Vulnerability creates deeper connection. Share your true self with your partner."
            ]
        }
    },
    "Sagittarius": {
        "en": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        "hi": {
            "personal": [
                "बृहस्पति आपके क्षितिज का विस्तार करता है। ज्ञान और नए अनुभवों की तलाश करें।",
                "आशावाद और उत्साह आपकी ताकत हैं। जहां भी जाएं सकारात्मकता फैलाएं।",
                "स्वतंत्रता और रोमांच आपको बुलाते हैं। नए क्षेत्रों का अन्वेषण करें, शाब्दिक या रूपक।",
                "आपका दार्शनिक स्वभाव अर्थ की तलाश करता है। जीवन के बड़े सवालों पर विचार करें।"
            ],
            "career": [
                "शिक्षण, प्रकाशन, या यात्रा-संबंधित काम फलता-फूलता है। अपनी बुद्धि साझा करें।",
                "उच्च शिक्षा या प्रमाणन कार्यक्रम आपके करियर विकास को लाभ पहुंचाते हैं।",
                "अंतर्राष्ट्रीय कनेक्शन या विदेशी अवसर उत्पन्न हो सकते हैं।",
                "आपका ईमानदार, सीधा दृष्टिकोण विश्वास और सम्मान अर्जित करता है।"
            ],
            "health": [
                "यकृत और कूल्हे के स्वास्थ्य पर ध्यान देने की आवश्यकता है। बेहतर कल्याण के लिए मध्यम भोग।",
                "बाहरी गतिविधियां और खेल आपको ऊर्जावान बनाते हैं। सक्रिय और साहसिक रहें।",
                "खुद को शारीरिक रूप से अधिक विस्तारित न करें। उत्साह को आराम के साथ संतुलित करें।",
                "खिंचाव के माध्यम से लचीलापन बनाए रखें। कूल्हों और जांघों में कठोरता को रोकें।"
            ],
            "love": [
                "प्रतिबद्धता के भीतर स्वतंत्रता महत्वपूर्ण है। रिश्तों में स्थान दें और प्राप्त करें।",
                "ईमानदारी और प्रत्यक्षता बंधन को मजबूत करती है। दयालुता के साथ अपना सच बोलें।",
                "अविवाहित साहसिक, खुले विचारों वाले साझेदारों को आकर्षित करते हैं।",
                "रोमांस को जीवित रखने के लिए अपने साथी के साथ रोमांचक गतिविधियों या यात्राओं की योजना बनाएं।"
            ]
        },
        "mr": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        "ta": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        "te": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        "kn": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        "bn": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        },
        "gu": {
            "personal": [
                "Jupiter expands your horizons. Seek knowledge and new experiences.",
                "Optimism and enthusiasm are your strengths. Spread positivity wherever you go.",
                "Freedom and adventure call to you. Explore new territories, literal or metaphorical.",
                "Your philosophical nature seeks meaning. Contemplate life's bigger questions."
            ],
            "career": [
                "Teaching, publishing, or travel-related work flourishes. Share your wisdom.",
                "Higher education or certification programs benefit your career growth.",
                "International connections or foreign opportunities may arise.",
                "Your honest, straightforward approach earns trust and respect."
            ],
            "health": [
                "Liver and hip health need attention. Moderate indulgences for better wellbeing.",
                "Outdoor activities and sports energize you. Stay active and adventurous.",
                "Don't overextend yourself physically. Balance enthusiasm with rest.",
                "Maintain flexibility through stretching. Prevent stiffness in hips and thighs."
            ],
            "love": [
                "Freedom within commitment is important. Give and receive space in relationships.",
                "Honesty and directness strengthen bonds. Speak your truth with kindness.",
                "Singles attract adventurous, open-minded partners.",
                "Plan exciting activities or trips with your partner to keep romance alive."
            ]
        }
    },
    "Capricorn": {
        "en": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        "hi": {
            "personal": [
                "शनि अनुशासन और जिम्मेदारी सिखाता है। आपकी कड़ी मेहनत स्थायी नींव बनाती है।",
                "धैर्य और दृढ़ता आपके गुण हैं। दीर्घकालिक लक्ष्य ध्यान में आते हैं।",
                "पारंपरिक मूल्य आपके निर्णयों का मार्गदर्शन करते हैं। अपनी प्रतिबद्धताओं का सम्मान करें।",
                "महत्वाकांक्षा आपको आगे बढ़ाती है। उच्च मानक निर्धारित करें और उन्हें व्यवस्थित रूप से प्राप्त करें।"
            ],
            "career": [
                "समर्पण के माध्यम से पेशेवर उन्नति। आपकी विश्वसनीयता को मान्यता दी जाती है।",
                "नेतृत्व की भूमिकाएं आपके लिए अच्छी तरह से अनुकूल हैं। आत्मविश्वास से अधिक जिम्मेदारी लें।",
                "दीर्घकालिक योजना परिणाम देती है। रणनीतिक सोच भुगतान करती है।",
                "व्यावसायिक कौशल और व्यावहारिक बुद्धि वित्तीय सफलता को बढ़ाती है।"
            ],
            "health": [
                "हड्डी और जोड़ों के स्वास्थ्य पर ध्यान देने की आवश्यकता है। कैल्शियम का सेवन और कोमल व्यायाम मदद करते हैं।",
                "काम के तनाव को कल्याण को प्रभावित न करने दें। नियमित ब्रेक शेड्यूल करें।",
                "दंत स्वास्थ्य महत्वपूर्ण है। अच्छी मौखिक स्वच्छता बनाए रखें।",
                "संरचित दिनचर्या आपके स्वास्थ्य का समर्थन करती है। स्थिरता महत्वपूर्ण है।"
            ],
            "love": [
                "प्रतिबद्धता और वफादारी आपके रिश्तों को परिभाषित करती है। समय के साथ विश्वास बनाएं।",
                "कार्यों और जिम्मेदारी के माध्यम से प्यार दिखाएं। अपने साथी के लिए भरोसेमंद बनें।",
                "अविवाहित परिपक्व, स्थिर साझेदारों को आकर्षित करते हैं जो आपके मूल्यों को साझा करते हैं।",
                "गुणवत्तापूर्ण समय और पारंपरिक इशारे रोमांटिक बंधन को मजबूत करते हैं।"
            ]
        },
        "mr": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        "ta": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        "te": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        "kn": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        "bn": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        },
        "gu": {
            "personal": [
                "Saturn teaches discipline and responsibility. Your hard work builds lasting foundations.",
                "Patience and perseverance are your virtues. Long-term goals come into focus.",
                "Traditional values guide your decisions. Honor your commitments.",
                "Ambition drives you forward. Set high standards and achieve them methodically."
            ],
            "career": [
                "Professional advancement through dedication. Your reliability is recognized.",
                "Leadership roles suit you well. Take on more responsibility confidently.",
                "Long-term planning yields results. Strategic thinking pays off.",
                "Business acumen and practical wisdom enhance financial success."
            ],
            "health": [
                "Bone and joint health need attention. Calcium intake and gentle exercises help.",
                "Don't let work stress affect wellbeing. Schedule regular breaks.",
                "Dental health is important. Maintain good oral hygiene.",
                "Structured routines support your health. Consistency is key."
            ],
            "love": [
                "Commitment and loyalty define your relationships. Build trust over time.",
                "Show love through actions and responsibility. Be dependable for your partner.",
                "Singles attract mature, stable partners who share your values.",
                "Quality time and traditional gestures strengthen romantic bonds."
            ]
        }
    },
    "Aquarius": {
        "en": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        "hi": {
            "personal": [
                "यूरेनस नवाचार और मौलिकता को प्रेरित करता है। आज बॉक्स के बाहर सोचें।",
                "आपका मानवीय स्वभाव दूसरों की मदद करना चाहता है। सामूहिक कल्याण में योगदान दें।",
                "स्वतंत्रता और स्वतंत्रता आवश्यक हैं। अपने अनूठे मार्ग का सम्मान करें।",
                "बौद्धिक गतिविधियां और प्रगतिशील विचार आपको ऊर्जावान बनाते हैं।"
            ],
            "career": [
                "प्रौद्योगिकी और नवाचार-संबंधित काम फलता-फूलता है। आपकी दूरदर्शी सोच को महत्व दिया जाता है।",
                "टीम वर्क और नेटवर्किंग अवसर लाते हैं। समान विचारधारा वाले व्यक्तियों के साथ सहयोग करें।",
                "अपरंपरागत दृष्टिकोण समस्याओं को हल करते हैं। अलग होने से डरो मत।",
                "सामाजिक कारण या सामुदायिक परियोजनाएं आपके मूल्यों और कौशल के साथ संरेखित होती हैं।"
            ],
            "health": [
                "परिसंचरण प्रणाली और टखनों पर ध्यान देने की आवश्यकता है। आंदोलन के साथ रक्त प्रवाह रखें।",
                "मानसिक उत्तेजना महत्वपूर्ण है, लेकिन अधिक सोचने से बचें। तर्क को विश्राम के साथ संतुलित करें।",
                "समूह फिटनेस गतिविधियां या टीम खेल आपके सामाजिक स्वभाव के अनुकूल हैं।",
                "नवीन स्वास्थ्य दृष्टिकोण आपकी रुचि रखते हैं। वैकल्पिक कल्याण विधियों का अन्वेषण करें।"
            ],
            "love": [
                "दोस्ती रोमांस की नींव बनाती है। बौद्धिक संबंध सबसे अधिक मायने रखता है।",
                "रिश्तों के भीतर स्वतंत्रता और स्वतंत्रता आवश्यक हैं। सीमाओं का सम्मान करें।",
                "अविवाहित अनूठे, अपरंपरागत साझेदारों को आकर्षित करते हैं जो आपके आदर्शों को साझा करते हैं।",
                "अपने साथी को कुछ अप्रत्याशित और मूल के साथ आश्चर्यचकित करें।"
            ]
        },
        "mr": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        "ta": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        "te": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        "kn": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        "bn": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        },
        "gu": {
            "personal": [
                "Uranus inspires innovation and originality. Think outside the box today.",
                "Your humanitarian nature seeks to help others. Contribute to collective wellbeing.",
                "Independence and freedom are essential. Honor your unique path.",
                "Intellectual pursuits and progressive ideas energize you."
            ],
            "career": [
                "Technology and innovation-related work flourishes. Your forward-thinking is valued.",
                "Teamwork and networking bring opportunities. Collaborate with like-minded individuals.",
                "Unconventional approaches solve problems. Don't be afraid to be different.",
                "Social causes or community projects align with your values and skills."
            ],
            "health": [
                "Circulatory system and ankles need attention. Keep blood flowing with movement.",
                "Mental stimulation is important, but avoid overthinking. Balance logic with relaxation.",
                "Group fitness activities or team sports suit your social nature.",
                "Innovative health approaches interest you. Explore alternative wellness methods."
            ],
            "love": [
                "Friendship forms the foundation of romance. Intellectual connection matters most.",
                "Freedom and independence within relationships are essential. Respect boundaries.",
                "Singles attract unique, unconventional partners who share your ideals.",
                "Surprise your partner with something unexpected and original."
            ]
        }
    },
    "Pisces": {
        "en": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        "hi": {
            "personal": [
                "नेपच्यून आपके अंतर्ज्ञान और रचनात्मकता को बढ़ाता है। अपने आंतरिक मार्गदर्शन पर भरोसा करें।",
                "करुणा और सहानुभूति आपके उपहार हैं। जरूरतमंदों की मदद करें।",
                "कल्पना और सपने आपको प्रेरित करते हैं। कलात्मक या आध्यात्मिक गतिविधियों में संलग्न हों।",
                "सीमाएं महत्वपूर्ण हैं। अपनी संवेदनशील ऊर्जा को नकारात्मकता से बचाएं।"
            ],
            "career": [
                "रचनात्मक, उपचार, या आध्यात्मिक काम फलता-फूलता है। आपकी करुणा एक संपत्ति है।",
                "सहज निर्णय लेना आपकी अच्छी सेवा करता है। अपनी आंत की भावनाओं पर भरोसा करें।",
                "कलात्मक प्रतिभा मान्यता लाती है। दुनिया के साथ अपने रचनात्मक उपहार साझा करें।",
                "मदद करने वाले पेशे या धर्मार्थ काम आपके मूल्यों के साथ संरेखित होते हैं।"
            ],
            "health": [
                "पैर और प्रतिरक्षा प्रणाली को देखभाल की आवश्यकता है। आरामदायक जूते और आराम आवश्यक हैं।",
                "भावनात्मक संवेदनशीलता शारीरिक स्वास्थ्य को प्रभावित करती है। आत्म-देखभाल और सीमाओं का अभ्यास करें।",
                "तैराकी जैसी पानी आधारित गतिविधियां आपकी आत्मा को शांत करती हैं।",
                "पर्याप्त नींद और सपने का समय आपकी भलाई के लिए महत्वपूर्ण है।"
            ],
            "love": [
                "रोमांस और आदर्शवाद आपके रिश्तों को रंग देते हैं। जादुई क्षण बनाएं।",
                "भावनात्मक गहराई और आध्यात्मिक संबंध सबसे अधिक मायने रखते हैं।",
                "अविवाहित आत्मीय, कलात्मक साझेदारों को आकर्षित करते हैं जो आपकी संवेदनशीलता को समझते हैं।",
                "कविता, संगीत, या अन्य रचनात्मक साधनों के माध्यम से प्यार व्यक्त करें।"
            ]
        },
        "mr": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        "ta": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        "te": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        "kn": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        "bn": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        },
        "gu": {
            "personal": [
                "Neptune enhances your intuition and creativity. Trust your inner guidance.",
                "Compassion and empathy are your gifts. Help those in need.",
                "Imagination and dreams inspire you. Engage in artistic or spiritual pursuits.",
                "Boundaries are important. Protect your sensitive energy from negativity."
            ],
            "career": [
                "Creative, healing, or spiritual work flourishes. Your compassion is an asset.",
                "Intuitive decision-making serves you well. Trust your gut feelings.",
                "Artistic talents bring recognition. Share your creative gifts with the world.",
                "Helping professions or charitable work align with your values."
            ],
            "health": [
                "Feet and immune system need care. Comfortable footwear and rest are essential.",
                "Emotional sensitivity affects physical health. Practice self-care and boundaries.",
                "Water-based activities like swimming soothe your spirit.",
                "Adequate sleep and dream time are crucial for your wellbeing."
            ],
            "love": [
                "Romance and idealism color your relationships. Create magical moments.",
                "Emotional depth and spiritual connection matter most.",
                "Singles attract soulful, artistic partners who understand your sensitivity.",
                "Express love through poetry, music, or other creative means."
            ]
        }
    }
};
