const fs = require('fs');
try {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    const lines = content.split(/\r?\n/);
    const line = lines[292];
    console.log('Line 293 content:', JSON.stringify(line));
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('h-screen') && lines[i].includes('p-12')) {
            console.log(`Found on line ${i + 1}:`, JSON.stringify(lines[i]));
        }
    }
} catch (e) {
    console.error(e);
}
