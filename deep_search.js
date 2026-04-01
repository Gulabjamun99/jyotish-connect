const fs = require('fs');
const path = require('path');

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file === 'node_modules' || file === '.next' || file === '.git') continue;
            searchDir(fullPath);
        } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('usualy') || content.includes('experienceing') || content.includes('alignmentsare')) {
                console.log(`FOUND IN: ${fullPath}`);
            }
        }
    }
}

try {
    searchDir('.');
} catch (e) {
    console.error(e);
}
