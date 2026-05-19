import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTrans } from './i18n';
import { generateDetailedMatchingReport } from './prediction-engine';

// Devanagari/Hindi cannot be rendered in standard jsPDF Helvetica, so PDF uses English names/labels.
const EN = getTrans('en');

const _SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function sg(sign: string) { return EN.signs[sign as keyof typeof EN.signs] || sign; }

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
    // Outer border
    doc.setDrawColor(249,115,22); doc.setLineWidth(0.5);
    doc.rect(ox, oy, s, s);
    // Inner diamond
    doc.line(ox+h, oy,     ox+s, oy+h);
    doc.line(ox+s, oy+h,   ox+h, oy+s);
    doc.line(ox+h, oy+s,   ox,   oy+h);
    doc.line(ox,   oy+h,   ox+h, oy);
    // Cross lines
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
    // Planet colors
    const pColors:Record<string,number[]> = {
        Sun:[249,115,22],Moon:[96,165,250],Mars:[248,113,113],
        Mercury:[74,222,128],Jupiter:[250,204,21],Venus:[244,114,182],
        Saturn:[167,139,250],Rahu:[148,163,184],Ketu:[100,116,139],Asc:[249,115,22]
    };
    const ascSign = Math.floor((ascLong||0)/30);
    // Draw house numbers and planets
    for(let h=1;h<=12;h++){
        const [cx,cy] = hPos[h-1];
        const signNum = ((ascSign + h - 1) % 12) + 1;
        // House number (small)
        doc.setFontSize(6.5); doc.setTextColor(150,150,150); doc.setFont('helvetica','normal');
        doc.text(String(signNum), cx, cy-4, {align:'center'});
        // Planets in this house
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
    let TP = 5; // Estimated total pages
    let currentPage = 1;

    // PAGE 1: Cover Page & Compatibility Overview
    doc.setFillColor(10,10,30); doc.rect(0,0,210,297,'F');
    doc.setFillColor(249,115,22); doc.rect(0,110,210,65,'F');
    
    doc.setFontSize(30); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    doc.text('JyotishConnect', 105, 65, {align:'center'});
    doc.setFontSize(12); doc.setTextColor(200,200,200); doc.setFont('helvetica','normal');
    doc.text('Sacred Vedic Kundli Matching Report', 105, 80, {align:'center'});
    
    // Names
    doc.setFontSize(22); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text(`${result.boy}   &   ${result.girl}`, 105, 130, {align:'center'});
    
    // Score
    doc.setFontSize(14); doc.setTextColor(255,255,255); doc.setFont('helvetica','normal');
    doc.text(`Celestial Compatibility Score: ${result.total_guna} / 36 Gunas`, 105, 145, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(255,220,180);
    const compatText = result.total_guna > 24 ? "Excellent Match" : result.total_guna > 18 ? "Good / Average Match" : "Low Compatibility";
    doc.text(compatText, 105, 155, {align:'center'});

    // Details Box
    doc.setFontSize(9.5); doc.setTextColor(180,180,180);
    doc.text(`Boy: ${boyDetails.dob} | ${boyDetails.tob} | ${boyDetails.place}`, 105, 195, {align:'center'});
    doc.text(`Girl: ${girlDetails.dob} | ${girlDetails.tob} | ${girlDetails.place}`, 105, 203, {align:'center'});
    
    // Manglik info
    const boyMang = result.is_manglik_boy ? "Manglik" : "Non-Manglik";
    const girlMang = result.is_manglik_girl ? "Manglik" : "Non-Manglik";
    doc.text(`Manglik Status — Boy: ${boyMang} | Girl: ${girlMang}`, 105, 215, {align:'center'});

    doc.setFontSize(8); doc.setTextColor(120,120,120);
    doc.text('Generated by JyotishConnect  —  jyotishconnect.com', 105, 275, {align:'center'});

    // PAGE 2: Birth Chart Comparison (D1 Charts)
    doc.addPage(); currentPage = 2;
    H(doc, 'Birth Chart Comparison', 2, TP);
    ST(doc, 'Birth Chart Comparison (D1 Charts)', 32);

    // Boy's Chart
    doc.setFontSize(11); doc.setTextColor(249,115,22); doc.setFont('helvetica','bold');
    doc.text(`${result.boy} (Boy)`, 50, 48, {align:'center'});
    drawNIChart(doc, result.boyChart?.D1 || {}, result.boyAscendant || 0, 15, 53, 80);

    // Girl's Chart
    doc.setFontSize(11); doc.setTextColor(239,68,68); doc.setFont('helvetica','bold');
    doc.text(`${result.girl} (Girl)`, 160, 48, {align:'center'});
    drawNIChart(doc, result.girlChart?.D1 || {}, result.girlAscendant || 0, 115, 53, 80);

    // Detailed Astrological Positions Table
    const boyMoonSign = sg(result.boyPlanets?.find((p: any) => p.name === 'Moon')?.sign || 'Aries');
    const girlMoonSign = sg(result.girlPlanets?.find((p: any) => p.name === 'Moon')?.sign || 'Aries');
    const boyNakshatra = EN.nakshatras[result.boyPanchang?.nakshatraId - 1] || '—';
    const girlNakshatra = EN.nakshatras[result.girlPanchang?.nakshatraId - 1] || '—';

    autoTable(doc, {
        startY: 145, margin: { left: 15 },
        head: [['Birth Attribute', `${result.boy} (Boy)`, `${result.girl} (Girl)`]],
        body: [
            ['Moon Sign (Rasi)', boyMoonSign, girlMoonSign],
            ['Nakshatra (Star)', boyNakshatra, girlNakshatra],
            ['Manglik Dosha', result.is_manglik_boy ? 'Yes (Present)' : 'No (Absent)', result.is_manglik_girl ? 'Yes (Present)' : 'No (Absent)'],
            ['Tithi at Birth', EN.panchang?.tithi[result.boyPanchang?.tithiId] || '—', EN.panchang?.tithi[result.girlPanchang?.tithiId] || '—'],
            ['Yoga at Birth', EN.panchang?.yoga[result.boyPanchang?.yogaId] || '—', EN.panchang?.yoga[result.girlPanchang?.yogaId] || '—'],
            ['Weekday (Vara)', EN.panchang?.vara[result.boyPanchang?.vara] || '—', EN.panchang?.vara[result.girlPanchang?.vara] || '—'],
        ],
        styles: { fontSize: 9.5, cellPadding: 3.5 },
        headStyles: { fillColor: [15, 15, 35], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 248, 250] },
    });

    // PAGE 3: Ashtakoot Guna Milan Details Table
    doc.addPage(); currentPage = 3;
    H(doc, 'Ashtakoot Koota Analysis', 3, TP);
    ST(doc, 'Detailed Ashtakoot Guna Score', 32, 79,70,229);

    autoTable(doc, {
        startY: 38, margin: { left: 15 },
        head: [['Koota / Aspect', 'Boy Value', 'Girl Value', 'Max Pts', 'Obtained Score', 'Verdict']],
        body: Object.entries(result.ashtakoot).map(([key, val]: any) => {
            const kootaName = EN.kootas[key as keyof typeof EN.kootas] || key;
            let verdict = 'Average';
            if (val.score === val.total) verdict = 'Excellent';
            else if (val.score === 0) verdict = 'Weak';
            return [
                kootaName,
                val.boyVal || '—',
                val.girlVal || '—',
                String(val.total),
                String(val.score),
                verdict
            ];
        }),
        styles: { fontSize: 9.5, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 248, 255] },
        didParseCell: (data: any) => {
            if (data.column.index === 4) {
                data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 5) {
                if (data.cell.raw === 'Excellent') data.cell.styles.textColor = [34, 197, 94];
                if (data.cell.raw === 'Weak') data.cell.styles.textColor = [220, 38, 38];
            }
        }
    });

    // Ensure that result has the format expected by generateDetailedMatchingReport
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

    // Generate clean English report dynamically to ensure perfect PDF rendering without garbled characters
    const englishReport = generateDetailedMatchingReport(compatibilityObject, 'en');

    // Overview verdict below table
    const yVerdict = (doc as any).lastAutoTable.finalY + 12;
    ST(doc, 'Vedic Reconciliation & Guidance', yVerdict, 249, 115, 22);
    
    doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal');
    const recText = englishReport?.summary?.verdict || 'The union shows positive alignment of thoughts and values. Mutual understanding and common life goals will play a vital role in keeping this relationship harmonious and successful.';
    const splitRec = doc.splitTextToSize(recText, 175);
    doc.text(splitRec, 15, yVerdict + 8);

    // PAGE 4: Detailed Compatibility Findings & Future Forecast
    doc.addPage(); currentPage = 4;
    H(doc, 'Detailed Findings & Remedies', 4, TP);
    ST(doc, 'Compatibility Areas & Future Forecast', 32, 109, 40, 217);

    let fy = 40;
    const compatibilitySections = [
        { title: 'Marriage Compatibility', text: englishReport?.marriage?.verdict },
        { title: 'Nature & Temperament', text: englishReport?.nature?.verdict },
        { title: 'Family & Children', text: englishReport?.family?.verdict },
        { title: 'Wealth & Prosperity', text: englishReport?.finance?.verdict },
        { title: 'Navamsa Synergy', text: englishReport?.bond?.verdict },
        { title: 'Auspicious Marriage Timing', text: englishReport?.timing?.verdict },
        { title: 'Life Forecast', text: englishReport?.forecast?.verdict },
    ];

    compatibilitySections.forEach((sec) => {
        if (!sec.text) return;
        
        const splitText = doc.splitTextToSize(sec.text, 175);
        const neededHeight = 4.5 + (splitText.length * 4) + 6;
        
        // Page break security: if printing this section overflows the printable area, move to next page
        if (fy + neededHeight > 270) {
            doc.addPage();
            currentPage += 1;
            H(doc, 'Detailed Findings & Remedies', currentPage, TP);
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
    const remediesList = englishReport?.remedies?.list || [];
    if (remediesList.length > 0) {
        const neededRemediesHeight = 10 + (remediesList.length * 7);
        if (fy + neededRemediesHeight > 270) {
            doc.addPage();
            currentPage += 1;
            H(doc, 'Spiritual Remedial Measures', currentPage, TP);
            fy = 32;
        } else {
            fy += 2;
        }
        
        ST(doc, 'Spiritual Remedial Measures', fy, 16, 185, 129);
        fy += 8;
        
        doc.setFontSize(9); doc.setTextColor(40, 40, 40);
        remediesList.forEach((rem: string) => {
            const splitRem = doc.splitTextToSize(`- ${rem}`, 175);
            doc.text(splitRem, 15, fy);
            fy += (splitRem.length * 4) + 2.5;
        });
    }

    // Conclusion / Blessing
    const neededBlessingHeight = 35;
    if (fy + neededBlessingHeight > 280) {
        doc.addPage();
        currentPage += 1;
        H(doc, 'Divine Blessings', currentPage, TP);
        fy = 35;
    } else {
        fy += 4;
    }

    doc.setFillColor(15, 15, 35);
    doc.roundedRect(15, fy, 180, 28, 2, 2, 'F');
    doc.setFontSize(10); doc.setTextColor(249, 115, 22); doc.setFont('helvetica', 'bold');
    doc.text('Divine Blessings', 105, fy + 8, {align: 'center'});
    doc.setFontSize(8.5); doc.setTextColor(240, 240, 240); doc.setFont('helvetica', 'normal');
    doc.text('May the divine cosmic energy bless your union with endless love, peace, and prosperity.', 105, fy + 16, {align: 'center'});

    // Enforce precise dynamic final page count calculation and headers override
    const finalPageCount = doc.getNumberOfPages();
    for (let p = 1; p <= finalPageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(15, 15, 35);
        // Whiteout standard page text box and draw the corrected dynamic total page count
        doc.rect(170, 10, 30, 8, 'F');
        doc.setFontSize(7); doc.setTextColor(180, 180, 180); doc.setFont('helvetica', 'normal');
        doc.text(`Page ${p} / ${finalPageCount}`, 195, 14, {align: 'right'});
    }

    doc.save(`JyotishConnect_Match_${result.boy}_${result.girl}.pdf`);
}


