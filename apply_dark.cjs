const fs = require('fs');

const mappings = [
  { p: /bg-white(?!\/)/g, r: 'bg-white dark:bg-slate-900' },
  { p: /bg-slate-50(?!\/|0)/g, r: 'bg-slate-50 dark:bg-slate-800/50' },
  { p: /bg-emerald-50(?!\/|0)/g, r: 'bg-emerald-50 dark:bg-emerald-900/30' },
  { p: /bg-rose-50(?!\/|0)/g, r: 'bg-rose-50 dark:bg-rose-900/20' },
  { p: /bg-amber-50(?!\/|0)/g, r: 'bg-amber-50 dark:bg-amber-900/20' },
  { p: /bg-blue-50(?!\/|0)/g, r: 'bg-blue-50 dark:bg-blue-900/20' },

  { p: /text-slate-900/g, r: 'text-slate-900 dark:text-slate-100' },
  { p: /text-slate-800/g, r: 'text-slate-800 dark:text-slate-200' },
  { p: /text-slate-700/g, r: 'text-slate-700 dark:text-slate-300' },
  { p: /text-slate-600/g, r: 'text-slate-600 dark:text-slate-400' },
  { p: /text-slate-500/g, r: 'text-slate-500 dark:text-slate-400' },

  { p: /text-emerald-900/g, r: 'text-emerald-900 dark:text-emerald-50' },
  { p: /text-emerald-800/g, r: 'text-emerald-800 dark:text-emerald-100' },
  { p: /text-emerald-700/g, r: 'text-emerald-700 dark:text-emerald-300' },

  { p: /text-rose-900/g, r: 'text-rose-900 dark:text-rose-50' },
  { p: /text-rose-800/g, r: 'text-rose-800 dark:text-rose-100' },
  { p: /text-rose-700/g, r: 'text-rose-700 dark:text-rose-300' },

  { p: /text-teal-900/g, r: 'text-teal-900 dark:text-teal-50' },

  { p: /border-slate-200/g, r: 'border-slate-200 dark:border-slate-700/60' },
  { p: /border-slate-100/g, r: 'border-slate-100 dark:border-slate-700/30' },
  { p: /border-emerald-100/g, r: 'border-emerald-100 dark:border-emerald-800/50' },
  { p: /border-rose-100/g, r: 'border-rose-100 dark:border-rose-800/50' },
];

const files = [
  'src/components/ReportingTab.tsx',
  'src/components/HistoryTab.tsx',
  'src/components/AnalyticsTab.tsx',
  'src/components/SettingsTab.tsx',
  'src/components/ExcelUploadModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Strip existing dual-classes to prevent infinite growth on rerun
  for (const map of mappings) {
     const injected = map.r.split(' ')[1]; // get the dark part
     content = content.split(` ${injected}`).join('');
  }

  for (const map of mappings) {
     content = content.replace(map.p, map.r);
  }

  fs.writeFileSync(file, content);
}
console.log('Applied dark mode mapping.');
