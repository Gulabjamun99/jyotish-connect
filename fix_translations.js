const fs = require('fs');
const files = ['messages/gu.json', 'messages/kn.json'];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/500\+/g, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
});
