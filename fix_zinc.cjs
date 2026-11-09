const fs = require('fs');

const mappings = [
  { p: /bg-zinc-50/g, r: 'bg-zinc-50 dark:bg-slate-900' },
  { p: /bg-zinc-100/g, r: 'bg-zinc-100 dark:bg-slate-800' },
  { p: /text-zinc-600/g, r: 'text-zinc-600 dark:text-zinc-400' },
  { p: /border-zinc-200/g, r: 'border-zinc-200 dark:border-slate-700' },
  { p: /border-zinc-300/g, r: 'border-zinc-300 dark:border-slate-600' },
  { p: /focus:ring-zinc-900/g, r: 'focus:ring-zinc-900 dark:focus:ring-zinc-400' },
  { p: /hover:bg-zinc-50/g, r: 'hover:bg-zinc-50 dark:hover:bg-slate-800' },
  { p: /hover:bg-zinc-100/g, r: 'hover:bg-zinc-100 dark:hover:bg-slate-800' }
];

const files = [
  'src/components/HistoryTab.tsx',
  'src/components/AnalyticsTab.tsx',
  'src/components/ExcelUploadModal.tsx',
  'src/Dashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const map of mappings) {
     content = content.replace(map.p, map.r);
  }
  // eliminate duplicates like `dark:bg-slate-900 dark:bg-slate-900`
  content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
  content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
  content = content.replace(/dark:text-zinc-400 dark:text-zinc-400/g, 'dark:text-zinc-400');
  content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
  
  fs.writeFileSync(file, content);
}
console.log('Fixed zinc colors.');
