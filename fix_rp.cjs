const fs = require('fs');
let c = fs.readFileSync('src/components/ReportingTab.tsx', 'utf8');
c = c.replace(/\/\* \/\* YYYY-MM \*\/ \*\//g, '/* YYYY-MM */');
c = c.replace(/\/\* \/\* To apply templates \*\/ \*\//g, '/* To apply templates */');
c = c.replace(/\/\* \/\* merge \*\/ \*\//g, '/* merge */');
c = c.replace(/\/\* \/\* Create \*\//g, '/* Create */');
fs.writeFileSync('src/components/ReportingTab.tsx', c);
