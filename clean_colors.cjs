const fs = require('fs');
const files = [
  'src/components/ReportingTab.tsx',
  'src/components/HistoryTab.tsx',
  'src/components/AnalyticsTab.tsx',
  'src/components/SettingsTab.tsx',
  'src/components/ExcelUploadModal.tsx',
  'src/Dashboard.tsx',
  'src/Auth.tsx'
];

for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  let before = text.length;
  // regex: match space + hyphen + color name + any characters (letters, numbers, dash, slash)
  text = text.replace(/ -(slate|emerald|rose|teal|amber|indigo|white|zinc)[a-zA-Z0-9/\-\[\]#]+/g, '');
  text = text.replace(/  +/g, ' '); // collapse spaces
  
  if (before !== text.length) {
    fs.writeFileSync(f, text);
    console.log('Fixed', f);
  }
}
