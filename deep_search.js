const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(process.cwd());

function searchDir(dir) {
    const resolvedDir = path.resolve(dir);
    if (!resolvedDir.startsWith(workspaceRoot)) {
        return;
    }
    const files = fs.readdirSync(resolvedDir);
    for (const file of files) {
        const fullPath = path.resolve(resolvedDir, file);
        if (!fullPath.startsWith(workspaceRoot)) {
            continue;
        }
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
    searchDir(workspaceRoot);
} catch (e) {
    console.error(e);
}
