const fs = require('fs');

function commentOutStrings(file, strings) {
  let c = fs.readFileSync(file, 'utf8');
  for (const s of strings) {
    c = c.replace(new RegExp(s, 'g'), '/* ' + s + ' */');
  }
  fs.writeFileSync(file, c);
}

// ExcelUploadModal.tsx
commentOutStrings('src/components/ExcelUploadModal.tsx', [
  'Process in batches of 500 max',
  'Note: if ONETIME we technically require incomeSourceId,  but from Excel we might not have it mapped cleanly.  For now, let\'s leave incomeSourceId empty or add a validation if needed.'
]);

// ReportingTab.tsx
commentOutStrings('src/components/ReportingTab.tsx', [
  'Used for SALARY',
  'Used for ONETIME',
  'YYYY-MM',
  'To apply templates',
  'eslint-disable-next-line react-hooks/exhaustive-deps',
  'Update handling logic: Cleanly merge exact data fields without conflicting deletes',
  'Create',
  '1. בחירה בסוג הכנסה \\(קבועה או חדפ\\)',
  '2. סכום הוצאה',
  '2. סכום הכנסה',
  '3. תיאור',
  '3. כיס / תאריך - באותה שורה',
  '4. כיס / תאריך - באותה שורה',
  '4. האם ההכנסה עושרה\\?'
]);

// Dashboard.tsx
commentOutStrings('src/Dashboard.tsx', [
  'Navigate to report tab in edit mode',
  'Warning if no pockets',
  'Tab Content Routing',
  'Header',
  'Navigation Tabs - Bottom on mobile, top on desktop'
]);

console.log('Fixed bare strings');
