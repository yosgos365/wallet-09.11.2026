const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove dark: classes
    content = content.replace(/dark:[A-Za-z0-9\-\/\[\]\#\.\%\:]+/g, '');

    // Remove DarkModeToggle imports
    content = content.replace(/import\s+DarkModeToggle\s+from\s+[^;]+;?\n/g, '');

    // Remove DarkModeToggle usage
    content = content.replace(/<DarkModeToggle\s*\/>/g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

walkDir('src');
