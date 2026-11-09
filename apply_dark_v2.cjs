const fs = require('fs');

const mappings = [
  // Backgrounds with opacity
  { p: /bg-white\/60/g, r: 'bg-white/60 dark:bg-slate-950/60' },
  { p: /bg-white\/95/g, r: 'bg-white/95 dark:bg-slate-950/95' },
  { p: /bg-slate-200\/60/g, r: 'bg-slate-200/60 dark:bg-slate-800/60' },
  { p: /bg-emerald-100\/30/g, r: 'bg-emerald-100/30 dark:bg-emerald-900/30' },
  { p: /bg-emerald-50\/80/g, r: 'bg-emerald-50/80 dark:bg-emerald-950/80' },
  { p: /bg-rose-50\/80/g, r: 'bg-rose-50/80 dark:bg-rose-950/80' },
  
  // Solid Backgrounds
  { p: /bg-white/g, r: 'bg-white dark:bg-slate-950' },
  { p: /bg-slate-50/g, r: 'bg-slate-50 dark:bg-slate-900' },
  { p: /bg-slate-100/g, r: 'bg-slate-100 dark:bg-slate-800' },
  { p: /bg-slate-200/g, r: 'bg-slate-200 dark:bg-slate-800' },
  { p: /bg-emerald-50/g, r: 'bg-emerald-50 dark:bg-emerald-950' },
  { p: /bg-emerald-100/g, r: 'bg-emerald-100 dark:bg-emerald-900' },
  { p: /bg-rose-50/g, r: 'bg-rose-50 dark:bg-rose-950' },
  { p: /bg-amber-50/g, r: 'bg-amber-50 dark:bg-amber-950' },
  { p: /bg-teal-50/g, r: 'bg-teal-50 dark:bg-teal-950' },
  { p: /bg-indigo-50/g, r: 'bg-indigo-50 dark:bg-indigo-950' },
  { p: /bg-indigo-100/g, r: 'bg-indigo-100 dark:bg-indigo-900/60' },
  
  // Custom auth colors and Dashboard shell
  { p: /from-emerald-950 via-emerald-900 to-teal-900/g, r: 'from-emerald-950 via-emerald-900 to-teal-900 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950' },
  { p: /from-emerald-50\/60 via-slate-50 to-teal-50\/40/g, r: 'from-emerald-50/60 via-slate-50 to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950' },
  { p: /bg-emerald-950/g, r: 'bg-emerald-950 dark:bg-slate-900' },

  // Text Colors
  { p: /text-slate-900/g, r: 'text-slate-900 dark:text-slate-100' },
  { p: /text-slate-800/g, r: 'text-slate-800 dark:text-slate-200' },
  { p: /text-slate-700/g, r: 'text-slate-700 dark:text-slate-300' },
  { p: /text-slate-600/g, r: 'text-slate-600 dark:text-slate-400' },
  { p: /text-slate-500/g, r: 'text-slate-500 dark:text-slate-400' },
  { p: /text-slate-400/g, r: 'text-slate-400 dark:text-slate-500' },
  
  { p: /text-emerald-900/g, r: 'text-emerald-900 dark:text-emerald-100' },
  { p: /text-emerald-800/g, r: 'text-emerald-800 dark:text-emerald-200' },
  { p: /text-emerald-700/g, r: 'text-emerald-700 dark:text-emerald-300' },
  { p: /text-emerald-600/g, r: 'text-emerald-600 dark:text-emerald-400' },
  
  { p: /text-rose-900/g, r: 'text-rose-900 dark:text-rose-100' },
  { p: /text-rose-800/g, r: 'text-rose-800 dark:text-rose-200' },
  { p: /text-rose-700/g, r: 'text-rose-700 dark:text-rose-300' },
  { p: /text-rose-600/g, r: 'text-rose-600 dark:text-rose-400' },

  { p: /text-teal-900/g, r: 'text-teal-900 dark:text-teal-100' },
  { p: /text-teal-600/g, r: 'text-teal-600 dark:text-teal-400' },
  { p: /text-indigo-800/g, r: 'text-indigo-800 dark:text-indigo-300' },
  { p: /text-amber-800/g, r: 'text-amber-800 dark:text-amber-300' },
  
  // Borders
  { p: /border-slate-200/g, r: 'border-slate-200 dark:border-slate-800' },
  { p: /border-slate-100/g, r: 'border-slate-100 dark:border-slate-800' },
  { p: /border-emerald-100(\/50)?/g, r: 'border-emerald-100$1 dark:border-emerald-800$1' },
  { p: /border-emerald-200(\/50)?/g, r: 'border-emerald-200$1 dark:border-emerald-800$1' },
  { p: /border-emerald-300/g, r: 'border-emerald-300 dark:border-emerald-700' },
  { p: /border-rose-200/g, r: 'border-rose-200 dark:border-rose-800' },
  { p: /border-rose-300/g, r: 'border-rose-300 dark:border-rose-800' },
  { p: /border-indigo-400/g, r: 'border-indigo-400 dark:border-indigo-600' },

  // Rings & shadows
  { p: /ring-slate-900\/5/g, r: 'ring-slate-900/5 dark:ring-white/10' },
  { p: /ring-rose-900\/10/g, r: 'ring-rose-900/10 dark:ring-rose-500/20' },
  { p: /ring-emerald-900\/10/g, r: 'ring-emerald-900/10 dark:ring-emerald-500/20' },
  
  // Specific auth fixes
  { p: /shadow-\[0_25px_60px_-15px_rgba\(0,0,0,0\.3\)\]/g, r: 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]' },
  { p: /border-emerald-500\/10(?! )/g, r: 'border-emerald-500/10 dark:border-emerald-500/20' }
];

const files = [
  'src/components/ReportingTab.tsx',
  'src/components/HistoryTab.tsx',
  'src/components/AnalyticsTab.tsx',
  'src/components/SettingsTab.tsx',
  'src/components/ExcelUploadModal.tsx',
  'src/Dashboard.tsx',
  'src/Auth.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Strip anything that looks like "dark:<something>" that might have been leftover
  content = content.replace(/dark:[a-zA-Z0-9/-\[\]\.\(\),]+/g, '');
  // normalize spaces
  content = content.replace(/\s+/g, ' ');

  // Read original file again for fresh replace
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/dark:[a-zA-Z0-9/-\[\]\.\(\),]+\s?/g, '');

  for (const map of mappings) {
     content = content.replace(map.p, map.r);
  }

  fs.writeFileSync(file, content);
}
console.log('Applied dark mode mapping v2.');
