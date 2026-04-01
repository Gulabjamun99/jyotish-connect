const fs = require('fs');
const files = ['messages/gu.json', 'messages/kn.json'];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        // Remove leading characters that are not '{'
        const firstBrace = content.indexOf('{');
        if (firstBrace !== -1) {
            content = content.substring(firstBrace);
        }
        
        // Remove trailing characters that are not '}'
        const lastBrace = content.lastIndexOf('}');
        if (lastBrace !== -1) {
            content = content.substring(0, lastBrace + 1);
        }

        // Verify it's valid JSON
        JSON.parse(content);
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Successfully cleaned and verified ${file}`);
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
        // If it's really messed up, I might need to provide the full content here
    }
});
