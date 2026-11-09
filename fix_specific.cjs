const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  // Dashboard.tsx
  c = c.replace(/\/\/ Navigate to report tab in edit mode /g, '/* Navigate to report tab in edit mode */ ');
  c = c.replace(/\/\/ Warning if no pockets /g, '/* Warning if no pockets */ ');
  c = c.replace(/\/\/ Tab Content Routing /g, '/* Tab Content Routing */ ');
  c = c.replace(/\/\/ Header /g, '/* Header */ ');
  c = c.replace(/\/\/ Navigation Tabs - Bottom on mobile, top on desktop /g, '/* Navigation Tabs - Bottom on mobile, top on desktop */ ');

  // HistoryTab.tsx
  c = c.replace(/\/\/ Render tabs /g, '/* Render tabs */ ');

  // Auth.tsx
  c = c.replace(/\/\/ Settings \/ Dark Mode at the top /g, '/* Settings */ ');
  c = c.replace(/\/\/ Abstract background shapes mimicking premium fintech app glassmorphism /g, '/* Abstract background */ ');

  // Apply general fix for stray // \n created by last script
  c = c.replace(/\n\/\/\n/g, ' ');
  c = c.replace(/\n\/\/ \n/g, ' ');

  fs.writeFileSync(file, c);
}

['src/Dashboard.tsx', 'src/components/ExcelUploadModal.tsx', 'src/components/ReportingTab.tsx', 'src/components/HistoryTab.tsx', 'src/components/AnalyticsTab.tsx', 'src/components/SettingsTab.tsx', 'src/Auth.tsx'].forEach(fix);
console.log('Fixed specific comments');
