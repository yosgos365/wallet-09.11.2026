const fs = require('fs');
let c = fs.readFileSync('src/components/ReportingTab.tsx', 'utf8');
c = c.replace(/\/\* Create \*\/ \*\//g, '/* Create */');
fs.writeFileSync('src/components/ReportingTab.tsx', c);
