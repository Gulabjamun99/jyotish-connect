import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTrans } from './i18n';

// Detect if any Unicode font is registered in jsPDF's VFS (Virtual File System)
export function isUnicodeFontLoaded(doc: jsPDF): boolean {
    try {
        const fonts = doc.getFontList();
        return Object.keys(fonts).some(fontName => 
            fontName.toLowerCase().includes('noto') || 
            fontName.toLowerCase().includes('devanagari') ||
            fontName.toLowerCase().includes('unicode') ||
            fontName.toLowerCase().includes('hindi')
        );
    } catch (e) {
        return false;
    }
}

// Clean non-Latin characters to prevent jsPDF Helvetica crashes or empty squares
export function safeText(doc: jsPDF, text: string, fallback: string = ''): string {
    if (!text) return fallback;
    if (isUnicodeFontLoaded(doc)) return text;
    // Clean to keep only ASCII printable characters (32 to 126)
    const cleaned = text.split('').filter(char => {
        const code = char.charCodeAt(0);
        return code >= 32 && code <= 126;
    }).join('').trim();
    return cleaned || fallback;
}

const _SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const _PLANETS_EN: Record<string,string> = { Sun:"Sun", Moon:"Moon", Mars:"Mars", Mercury:"Mercury", Jupiter:"Jupiter", Venus:"Venus", Saturn:"Saturn", Rahu:"Rahu (North Node)", Ketu:"Ketu (South Node)", Asc:"Ascendant" };

function pl(name: string, T: any) { 
    return T.planets?.[name] || _PLANETS_EN[name] || name; 
}
function sg(sign: string, T: any) { 
    return T.signs?.[sign as keyof typeof T.signs] || sign; 
}
function nk(id: number, T: any) { 
    return T.nakshatras?.[id - 1] || '—'; 
}

function H(doc: jsPDF, title: string, pg: number, total: number) {
    doc.setFillColor(15,15,35); doc.rect(0,0,210,22,'F');
    doc.setFontSize(7); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    doc.text('JyotishConnect', 15, 14);
    doc.setFont('helvetica','normal'); doc.setTextColor(180,180,180);
    doc.text(title, 105, 14, {align:'center'});
    doc.text(`Page ${pg} / ${total}`, 195, 14, {align:'right'});
}

function ST(doc: jsPDF, text: string, y: number, r=249, g=115, b=22) {
    doc.setFontSize(13); doc.setTextColor(r,g,b); doc.setFont('helvetica','bold');
    doc.text(text, 15, y);
    doc.setDrawColor(r,g,b); doc.setLineWidth(0.4); doc.line(15,y+2,195,y+2);
    doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30);
}

const LOCALE_NAMES: Record<string,string> = {
    en:'English', hi:'Hindi', mr:'Marathi', bn:'Bengali',
    gu:'Gujarati', ta:'Tamil', te:'Telugu', kn:'Kannada'
};

