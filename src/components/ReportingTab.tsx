import { useState, useEffect, FormEvent } from "react";

import { db } from "../lib/firebase";

import {
  doc,
  setDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
  collection,
} from "firebase/firestore";

import { useAuth } from "../contexts/AuthContext";

import { Transaction, Pocket, IncomeSource, FixedExpense } from "../types";

import {
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Coins,
  Check,
  TrendingUp,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { formatCurrency, getCurrencySymbol } from "../lib/utils";

type Props = {
  pockets: Pocket[];
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  editingTx?: Transaction | null;
  onClearEdit?: () => void;
};

export default function ReportingTab({
  pockets,
  incomeSources,
  fixedExpenses,
  editingTx,
  onClearEdit,
}: Props) {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [pocketId, setPocketId] = useState("");
  const [incomeType, setIncomeType] = useState<"ONETIME" | "SALARY">("ONETIME");
  const [incomeSourceId, setIncomeSourceId] = useState("");
  /* Used for SALARY */
  const [incomeSourceText, setIncomeSourceText] = useState("");
  /* Used for ONETIME */
  const [salaryMonthDate, setSalaryMonthDate] = useState("");
  /* YYYY-MM */
  const [fixedExpenseId, setFixedExpenseId] = useState("");
  /* To apply templates */
  const [isTithed, setIsTithed] = useState(false);
  const [isInvestment, setIsInvestment] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setAmount(editingTx.amount.toString());
      setDate(editingTx.date);
      setDescription(editingTx.description);
      setPocketId(editingTx.pocketId);

      if (editingTx.type === "income") {
        setIncomeType(editingTx.incomeType || "ONETIME");
        if (editingTx.incomeSourceId)
          setIncomeSourceId(editingTx.incomeSourceId);
        if (editingTx.incomeSourceText)
          setIncomeSourceText(editingTx.incomeSourceText);
        setIsTithed(!!editingTx.isTithed);
        setIsInvestment(false);

        if (editingTx.incomeType === "SALARY" && editingTx.salaryMonth) {
          setSalaryMonthDate(editingTx.salaryMonth);
        } else if (editingTx.incomeType === "SALARY" && editingTx.date) {
          setSalaryMonthDate(editingTx.date.substring(0, 7));
        }
      } else {
        setIsInvestment(!!editingTx.isInvestment);
        if (editingTx.fixedExpenseId)
          setFixedExpenseId(editingTx.fixedExpenseId);
      }
    } else {
      resetForm();
    }
  }, [editingTx]);

  const [saveError, setSaveError] = useState("");

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");

    if (pockets.length > 0) setPocketId(pockets[0].id);
    setIncomeType("ONETIME");
    setIncomeSourceId("");
    setIncomeSourceText("");
    setSalaryMonthDate("");
    setFixedExpenseId("");
    setIsTithed(false);
    setIsInvestment(false);
    setSaveError("");
  };
  const handleApplyFixedExpense = (fxId: string) => {
    setFixedExpenseId(fxId);

    if (!fxId) {
      setDescription("");
      setAmount("");
      return;
    }

    const fx = fixedExpenses.find((f) => f.id === fxId);

    if (fx) {
      setDescription(fx.name);
      setAmount(fx.amount.toString());
    }
  };
  const monthNames = [
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
  ];

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || (!pocketId && type !== "income")) return;
    setLoading(true);
    setShowSuccess(false);
    setSaveError("");

    try {
      let finalDescription = description;

      if (type === "income" && incomeType === "SALARY" && salaryMonthDate) {
        const [year, month] = salaryMonthDate.split("-");
        finalDescription = `משכורת עבור חודש ${monthNames[parseInt(month) - 1]}
 ${year}
`;
      }

      const data: any = {
        userId: user.uid,
        amount: parseFloat(amount),
        date,
        type,
        description: finalDescription,
        pocketId,
        updatedAt: serverTimestamp(),
      };
      if (type === "income") {
        data.incomeType = incomeType;
        data.isTithed = isTithed;

        if (incomeType === "SALARY") {
          if (incomeSourceId) data.incomeSourceId = incomeSourceId;

          if (salaryMonthDate) data.salaryMonth = salaryMonthDate;
        } else if (incomeType === "ONETIME") {
          if (incomeSourceText) data.incomeSourceText = incomeSourceText;
        }
      } else {
        data.isInvestment = isInvestment;
        if (fixedExpenseId) {
          data.fixedExpenseId = fixedExpenseId;
        }
      }

      if (editingTx?.id) {
        /* merge */
        const updates: any = { ...data };
        if (type === "expense" && editingTx.type === "income") {
          updates.incomeType = deleteField();
          updates.incomeSourceId = deleteField();
          updates.incomeSourceText = deleteField();
          updates.salaryMonth = deleteField();
          updates.isTithed = deleteField();
        } else if (type === "income" && editingTx.type === "expense") {
          updates.fixedExpenseId = deleteField();
          updates.isInvestment = deleteField();
        } else if (type === "income" && editingTx.type === "income") {
          if (incomeType === "ONETIME" && editingTx.incomeType === "SALARY") {
            updates.incomeSourceId = deleteField();
            updates.salaryMonth = deleteField();
          } else if (
            incomeType === "SALARY" &&
            editingTx.incomeType === "ONETIME"
          ) {
            updates.incomeSourceText = deleteField();
          }
        } else if (type === "expense" && editingTx.type === "expense") {
          if (!isInvestment && editingTx.isInvestment) {
            updates.isInvestment = false;
          }
        }

        await updateDoc(
          doc(db, "fin_users", user.uid, "fin_transactions", editingTx.id),
          updates,
        );
        if (onClearEdit) onClearEdit();
      } else {
        /* Create */ data.createdAt = serverTimestamp();

        const newRef = doc(
          collection(db, `fin_users/${user.uid}/fin_transactions`),
        );

        await setDoc(newRef, data);
        setShowSuccess(true);
        resetForm();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "שגיאה בשמירה.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={`rounded-2xl shadow-md border overflow-hidden max-w-2xl mx-auto ring-1 my-1 sm:my-2 transition-colors ${
        isInvestment
          ? "bg-indigo-50 border-indigo-300 ring-indigo-900/10"
          : type === "expense"
            ? "bg-rose-50  border-rose-300  ring-rose-900/10"
            : "bg-emerald-50   border-emerald-300  ring-emerald-900/10"
      }
`}
    >
      <div className="p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          {isInvestment ? (
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          ) : (
            <FileText className="w-5 h-5 text-teal-600" />
          )}
          {isInvestment
            ? editingTx
              ? "ערוך השקעה"
              : "הזנת השקעה"
            : editingTx
              ? "ערוך תנועה קיימת"
              : "הזנת תנועה"}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !isInvestment;
              setIsInvestment(next);
              if (next) setType("expense");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
              isInvestment
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-800"
            }`}
            title="מעבר למצב הזנת השקעה"
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>השקעה</span>
            <span
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                isInvestment ? "bg-white/40" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isInvestment ? "-translate-x-3" : "translate-x-0"
                }`}
              />
            </span>
          </button>

          {editingTx && (
            <button
              onClick={() => onClearEdit && onClearEdit()}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium bg-white px-2.5 py-1.5 rounded-full border border-slate-200"
            >
              ביטול לעורך
            </button>
          )}
        </div>
      </div>
      <div className="p-2 sm:p-3 bg-white ">
        <form onSubmit={handleSave} className="space-y-2">
          {saveError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-medium animate-in fade-in shadow-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {saveError}
            </div>
          )}

          {/* When NOT in investment mode, show standard type switcher */}
          {!isInvestment ? (
            <>
              <label className="block text-sm font-semibold text-slate-600 mb-0.5">
                סוג תנועה
              </label>
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-base ${
                    type === "expense"
                      ? "bg-white text-rose-700 shadow-sm ring-1 ring-slate-900/5"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  הוצאה
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-base ${
                    type === "income"
                      ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-900/5"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  הכנסה
                </button>
              </div>
            </>
          ) : null}

          {isInvestment ? (
            /* Streamlined Investment Form: only amount, pocket, date, description */
            <div className="space-y-2.5 animate-in fade-in duration-200 pt-1">
              <div>
                <label className="block text-sm font-semibold text-indigo-950 mb-0.5">
                  סכום ההשקעה ({getCurrencySymbol(settings.currency)})
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-tight text-lg shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-0.5">
                    כיס / מקור תשלום
                  </label>
                  <select
                    required
                    value={pocketId}
                    onChange={(e) => setPocketId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-base"
                  >
                    <option value="">בחירה...</option>
                    {pockets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-0.5">
                    תאריך
                  </label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-0.5">
                  תיאור / אפיק השקעה
                </label>
                <input
                  type="text"
                  placeholder="למשל: רכישת מניות, קרן השתלמות, נדל״ן..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                />
              </div>
            </div>
          ) : type === "expense" ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              {" "}
              {fixedExpenses.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                    תבנית קבועה (אופציונלי)
                  </label>
                  <select
                    value={fixedExpenseId}
                    onChange={(e) => handleApplyFixedExpense(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white  border border-rose-200  text-rose-900  rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-base font-medium"
                  >
                    <option value="">ללא תבנית</option>{" "}
                    {fixedExpenses.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} - {formatCurrency(f.amount, settings.currency)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                  סכום בהוצאה ({getCurrencySymbol(settings.currency)})
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white  border border-rose-200  rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono tracking-tight text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                  תיאור
                </label>
                <input
                  required
                  type="text"
                  placeholder={isInvestment ? "למשל: רכישת מניות, קרן השתלמות, נדל״ן..." : "למשל: סופר, דלק..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white  border border-rose-200  rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                    כיס/אמצעי
                  </label>
                  <select
                    required
                    value={pocketId}
                    onChange={(e) => setPocketId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white  border border-rose-200  rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900  text-base"
                  >
                    <option value="">בחירה...</option>{" "}
                    {pockets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                    תאריך
                  </label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white  border border-rose-200  rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-base"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-200">
              {" "}
              {/* comment */}
              <div className="bg-emerald-100  p-2 rounded-lg border border-emerald-200/50 ">
                <div className="flex items-center gap-4 mb-2">
                  <label className="block text-sm font-bold text-emerald-800  shrink-0">
                    סוג הכנסה:
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={incomeType === "ONETIME"}
                      onChange={() => setIncomeType("ONETIME")}
                      className="text-emerald-600  w-4 h-4 focus:ring-emerald-600"
                    />
                    <span className="text-sm font-bold text-slate-700  ">
                      מזדמנת
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={incomeType === "SALARY"}
                      onChange={() => setIncomeType("SALARY")}
                      className="text-emerald-600  w-4 h-4 focus:ring-emerald-600"
                    />
                    <span className="text-sm font-bold text-slate-700  ">
                      משכורת
                    </span>
                  </label>
                </div>
                <div className="mt-1">
                  {" "}
                  {incomeType === "SALARY" ? (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-150">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                          מקור משכורת
                        </label>
                        <select
                          value={incomeSourceId}
                          onChange={(e) => setIncomeSourceId(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white  border border-slate-200  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base text-slate-800  "
                        >
                          <option value="">בחירה...</option>{" "}
                          {incomeSources.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                          חודש
                        </label>
                        <input
                          required
                          type="month"
                          value={salaryMonthDate}
                          onChange={(e) => setSalaryMonthDate(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white  border border-slate-200  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-150">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600  mb-1.5">
                          מקור
                        </label>
                        <input
                          type="text"
                          placeholder="למשל: ירון..."
                          value={incomeSourceText}
                          onChange={(e) => setIncomeSourceText(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white  border border-slate-200  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600  mb-1.5">
                          תיאור
                        </label>
                        <input
                          type="text"
                          placeholder="עבור..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white  border border-slate-200  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>{" "}
              {/* comment */}
              <div>
                <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                  סכום ההכנסה ({getCurrencySymbol(settings.currency)})
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white  border border-emerald-300  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-tight text-lg"
                />
              </div>{" "}
              {/* comment */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                    כיס
                  </label>
                  <select
                    required
                    value={pocketId}
                    onChange={(e) => setPocketId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white  border border-emerald-300  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900  text-base"
                  >
                    <option value="">בחירה...</option>{" "}
                    {pockets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600  mb-0.5">
                    תאריך
                  </label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white  border border-emerald-300  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  />
                </div>
              </div>{" "}
              {/* comment */}
              <div
                className={`mt-2 border-2 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 cursor-pointer transition-all ${
                  isTithed
                    ? "bg-indigo-50  border-indigo-400  shadow-sm"
                    : "bg-slate-50  border-slate-200  hover:border-indigo-300"
                }
