import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTrans } from './i18n';
import { generateDetailedMatchingReport } from './prediction-engine';
import { isUnicodeFontLoaded, safeText } from './generateKundliPDF';

// Use English backup translations
const EN = getTrans('en');

const _SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function sg(sign: string, T: any) { 
    return T.signs?.[sign as keyof typeof T.signs] || sign; 
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

// Draw North Indian Kundli chart programmatically in jsPDF
const drawNIChart = (doc: jsPDF, houseData: {[h:number]:string[]}, ascLong: number, ox: number, oy: number, size: number) => {
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

export async function generateMatchingPDF(
    result: any,
    boyDetails: any,
    girlDetails: any,
    locale: string,
    detailedReport: any
) {
    const doc = new jsPDF('p','mm','a4');
    const useUnicode = isUnicodeFontLoaded(doc);
    const T = useUnicode ? getTrans(locale) : getTrans('en');

    // Layout configuration depending on locale and font support
    const L = {
        coverTitle: useUnicode && locale === 'hi' ? 'पवित्र वैदिक कुंडली मिलान रिपोर्ट' : 'Sacred Vedic Kundli Matching Report',
        scoreLabel: useUnicode && locale === 'hi' ? 'दिव्य गुण मिलान स्कोर' : 'Celestial Compatibility Score',
        boyLabel: useUnicode && locale === 'hi' ? 'वर (लड़का)' : 'Boy',
        girlLabel: useUnicode && locale === 'hi' ? 'वधू (लड़की)' : 'Girl',
        manglikStatus: useUnicode && locale === 'hi' ? 'मांगलिक स्थिति' : 'Manglik Status',
        chartComparison: useUnicode && locale === 'hi' ? 'जन्म कुंडली तुलना' : 'Birth Chart Comparison',
        chartComparisonSub: useUnicode && locale === 'hi' ? 'जन्म कुंडली तुलना (D1 कुंडलियां)' : 'Birth Chart Comparison (D1 Charts)',
        birthAttribute: useUnicode && locale === 'hi' ? 'जन्म विवरण' : 'Birth Attribute',
        ashtakootAnalysis: useUnicode && locale === 'hi' ? 'अष्टकूट मिलान विश्लेषण' : 'Ashtakoot Koota Analysis',
        ashtakootAnalysisSub: useUnicode && locale === 'hi' ? 'अष्टकूट गुण मिलान अंक' : 'Detailed Ashtakoot Guna Score',
        aspectLabel: useUnicode && locale === 'hi' ? 'कूट / पहलू' : 'Koota / Aspect',
        maxPts: useUnicode && locale === 'hi' ? 'अधिकतम' : 'Max Pts',
        obtainedScore: useUnicode && locale === 'hi' ? 'प्राप्त अंक' : 'Obtained Score',
        verdictLabel: useUnicode && locale === 'hi' ? 'निर्णय' : 'Verdict',
        guidanceLabel: useUnicode && locale === 'hi' ? 'वैदिक समाधान एवं मार्गदर्शन' : 'Vedic Reconciliation & Guidance',
        detailedFindings: useUnicode && locale === 'hi' ? 'विस्तृत विश्लेषण एवं उपाय' : 'Detailed Findings & Remedies',
        compatibilityAreas: useUnicode && locale === 'hi' ? 'संगतता क्षेत्र एवं भविष्यफल' : 'Compatibility Areas & Future Forecast',
        remediesLabel: useUnicode && locale === 'hi' ? 'आध्यात्मिक उपचारात्मक उपाय' : 'Spiritual Remedial Measures',
        blessingLabel: useUnicode && locale === 'hi' ? 'दैवीय आशीर्वाद' : 'Divine Blessings',
    };

    let TP = 5; // Dynamic total pages calculation placeholder

    // PAGE 1: Cover Page & Compatibility Overview
    doc.setFillColor(10,10,30); doc.rect(0,0,210,297,'F');
    doc.setFillColor(249,115,22); doc.rect(0,110,210,65,'F');
    
    doc.setFontSize(30); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    doc.text('JyotishConnect', 105, 65, {align:'center'});
    doc.setFontSize(12); doc.setTextColor(200,200,200); doc.setFont('helvetica','normal');
    doc.text(L.coverTitle, 105, 80, {align:'center'});
    
    // Names
    doc.setFontSize(22); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text(`${safeText(doc, result.boy, 'Boy')}   &   ${safeText(doc, result.girl, 'Girl')}`, 105, 130, {align:'center'});
    
    // Score
    doc.setFontSize(14); doc.setTextColor(255,255,255); doc.setFont('helvetica','normal');
    doc.text(`${L.scoreLabel}: ${result.total_guna} / 36 ${useUnicode && locale === 'hi' ? 'गुण' : 'Gunas'}`, 105, 145, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(255,220,180);
    
    let compatText = result.total_guna > 24 
        ? (useUnicode && locale === 'hi' ? "उत्कृष्ट मिलान" : "Excellent Match") 
        : result.total_guna > 18 
            ? (useUnicode && locale === 'hi' ? "उत्तम / औसत मिलान" : "Good / Average Match") 
            : (useUnicode && locale === 'hi' ? "न्यून अनुकूलता" : "Low Compatibility");
    doc.text(compatText, 105, 155, {align:'center'});

    // Details Box
    doc.setFontSize(9.5); doc.setTextColor(180,180,180);
    doc.text(`${useUnicode && locale === 'hi' ? 'वर' : 'Boy'}: ${boyDetails.dob} | ${boyDetails.tob} | ${safeText(doc, boyDetails.place, 'Birthplace')}`, 105, 195, {align:'center'});
    doc.text(`${useUnicode && locale === 'hi' ? 'वधू' : 'Girl'}: ${girlDetails.dob} | ${girlDetails.tob} | ${safeText(doc, girlDetails.place, 'Birthplace')}`, 105, 203, {align:'center'});
    
    // Manglik info
    const mLabel = (present: boolean) => {
        if (present) return useUnicode && locale === 'hi' ? 'मांगलिक' : 'Manglik';
        return useUnicode && locale === 'hi' ? 'गैर-मांगलिक' : 'Non-Manglik';
    };
    doc.text(`${L.manglikStatus} — ${useUnicode && locale === 'hi' ? 'वर' : 'Boy'}: ${mLabel(result.is_manglik_boy)} | ${useUnicode && locale === 'hi' ? 'वधू' : 'Girl'}: ${mLabel(result.is_manglik_girl)}`, 105, 215, {align:'center'});

    doc.setFontSize(8); doc.setTextColor(120,120,120);
    doc.text('Generated by JyotishConnect  —  jyotishconnect.com', 105, 275, {align:'center'});

    // PAGE 2: Birth Chart Comparison
    doc.addPage();
    H(doc, L.chartComparison, 2, TP);
    ST(doc, L.chartComparisonSub, 32);

    // Boy's Chart
    doc.setFontSize(11); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    doc.text(`${safeText(doc, result.boy, 'Boy')} (${useUnicode && locale === 'hi' ? 'वर' : 'Boy'})`, 50, 48, {align:'center'});
    drawNIChart(doc, result.boyChart?.D1 || {}, result.boyAscendant || 0, 15, 53, 80);

    // Girl's Chart
    doc.setFontSize(11); doc.setTextColor(239,68,68); doc.setFont('helvetica','bold');
    doc.text(`${safeText(doc, result.girl, 'Girl')} (${useUnicode && locale === 'hi' ? 'वधू' : 'Girl'})`, 160, 48, {align:'center'});
    drawNIChart(doc, result.girlChart?.D1 || {}, result.girlAscendant || 0, 115, 53, 80);

    // Detailed Astrological Positions Table
    const boyMoonSign = sg(result.boyPlanets?.find((p: any) => p.name === 'Moon')?.sign || 'Aries', T);
    const girlMoonSign = sg(result.girlPlanets?.find((p: any) => p.name === 'Moon')?.sign || 'Aries', T);
    const boyNakshatra = result.boyPanchang?.nakshatraId ? T.nakshatras[result.boyPanchang.nakshatraId - 1] : '—';
    const girlNakshatra = result.girlPanchang?.nakshatraId ? T.nakshatras[result.girlPanchang.nakshatraId - 1] : '—';

    autoTable(doc, {
        startY: 145, margin: { left: 15 },
        head: [[L.birthAttribute, `${safeText(doc, result.boy, 'Boy')} (${useUnicode && locale === 'hi' ? 'वर' : 'Boy'})`, `${safeText(doc, result.girl, 'Girl')} (${useUnicode && locale === 'hi' ? 'वधू' : 'Girl'})`]],
        body: [
            [useUnicode && locale === 'hi' ? 'चंद्र राशि (Rasi)' : 'Moon Sign (Rasi)', boyMoonSign, girlMoonSign],
            [useUnicode && locale === 'hi' ? 'नक्षत्र (Star)' : 'Nakshatra (Star)', boyNakshatra, girlNakshatra],
            [useUnicode && locale === 'hi' ? 'मांगलिक दोष' : 'Manglik Dosha', 
                result.is_manglik_boy 
                    ? (useUnicode && locale === 'hi' ? 'हाँ (सक्रिय)' : 'Yes (Present)') 
                    : (useUnicode && locale === 'hi' ? 'नहीं (अनुपस्थित)' : 'No (Absent)'), 
                result.is_manglik_girl 
                    ? (useUnicode && locale === 'hi' ? 'हाँ (सक्रिय)' : 'Yes (Present)') 
                    : (useUnicode && locale === 'hi' ? 'नहीं (अनुपस्थित)' : 'No (Absent)')],
            [useUnicode && locale === 'hi' ? 'जन्म तिथि' : 'Tithi at Birth', 
                T.panchang?.tithi[result.boyPanchang?.tithiId] || '—', 
                T.panchang?.tithi[result.girlPanchang?.tithiId] || '—'],
            [useUnicode && locale === 'hi' ? 'जन्म योग' : 'Yoga at Birth', 
                T.panchang?.yoga[result.boyPanchang?.yogaId] || '—', 
                T.panchang?.yoga[result.girlPanchang?.yogaId] || '—'],
            [useUnicode && locale === 'hi' ? 'जन्म वार (Weekday)' : 'Weekday (Vara)', 
                T.panchang?.vara[result.boyPanchang?.vara] || '—', 
                T.panchang?.vara[result.girlPanchang?.vara] || '—'],
        ],
        styles: { fontSize: useUnicode ? 9 : 9.5, cellPadding: 3.5 },
        headStyles: { fillColor: [15, 15, 35], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 248, 250] },
    });

    // PAGE 3: Ashtakoot Guna Milan Details Table
    doc.addPage();
    H(doc, L.ashtakootAnalysis, 3, TP);
    ST(doc, L.ashtakootAnalysisSub, 32, 79,70,229);

    autoTable(doc, {
        startY: 38, margin: { left: 15 },
        head: [[
            L.aspectLabel, 
            useUnicode && locale === 'hi' ? 'वर का मान' : 'Boy Value', 
            useUnicode && locale === 'hi' ? 'वधू का मान' : 'Girl Value', 
            L.maxPts, 
            L.obtainedScore, 
            L.verdictLabel
        ]],
        body: Object.entries(result.ashtakoot).map(([key, val]: any) => {
            const kootaName = T.kootas?.[key as keyof typeof T.kootas] || EN.kootas?.[key as keyof typeof EN.kootas] || key;
            
            let verdict = useUnicode && locale === 'hi' ? 'औसत' : 'Average';
            if (val.score === val.total) {
                verdict = useUnicode && locale === 'hi' ? 'उत्कृष्ट' : 'Excellent';
            } else if (val.score === 0) {
                verdict = useUnicode && locale === 'hi' ? 'कमजोर' : 'Weak';
            }
            return [
                kootaName,
                val.boyVal || '—',
                val.girlVal || '—',
                String(val.total),
                String(val.score),
                verdict
            ];
        }),
        styles: { fontSize: useUnicode ? 9 : 9.5, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 248, 255] },
        didParseCell: (data: any) => {
            if (data.column.index === 4) {
                data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 5) {
                if (data.cell.raw === 'Excellent' || data.cell.raw === 'उत्कृष्ट') data.cell.styles.textColor = [34, 197, 94];
                if (data.cell.raw === 'Weak' || data.cell.raw === 'कमजोर') data.cell.styles.textColor = [220, 38, 38];
            }
        }
    });

    let compatibilityObject = result;
    if (result && !result.milan) {
        compatibilityObject = {
            milan: {
                totalScore: result.total_guna || 0,
                ashtakoot: result.ashtakoot || {}
            },
            boy: {
                name: result.boy || "Boy",
                planets: result.boyPlanets || [],
                charts: result.boyChart || {},
                ascendantLongitude: result.boyAscendant || 0,
                doshas: {
                    Manglik: { present: result.is_manglik_boy || false }
                }
            },
            girl: {
                name: result.girl || "Girl",
                planets: result.girlPlanets || [],
                charts: result.girlChart || {},
                ascendantLongitude: result.girlAscendant || 0,
                doshas: {
                    Manglik: { present: result.is_manglik_girl || false }
                }
            }
        };
    }

    const reportLocale = useUnicode ? locale : 'en';
    const report = generateDetailedMatchingReport(compatibilityObject, reportLocale);

    // Overview verdict below table
    const yVerdict = (doc as any).lastAutoTable.finalY + 12;
    ST(doc, L.guidanceLabel, yVerdict, 249, 115, 22);
    
    doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal');
    const recText = report?.summary?.verdict || (useUnicode && locale === 'hi' 
        ? 'यह मिलान दोनों व्यक्तियों में सकारात्मक सामंजस्य और विचारशीलता को दर्शाता है।' 
        : 'The union shows positive alignment of thoughts and values. Mutual understanding and common life goals will play a vital role in keeping this relationship harmonious and successful.');
    
    const splitRec = doc.splitTextToSize(useUnicode ? String(recText) : safeText(doc, recText), 175);
    doc.text(splitRec, 15, yVerdict + 8);

    // PAGE 4: Detailed Compatibility Findings & Future Forecast
    doc.addPage();
    let currentPage = 4;
    H(doc, L.detailedFindings, 4, TP);
    ST(doc, L.compatibilityAreas, 32, 109, 40, 217);

    let fy = 40;
    const compatibilitySections = [
        { title: useUnicode && locale === 'hi' ? 'विवाह अनुकूलता' : 'Marriage Compatibility', text: report?.marriage?.verdict },
        { title: useUnicode && locale === 'hi' ? 'स्वभाव और प्रकृति' : 'Nature & Temperament', text: report?.nature?.verdict },
        { title: useUnicode && locale === 'hi' ? 'परिवार और संतान' : 'Family & Children', text: report?.family?.verdict },
        { title: useUnicode && locale === 'hi' ? 'धन और समृद्धि' : 'Wealth & Prosperity', text: report?.finance?.verdict },
        { title: useUnicode && locale === 'hi' ? 'नवांश तालमेल (गहन संबंध)' : 'Navamsa Synergy', text: report?.bond?.verdict },
        { title: useUnicode && locale === 'hi' ? 'शुभ विवाह मुहूर्त काल' : 'Auspicious Marriage Timing', text: report?.timing?.verdict },
        { title: useUnicode && locale === 'hi' ? 'जीवन भविष्यफल' : 'Life Forecast', text: report?.forecast?.verdict },
    ];

    compatibilitySections.forEach((sec) => {
        if (!sec.text) return;
        
        const splitText = doc.splitTextToSize(useUnicode ? String(sec.text) : safeText(doc, sec.text), 175);
        const neededHeight = 4.5 + (splitText.length * 4) + 6;
        
        if (fy + neededHeight > 270) {
            doc.addPage();
            currentPage += 1;
            H(doc, L.detailedFindings, currentPage, TP);
            fy = 35;
        }

        doc.setFontSize(9.5); doc.setTextColor(109, 40, 217); doc.setFont('helvetica', 'bold');
        doc.text(sec.title, 15, fy);
        fy += 4.5;
        doc.setFontSize(8.5); doc.setTextColor(60, 60, 60); doc.setFont('helvetica', 'normal');
        doc.text(splitText, 15, fy);
        fy += (splitText.length * 4) + 6;
    });

    // Remedies Section
    const remediesList = report?.remedies?.list || [];
    if (remediesList.length > 0) {
        const neededRemediesHeight = 10 + (remediesList.length * 7);
        if (fy + neededRemediesHeight > 270) {
            doc.addPage();
            currentPage += 1;
            H(doc, L.remediesLabel, currentPage, TP);
            fy = 32;
        } else {
            fy += 2;
        }
        
        ST(doc, L.remediesLabel, fy, 16, 185, 129);
        fy += 8;
        
        doc.setFontSize(9); doc.setTextColor(40, 40, 40);
        remediesList.forEach((rem: string) => {
            const splitRem = doc.splitTextToSize(useUnicode ? `- ${rem}` : `- ${safeText(doc, rem)}`, 175);
            doc.text(splitRem, 15, fy);
            fy += (splitRem.length * 4) + 2.5;
        });
    }

    // Conclusion / Blessing
    const neededBlessingHeight = 35;
    if (fy + neededBlessingHeight > 280) {
        doc.addPage();
        currentPage += 1;
        H(doc, L.blessingLabel, currentPage, TP);
        fy = 35;
    } else {
        fy += 4;
    }

    doc.setFillColor(15, 15, 35);
    doc.roundedRect(15, fy, 180, 28, 2, 2, 'F');
    doc.setFontSize(10); doc.setTextColor(249, 115, 22); doc.setFont('helvetica', 'bold');
    doc.text(L.blessingLabel, 105, fy + 8, {align: 'center'});
    doc.setFontSize(8.5); doc.setTextColor(240, 240, 240); doc.setFont('helvetica', 'normal');
    doc.text(
        useUnicode && locale === 'hi'
            ? 'ईश्वर इस गठबंधन को शाश्वत प्रेम, शांति और समृद्धि से आशीर्वाद दें।'
            : 'May the divine cosmic energy bless your union with endless love, peace, and prosperity.', 
        105, fy + 16, {align: 'center'}
    );

    // Overwrite the dynamic total page numbers on all pages
    const finalPageCount = doc.getNumberOfPages();
    for (let p = 1; p <= finalPageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(15, 15, 35);
        // Clear standard page text box and draw the corrected dynamic total page count
        doc.rect(170, 10, 30, 8, 'F');
        doc.setFontSize(7); doc.setTextColor(180, 180, 180); doc.setFont('helvetica', 'normal');
        doc.text(`${useUnicode && locale === 'hi' ? 'पृष्ठ' : 'Page'} ${p} / ${finalPageCount}`, 195, 14, {align: 'right'});
    }

    doc.save(`JyotishConnect_Match_${safeText(doc, result.boy, 'Boy')}_${safeText(doc, result.girl, 'Girl')}.pdf`);
}
