import { useState, useMemo } from "react";

import { Transaction } from "../types";

import { formatDate, formatCurrency } from "../lib/utils";
import { useSettings } from "../contexts/SettingsContext";

import {
  Trash2,
  Edit2,
  UploadCloud,
  Search,
  CheckCircle,
  Heart,
  DollarSign,
  MoreVertical,
  Coins,
  CheckSquare,
  Square,
  TrendingUp,
} from "lucide-react";

import {
  deleteDoc,
  doc,
  writeBatch,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";

import { useAuth } from "../contexts/AuthContext";

import ExcelUploadModal from "./ExcelUploadModal";

type Props = {
  transactions: Transaction[];

  pockets: any[];

  incomeSources: any[];

  onEdit: (t: Transaction) => void;
};

export default function HistoryTab({
  transactions,
  pockets,
  incomeSources,
  onEdit,
}: Props) {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [titheConfirmTx, setTitheConfirmTx] = useState<Transaction | null>(
    null,
  );

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType === "investment") {
        if (!t.isInvestment) return false;
      } else if (filterType !== "all" && t.type !== filterType) {
        return false;
      }

      if (search) {
        const s = search.toLowerCase();

        if (
          !t.description.toLowerCase().includes(s) &&
          !t.amount.toString().includes(s)
        )
          return false;
      }

      return true;
    });
  }, [transactions, search, filterType]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const performDelete = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(
          doc(db, `fin_users/${user.uid}/fin_transactions/${id}`),
        );

        setDeleteConfirmId(null);

        setSelectedIds((prev) =>
          prev.filter((selectedId) => selectedId !== id),
        );
      } catch (e) {
        console.error("שגיאה במחיקה: " + (e as Error).message);
      }
    }
  };
  const handleTitheConfirm = async () => {
    if (!titheConfirmTx || !user) return;

    try {
      await updateDoc(
        doc(db, "fin_users", user.uid, "fin_transactions", titheConfirmTx.id),
        { isTithed: true, updatedAt: serverTimestamp() },
      );

      setTitheConfirmTx(null);
    } catch (e) {
      console.error("שגיאה בהפרשת מעשר: " + (e as Error).message);
    }
  };
  const handleTitheUndo = async (t: Transaction) => {
    if (!user) return;

    try {
      await updateDoc(
        doc(db, "fin_users", user.uid, "fin_transactions", t.id),
        { isTithed: false, updatedAt: serverTimestamp() },
      );
    } catch (e) {
      console.error("שגיאה בביטול מעשר: " + (e as Error).message);
    }
  };
  const performBatchDelete = async () => {
    if (!user || selectedIds.length === 0) return;

    try {
      const batch = writeBatch(db);

      selectedIds.forEach((id) => {
        batch.delete(doc(db, `fin_users/${user.uid}/fin_transactions/${id}`));
      });

      await batch.commit();

      setSelectedIds([]);

      setBatchDeleteConfirm(false);
    } catch (e) {
      console.error("שגיאה במחיכה מרובה: " + (e as Error).message);

      alert("אירעה שגיאה. נסה שוב.");
    }
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((t) => t.id));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const isAllSelected =
    filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <div className="space-y-6">
      {" "}
      <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full justify-between items-start sm:items-center bg-white  backdrop-blur-sm p-4 sm:p-5 rounded-3xl shadow-sm ring-1 ring-slate-900/5  transition-all text-sm relative">
        {" "}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 pr-10 sm:pr-0">
          {" "}
          <div className="relative w-full sm:w-72">
            {" "}
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 " />{" "}
            <input
              className="w-full pl-4 pr-11 py-3 bg-white  border border-slate-200  rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-sm transition-all text-base"
              placeholder="חיפוש לפי סכום או תיאור..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />{" "}
          </div>{" "}
          <select
            className="bg-white  border border-slate-200  rounded-2xl px-5 py-3 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none min-w-[160px] text-base text-slate-700  font-medium transition-all"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">כל התנועות</option>
            <option value="expense">הוצאות בלבד</option>
            <option value="income">הכנסות בלבד</option>
            <option value="investment">השקעות בלבד</option>
          </select>{" "}
        </div>{" "}
        <div className="absolute top-3 right-3 sm:static sm:top-auto sm:right-auto flex flex-col gap-2 z-10 hidden sm:flex">
          {" "}
          <button
            onClick={() => setIsExcelOpen(true)}
            title="ייבוא אקסל"
            className="text-slate-400  hover:text-teal-600  bg-white  sm:bg-teal-50  hover:bg-teal-100 p-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-medium tracking-tight transition-all shadow-sm active:scale-95 flex items-center justify-center border border-slate-200  sm:border-transparent"
          >
            {" "}
            <UploadCloud className="w-5 h-5" />{" "}
            <span className="hidden sm:inline-block mr-2">ייבוא</span>{" "}
          </button>{" "}
          <button
            onClick={toggleSelectAll}
            className={
              "bg-white  hover:bg-slate-50  border border-slate-200  p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors " +
              (isAllSelected
                ? "text-teal-600  border-teal-200"
                : "text-slate-500   ")
            }
          >
            {" "}
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}{" "}
            <span className="hidden sm:inline-block">בחר הכל</span>{" "}
            <span className="sm:hidden">סנן</span>{" "}
          </button>{" "}
        </div>{" "}
        <div className="sm:hidden absolute top-3 right-3 flex flex-col gap-1 z-10">
          {" "}
          <button
            onClick={() => setIsExcelOpen(true)}
            title="ייבוא אקסל"
            className="text-slate-400  hover:text-teal-600  bg-white  shadow-sm p-2 rounded-xl active:scale-95 flex items-center justify-center border border-slate-200  "
          >
            {" "}
            <UploadCloud className="w-4 h-4" />{" "}
          </button>{" "}
          <button
            onClick={toggleSelectAll}
            title="בחר הכל"
            className={
              "bg-white  shadow-sm p-2 rounded-xl active:scale-95 flex items-center justify-center border transition-colors " +
              (isAllSelected
                ? "text-teal-600  border-teal-200"
                : "text-slate-500   border-slate-200  ")
            }
          >
            {" "}
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50  border border-rose-200  rounded-xl p-4 flex items-center justify-between">
          {" "}
          <span className="text-rose-800  font-medium">
            נבחרו {selectedIds.length}
            תנועות
          </span>{" "}
          <div className="flex gap-3">
            {" "}
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-rose-700  bg-white  border border-rose-200  rounded-lg hover:bg-rose-100  transition-colors"
            >
              ביטול בחירה
            </button>{" "}
            {batchDeleteConfirm ? (
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-rose-800  text-sm font-medium">
                  למחוק לצמיתות?
                </span>{" "}
                <button
                  onClick={performBatchDelete}
                  className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                >
                  כן, מחק
                </button>{" "}
                <button
                  onClick={() => setBatchDeleteConfirm(false)}
                  className="bg-white  text-zinc-600  px-4 py-2 rounded-lg border border-zinc-200  hover:bg-zinc-100   transition-colors"
                >
                  לא, טעות
                </button>{" "}
              </div>
            ) : (
              <button
                onClick={() => setBatchDeleteConfirm(true)}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
              >
                {" "}
                <Trash2 className="w-4 h-4" /> מחק נבחרים{" "}
              </button>
            )}{" "}
          </div>{" "}
        </div>
      )}{" "}
      <div className="bg-white  rounded-3xl shadow-sm border border-slate-200  overflow-hidden ring-1 ring-slate-900/5 ">
        {" "}
        <div className="overflow-x-auto">
          <table className="w-full text-base text-right block sm:table overflow-x-hidden sm:overflow-visible">
            <thead className="bg-slate-50  border-b border-slate-200  text-slate-600  hidden sm:table-header-group">
              <tr>
                <th className="px-4 py-4 w-12 text-center"></th>
                <th className="px-6 py-4 font-semibold tracking-tight">
                  תאריך
                </th>
                <th className="px-6 py-4 font-semibold tracking-tight">
                  תיאור / מקור משלם
                </th>
                <th className="px-6 py-4 font-semibold tracking-tight">סוג</th>
                <th className="px-6 py-4 font-semibold tracking-tight">כיס</th>
                <th className="px-6 py-4 font-semibold tracking-tight text-left">
                  סכום
                </th>
                <th className="px-6 py-4 font-semibold tracking-tight text-left">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 block sm:table-row-group">
              {filtered.length === 0 ? (
                <tr className="block sm:table-row">
                  <td
                    colSpan={7}
                    className="block sm:table-cell px-6 py-16 text-center text-slate-500   bg-slate-50 "
                  >
                    <div className="flex justify-center mb-3">
                      {" "}
                      <Search className="w-8 h-8 text-slate-300" />{" "}
                    </div>{" "}
                    <span className="font-medium text-slate-600  ">
                      אין עסקאות להצגה בסינון או בחיפוש הנוכחי.
                    </span>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isSelected = selectedIds.includes(t.id);

                  const pocketName =
                    pockets.find((p) => p.id === t.pocketId)?.name || "---";

                  const isSalary =
                    t.type === "income" && t.incomeType === "SALARY";

                  const isOnetime =
                    t.type === "income" && t.incomeType === "ONETIME";

                  const extraSource = isSalary
                    ? `מקור: ${
                        incomeSources.find((s) => s.id === t.incomeSourceId)
                          ?.name || "---"
                      }
`
                    : isOnetime && t.incomeSourceText
                      ? `מאת: ${t.incomeSourceText}
`
                      : "";

                  const bgColor =
                    t.type === "income"
                      ? "bg-emerald-50   hover:bg-emerald-100  border-emerald-100  "
                      : "bg-rose-50  hover:bg-rose-100  border-rose-100 ";

                  return (
                    <tr
                      key={t.id}
                      className={`transition-all group relative flex items-center justify-between sm:table-row p-2.5 sm:p-0 border-b sm:border-b-[1px] ${
                        isSelected ? "bg-teal-100/50" : bgColor
                      }
`}
                    >
                      {/* Checkbox */}
                      <td className="sm:table-cell text-center shrink-0 w-auto sm:w-12 sm:px-4 sm:py-4">
                        {
                          selectedIds.length > 0 || isSelected ? (
                            <button
                              onClick={() => toggleSelect(t.id)}
                              className="p-1 text-slate-400  hover:text-teal-600  focus:outline-none rounded-lg transition-colors"
                            >
                              {" "}
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-teal-600 " />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}{" "}
                            </button>
                          ) : (
                            <div className="w-5 sm:hidden" />
                          ) /* placeholder to align on mobile */
                        }
                      </td>
                      {/* Date (hidden on mobile, shown on desktop) */}
                      <td className="hidden sm:table-cell px-6 py-4 font-mono text-slate-600  whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      {/* Details & Metadata Combined on Mobile, Description only on Desktop */}
                      <td className="flex-1 sm:table-cell text-right px-1.5 sm:px-6 sm:py-4 min-w-0">
                        <div className="flex flex-col">
                          {" "}
                          {/* Line 1: Description */}{" "}
                          <div
                            className={`font-semibold text-base sm:text-lg truncate pb-0.5 ${
                              t.type === "income"
                                ? "text-emerald-950"
                                : "text-rose-950"
                            }
`}
                            title={t.description}
                          >
                            {" "}
                            {t.description}{" "}
                          </div>{" "}
                          {/* Line 2 on Mobile: Date & Pocket & Extra */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-sm md:text-base text-slate-500 sm:hidden">
                            <span className="bg-slate-100 px-1.5 py-0.5 text-slate-600 rounded font-mono text-xs">
                              {formatDate(t.date)}
                            </span>
                            <span>•</span>
                            <span>{pocketName}</span>
                            {t.isInvestment && (
                              <>
                                <span>•</span>
                                <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                  השקעה
                                </span>
                              </>
                            )}
                            {extraSource && (
                              <>
                                <span>•</span>
                                <span className="text-teal-700 font-medium">
                                  {extraSource}
                                </span>
                              </>
                            )}
                          </div>
                          {/* Desktop Extra Source */}
                          {extraSource && (
                            <span className="hidden sm:block text-sm text-slate-500 font-normal mt-0.5">
                              {extraSource}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Type badge (hidden on mobile, shown on desktop) */}
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        {t.isInvestment ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold tracking-tight border bg-indigo-50 text-indigo-700 border-indigo-200">
                            <TrendingUp className="w-3.5 h-3.5" /> השקעה
                          </span>
                        ) : (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold tracking-tight border ${
                              t.type === "income"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {t.type === "income"
                              ? isSalary
                                ? "משכורת"
                                : "הכנסה"
                              : "הוצאה"}
                          </span>
                        )}
                      </td>
                      {/* Pocket (hidden on mobile, shown on desktop) */}
                      <td className="hidden sm:table-cell px-6 py-4 text-slate-600 text-base whitespace-nowrap">
                        {pocketName}
                      </td>
                      {/* Amount: Prominent on both */}
                      <td
                        className={`shrink-0 sm:table-cell text-left px-2 sm:px-6 sm:py-4 font-mono font-bold sm:font-semibold text-base sm:text-xl whitespace-nowrap ${
                          t.isInvestment
                            ? "text-indigo-700"
                            : t.type === "income"
                              ? "text-emerald-700"
                              : "text-rose-700"
                        }`}
                        dir="ltr"
                      >
                        {t.type === "expense" && "-"}
                        {formatCurrency(t.amount, settings.currency)}
                      </td>
                      {/* Actions: Small inline on mobile, block hover on desktop */}
                      <td className="shrink-0 sm:table-cell text-left px-1 sm:px-6 sm:py-4 min-w-[50px] sm:min-w-[70px]">
                        <div className="flex items-center justify-end gap-1 sm:gap-2 relative">
                          {" "}
                          {deleteConfirmId === t.id ? (
                            <div className="flex items-center gap-2 bg-rose-50  p-1.5 rounded-xl border border-rose-200  shadow-sm animate-in fade-in zoom-in-95">
                              {" "}
                              <span className="text-xs text-rose-800  font-bold whitespace-nowrap">
                                למחוק?
                              </span>{" "}
                              <button
                                onClick={() => performDelete(t.id)}
                                className="text-xs text-white bg-rose-600 px-2.5 py-1 rounded hover:bg-rose-700 transition-colors"
                              >
                                כן
                              </button>{" "}
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs text-slate-700  bg-white  border border-slate-200  px-2.5 py-1 rounded hover:bg-slate-50  transition-colors"
                              >
                                לא
                              </button>{" "}
                            </div>
                          ) : (
                            <>
                              {" "}
                              {t.type === "income" && (
                                <button
                                  onClick={() =>
                                    t.isTithed
                                      ? handleTitheUndo(t)
                                      : setTitheConfirmTx(t)
                                  }
                                  title={
                                    t.isTithed
                                      ? "בטל סימון מעשר"
                                      : "סמן מעשר כשולם"
                                  }
                                  className={`p-1.5 flex items-center justify-center gap-1.5 ml-1 rounded px-3 py-1.5 min-w-[70px] shadow-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ${
                                    t.isTithed
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700"
                                      : "bg-white  text-slate-500   border border-slate-300 hover:border-indigo-400  hover:text-indigo-600 hover:bg-indigo-50  border-dashed"
                                  }
`}
                                >
                                  {" "}
                                  <Coins className="w-4 h-4 shrink-0" />{" "}
                                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
                                    מעשר
                                  </span>{" "}
                                </button>
                              )}{" "}
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === t.id ? null : t.id,
                                  )
                                }
                                className="p-1 text-slate-500   hover:text-teal-700 bg-white  sm:bg-transparent rounded px-1 shadow-xs sm:shadow-none border border-slate-200  sm:border-transparent hover:bg-slate-100  transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                              >
                                {" "}
                                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                              </button>{" "}
                              {openMenuId === t.id && (
                                <div className="absolute left-0 top-full mt-1 w-28 bg-white  border border-slate-200  rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                  {" "}
                                  <button
                                    onClick={() => {
                                      onEdit(t);

                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-right px-3 py-2 text-sm text-slate-700  hover:bg-slate-50  flex items-center gap-2"
                                  >
                                    {" "}
                                    <Edit2 className="w-3.5 h-3.5" /> עריכה{" "}
                                  </button>{" "}
                                  <button
                                    onClick={() => {
                                      setDeleteConfirmId(t.id);

                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-right px-3 py-2 text-sm text-rose-600   hover:bg-rose-50  flex items-center gap-2 border-t border-slate-100  "
                                  >
                                    {" "}
                                    <Trash2 className="w-3.5 h-3.5" />{" "}
                                    מחיקה{" "}
                                  </button>{" "}
                                </div>
                              )}{" "}
                            </>
                          )}{" "}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>{" "}
      </div>{" "}
      <ExcelUploadModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        pockets={pockets}
      />{" "}
      {titheConfirmTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          {" "}
          <div className="bg-white  rounded-3xl p-6 shadow-xl max-w-sm w-full border border-slate-100  flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {" "}
            <div className="w-16 h-16 bg-indigo-50  border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              {" "}
              <Heart className="w-8 h-8" />{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-slate-800  tracking-tight mb-2">
              הפרשת מעשר
            </h3>{" "}
            <p className="text-sm text-slate-500 mb-6">
              האם ברצונך לאשר הפרשת מעשר להכנסה מתוך סכום של{" "}
              {formatCurrency(titheConfirmTx.amount, settings.currency)}?
            </p>
            <div
              className="bg-indigo-50 text-indigo-800 font-mono font-black text-3xl py-3 px-6 rounded-2xl border border-indigo-200 mb-6 w-full"
              dir="ltr"
            >
              {formatCurrency(titheConfirmTx.amount * 0.2, settings.currency)}
            </div>{" "}
            <div className="flex gap-3 w-full">
              {" "}
              <button
                onClick={() => setTitheConfirmTx(null)}
                className="flex-1 px-4 py-3 bg-white  border border-slate-200  text-slate-700  font-medium rounded-xl hover:bg-slate-50  transition-colors"
              >
                {" "}
                ביטול{" "}
              </button>{" "}
              <button
                onClick={handleTitheConfirm}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
              >
                {" "}
                אשר הפרשה{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
