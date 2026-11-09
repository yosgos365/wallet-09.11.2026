const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  // ExcelUploadModal.tsx
  c = c.replace(/\/\/ Process in batches of 500 max /g, '/* Process in batches of 500 max */ ');
  c = c.replace(/\/\/ Note: if ONETIME we technically require incomeSourceId, but from Excel we might not have it mapped cleanly. For now, let's leave incomeSourceId empty or add a validation if needed. /g, '/* Note: if ONETIME we technically require incomeSourceId, but from Excel we might not have it mapped cleanly. For now, let\'s leave incomeSourceId empty or add a validation if needed. */ ');

  // ReportingTab.tsx
  c = c.replace(/\/\/ Used for SALARY /g, '/* Used for SALARY */ ');
  c = c.replace(/\/\/ Used for ONETIME /g, '/* Used for ONETIME */ ');
  c = c.replace(/\/\/ YYYY-MM /g, '/* YYYY-MM */ ');
  c = c.replace(/\/\/ To apply templates /g, '/* To apply templates */ ');
  c = c.replace(/\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps /g, '/* eslint-disable-next-line react-hooks/exhaustive-deps */ ');
  c = c.replace(/\/\/ Update handling logic: Cleanly merge exact data fields without conflicting deletes /g, '/* Update handling logic: Cleanly merge exact data fields without conflicting deletes */ ');
  c = c.replace(/\/\/ Create /g, '/* Create */ ');
  c = c.replace(/\/\/ 1\. בחירה בסוג הכנסה \(קבועה או חדפ\) /g, '/* 1. בחירה בסוג הכנסה */ ');
  c = c.replace(/\/\/ 2\. סכום הוצאה /g, '/* 2. סכום הוצאה */ ');
  c = c.replace(/\/\/ 2\. סכום הכנסה /g, '/* 2. סכום הכנסה */ ');
  c = c.replace(/\/\/ 3\. תיאור /g, '/* 3. תיאור */ ');
  c = c.replace(/\/\/ 3\. כיס \/ תאריך - באותה שורה /g, '/* 3. כיס */ ');
  c = c.replace(/\/\/ 4\. כיס \/ תאריך - באותה שורה /g, '/* 4. כיס */ ');
  c = c.replace(/\/\/ 4\. האם ההכנסה עושרה\? /g, '/* 4. האם ההכנסה עושרה? */ ');

  fs.writeFileSync(file, c);
}

['src/components/ExcelUploadModal.tsx', 'src/components/ReportingTab.tsx'].forEach(fix);
console.log('Fixed specific comments');
