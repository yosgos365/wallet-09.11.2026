const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const replacement = `          </div>
          
          <div className="absolute top-3 right-3 sm:static sm:top-auto sm:right-auto flex flex-col gap-2 z-10 hidden sm:flex">
             <button 
                onClick={() => setIsExcelOpen(true)} 
                title="ייבוא אקסל"
                className="text-slate-400 hover:text-teal-600 bg-white sm:bg-teal-50 hover:bg-teal-100 p-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-medium tracking-tight transition-all shadow-sm active:scale-95 flex items-center justify-center border border-slate-200 sm:border-transparent"
             >
                <UploadCloud className="w-5 h-5" />
                <span className="hidden sm:inline-block mr-2">ייבוא</span>
             </button>
             <button
                onClick={toggleSelectAll}
                className={"bg-white hover:bg-slate-50 border border-slate-200 p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors " + (isAllSelected ? "text-teal-600 border-teal-200" : "text-slate-500")}
             >
                {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                <span className="hidden sm:inline-block">בחר הכל</span>
                <span className="sm:hidden">סנן</span>
             </button>
          </div>
          
          <div className="sm:hidden absolute top-3 right-3 flex flex-col gap-1 z-10">
             <button 
                onClick={() => setIsExcelOpen(true)} 
                title="ייבוא אקסל"
                className="text-slate-400 hover:text-teal-600 bg-white shadow-sm p-2 rounded-xl active:scale-95 flex items-center justify-center border border-slate-200"
             >
                <UploadCloud className="w-4 h-4" />
             </button>
             <button
                onClick={toggleSelectAll}
                title="בחר הכל"
                className={"bg-white shadow-sm p-2 rounded-xl active:scale-95 flex items-center justify-center border transition-colors " + (isAllSelected ? "text-teal-600 border-teal-200" : "text-slate-500 border-slate-200")}
             >
                {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
             </button>
          </div>
       </div>`;

code = code.replace(/<\/div>\s*<button\s*onClick=\{\(\) => setIsExcelOpen\(true\)\}\s*title="ייבוא אקסל"[\s\S]*?<\/button>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
console.log("Regex fallback applied.");
