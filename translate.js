const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');

const FILE_PATH = './src/lib/astrology/horoscope-data.ts';

async function main() {
    let content = fs.readFileSync(FILE_PATH, 'utf-8');
    const langs = ['mr', 'ta', 'te', 'kn', 'bn', 'gu'];
    
    // We will parse the file, translate 'en' to other languages, and overwrite.
    console.log("Parsing horoscope-data.ts...");
    
    // Evaluate the object to make it easy to traverse
    // To evaluate, we need to strip 'export const SIGN_PREDICTIONS: Record<string, SignPredictions> = '
    const startIdx = content.indexOf('export const SIGN_PREDICTIONS');
    const jsonStr = content.slice(startIdx)
        .replace(/export const SIGN_PREDICTIONS.*?=\s*/, '')
        .replace(/;?\s*$/, '');
        
    // Eval inside a safe context
    let dataObj;
    try {
        dataObj = eval('(' + jsonStr + ')');
    } catch (e) {
        console.error("Failed to eval", e);
        return;
    }

    const signs = Object.keys(dataObj);
    
    for (const sign of signs) {
        console.log(`Translating ${sign}...`);
        const enData = dataObj[sign].en;
        for (const targetLang of langs) {
            if (!dataObj[sign][targetLang]) {
                dataObj[sign][targetLang] = {
                    personal: [],
                    career: [],
                    health: [],
                    love: []
                };
            }
            
            for (const category of ['personal', 'career', 'health', 'love']) {
                if (dataObj[sign][targetLang][category].length === 0) {
                    try {
                        const textToTranslate = enData[category].join(' ||| ');
                        const res = await translate(textToTranslate, { to: targetLang });
                        dataObj[sign][targetLang][category] = res.text.split(' ||| ').map(s => s.trim().replace(/"/g, "'"));
                    } catch (e) {
                        console.log(`Error translating ${sign} ${category} to ${targetLang}`, e);
                        dataObj[sign][targetLang][category] = enData[category]; // fallback to english if fails
                    }
                }
            }
        }
    }

    // Write back to file
    const newFileContent = `// Sign-specific horoscope prediction database
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

export const SIGN_PREDICTIONS: Record<string, SignPredictions> = ${JSON.stringify(dataObj, null, 4)};
`;

    fs.writeFileSync(FILE_PATH, newFileContent, 'utf-8');
    console.log("Translation complete and saved to horoscope-data.ts");
}

main();
