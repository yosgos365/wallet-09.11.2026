const fs = require('fs');

function unminify(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/(const |let |var |if |return |for |switch |function |import |export |class |type |interface |try |catch |finally|await )/g, '\n$1');
  c = c.replace(/</g, '\n<');
  c = c.replace(/\}/g, '\n}\n');
  c = c.replace(/;/g, ';\n');
  fs.writeFileSync(file, c);
}

['src/components/ExcelUploadModal.tsx', 'src/components/ReportingTab.tsx', 'src/components/HistoryTab.tsx', 'src/Dashboard.tsx'].forEach(unminify);
console.log('Unminified files');