export async function generateKundliPDF(
    chart: any,
    formData: {name:string; dob:string; tob:string; birthplace:string},
    locale: string,
    imgs: {
        d1?:string|null; d9?:string|null; moon?:string|null; d10?:string|null;
        planets?:string|null; birth?:string|null; dasha?:string|null; ashtak?:string|null;
        doshas?:string|null;
        pCareer?:string|null; pHealth?:string|null; pLove?:string|null; pWealth?:string|null; pEdu?:string|null;
    }
) {
    const doc = new jsPDF('p','mm','a4');
    const useUnicode = isUnicodeFontLoaded(doc);
    const T = useUnicode ? getTrans(locale) : getTrans('en');
    const EN = getTrans('en');

    // Labels system dynamically switching between localized (Unicode) and safe English
    const L = {
        title: useUnicode && locale === 'hi' ? 'प्रीमियम वैदिक ज्योतिष रिपोर्ट' : 'Premium Vedic Astrology Report',
        birthDetails: useUnicode && locale === 'hi' ? 'जन्म विवरण' : 'Birth Details',
        avakahada: useUnicode && locale === 'hi' ? 'अवकहड़ा चक्र' : 'Avakahada Chakra',
        panchang: useUnicode && locale === 'hi' ? 'दैनिक पंचांग' : 'Daily Panchang at Birth',
        panchangDetails: useUnicode && locale === 'hi' ? 'पंचांग विवरण' : 'Panchang Details',
        planetaryPositions: useUnicode && locale === 'hi' ? 'ग्रहों की स्थिति' : 'Planetary Positions',
        currentActiveDasha: useUnicode && locale === 'hi' ? 'वर्तमान सक्रिय दशा' : 'Current Active Dasha',
        dashaTimeline: useUnicode && locale === 'hi' ? 'विंशोत्तरी दशा समय-रेखा (120 वर्ष चक्र)' : 'Full Vimshottari Dasha Timeline (120 Year Cycle)',
        ashtakvarga: useUnicode && locale === 'hi' ? 'अष्टकवर्ग विश्लेषण' : 'Ashtakvarga Analysis',
        ashtakvargaStrength: useUnicode && locale === 'hi' ? 'सर्वाष्टकवर्ग - राशि अनुसार शक्ति स्कोर' : 'Sarvashtakvarga — Strength Score per Zodiac Sign',
        doshaAnalysis: useUnicode && locale === 'hi' ? 'दोष विश्लेषण' : 'Dosha Analysis',
        lifePredictions: useUnicode && locale === 'hi' ? 'जीवन भविष्यफल' : 'Life Predictions',
        lifeAreaPredictions: useUnicode && locale === 'hi' ? 'जीवन क्षेत्र भविष्यफल' : 'Life Area Predictions',
        yogas: useUnicode && locale === 'hi' ? 'महत्वपूर्ण योग' : 'Important Yogas',
        yogasDetected: useUnicode && locale === 'hi' ? 'आपकी कुंडली में पाए गए योग' : 'Yogas Detected in Your Chart',
        gemstones: useUnicode && locale === 'hi' ? 'रत्न अनुशंसाएं' : 'Gemstone Recommendations',
        remedies: useUnicode && locale === 'hi' ? 'आध्यात्मिक उपाय' : 'Spiritual Remedies',
        conclusion: useUnicode && locale === 'hi' ? 'आशीर्वाद और दिव्य मार्गदर्शन' : 'Blessings & Divine Guidance',
    };

    const langLabel = LOCALE_NAMES[locale] || 'English';

    // Safely retrieve nakshatra name using dynamic T
    const nakshatraVal = chart.nakshatraId ? nk(chart.nakshatraId, T) : safeText(doc, chart.nakshatra_en || chart.nakshatra, '—');
    const nakshatraEn = chart.nakshatraId ? nk(chart.nakshatraId, EN) : safeText(doc, chart.nakshatra_en || (typeof chart.nakshatra === 'string' && /^[\x00-\x7F]*$/.test(chart.nakshatra) ? chart.nakshatra : ''), '—');
    
    const TP = 18;

    // PAGE 1: Cover
    doc.setFillColor(10,10,30); doc.rect(0,0,210,297,'F');
    doc.setFillColor(249,115,22); doc.rect(0,118,210,58,'F');
    doc.setFontSize(30); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    doc.text('JyotishConnect', 105, 75, {align:'center'});
    doc.setFontSize(12); doc.setTextColor(200,200,200); doc.setFont('helvetica','normal');
    doc.text(L.title, 105, 90, {align:'center'});
    doc.setFontSize(22); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text(safeText(doc, formData.name, 'Seeker'), 105, 140, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(255,220,180); doc.setFont('helvetica','normal');
    doc.text(`${formData.dob}  |  ${formData.tob}  |  ${safeText(doc, formData.birthplace, 'Birthplace')}`, 105, 153, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(150,150,150);
    doc.text(`${useUnicode && locale === 'hi' ? 'लग्न' : 'Lagna'}: ${sg(chart.ascendantSign, T)}  |  ${useUnicode && locale === 'hi' ? 'राशि' : 'Rasi'}: ${sg(chart.moonSign, T)}  |  ${useUnicode && locale === 'hi' ? 'नक्षत्र' : 'Nakshatra'}: ${nakshatraVal}`, 105, 200, {align:'center'});
    
    // Show language label so user knows this PDF matches their selected language
    doc.setFontSize(8); doc.setTextColor(120,100,60);
    doc.text(`Report Language: ${langLabel}  |  Numerical data identical across all languages`, 105, 265, {align:'center'});
    doc.setFontSize(7); doc.setTextColor(80,80,80); doc.text('Generated by JyotishConnect  —  jyotishconnect.com', 105, 280, {align:'center'});

    // PAGE 2: Birth Details + Avakahada
    doc.addPage(); 
    if (imgs.birth) {
        doc.addImage(imgs.birth, 'PNG', 0, 0, 210, 297);
    } else {
        H(doc, useUnicode && locale === 'hi' ? 'जन्म गुण एवं अवकहड़ा' : 'Birth Attributes & Avakahada', 2, TP);
        ST(doc, L.birthDetails, 32);
        
        autoTable(doc,{
            startY:37, margin:{left:15},
            head:[[useUnicode && locale === 'hi' ? 'विवरण' : 'Field', useUnicode && locale === 'hi' ? 'मान' : 'Value']],
            body:[
                [useUnicode && locale === 'hi' ? 'नाम' : 'Name', safeText(doc, formData.name, 'Seeker')],
                [useUnicode && locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth', formData.dob],
                [useUnicode && locale === 'hi' ? 'जन्म समय' : 'Time of Birth', formData.tob],
                [useUnicode && locale === 'hi' ? 'जन्म स्थान' : 'Place of Birth', safeText(doc, formData.birthplace, 'Birthplace')],
                [useUnicode && locale === 'hi' ? 'लग्न (Ascendant)' : 'Lagna (Ascendant)', sg(chart.ascendantSign, T)],
                [useUnicode && locale === 'hi' ? 'चंद्र राशि (Rasi)' : 'Moon Sign (Rasi)', sg(chart.moonSign, T)],
                [useUnicode && locale === 'hi' ? 'नक्षत्र (Birth Star)' : 'Nakshatra (Birth Star)', nakshatraVal],
                [useUnicode && locale === 'hi' ? 'नक्षत्र चरण' : 'Nakshatra Pada', chart.nakshatraPada ? `${useUnicode && locale === 'hi' ? 'चरण' : 'Pada'} ${chart.nakshatraPada}` : '—'],
                [useUnicode && locale === 'hi' ? 'नक्षत्र संख्या' : 'Nakshatra Number', chart.nakshatraId ? String(chart.nakshatraId) : '—'],
                [useUnicode && locale === 'hi' ? 'रिपोर्ट भाषा' : 'Report Language', langLabel],
            ],
            styles:{fontSize:useUnicode?9.5:10,cellPadding:4},
            headStyles:{fillColor:[249,115,22],textColor:255},
            alternateRowStyles:{fillColor:[250,250,250]},
        });
        
        const y2=(doc as any).lastAutoTable.finalY+10;
        ST(doc, L.avakahada, y2, 79,70,229);
        autoTable(doc,{
            startY:y2+5, margin:{left:15},
            head:[[
                useUnicode && locale === 'hi' ? 'गुण' : 'Attribute', 
                useUnicode && locale === 'hi' ? 'मान' : 'Value', 
                useUnicode && locale === 'hi' ? 'गुण' : 'Attribute', 
                useUnicode && locale === 'hi' ? 'मान' : 'Value'
            ]],
            body:[
                [useUnicode && locale === 'hi' ? 'वर्ण' : 'Varna', chart.avakahada?.varna||'—', useUnicode && locale === 'hi' ? 'वश्य' : 'Vashya', chart.avakahada?.vashya||'—'],
                [useUnicode && locale === 'hi' ? 'तारा' : 'Tara',  chart.avakahada?.tara||'—',  useUnicode && locale === 'hi' ? 'योनि' : 'Yoni',   chart.avakahada?.yoni||'—'],
                [useUnicode && locale === 'hi' ? 'गण' : 'Gana',  chart.avakahada?.gana||'—',  useUnicode && locale === 'hi' ? 'नाड़ी' : 'Nadi',   chart.avakahada?.nadi||'—'],
                [useUnicode && locale === 'hi' ? 'राशि स्वामी' : 'Moon Lord (Rashish)', chart.avakahada?.rashish||'—', useUnicode && locale === 'hi' ? 'भकूट' : 'Bhakoot', chart.avakahada?.bhakoot||'—'],
            ],
            styles:{fontSize:useUnicode?9.5:10,cellPadding:4},
            headStyles:{fillColor:[79,70,229],textColor:255},
            alternateRowStyles:{fillColor:[248,248,255]},
        });
    }

    // PAGE 3: Panchang
    doc.addPage();
    if (imgs.planets) {
        doc.addImage(imgs.planets, 'PNG', 0, 0, 210, 297);
    } else {
        H(doc, L.panchang, 3, TP);
        ST(doc, L.panchangDetails, 32);
        
        const safeStr = (v: any) => (typeof v === 'string' && /^[\x00-\x7F]*$/.test(v)) ? v : '';
        const resolveIdx = (arr: string[]|undefined, v: any) => typeof v === 'number' ? (arr?.[v] || `#${v}`) : safeStr(v);
        const tithiVal = resolveIdx(T.panchang?.tithi, chart.panchang?.tithiId) || '—';
        const yogaVal  = resolveIdx(T.panchang?.yoga,  chart.panchang?.yogaId)  || '—';
        const karanVal = resolveIdx(T.panchang?.karan, chart.panchang?.karanaId)|| '—';
        const varaVal  = resolveIdx(T.panchang?.vara,  chart.panchang?.vara)  || '—';
        
        autoTable(doc,{
            startY:37, margin:{left:15},
            head:[[useUnicode && locale === 'hi' ? 'पंचांग तत्व' : 'Panchang Element', useUnicode && locale === 'hi' ? 'मान' : 'Value']],
            body:[
                [useUnicode && locale === 'hi' ? 'तिथि (Lunar Day)' : 'Tithi (Lunar Day)', tithiVal],
                [useUnicode && locale === 'hi' ? 'नक्षत्र (Birth Star)' : 'Nakshatra (Birth Star)', nakshatraVal],
                [useUnicode && locale === 'hi' ? 'योग' : 'Yoga', yogaVal],
                [useUnicode && locale === 'hi' ? 'करण' : 'Karana', karanVal],
                [useUnicode && locale === 'hi' ? 'वार (Weekday)' : 'Vara (Weekday)', varaVal],
                [useUnicode && locale === 'hi' ? 'सूर्योदय' : 'Sunrise', safeStr(chart.panchang?.sunrise) || '—'],
                [useUnicode && locale === 'hi' ? 'सूर्यास्त' : 'Sunset',  safeStr(chart.panchang?.sunset)  || '—'],
            ],
            styles:{fontSize:11,cellPadding:5},
            headStyles:{fillColor:[30,90,180],textColor:255},
            alternateRowStyles:{fillColor:[245,248,255]},
        });
    }

    // PAGES 4-7: Charts
    const chartDefs=[
        {img:imgs.d1, label: useUnicode && locale === 'hi' ? 'लग्न / जन्म कुंडली (D1)' : 'Lagna / Birth Chart (D1)', pg:4},
        {img:imgs.d9, label: useUnicode && locale === 'hi' ? 'नवांश कुंडली (D9)' : 'Navamsa Chart (D9)',       pg:5},
        {img:imgs.moon,label: useUnicode && locale === 'hi' ? 'चन्द्र लग्न कुंडली' : 'Chandra Lagna (Moon Chart)',pg:6},
        {img:imgs.d10,label: useUnicode && locale === 'hi' ? 'दशमांश कुंडली (D10)' : 'Dasamsa Chart (D10)',      pg:7},
    ];

    const drawNIChart = (houseData: {[h:number]:string[]}, ascLong: number, ox: number, oy: number, size: number) => {
        const s = size; const h = s/2; const q = s/4;
        doc.setDrawColor(249,115,22); doc.setLineWidth(0.5);
        doc.rect(ox, oy, s, s);
        doc.line(ox+h, oy,     ox+s, oy+h);
        doc.line(ox+s, oy+h,   ox+h, oy+s);
        doc.line(ox+h, oy+s,   ox,   oy+h);
        doc.line(ox,   oy+h,   ox+h, oy);
        doc.line(ox,oy,   ox+s,oy+s);
        doc.line(ox+s,oy, ox,oy+s);
        
        const hPos:Array<[number,number]> = [
            [ox+h,      oy+q],         // H1
            [ox+q,      oy+s*0.1],     // H2
            [ox+s*0.1,  oy+q],         // H3
            [ox+q,      oy+h],         // H4
            [ox+s*0.1,  oy+s*0.75],    // H5
            [ox+q,      oy+s*0.9],     // H6
            [ox+h,      oy+s*0.75],    // H7
            [ox+s*0.75, oy+s*0.9],     // H8
            [ox+s*0.9,  oy+s*0.75],    // H9
            [ox+s*0.75, oy+h],         // H10
            [ox+s*0.9,  oy+q],         // H11
            [ox+s*0.75, oy+s*0.1],     // H12
        ];
        const pColors:Record<string,number[]> = {
            Sun:[249,115,22],Moon:[96,165,250],Mars:[248,113,113],
            Mercury:[74,222,128],Jupiter:[250,204,21],Venus:[244,114,182],
            Saturn:[167,139,250],Rahu:[148,163,184],Ketu:[100,116,139],Asc:[249,115,22]
        };
        const ascSign = Math.floor((ascLong||0)/30);
        for(let h=1;h<=12;h++){
            const [cx,cy] = hPos[h-1];
            const signNum = ((ascSign + h - 1) % 12) + 1;
            doc.setFontSize(6.5); doc.setTextColor(150,150,150); doc.setFont('helvetica','normal');
            doc.text(String(signNum), cx, cy-4, {align:'center'});
            const planets = houseData[h] || [];
            planets.forEach((pName, idx) => {
                const col = pColors[pName] || [80,80,80];
                doc.setTextColor(col[0],col[1],col[2]);
                doc.setFontSize(7.5); doc.setFont('helvetica','bold');
                const short = pName==='Asc'?'As':pName==='Rahu'?'Ra':pName==='Ketu'?'Ke':pName.substring(0,2);
                doc.text(short, cx, cy+3+(idx*8), {align:'center'});
            });
        }
        doc.setFont('helvetica','normal');
    };

    chartDefs.forEach(({img,label,pg})=>{
        doc.addPage(); H(doc,label,pg,TP);
        ST(doc,label,32);
        if(img){
            doc.addImage(img,'PNG',35,42,140,140);
        } else {
            const chartKey = pg===4?'D1':pg===5?'D9':pg===6?'Moon':'D10';
            const houseData = chart.charts?.[chartKey] || {};
            const ascLong = chartKey === 'D9' ? (chart.d9Ascendant || 0) : chartKey === 'D10' ? (chart.d10Ascendant || 0) : chartKey === 'Moon' ? (chart.moonLongitude || 0) : (chart.ascendantLongitude || 0);
            drawNIChart(houseData, ascLong, 35, 38, 140);
            const legendPlanets = [['Su','Sun',[249,115,22]],['Mo','Moon',[96,165,250]],['Ma','Mars',[248,113,113]],['Me','Mercury',[74,222,128]],['Ju','Jupiter',[250,204,21]],['Ve','Venus',[244,114,182]],['Sa','Saturn',[167,139,250]],['Ra','Rahu',[148,163,184]],['Ke','Ketu',[100,116,139]]];
            let lx=15; const ly=190;
            legendPlanets.forEach(([short,name,col]:any)=>{
                doc.setFillColor(col[0],col[1],col[2]); doc.circle(lx+2,ly-1,1.5,'F');
                doc.setFontSize(7); doc.setTextColor(60,60,60);
                doc.text(`${short}=${pl(name, T)}`,lx+5,ly);
                lx+=28;
                if(lx>185){lx=15;}
            });
        }
    });

    // PAGE 8: Planetary Positions
    doc.addPage(); H(doc, L.planetaryPositions, 8, TP);
    ST(doc, L.planetaryPositions, 32);
    autoTable(doc,{
        startY:38, margin:{left:15},
        head:[[
            useUnicode && locale === 'hi' ? 'ग्रह' : 'Planet',
            useUnicode && locale === 'hi' ? 'राशि' : 'Sign',
            useUnicode && locale === 'hi' ? 'अंश' : 'Degree',
            useUnicode && locale === 'hi' ? 'नक्षत्र' : 'Nakshatra',
            useUnicode && locale === 'hi' ? 'भाव' : 'House',
            useUnicode && locale === 'hi' ? 'अवस्था' : 'Status'
        ]],
        body:(chart.planets||[]).map((p:any)=>[
            pl(p.name, T),
            sg(p.sign, T),
            p.longitude != null ? `${Math.floor(p.longitude%30)}\u00b0 ${Math.floor((p.longitude%1)*60)}'` : '—',
            p.nakshatraId ? nk(p.nakshatraId, T) : '—',
            p.house != null ? String(p.house) : '—',
            p.isExalted 
                ? (useUnicode && locale === 'hi' ? 'उच्च' : 'Exalted') 
                : p.isDebilitated 
                    ? (useUnicode && locale === 'hi' ? 'नीच' : 'Debilitated') 
                    : (useUnicode && locale === 'hi' ? 'समान्य' : 'Neutral'),
        ]),
        styles:{fontSize:useUnicode?9:9.5,cellPadding:3},
        headStyles:{fillColor:[109,40,217],textColor:255},
        alternateRowStyles:{fillColor:[248,245,255]},
        didParseCell:(data:any)=>{
            if(data.column.index===5){
                if(data.cell.raw==='Exalted' || data.cell.raw==='उच्च') data.cell.styles.textColor=[34,197,94];
                if(data.cell.raw==='Debilitated' || data.cell.raw==='नीच') data.cell.styles.textColor=[220,38,38];
            }
        },
    });

    // PAGE 9: Dasha Timeline
    const nowMs = Date.now();
    const mahadashas: any[] = chart.dasha?.mahadashas || [];
    const activeMaha = mahadashas.find((m:any) => {
        const s=new Date(m.start).getTime(), e=new Date(m.end).getTime();
        return nowMs>=s && nowMs<=e;
    }) || mahadashas[0];
    const activeAntar = activeMaha?.antardashas?.find((a:any) => {
        const s=new Date(a.start).getTime(), e=new Date(a.end).getTime();
        return nowMs>=s && nowMs<=e;
    }) || activeMaha?.antardashas?.[0];
    const maha = activeMaha?.lord || '—';
    const antar = activeAntar?.lord || '—';

    doc.addPage();
    if (imgs.dasha) {
        doc.addImage(imgs.dasha, 'PNG', 0, 0, 210, 297);
    } else {
        H(doc, useUnicode && locale === 'hi' ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha Timeline', 9, TP);
        ST(doc, L.currentActiveDasha, 32);
        
        autoTable(doc,{
            startY:38, margin:{left:15}, tableWidth:130,
            head:[[
                useUnicode && locale === 'hi' ? 'दशा स्तर' : 'Dasha Level',
                useUnicode && locale === 'hi' ? 'दशा स्वामी' : 'Planet Lord',
                useUnicode && locale === 'hi' ? 'अवधि' : 'Period'
            ]],
            body:[
                [useUnicode && locale === 'hi' ? 'महादशा (दीर्घ)' : 'Mahadasha (Major)', pl(maha, T),
                    activeMaha ? `${new Date(activeMaha.start).getFullYear()} — ${new Date(activeMaha.end).getFullYear()}` : '—'],
                [useUnicode && locale === 'hi' ? 'अंतर्दशा (लघु)' : 'Antardasha (Sub)', pl(antar, T),
                    activeAntar ? `${new Date(activeAntar.start).toLocaleDateString('en-IN',{month:'short',year:'numeric'})} — ${new Date(activeAntar.end).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}` : '—'],
                [useUnicode && locale === 'hi' ? 'प्रत्यंतर्दशा' : 'Pratyantardasha','—','—'],
            ],
            styles:{fontSize:useUnicode?9.5:10,cellPadding:5},
            headStyles:{fillColor:[249,115,22],textColor:255},
        });
        
        const y9=(doc as any).lastAutoTable.finalY+10;
        ST(doc, L.dashaTimeline, y9, 79,70,229);
        if(mahadashas.length===0){
            doc.setFontSize(10); doc.setTextColor(120,120,120);
            doc.text(useUnicode && locale === 'hi' ? 'दशा डेटा उपलब्ध नहीं है।' : 'Dasha data not available. Please regenerate the Kundli.', 15, y9+12);
        } else {
            autoTable(doc,{
                startY:y9+5, margin:{left:15},
                head:[[
                    useUnicode && locale === 'hi' ? 'ग्रह' : 'Planet',
                    useUnicode && locale === 'hi' ? 'शुरुआत' : 'Start',
                    useUnicode && locale === 'hi' ? 'समाप्ति' : 'End',
                    useUnicode && locale === 'hi' ? 'वर्ष' : 'Yrs',
                    useUnicode && locale === 'hi' ? 'सक्रिय अंतर्दशा' : 'Active Antardasha',
                    useUnicode && locale === 'hi' ? 'अवस्था' : 'Status'
                ]],
                body:mahadashas.map((m:any)=>{
                    const s=new Date(m.start), e=new Date(m.end);
                    const isActive=nowMs>=s.getTime()&&nowMs<=e.getTime();
                    const isPast=nowMs>e.getTime();
                    const dur=((e.getTime()-s.getTime())/(365.25*24*3600*1000)).toFixed(1);
                    const curAD=m.antardashas?.find((a:any)=>nowMs>=new Date(a.start).getTime()&&nowMs<=new Date(a.end).getTime());
                    
                    let statusLabel = isActive ? 'ACTIVE' : isPast ? 'Done' : 'Future';
                    if (useUnicode && locale === 'hi') {
                        statusLabel = isActive ? 'सक्रिय' : isPast ? 'पूर्ण' : 'भविष्य';
                    }
                    return[
                        pl(m.lord, T),
                        s.toLocaleDateString('en-IN',{year:'numeric',month:'short'}),
                        e.toLocaleDateString('en-IN',{year:'numeric',month:'short'}),
                        dur,
                        curAD ? pl(curAD.lord, T) : '—',
                        statusLabel,
                    ];
                }),
                styles:{fontSize:useUnicode?8:8.5,cellPadding:3},
                headStyles:{fillColor:[79,70,229],textColor:255},
                alternateRowStyles:{fillColor:[248,248,255]},
                didParseCell:(data:any)=>{
                    if((data.column.index===5)&&(data.cell.raw==='ACTIVE' || data.cell.raw==='सक्रिय')){
                        data.cell.styles.textColor=[249,115,22];
                        data.cell.styles.fontStyle='bold';
                    }
                },
            });
            
            if(activeMaha?.antardashas?.length>0){
                const yAD=(doc as any).lastAutoTable.finalY+8;
                if(yAD<260){
                    ST(doc, useUnicode && locale === 'hi' ? `अंतर्दशा अनुसूची — स्वामी: ${pl(maha, T)}` : `Antardasha Schedule — ${pl(maha, T)} Mahadasha`, yAD, 109,40,217);
                    autoTable(doc,{
                        startY:yAD+5, margin:{left:15},
                        head:[[
                            useUnicode && locale === 'hi' ? 'उप-स्वामी' : 'Sub-Lord',
                            useUnicode && locale === 'hi' ? 'शुरुआत' : 'Start',
                            useUnicode && locale === 'hi' ? 'समाप्ति' : 'End',
                            useUnicode && locale === 'hi' ? 'अवस्था' : 'Status'
                        ]],
                        body:activeMaha.antardashas.map((a:any)=>{
                            const as=new Date(a.start),ae=new Date(a.end);
                            const ia=nowMs>=as.getTime()&&nowMs<=ae.getTime();
                            const ip=nowMs>ae.getTime();
                            
                            let statusLabel = ia ? 'ACTIVE' : ip ? 'Done' : 'Upcoming';
                            if (useUnicode && locale === 'hi') {
                                statusLabel = ia ? 'सक्रिय' : ip ? 'पूर्ण' : 'आगामी';
                            }
                            return[
                                pl(a.lord, T),
                                as.toLocaleDateString('en-IN',{month:'short',year:'numeric'}),
                                ae.toLocaleDateString('en-IN',{month:'short',year:'numeric'}),
                                statusLabel
                            ];
                        }),
                        styles:{fontSize:useUnicode?7.5:8,cellPadding:2.5},
                        headStyles:{fillColor:[109,40,217],textColor:255},
                        didParseCell:(data:any)=>{
                            if((data.column.index===3)&&(data.cell.raw==='ACTIVE' || data.cell.raw==='सक्रिय')){
                                data.cell.styles.textColor=[249,115,22];
                                data.cell.styles.fontStyle='bold';
                            }
                        },
                    });
                }
            }
        }
    }

    // PAGE 10: Ashtakvarga
    doc.addPage();
    if (imgs.ashtak) {
        doc.addImage(imgs.ashtak, 'PNG', 0, 0, 210, 297);
    } else {
        H(doc, L.ashtakvarga, 10, TP);
        ST(doc, L.ashtakvargaStrength, 32);
        
        doc.setFontSize(8.5); doc.setTextColor(100,100,100);
        doc.text(
            useUnicode && locale === 'hi' 
                ? 'अंक मार्गदर्शिका: 30+ = उत्कृष्ट  |  25-29 = उत्तम  |  20-24 = मध्यम  |  20 से कम = कमजोर'
                : 'Score Guide: 30+ = Excellent  |  25-29 = Good  |  20-24 = Medium  |  Below 20 = Weak', 
            15,41
        );
        
        const total672=_SIGNS_EN.reduce((acc:number,_:string,i:number)=>acc+(chart.ashtakvarga?.sarva?.[i]||28),0);
        doc.setFontSize(9); doc.setTextColor(79,70,229);
        doc.text(
            useUnicode && locale === 'hi'
                ? `कुल सर्वाष्टकवर्ग स्कोर: ${total672} / 337 (औसत ${(total672/12).toFixed(1)} प्रति राशि)`
                : `Total Sarvashtakvarga Score: ${total672} / 337 (avg ${(total672/12).toFixed(1)} per sign)`, 
            15, 47
        );
        
        autoTable(doc,{
            startY:52, margin:{left:15},
            head:[[
                useUnicode && locale === 'hi' ? 'राशि' : 'Sign',
                useUnicode && locale === 'hi' ? 'अंक' : 'Pts',
                useUnicode && locale === 'hi' ? 'शक्ति' : 'Strength',
                useUnicode && locale === 'hi' ? 'राशि' : 'Sign',
                useUnicode && locale === 'hi' ? 'अंक' : 'Pts',
                useUnicode && locale === 'hi' ? 'शक्ति' : 'Strength'
            ]],
            body:(()=>{
                const rows:any[]=[];
                const sarva = chart.ashtakvarga?.sarva || [];
                for(let i=0;i<12;i+=2){
                    const p1 = typeof sarva[i]   === 'number' ? sarva[i]   : 28;
                    const p2 = typeof sarva[i+1] === 'number' ? sarva[i+1] : 28;
                    
                    const s = (n:number) => {
                        if (useUnicode && locale === 'hi') {
                            return n>=30?'उत्कृष्ट':n>=25?'उत्तम':n>=20?'मध्यम':'कमजोर';
                        }
                        return n>=30?'Excellent':n>=25?'Good':n>=20?'Medium':'Weak';
                    };
                    rows.push([sg(_SIGNS_EN[i], T), p1, s(p1), sg(_SIGNS_EN[i+1], T), p2, s(p2)]);
                }
                return rows;
            })(),
            styles:{fontSize:useUnicode?9.5:10,cellPadding:4},
            headStyles:{fillColor:[161,98,7],textColor:255},
            alternateRowStyles:{fillColor:[255,251,235]},
            didParseCell:(data:any)=>{
                const v=data.cell.raw;
                if(v==='Excellent' || v==='उत्कृष्ट') data.cell.styles.textColor=[22,163,74];
                if(v==='Good' || v==='उत्तम')      data.cell.styles.textColor=[59,130,246];
                if(v==='Medium' || v==='मध्यम')    data.cell.styles.textColor=[161,98,7];
                if(v==='Weak' || v==='कमजोर')      data.cell.styles.textColor=[220,38,38];
            },
        });
    }

    // PAGE 11: Doshas
    doc.addPage();
    if (imgs.doshas) {
        doc.addImage(imgs.doshas, 'PNG', 0, 0, 210, 297);
    } else {
        H(doc, L.doshaAnalysis, 11, TP);
        ST(doc, L.doshaAnalysis, 32);
        let yD=40;
        
        Object.entries(chart.doshas||{}).forEach(([key,data]:any)=>{
            const info = T.doshas?.[key as keyof typeof T.doshas] as any;
            const name = info?.name || key;
            const desc = info?.description || data.description || (useUnicode && locale === 'hi' ? 'इस क्षेत्र में कोई बड़ा प्रभाव नहीं पाया गया।' : 'No major influence detected in this area.');
            const rems:string[] = data.present ? (info?.remedies || []) : [];
            const boxH=32+rems.length*5.5;
            
            if(yD+boxH>268){
                doc.addPage();
                H(doc, useUnicode && locale === 'hi' ? 'दोष विश्लेषण (क्रमशः)' : 'Dosha Analysis (contd.)', 11, TP);
                yD=30;
            }
            
            const bg=data.present?[255,240,240]:[240,255,245];
            const bc=data.present?[220,50,50]:[34,197,94];
            doc.setFillColor(bg[0],bg[1],bg[2]);
            doc.setDrawColor(bc[0],bc[1],bc[2]);
            doc.setLineWidth(0.5);
            doc.roundedRect(15,yD,180,boxH,2,2,'FD');
            
            doc.setFontSize(11); doc.setTextColor(30,30,30); doc.setFont('helvetica','bold');
            const statusStr = data.present 
                ? (useUnicode && locale === 'hi' ? 'उपस्थित' : 'PRESENT') 
                : (useUnicode && locale === 'hi' ? 'अनुपस्थित' : 'ABSENT');
            doc.text(`${name}  —  ${statusStr}`, 20, yD+8);
            
            doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(70,70,70);
            const dL=doc.splitTextToSize(desc,168);
            doc.text(dL,20,yD+15);
            
            if(rems.length){
                const ry=yD+15+dL.length*5;
                doc.setFontSize(8); doc.setTextColor(249,115,22);
                doc.text(useUnicode && locale === 'hi' ? 'उपाय:' : 'Remedies:', 20, ry);
                doc.setTextColor(60,60,60);
                rems.forEach((r:string,ri:number)=>doc.text(`- ${r}`,24,ry+5+ri*5.5));
            }
            yD+=boxH+6;
        });
    }

    // PAGES 12+: Life Predictions
    let predY = 40;
    if (imgs.pCareer || imgs.pHealth || imgs.pLove || imgs.pWealth || imgs.pEdu) {
        if (imgs.pCareer) { doc.addPage(); doc.addImage(imgs.pCareer, 'PNG', 0, 0, 210, 297); }
        if (imgs.pHealth) { doc.addPage(); doc.addImage(imgs.pHealth, 'PNG', 0, 0, 210, 297); }
        if (imgs.pLove)   { doc.addPage(); doc.addImage(imgs.pLove,   'PNG', 0, 0, 210, 297); }
        if (imgs.pWealth) { doc.addPage(); doc.addImage(imgs.pWealth, 'PNG', 0, 0, 210, 297); }
        if (imgs.pEdu)    { doc.addPage(); doc.addImage(imgs.pEdu,    'PNG', 0, 0, 210, 297); }
    } else {
        const predData = useUnicode ? (chart.predictions || {}) : (chart.predictionsEn || chart.predictions || {});
        const predEntries = Object.entries(predData);
        
        doc.addPage(); H(doc, L.lifePredictions, 12, TP);
        ST(doc, L.lifeAreaPredictions, 32, 79,70,229);
        predY = 40;
        
        predEntries.forEach(([area, text]: any) => {
            const label = (T.labels?.life_predictions as any)?.[area] || area;
            const safeT = useUnicode ? String(text) : (typeof text === 'string' && /^[\x00-\xFF]*$/.test(text) ? text : 'Detailed prediction details generated inside platform.');
            
            doc.setFontSize(11); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
            doc.text(label, 15, predY); predY += 6;
            doc.setFillColor(249,115,22); doc.rect(15, predY, 180, 0.5, 'F'); predY += 5;
            
            doc.setFontSize(10); doc.setTextColor(40,40,40); doc.setFont('helvetica','normal');
            const lines = doc.splitTextToSize(safeT, 175);
            
            if (predY + (lines.length * 5) > 280) {
                doc.addPage(); 
                H(doc, useUnicode && locale === 'hi' ? 'जीवन भविष्यफल (क्रमशः)' : 'Life Predictions (Continued)', 13, TP);
                predY = 30;
            }
            
            doc.text(lines, 15, predY);
            predY += lines.length * 5 + 10;
        });
    }

    // Add Yogas if there is space, otherwise new page
    if (chart.yogas && chart.yogas.length > 0) {
        if (predY > 220) {
            doc.addPage(); H(doc, L.yogas, 14, TP);
            predY = 30;
        }
        ST(doc, L.yogasDetected, predY, 161, 98, 7); predY += 8;
        
        autoTable(doc, {
            startY: predY, margin: { left: 15 },
            head: [[
                useUnicode && locale === 'hi' ? 'योग नाम' : 'Yoga Name', 
                useUnicode && locale === 'hi' ? 'प्रभाव / विवरण' : 'Effect'
            ]],
            body: chart.yogas.map((y: any) => [
                y.name || '—', 
                y.effects || y.description || '—'
            ]),
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [161, 98, 7], textColor: 255 },
            alternateRowStyles: { fillColor: [255, 251, 235] },
        });
    }

    // PAGE 17: Remedies & Gemstones
    doc.addPage(); H(doc, useUnicode && locale === 'hi' ? 'उपाय एवं रत्न' : 'Remedies & Gemstones', 17, TP);
    ST(doc, L.gemstones, 32);
    
    autoTable(doc,{
        startY:38, margin:{left:15},
        head:[[
            useUnicode && locale === 'hi' ? 'प्रकार' : 'Type',
            useUnicode && locale === 'hi' ? 'रत्न' : 'Gemstone',
            useUnicode && locale === 'hi' ? 'धारण दिन' : 'Wear Day',
            useUnicode && locale === 'hi' ? 'अंगुली' : 'Finger',
            useUnicode && locale === 'hi' ? 'धातु' : 'Metal',
            useUnicode && locale === 'hi' ? 'वजन' : 'Weight',
            useUnicode && locale === 'hi' ? 'मंत्र' : 'Mantra'
        ]],
        body:[
            [
                useUnicode && locale === 'hi' ? 'जीवन रत्न' : 'Life Stone',
                T.gemstones?.Sun || 'Ruby',
                useUnicode && locale === 'hi' ? 'रविवार' : 'Sunday',
                useUnicode && locale === 'hi' ? 'अनामिका' : 'Ring Finger',
                useUnicode && locale === 'hi' ? 'सोना' : 'Gold',
                '3-5 Ratti',
                'Om Suryaya Namah'
            ],
            [
                useUnicode && locale === 'hi' ? 'भाग्य रत्न' : 'Lucky Stone',
                T.gemstones?.Jupiter || 'Yellow Sapphire',
                useUnicode && locale === 'hi' ? 'गुरुवार' : 'Thursday',
                useUnicode && locale === 'hi' ? 'तर्जनी' : 'Index Finger',
                useUnicode && locale === 'hi' ? 'सोना' : 'Gold',
                '5-7 Ratti',
                'Om Guruve Namah'
            ],
            [
                useUnicode && locale === 'hi' ? 'कारक रत्न' : 'Benefic Stone',
                T.gemstones?.Moon || 'Pearl',
                useUnicode && locale === 'hi' ? 'सोमवार' : 'Monday',
                useUnicode && locale === 'hi' ? 'कनिष्ठिका' : 'Little Finger',
                useUnicode && locale === 'hi' ? 'चांदी' : 'Silver',
                '5-7 Ratti',
                'Om Chandraya Namah'
            ],
        ],
        styles:{fontSize:useUnicode?8:8.5,cellPadding:3},
        headStyles:{fillColor:[161,98,7],textColor:255},
        alternateRowStyles:{fillColor:[255,251,235]},
    });
    
    const yR=(doc as any).lastAutoTable.finalY+10;
    ST(doc, L.remedies, yR, 79,70,229);
    autoTable(doc,{
        startY:yR+5, margin:{left:15},
        head:[[
            useUnicode && locale === 'hi' ? 'उपाय प्रकार' : 'Remedy', 
            useUnicode && locale === 'hi' ? 'मार्गदर्शन' : 'Detailed Instructions'
        ]],
        body:[
            [
                useUnicode && locale === 'hi' ? 'सक्रिय महादशा उपाय' : 'Mahadasha Remedy', 
                useUnicode && locale === 'hi' 
                    ? `${pl(chart.dasha?.currentLords?.[0]||'Sun', T)} महादशा सक्रिय है। प्रतिदिन सूर्योदय के बाद 108 बार इसके बीज मंत्र का जाप करें।`
                    : `${pl(chart.dasha?.currentLords?.[0]||'Sun', T)} Mahadasha is active. Recite its Beej Mantra 108 times daily, preferably after sunrise.`
            ],
            [
                useUnicode && locale === 'hi' ? 'शनि देव उपाय' : 'Shani (Saturn) Remedy', 
                useUnicode && locale === 'hi'
                    ? 'प्रत्येक शनिवार को पीपल के पेड़ पर जल चढ़ाएं। काले तिल, उड़द की दाल या सरसों के तेल का दान करें। घर में शनि यंत्र स्थापित करें।'
                    : 'Every Saturday, offer water to a peepal tree. Donate black sesame, urad dal, or mustard oil. Install Shani Yantra at home.'
            ],
            [
                useUnicode && locale === 'hi' ? 'मंगल देव उपाय' : 'Mangal (Mars) Remedy', 
                useUnicode && locale === 'hi'
                    ? 'प्रत्येक मंगलवार को हनुमान चालीसा का पाठ करें। लाल कपड़ा या लाल मसूर की दाल दान करें। रक्तदान भी अत्यधिक लाभकारी है।'
                    : 'Every Tuesday, recite Hanuman Chalisa. Donate red cloth or red lentils. Blood donation is also highly beneficial.'
            ],
            [
                useUnicode && locale === 'hi' ? 'सूर्य देव उपाय' : 'Surya (Sun) Remedy', 
                useUnicode && locale === 'hi'
                    ? 'प्रतिदिन सुबह तांबे के लोटे में जल भरकर सूर्य को अर्घ्य दें। आदित्य हृदय स्तोत्र का पाठ करें। दाहिने हाथ में तांबे की अंगूठी धारण करें।'
                    : 'Every morning, offer water to the Sun with red flowers and sandalwood. Recite Aditya Hridayam. Wear copper ring on right hand.'
            ],
            [
                useUnicode && locale === 'hi' ? 'राहु देव उपाय' : 'Rahu Remedy', 
                useUnicode && locale === 'hi'
                    ? 'शनिवार के दिन नीली या काली वस्तुओं का दान करें। "ॐ राहवे नमः" का १८ बार जाप करें। शनिवार को तामसिक भोजन से बचें।'
                    : 'Donate blue/black items on Saturdays. Recite "Om Rahave Namah" 18 times. Avoid non-vegetarian food on Saturdays.'
            ],
        ],
        styles:{fontSize:useUnicode?9:9.5,cellPadding:4},
        headStyles:{fillColor:[79,70,229],textColor:255},
        alternateRowStyles:{fillColor:[245,245,255]},
        columnStyles:{0:{fontStyle:'bold',cellWidth:useUnicode?45:42}},
    });

    // PAGE 18: Conclusion
    doc.addPage(); H(doc, useUnicode && locale === 'hi' ? 'निष्कर्ष एवं आशीर्वाद' : 'Summary & Blessings', 18, TP);
    doc.setFillColor(10,10,30); doc.rect(0,22,210,275,'F');
    doc.setFontSize(20); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    
    doc.text(L.conclusion, 105, 80, {align:'center'});
    doc.setFontSize(12); doc.setTextColor(200,200,200); doc.setFont('helvetica','normal');
    doc.text(
        useUnicode && locale === 'hi' 
            ? `प्रिय ${safeText(doc, formData.name, 'साधक')},`
            : `Dear ${safeText(doc, formData.name, 'Seeker')},`, 
        105, 105, {align:'center'}
    );
    
    const bl=doc.splitTextToSize(
        useUnicode && locale === 'hi'
            ? 'ईश्वर से प्रार्थना है कि आपकी कुंडली के दिव्य ग्रह संरेखण आपको शांति, समृद्धि और जीवन के उद्देश्य की ओर ले जाएं। सितारे आपके मार्ग को आलोकित करते हैं - यह आपका कर्म और स्वतंत्र इच्छा है जो आपके भाग्य को आकार देती है। पूर्ण विश्वास और बुद्धि के साथ आगे बढ़ें।'
            : 'May the celestial alignments of your birth chart guide you towards peace, prosperity, and purpose. The stars illuminate your path — it is your karma and free will that shape your destiny. Walk forward with courage and wisdom, guided by the divine light of Jyotish.', 
        160
    );
    doc.text(bl, 105, 118, {align:'center'});
    
    doc.setFontSize(10); doc.setTextColor(150,150,150);
    doc.text(
        `${useUnicode && locale === 'hi' ? 'लग्न' : 'Lagna'}: ${sg(chart.ascendantSign, T)}  |  ${useUnicode && locale === 'hi' ? 'चंद्र राशि' : 'Moon Sign'}: ${sg(chart.moonSign, T)}  |  ${useUnicode && locale === 'hi' ? 'नक्षत्र' : 'Nakshatra'}: ${nakshatraVal}`, 
        105, 185, {align:'center'}
    );
    doc.text(
        `${useUnicode && locale === 'hi' ? 'सक्रिय महादशा' : 'Active Mahadasha'}: ${pl(maha, T)}  |  ${useUnicode && locale === 'hi' ? 'अंतर्दशा' : 'Antardasha'}: ${pl(antar, T)}`, 
        105, 195, {align:'center'}
    );
    
    doc.setFontSize(8); doc.setTextColor(100,100,100);
    const dateFormatted = new Date().toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday:'long',year:'numeric',month:'long',day:'numeric'
    });
    doc.text(`${useUnicode && locale === 'hi' ? 'रिपोर्ट जनरेट की गई' : 'Report generated'}: ${dateFormatted}`, 105, 215, {align:'center'});
    doc.text('JyotishConnect — Premium Vedic Astrology Platform', 105, 225, {align:'center'});

    // Whiteout and update total dynamic page numbers precisely
    const finalPageCount = doc.getNumberOfPages();
    for (let p = 1; p <= finalPageCount; p++) {
        doc.setPage(p);
        // Cover page doesn't have standard header rectangle, but other pages do
        if (p > 1) {
            doc.setFillColor(15, 15, 35);
            doc.rect(170, 8, 30, 8, 'F');
            doc.setFontSize(7); doc.setTextColor(180, 180, 180); doc.setFont('helvetica', 'normal');
            doc.text(`${useUnicode && locale === 'hi' ? 'पृष्ठ' : 'Page'} ${p} / ${finalPageCount}`, 195, 14, {align: 'right'});
        }
    }

    doc.save(`Kundli_Report_${safeText(doc, formData.name, 'Report')}.pdf`);
}
