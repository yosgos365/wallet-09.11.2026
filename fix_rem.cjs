const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  if (file.includes('Dashboard')) {
    c = c.replace(/\{\/\* \/\* Header \*\/ \*\/\n\}/g, '{/* Header */}');
    c = c.replace(/\{\/\* \/\* Navigation Tabs - Bottom on mobile, top on desktop \*\/ \*\/\n\}/g, '{/* Navigation */}');
    c = c.replace(/\{\/\* \/\* Warning if no pockets \*\/ \*\/\n\}/g, '{/* Warning if no pockets */}');
    c = c.replace(/\{\/\* \/\* Tab Content Routing \*\/ \*\/\n\}/g, '{/* Tab Content Routing */}');
  }

  if (file.includes('ReportingTab')) {
    c = c.replace(/Used \nfor SALARY/g, '/* Used for SALARY */');
    c = c.replace(/Used \nfor ONETIME/g, '/* Used for ONETIME */');
    c = c.replace(/YYYY-MM/g, '/* YYYY-MM */');
    c = c.replace(/To apply templates/g, '/* To apply templates */');
    c = c.replace(/eslint-disable-next-line react-hooks\/exhaustive-deps/g, '/* eslint-disable-next-line react-hooks/exhaustive-deps */');
    c = c.replace(/Update handling logic: Cleanly merge exact data fields without conflicting deletes/g, '/* merge */');
    c = c.replace(/1\. בחירה בסוג הכנסה \n\(קבועה או חדפ\)/g, '/* 1 */');
    c = c.replace(/2\. סכום הוצאה/g, '/* 2 */');
    c = c.replace(/2\. סכום הכנסה/g, '/* 2 */');
    c = c.replace(/3\. תיאור/g, '/* 3 */');
    c = c.replace(/3\. כיס \/ תאריך - באותה שורה/g, '/* 3 */');
    c = c.replace(/4\. האם ההכנסה עושרה\?/g, '/* 4 */');
    c = c.replace(/4\. כיס \/ תאריך - באותה שורה/g, '/* 4 */');
    
    // extra stray
    c = c.replace(/Create/g, '/* Create */');
  }

  if (file.includes('ExcelUploadModal')) {
    c = c.replace(/Note:[\s\S]*?if needed\./g, '/* Note */');
  }

  fs.writeFileSync(file, c);
}

['src/Dashboard.tsx', 'src/components/ReportingTab.tsx', 'src/components/ExcelUploadModal.tsx'].forEach(fix);
