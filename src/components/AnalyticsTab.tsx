import { useState, useEffect, useMemo } from "react";
import { Transaction, Pocket, IncomeSource } from "../types";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  ArrowUpDown,
  Coins,
  TrendingUp,
  BarChart3,
  LineChart,
  X,
  Layers,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatDate, formatCurrency } from "../lib/utils";
import { useSettings } from "../contexts/SettingsContext";

type Props = {
  transactions: Transaction[];
  pockets: Pocket[];
  incomeSources: IncomeSource[];
};

type MetricType = "balance" | "tithe" | "income" | "expense" | "investment";

export default function AnalyticsTab({
  transactions,
  pockets,
  incomeSources,
}: Props) {
  const { settings } = useSettings();

  const getTxMonth = (t: Transaction) => {
    if (t.type === "income" && t.incomeType === "SALARY" && t.salaryMonth) {
      return t.salaryMonth;
    }
    return t.date ? t.date.substring(0, 7) : "";
  };

  const monthsOptions = useMemo(() => {
    const s = new Set<string>();
    transactions.forEach((t) => {
      const ym = getTxMonth(t);
      if (ym) s.add(ym);
    });
    return Array.from(s).sort().reverse();
  }, [transactions]);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedPocketId, setSelectedPocketId] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"date" | "category" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Graph Modal state
  const [activeGraphMetric, setActiveGraphMetric] = useState<MetricType | null>(null);
  const [graphViewMode, setGraphViewMode] = useState<"line" | "bar">("line");
  const [hoveredEntryIndex, setHoveredEntryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (monthsOptions.length > 0 && !selectedMonth) {
      setSelectedMonth(monthsOptions[0]);
    } else if (monthsOptions.length === 0) {
      setSelectedMonth("");
    }
  }, [monthsOptions, selectedMonth]);

  // Filtered transactions for the current view
  const filteredTxs = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonth !== "ALL" && getTxMonth(t) !== selectedMonth) {
        return false;
      }
      if (selectedPocketId !== "ALL" && t.pocketId !== selectedPocketId) {
        return false;
      }
      return true;
    });
  }, [transactions, selectedMonth, selectedPocketId]);

  // Stats calculation for the selected period / pocket
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let regularExpense = 0;
    let investment = 0;
    let tithedAmount = 0;

    filteredTxs.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
        if (t.isTithed) {
          tithedAmount += t.amount * 0.2;
        }
      } else {
        expense += t.amount;
        if (t.isInvestment) {
          investment += t.amount;
        } else {
          regularExpense += t.amount;
        }
      }
    });

    return {
      income,
      expense,
      regularExpense,
      investment,
      tithedAmount,
      balance: income - expense - tithedAmount,
    };
  }, [filteredTxs]);

  // Sorted list for transaction tables
  const sortedTxs = useMemo(() => {
    return [...filteredTxs].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "amount") {
        cmp = a.amount - b.amount;
      } else {
        const descA = a.description || "";
        const descB = b.description || "";
        cmp = descA.localeCompare(descB);
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [filteredTxs, sortField, sortOrder]);

  const incomesList = sortedTxs.filter((t) => t.type === "income");
  const expensesList = sortedTxs.filter((t) => t.type === "expense");

  const formatMonth = (ym: string) => {
    if (ym === "ALL") return "כל החודשים";
    if (!ym || !ym.includes("-")) return ym;
    const [year, month] = ym.split("-");
    const mName = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ][parseInt(month, 10) - 1];
    return `${mName} ${year}`;
  };

  const selectedPocketName = useMemo(() => {
    if (selectedPocketId === "ALL") return null;
    return pockets.find((p) => p.id === selectedPocketId)?.name || null;
  }, [selectedPocketId, pockets]);

  // Monthly historical data calculation for the Graph Modal
  const graphData = useMemo(() => {
    if (!activeGraphMetric) return null;

    // Filter by pocket if one is selected, but include ALL months from beginning to today
    const relevantTxs = transactions.filter((t) => {
      if (selectedPocketId !== "ALL" && t.pocketId !== selectedPocketId) {
        return false;
      }
      return true;
    });

    // Group by month
    const monthMap = new Map<string, number>();
    // Collect all chronological months
    const allMonths = Array.from(
      new Set(
        relevantTxs
          .map((t) => getTxMonth(t))
          .filter(Boolean),
      ),
    ).sort(); // chronological order: oldest to newest

    allMonths.forEach((m) => monthMap.set(m, 0));

    relevantTxs.forEach((t) => {
      const ym = getTxMonth(t);
      if (!ym) return;
      const current = monthMap.get(ym) || 0;

      if (activeGraphMetric === "income" && t.type === "income") {
        monthMap.set(ym, current + t.amount);
      } else if (activeGraphMetric === "expense" && t.type === "expense") {
        monthMap.set(ym, current + t.amount);
      } else if (activeGraphMetric === "investment" && t.type === "expense" && t.isInvestment) {
        monthMap.set(ym, current + t.amount);
      } else if (activeGraphMetric === "tithe" && t.type === "income" && t.isTithed) {
        monthMap.set(ym, current + t.amount * 0.2);
      } else if (activeGraphMetric === "balance") {
        if (t.type === "income") {
          const tithe = t.isTithed ? t.amount * 0.2 : 0;
          monthMap.set(ym, current + t.amount - tithe);
        } else {
          monthMap.set(ym, current - t.amount);
        }
      }
    });

    const entries = allMonths.map((month) => ({
      month,
      monthLabel: formatMonth(month),
      amount: monthMap.get(month) || 0,
    }));

    const totalAllTime = entries.reduce((acc, curr) => acc + curr.amount, 0);
    const avgMonthly = entries.length > 0 ? totalAllTime / entries.length : 0;
    const maxEntry = entries.reduce(
      (max, curr) => (curr.amount > max.amount ? curr : max),
      entries[0] || { month: "", monthLabel: "", amount: 0 },
    );

    return {
      entries,
      totalAllTime,
      avgMonthly,
      maxEntry,
    };
  }, [activeGraphMetric, transactions, selectedPocketId]);

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-500 bg-white rounded-2xl shadow-sm border border-zinc-200">
        אין עדיין נתונים זמינים לדוחות.
      </div>
    );
  }

  const renderTable = (list: Transaction[], isIncome: boolean) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-3 shadow-xs">
      <div className="divide-y divide-slate-100">
        {list.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-xs">
            אין נתונים להצגה בסינון הנוכחי.
          </div>
        ) : (
          list.map((t) => {
            const pocketName =
              pockets.find((p) => p.id === t.pocketId)?.name || "---";
            const isSalary = t.type === "income" && t.incomeType === "SALARY";
            const isOnetime = t.type === "income" && t.incomeType === "ONETIME";
            const extraSource = isSalary
              ? `מקור: ${incomeSources.find((s) => s.id === t.incomeSourceId)?.name || "---"}`
              : isOnetime && t.incomeSourceText
                ? `מאת: ${t.incomeSourceText}`
                : "";
            return (
              <div
                key={t.id}
                className={`flex items-center justify-between p-3 border-b last:border-b-0 transition-colors text-right ${
                  isIncome
                    ? "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-50"
                    : t.isInvestment
                      ? "bg-indigo-50/70 hover:bg-indigo-100/70 border-indigo-50"
                      : "bg-rose-50 hover:bg-rose-100/80 border-rose-50"
                }`}
              >
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-base truncate ${
                        isIncome
                          ? "text-emerald-950"
                          : t.isInvestment
                            ? "text-indigo-950"
                            : "text-rose-950"
                      }`}
                      title={t.description}
                    >
                      {t.description}
                    </span>
                    {t.isInvestment && (
                      <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 shrink-0 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> השקעה
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-sm text-zinc-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">
                      {formatDate(t.date)}
                    </span>
                    <span>•</span>
                    <span>{pocketName}</span>
                    {extraSource && (
                      <>
                        <span>•</span>
                        <span
                          className={`font-medium ${isIncome ? "text-emerald-700" : "text-rose-700"}`}
                        >
                          {extraSource}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={`shrink-0 text-left font-mono font-bold text-base pl-1 ${
                    isIncome
                      ? "text-emerald-700"
                      : t.isInvestment
                        ? "text-indigo-700"
                        : "text-rose-700"
                  }`}
                  dir="ltr"
                >
                  {!isIncome && "-"}
                  {formatCurrency(t.amount, settings.currency)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5" dir="rtl">
      {/* Filters Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white border border-slate-200 p-3 sm:p-4 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>דוחות וניתוח פיננסי</span>
            {selectedPocketName && (
              <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                מעקב כיס: {selectedPocketName}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            לחץ על כל אחת מהבועות לצפייה בגרף מגמה וחישוב סה״כ מההתחלה עד היום.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Pocket Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs flex-1 sm:flex-initial">
            <Layers className="w-4 h-4 text-teal-600 shrink-0" />
            <select
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer py-1 w-full"
              value={selectedPocketId}
              onChange={(e) => setSelectedPocketId(e.target.value)}
              title="סנן לפי כיס / אמצעי תשלום"
            >
              <option value="ALL">כל הכיסים</option>
              {pockets.map((p) => (
                <option key={p.id} value={p.id}>
                  כיס: {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month / All Period Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <select
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer py-1 w-full min-w-[130px]"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              title="בחר חודש או הצג את כל החודשים"
            >
              <option value="ALL">כל החודשים (מצטבר)</option>
              {monthsOptions.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonth(ym)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {/* Balance Card */}
        <div
          onClick={() => setActiveGraphMetric("balance")}
          className="bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col justify-between text-center relative overflow-hidden group shadow-md hover:shadow-xl hover:border-teal-500/40 transition-all p-3.5 min-h-[90px] sm:min-h-[105px] cursor-pointer"
          title="לחץ לצפייה בגרף יתרה לאורך כל החודשים"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
            <Wallet className="w-16 h-16 text-slate-300" />
          </div>
          <div className="flex items-center justify-between w-full z-10">
            <div className="text-zinc-400 font-bold flex items-center gap-1.5 text-base sm:text-lg">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
              יתרה
            </div>
            <span className="text-[11px] bg-slate-800/80 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20 opacity-90 group-hover:opacity-100 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> גרף
            </span>
          </div>
          <div
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight z-10 text-teal-300 select-all break-words w-full my-auto"
            dir="ltr"
          >
            {formatCurrency(stats.balance, settings.currency)}
          </div>
        </div>

        {/* Charity / Tithe Card */}
        <div
          onClick={() => setActiveGraphMetric("tithe")}
          className="bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-2xl flex flex-col justify-between text-center relative overflow-hidden group shadow-sm hover:shadow-md hover:border-indigo-400 transition-all p-3.5 min-h-[90px] sm:min-h-[105px] cursor-pointer"
          title="לחץ לצפייה בגרף צדקה לאורך כל החודשים"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
            <Coins className="w-16 h-16 text-indigo-700" />
          </div>
          <div className="flex items-center justify-between w-full z-10">
            <div className="text-indigo-800 font-bold flex items-center gap-1.5 text-base sm:text-lg">
              <Coins className="w-4 h-4 text-indigo-600" /> צדקה / מעשר
            </div>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200 opacity-90 group-hover:opacity-100 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> גרף
            </span>
          </div>
          <div
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-indigo-700 z-10 break-words w-full my-auto"
            dir="ltr"
          >
            {formatCurrency(stats.tithedAmount, settings.currency)}
          </div>
        </div>

        {/* Income Card */}
        <div
          onClick={() => setActiveGraphMetric("income")}
          className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl flex flex-col justify-between text-center relative overflow-hidden group shadow-sm hover:shadow-md hover:border-emerald-400 transition-all p-3.5 min-h-[90px] sm:min-h-[105px] cursor-pointer"
          title="לחץ לצפייה בגרף הכנסות לאורך כל החודשים"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
            <ArrowUpCircle className="w-16 h-16 text-emerald-700" />
          </div>
          <div className="flex items-center justify-between w-full z-10">
            <div className="text-emerald-800 font-bold flex items-center gap-1.5 text-base sm:text-lg">
              <ArrowUpCircle className="w-4 h-4 text-emerald-600" /> הכנסות
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 opacity-90 group-hover:opacity-100 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> גרף
            </span>
          </div>
          <div
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 z-10 break-words w-full my-auto"
            dir="ltr"
          >
            {formatCurrency(stats.income, settings.currency)}
          </div>
        </div>

        {/* Expenses Card */}
        <div
          onClick={() => setActiveGraphMetric("expense")}
          className="bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl flex flex-col justify-between text-center relative overflow-hidden group shadow-sm hover:shadow-md hover:border-rose-400 transition-all p-3.5 min-h-[90px] sm:min-h-[105px] cursor-pointer"
          title="לחץ לצפייה בגרף הוצאות לאורך כל החודשים"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
            <ArrowDownCircle className="w-16 h-16 text-rose-700" />
          </div>
          <div className="flex items-center justify-between w-full z-10">
            <div className="text-rose-800 font-bold flex items-center gap-1.5 text-base sm:text-lg">
              <ArrowDownCircle className="w-4 h-4 text-rose-600" /> הוצאות
            </div>
            <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200 opacity-90 group-hover:opacity-100 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> גרף
            </span>
          </div>
          <div
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-700 z-10 break-words w-full my-auto"
            dir="ltr"
          >
            {formatCurrency(stats.expense, settings.currency)}
          </div>
        </div>
      </div>

      {/* 5th Bubble: Investment Tracking Bar - Narrow & Long */}
      <div
        onClick={() => setActiveGraphMetric("investment")}
        className="w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-700/60 hover:border-indigo-400/80 text-white rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
        title="לחץ לצפייה בגרף השקעות"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold text-white tracking-tight">
            השקעות
          </span>
        </div>

        <div className="flex items-center gap-2.5" dir="ltr">
          <span className="text-xl sm:text-2xl font-black font-mono text-indigo-300 tracking-tight">
            {formatCurrency(stats.investment, settings.currency)}
          </span>
          <BarChart3 className="w-4 h-4 text-indigo-400/60 group-hover:text-indigo-300 transition-colors" />
        </div>
      </div>

      {/* Movement Details Breakdown */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-zinc-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-800">
              פירוט תנועות {selectedMonth === "ALL" ? "(כל החודשים)" : `ל-${formatMonth(selectedMonth)}`}
            </h3>
            {selectedPocketName && (
              <span className="text-xs text-teal-700 font-medium">
                מסונן עבור כיס: {selectedPocketName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-500">מיון לפי:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-zinc-900 focus:outline-none text-sm"
              >
                <option value="date">תאריך</option>
                <option value="category">קטגוריה (תיאור)</option>
                <option value="amount">סכום</option>
              </select>
            </div>
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="p-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600 transition-colors"
              title={sortOrder === "asc" ? "סדר עולה" : "סדר יורד"}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-emerald-700 flex items-center gap-2 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
              <ArrowUpCircle className="w-4 h-4" /> הכנסות ({incomesList.length})
            </h4>
            {renderTable(incomesList, true)}
          </div>
          <div>
            <h4 className="font-bold text-rose-700 flex items-center gap-2 bg-rose-50 w-fit px-3 py-1 rounded-lg">
              <ArrowDownCircle className="w-4 h-4" /> הוצאות ({expensesList.length})
            </h4>
            {renderTable(expensesList, false)}
          </div>
        </div>
      </div>

      {/* Graph Modal - Trend across all months */}
      {activeGraphMetric && graphData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveGraphMetric(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl max-w-2xl w-full border border-slate-100 relative text-right animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`p-2 rounded-xl text-white ${
                      activeGraphMetric === "income"
                        ? "bg-emerald-600"
                        : activeGraphMetric === "expense"
                          ? "bg-rose-600"
                          : activeGraphMetric === "investment"
                            ? "bg-indigo-600"
                            : activeGraphMetric === "tithe"
                              ? "bg-indigo-500"
                              : "bg-slate-900"
                    }`}
                  >
                    {activeGraphMetric === "income" && <ArrowUpCircle className="w-5 h-5" />}
                    {activeGraphMetric === "expense" && <ArrowDownCircle className="w-5 h-5" />}
                    {activeGraphMetric === "investment" && <TrendingUp className="w-5 h-5" />}
                    {activeGraphMetric === "tithe" && <Coins className="w-5 h-5" />}
                    {activeGraphMetric === "balance" && <Wallet className="w-5 h-5" />}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {activeGraphMetric === "income" && "גרף מגמת הכנסות"}
                      {activeGraphMetric === "expense" && "גרף מגמת הוצאות"}
                      {activeGraphMetric === "investment" && "גרף מגמת השקעות"}
                      {activeGraphMetric === "tithe" && "גרף מגמת צדקה / מעשר"}
                      {activeGraphMetric === "balance" && "גרף מגמת יתרה נטו"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      התפלגות חודשית מההתחלה ועד היום {selectedPocketName ? `(כיס: ${selectedPocketName})` : "(כל הכיסים)"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveGraphMetric(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="סגור חלונית"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Stats Summary */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-5">
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/70 text-center">
                <span className="text-xs font-semibold text-slate-500 block">סה״כ מצטבר</span>
                <span className="text-lg sm:text-2xl font-black font-mono text-slate-900 block mt-1" dir="ltr">
                  {formatCurrency(graphData.totalAllTime, settings.currency)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/70 text-center">
                <span className="text-xs font-semibold text-slate-500 block">ממוצע חודשי</span>
                <span className="text-lg sm:text-2xl font-black font-mono text-slate-700 block mt-1" dir="ltr">
                  {formatCurrency(graphData.avgMonthly, settings.currency)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/70 text-center">
                <span className="text-xs font-semibold text-slate-500 block">חודש שיא</span>
                <span className="text-sm sm:text-base font-bold text-slate-800 block mt-1 truncate">
                  {graphData.maxEntry.monthLabel || "---"}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500" dir="ltr">
                  {formatCurrency(graphData.maxEntry.amount, settings.currency)}
                </span>
              </div>
            </div>

            {/* Visual Chart Section (Switchable between Continuous Line & Bar Column Chart) */}
            <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl shadow-inner my-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-zinc-400 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span>סדר כרונולוגי חודשי</span>
                  {hoveredEntryIndex !== null && graphData.entries[hoveredEntryIndex] && (
                    <span className="text-white font-mono font-bold bg-indigo-600/60 px-2 py-0.5 rounded-md border border-indigo-500/50">
                      {graphData.entries[hoveredEntryIndex].monthLabel}: {formatCurrency(graphData.entries[hoveredEntryIndex].amount, settings.currency)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-zinc-800/90 p-1 rounded-xl border border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setGraphViewMode("line")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      graphViewMode === "line"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="גרף רציף"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    <span>גרף רציף</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraphViewMode("bar")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      graphViewMode === "bar"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="תרשים עמודות"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>עמודות</span>
                  </button>
                </div>
              </div>

              {graphData.entries.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">אין נתונים זמינים.</div>
              ) : graphViewMode === "line" ? (
                <div className="w-full pt-1 pb-2">
                  {(() => {
                    const N = graphData.entries.length;
                    const amounts = graphData.entries.map((e) => e.amount);
                    const isBalance = activeGraphMetric === "balance";
                    const minVal = isBalance ? Math.min(0, ...amounts) : 0;
                    const maxVal = Math.max(...amounts, 1);
                    const range = maxVal - minVal || 1;

                    const svgWidth = 600;
                    const svgHeight = 220;
                    const padLeft = 45;
                    const padRight = 35;
                    const padTop = 22;
                    const padBottom = 35;
                    const plotW = svgWidth - padLeft - padRight;
                    const plotH = svgHeight - padTop - padBottom;

                    const points = graphData.entries.map((entry, idx) => {
                      const x = N === 1 ? padLeft + plotW / 2 : padLeft + (idx / (N - 1)) * plotW;
                      const y = padTop + ((maxVal - entry.amount) / range) * plotH;
                      return { x, y, entry, idx };
                    });

                    const zeroY = Math.min(
                      Math.max(padTop + ((maxVal - 0) / range) * plotH, padTop),
                      padTop + plotH,
                    );

                    let linePath = "";
                    if (points.length === 1) {
                      linePath = `M ${points[0].x - 25} ${points[0].y} L ${points[0].x + 25} ${points[0].y}`;
                    } else if (points.length > 1) {
                      linePath = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 1; i < points.length; i++) {
                        const prev = points[i - 1];
                        const curr = points[i];
                        const cpx1 = prev.x + (curr.x - prev.x) / 2;
                        const cpy1 = prev.y;
                        const cpx2 = prev.x + (curr.x - prev.x) / 2;
                        const cpy2 = curr.y;
                        linePath += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
                      }
                    }

                    const areaPath =
                      points.length > 1
                        ? `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`
                        : "";

                    const colorHex =
                      activeGraphMetric === "income"
                        ? "#10b981"
                        : activeGraphMetric === "expense"
                          ? "#f43f5e"
                          : activeGraphMetric === "investment"
                            ? "#818cf8"
                            : activeGraphMetric === "tithe"
                              ? "#a78bfa"
                              : "#14b8a6";

                    return (
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-52 sm:h-60 overflow-visible"
                      >
                        <defs>
                          <linearGradient id="metricAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colorHex} stopOpacity="0.45" />
                            <stop offset="100%" stopColor={colorHex} stopOpacity="0.02" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines (horizontal) */}
                        {[0, 0.33, 0.66, 1].map((pct, gIdx) => {
                          const gy = padTop + pct * plotH;
                          const gVal = maxVal - pct * range;
                          return (
                            <g key={gIdx}>
                              <line
                                x1={padLeft}
                                y1={gy}
                                x2={svgWidth - padRight}
                                y2={gy}
                                stroke="#334155"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />
                              <text
                                x={padLeft - 6}
                                y={gy + 3}
                                textAnchor="end"
                                fill="#64748b"
                                fontSize="10"
                                fontFamily="monospace"
                              >
                                {gVal >= 1000 ? `${Math.round(gVal / 1000)}k` : Math.round(gVal)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Area Fill */}
                        {areaPath && (
                          <path
                            d={areaPath}
                            fill="url(#metricAreaGrad)"
                            className="transition-all duration-300"
                          />
                        )}

                        {/* Continuous Trend Line */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke={colorHex}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-md"
                          />
                        )}

                        {/* Interactive Data Points */}
                        {points.map((pt) => {
                          const isHovered = hoveredEntryIndex === pt.idx;
                          return (
                            <g
                              key={pt.entry.month}
                              className="cursor-pointer group"
                              onMouseEnter={() => setHoveredEntryIndex(pt.idx)}
                              onMouseLeave={() => setHoveredEntryIndex(null)}
                            >
                              {/* Hover vertical guide line */}
                              {isHovered && (
                                <line
                                  x1={pt.x}
                                  y1={padTop}
                                  x2={pt.x}
                                  y2={padTop + plotH}
                                  stroke={colorHex}
                                  strokeWidth="1.5"
                                  strokeDasharray="2 2"
                                  opacity="0.8"
                                />
                              )}

                              {/* Invisible hit box for easier hover */}
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={14}
                                fill="transparent"
                              />

                              {/* Point Circle */}
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 6 : 4}
                                fill={isHovered ? "#ffffff" : colorHex}
                                stroke={colorHex}
                                strokeWidth={isHovered ? 3 : 2}
                                className="transition-all duration-200"
                              />

                              {/* Amount Label */}
                              <text
                                x={pt.x}
                                y={pt.y - 10}
                                textAnchor="middle"
                                fill={isHovered ? "#ffffff" : "#94a3b8"}
                                fontSize={isHovered ? "11" : "9"}
                                fontWeight={isHovered ? "bold" : "normal"}
                                fontFamily="monospace"
                                className="pointer-events-none transition-all"
                              >
                                {pt.entry.amount >= 1000
                                  ? `${Math.round(pt.entry.amount / 1000)}k`
                                  : Math.round(pt.entry.amount)}
                              </text>

                              {/* X Axis Month Label */}
                              <text
                                x={pt.x}
                                y={svgHeight - 12}
                                textAnchor="middle"
                                fill="#94a3b8"
                                fontSize="10"
                                fontFamily="sans-serif"
                                fontWeight={isHovered ? "bold" : "normal"}
                                className="pointer-events-none"
                              >
                                {pt.entry.month.substring(2)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-end gap-2 sm:gap-4 h-48 sm:h-56 pt-6 pb-2 px-1 overflow-x-auto no-scrollbar">
                  {graphData.entries.map((entry) => {
                    const maxVal = Math.max(graphData.maxEntry.amount, 1);
                    const heightPercent = Math.max(
                      Math.round((Math.abs(entry.amount) / maxVal) * 100),
                      entry.amount > 0 ? 8 : 4,
                    );

                    const barColor =
                      activeGraphMetric === "income"
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                        : activeGraphMetric === "expense"
                          ? "bg-gradient-to-t from-rose-600 to-rose-400"
                          : activeGraphMetric === "investment"
                            ? "bg-gradient-to-t from-indigo-600 to-indigo-400"
                            : activeGraphMetric === "tithe"
                              ? "bg-gradient-to-t from-indigo-500 to-indigo-300"
                              : entry.amount >= 0
                                ? "bg-gradient-to-t from-teal-600 to-teal-400"
                                : "bg-gradient-to-t from-rose-700 to-rose-500";

                    return (
                      <div
                        key={entry.month}
                        className="flex-1 flex flex-col items-center justify-end h-full min-w-[45px] sm:min-w-[55px] group relative"
                      >
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black/90 text-white text-[11px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                          {formatCurrency(entry.amount, settings.currency)}
                        </div>

                        {/* Amount over bar (on larger screen) */}
                        <span className="text-[10px] font-mono text-zinc-400 mb-1 opacity-0 group-hover:opacity-100 sm:opacity-80 transition-opacity truncate max-w-full">
                          {entry.amount >= 1000 ? `${Math.round(entry.amount / 1000)}k` : Math.round(entry.amount)}
                        </span>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${barColor} shadow-md`}
                        />

                        {/* Month Label */}
                        <span className="text-[11px] text-zinc-400 mt-2 whitespace-nowrap font-medium rotate-[-25deg] origin-top-right">
                          {entry.month.substring(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Month-by-month Table Breakdown */}
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-800 mb-2">פירוט סכומים לפי חודשים</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {[...graphData.entries].reverse().map((entry) => (
                  <div
                    key={entry.month}
                    className="flex justify-between items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{entry.monthLabel}</span>
                    <span className="font-mono font-bold text-slate-900" dir="ltr">
                      {formatCurrency(entry.amount, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveGraphMetric(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