`}
                onClick={() => setIsTithed(!isTithed)}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-md border-2 shrink-0 transition-colors ${
                    isTithed
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 bg-white  "
                  }
`}
                >
                  {" "}
                  {isTithed && <Check className="w-4 h-4" />}
                </div>
                <div className="flex-1 flex items-center gap-1.5 sm:gap-2">
                  <Coins
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                      isTithed ? "text-indigo-600" : "text-slate-400 "
                    }
`}
                  />
                  <span
                    className={`font-bold text-sm sm:text-base select-none transition-colors ${
                      isTithed ? "text-indigo-900" : "text-slate-600  "
                    }
`}
                  >
                    {" "}
                    הופרש מעשר?
                  </span>
                </div>
                <div
                  className={`text-sm sm:text-base font-black px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    isTithed
                      ? "text-indigo-800  bg-indigo-100 "
                      : "text-slate-500   bg-slate-200 "
                  }
`}
                >
                  <span className="text-xs font-semibold">מעשר (20%):</span>
                  <span dir="ltr">
                    {formatCurrency(Number(amount || 0) * 0.2, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-teal-600 text-white font-bold py-2.5 sm:py-3 rounded-lg text-base sm:text-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/20 transition-all disabled:opacity-50 mt-1 flex items-center justify-center gap-2 shadow-md"
          >
            <Save className="w-5 h-5" />{" "}
            {loading ? "שומר..." : editingTx ? "שמור שינויים" : "הזן תנועה"}
          </button>{" "}
          {showSuccess && (
            <div className="bg-emerald-50   border border-emerald-200  text-emerald-700  px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-medium animate-in fade-in slide-in-from-bottom-2 shadow-sm text-xs mt-1">
              <CheckCircle2 className="w-4 h-4" /> הנתונים הוזנו בהצלחה
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
