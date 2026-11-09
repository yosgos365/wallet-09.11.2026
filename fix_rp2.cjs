const fs = require('fs');
let c = fs.readFileSync('src/components/ReportingTab.tsx', 'utf8');
c = c.replace(/\/\* \/\* eslint-disable-next-line react-hooks\/exhaustive-deps \*\/ \*\//g, '/* lint */');
c = c.replace(/\/\* \/\* 1 \*\/ \*\//g, '/* 1 */');
c = c.replace(/\/\* \/\* 2 \*\/ \*\//g, '/* 2 */');
c = c.replace(/\/\* \/\* 3 \*\/ \*\//g, '/* 3 */');
c = c.replace(/\/\* \/\* 4 \*\/ \*\//g, '/* 4 */');
// catch any other /* /* ... */ */
c = c.replace(/\/\* \/\* [^*]+ \*\/ \*\//g, '/* comment */');
fs.writeFileSync('src/components/ReportingTab.tsx', c);
