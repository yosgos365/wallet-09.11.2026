import { useState } from "react";

import { useAuth } from "./contexts/AuthContext";

import { logout } from "./lib/firebase";

import {
  useTransactions,
  usePockets,
  useIncomeSources,
  useFixedExpenses,
} from "./hooks/useData";

import { Transaction } from "./types";

import {
  LogOut,
  Settings2,
  Wallet,
  AlertTriangle,
  FileEdit,
  Undo2,
  PieChart,
  Mail,
  ShieldCheck,
  X,
  CheckCircle2,
} from "lucide-react";

import SettingsTab from "./components/SettingsTab";

import ReportingTab from "./components/ReportingTab";

import HistoryTab from "./components/HistoryTab";

import AnalyticsTab from "./components/AnalyticsTab";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: transactions, loading: loadingT } = useTransactions(user?.uid);

  const { data: pockets, loading: loadingP } = usePockets(user?.uid);

  const { data: incomeSources, loading: loadingI } = useIncomeSources(
    user?.uid,
  );

  const { data: fixedExpenses, loading: loadingF } = useFixedExpenses(
    user?.uid,
  );

  const [activeTab, setActiveTab] = useState<
    "reporting" | "history" | "analytics" | "settings"
  >("reporting");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  /* Navigate to report tab in edit mode */
  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setActiveTab("reporting");
  };
  const handleClearEdit = () => {
    setEditingTx(null);
    setActiveTab("history");
  };
  if (loadingT || loadingP || loadingI || loadingF) {
    return;
    <div
      className="min-h-screen flex items-center justify-center bg-zinc-50  font-sans"
      dir="rtl"
    >
      טוען נתונים מאובטחים מול השרת...
    </div>;
  }

  const hasPockets = pockets.length > 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40    text-slate-900  font-sans selection:bg-emerald-100  selection:text-emerald-900 "
      dir="rtl"
    >
      {" "}
      {/* Header */}
      <header className="bg-emerald-950  text-white sticky top-0 z-30 shadow-md rounded-b-2xl sm:rounded-b-none border-b border-transparent ">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50   text-emerald-300 p-2 rounded-xl ring-1 ring-emerald-500/30 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">פיננסים אישי</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab("settings")}
              className="hidden sm:flex p-2 text-emerald-100 hover:text-white hover:bg-emerald-900 rounded-full transition-colors"
              title="הגדרות"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-emerald-100 hover:text-rose-400 hover:bg-emerald-900 rounded-full transition-colors"
              title="יציאה מחשבון"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="relative p-0.5 rounded-full ring-2 ring-emerald-400/50 hover:ring-emerald-300 transition-all focus:outline-none focus:ring-emerald-300 ml-1 cursor-pointer group active:scale-95"
              title="פרטי חשבון Google"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Avatar"}
                  className="w-8 h-8 rounded-full select-none object-cover border border-emerald-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs select-none">
                  {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>{" "}
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white  border-t border-slate-200  pb-safe sm:pb-0 sm:static sm:bg-emerald-950  sm:sm:border-none sm:text-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:shadow-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex justify-around sm:justify-start sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab("reporting");
              setEditingTx(null);
            }}
            className={`flex-1 sm:flex-none py-3 sm:py-4 font-medium tracking-wide flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all sm:border-b-2 whitespace-nowrap text-xs sm:text-base ${
              activeTab === "reporting" && !editingTx
                ? "text-teal-600  sm:border-emerald-400 sm:text-emerald-400 "
                : "text-slate-400  sm:border-transparent sm:text-emerald-200/60 hover:text-teal-600  :text-teal-300 sm:hover:text-emerald-100"
            }
`}
          >
            <FileEdit className="w-5 h-5 sm:w-4 sm:h-4" /> דיווח חדש
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-none py-3 sm:py-4 font-medium tracking-wide flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all sm:border-b-2 whitespace-nowrap text-xs sm:text-base ${
              activeTab === "history" || editingTx
                ? "text-teal-600  sm:border-emerald-400 sm:text-emerald-400 "
                : "text-slate-400  sm:border-transparent sm:text-emerald-200/60 hover:text-teal-600  :text-teal-300 sm:hover:text-emerald-100"
            }
`}
          >
            <Undo2 className="w-5 h-5 sm:w-4 sm:h-4" /> היסטוריה
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 sm:flex-none py-3 sm:py-4 font-medium tracking-wide flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all sm:border-b-2 whitespace-nowrap text-xs sm:text-base ${
              activeTab === "analytics"
                ? "text-teal-600  sm:border-emerald-400 sm:text-emerald-400 "
                : "text-slate-400  sm:border-transparent sm:text-emerald-200/60 hover:text-teal-600  :text-teal-300 sm:hover:text-emerald-100"
            }
`}
          >
            <PieChart className="w-5 h-5 sm:w-4 sm:h-4" /> דוחות
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 sm:flex-none py-3 sm:py-4 font-medium tracking-wide flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all sm:border-b-2 whitespace-nowrap text-xs sm:text-base ${
              activeTab === "settings"
                ? "text-teal-600  sm:border-emerald-400 sm:text-emerald-400 "
                : "text-slate-400  sm:border-transparent sm:text-emerald-200/60 hover:text-teal-600  :text-teal-300 sm:hover:text-emerald-100"
            }
`}
          >
            <Settings2 className="w-5 h-5 sm:w-4 sm:h-4" /> הגדרות
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-1.5 sm:px-4 py-2 sm:py-8 pb-24 sm:pb-8 relative">
        {" "}
        {/* Warning 
if no pockets */}
        {!hasPockets && activeTab === "reporting" && (
          <div className="max-w-2xl mx-auto bg-amber-50  border border-amber-200 p-5 rounded-3xl flex items-start gap-4 mb-4 sm:mb-8 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">
                דרושה חובת הגדרה
              </h3>
              <p className="text-amber-800  mt-1 mb-4 leading-relaxed">
                לפני שניתן להזין דוחות עליך להגדיר לפחות מקור תשלום או כיס אחד
                במערכת.
              </p>
              <button
                onClick={() => setActiveTab("settings")}
                className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-amber-700 hover:shadow transition-all"
              >
                {" "}
                הגדר מקור שימוש עכשיו
              </button>
            </div>
          </div>
        )}
        {/* Tab Content Routing */}
        {activeTab === "reporting" && (
          <div>
            {" "}
            {hasPockets ? (
              <ReportingTab
                pockets={pockets}
                incomeSources={incomeSources}
                fixedExpenses={fixedExpenses}
                editingTx={editingTx}
                onClearEdit={handleClearEdit}
              />
            ) : (
              <div className="text-center text-zinc-400 py-12">
                המשך פעולה חסומה.
              </div>
            )}
          </div>
        )}
        {activeTab === "history" && (
          <div>
            <HistoryTab
              transactions={transactions}
              pockets={pockets}
              incomeSources={incomeSources}
              onEdit={handleEditTx}
            />
          </div>
        )}
        {activeTab === "analytics" && (
          <div>
            <AnalyticsTab
              transactions={transactions}
              pockets={pockets}
              incomeSources={incomeSources}
            />
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            <SettingsTab
              pockets={pockets}
              incomeSources={incomeSources}
              fixedExpenses={fixedExpenses}
            />
          </div>
        )}
      </main>

      {/* Google Account Profile Modal */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-sm w-full border border-slate-100 relative text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <div className="relative mb-3.5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Google User"}
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500/20 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-800 text-white flex items-center justify-center text-3xl font-black border-4 border-emerald-500/20 shadow-md">
                    {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-sm"
                  title="חשבון מאומת"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {user?.displayName || "משתמש Google"}
              </h3>

              <div
                className="flex items-center gap-1.5 text-slate-600 text-sm mt-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60 font-mono"
                dir="ltr"
              >
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[220px]">
                  {user?.email || "אין כתובת מייל"}
                </span>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-right text-xs text-emerald-900 space-y-1">
                  <div className="font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> חשבון מחובר ומאובטח
                  </div>
                  <p className="text-emerald-700/80 leading-relaxed">
                    הנתונים והדוחות שלך מסונכרנים בזמן אמת עם מסד הנתונים בענן.
                  </p>
                </div>

                <div className="flex gap-2 w-full pt-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      logout();
                    }}
                    className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border border-rose-200"
                  >
                    <LogOut className="w-4 h-4" /> התנתק
                  </button>
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    סגור
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
