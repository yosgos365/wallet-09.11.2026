import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Pocket, IncomeSource, FixedExpense } from "../types";
import { Trash2, Plus, Info, Edit2, Check, X, Coins, DollarSign } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { formatCurrency, getCurrencySymbol } from "../lib/utils";
type Props = {
  pockets: Pocket[];
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
};
export default function SettingsTab({
  pockets,
  incomeSources,
  fixedExpenses,
}: Props) {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [newPocketName, setNewPocketName] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [newFixedName, setNewFixedName] = useState("");
  const [newFixedAmount, setNewFixedAmount] = useState("");
  const [editingPocketId, setEditingPocketId] = useState<string | null>(null);
  const [editPocketName, setEditPocketName] = useState("");
  const handleUpdatePocket = async (id: string) => {
    if (!user || !editPocketName.trim()) return;
    await setDoc(
      doc(db, `fin_users/${user.uid}/fin_pockets`, id),
      { name: editPocketName.trim() },
      { merge: true },
    );
    setEditingPocketId(null);
  };
  const handleAddPocket = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newPocketName) return;
    const ref = doc(collection(db, `fin_users/${user.uid}/fin_pockets`));
    await setDoc(ref, {
      userId: user.uid,
      name: newPocketName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewPocketName("");
  };
  const handleAddSource = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newSourceName) return;
    const ref = doc(collection(db, `fin_users/${user.uid}/fin_income_sources`));
    await setDoc(ref, {
      userId: user.uid,
      name: newSourceName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewSourceName("");
  };
  const handleAddFixedExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newFixedName || !newFixedAmount) return;
    const ref = doc(collection(db, `fin_users/${user.uid}/fin_fixed_expenses`));
    await setDoc(ref, {
      userId: user.uid,
      name: newFixedName,
      amount: parseFloat(newFixedAmount),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewFixedName("");
    setNewFixedAmount("");
  };
  const handleDeletePocket = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `fin_users/${user.uid}/fin_pockets/${id}`));
  };
  const handleDeleteSource = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `fin_users/${user.uid}/fin_income_sources/${id}`));
  };
  const handleDeleteFixedExpense = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `fin_users/${user.uid}/fin_fixed_expenses/${id}`));
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      {/* App Preferences Section */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">הגדרות אפליקציה</h2>
          <p className="text-slate-500 text-sm mt-1">
            התאם את מטבע המערכת ואפשרויות מעקב מתקדמות.
          </p>
        </div>
        <div className="p-6 space-y-5">
          {/* Currency Selection */}
          <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl ring-1 ring-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" /> מטבע האפליקציה
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                בחר את המטבע בו יוצגו כל הסכומים, הדוחות והתנועות במערכת.
              </p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-emerald-200 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => updateSettings({ currency: "ILS" })}
                className={`py-2 px-4 rounded-lg font-bold text-sm transition-all flex items-center gap-1.5 ${
                  settings.currency === "ILS"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>₪</span>
                <span>שקל (ILS)</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ currency: "USD" })}
                className={`py-2 px-4 rounded-lg font-bold text-sm transition-all flex items-center gap-1.5 ${
                  settings.currency === "USD"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>$</span>
                <span>דולר (USD)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {" "}
      <div className="bg-white  rounded-3xl shadow-sm ring-1 ring-slate-900/5  overflow-hidden flex flex-col">
        {" "}
        <div className="p-6 border-b border-slate-100  bg-slate-50 ">
          {" "}
          <h2 className="text-xl font-bold text-slate-900  ">
            הגדרות מקורות תקציב
          </h2>{" "}
          <p className="text-slate-500   text-sm mt-1">
            נהל את אמצעי התשלום, מקורות ההכנסה ותבניות ההוצאה שלך הקבועות.
          </p>{" "}
        </div>{" "}
        <div className="p-6 space-y-8">
          {" "}
          {/* Pockets Section */}{" "}
          <section className="bg-teal-50  p-5 rounded-2xl ring-1 ring-teal-100">
            {" "}
            <h3 className="text-lg font-bold text-teal-900  mb-4 border-r-4 border-teal-500 pr-3">
              כיסים / אמצעי תשלום
            </h3>{" "}
            <form
              onSubmit={handleAddPocket}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4"
            >
              {" "}
              <input
                required
                placeholder="למשל: כרטיס ויזה, בנק לאומי..."
                className="w-full sm:flex-1 px-4 py-2 bg-white  border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={newPocketName}
                onChange={(e) => setNewPocketName(e.target.value)}
              />{" "}
              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors shadow-sm w-full sm:w-auto"
              >
                {" "}
                <Plus className="w-4 h-4" /> הוסף{" "}
              </button>{" "}
            </form>{" "}
            <div className="bg-white  border border-teal-100 rounded-xl shadow-sm divide-y divide-teal-50">
              {" "}
              {pockets.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 group"
                >
                  {" "}
                  {editingPocketId === p.id ? (
                    <div className="flex-1 flex items-center justify-between ml-2 gap-2">
                      {" "}
                      <input
                        autoFocus
                        className="flex-1 px-3 py-1 bg-teal-50  border border-teal-300 rounded font-medium text-slate-800  focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={editPocketName}
                        onChange={(e) => setEditPocketName(e.target.value)}
                      />{" "}
                      <div className="flex gap-1 shrink-0">
                        {" "}
                        <button
                          onClick={() => handleUpdatePocket(p.id)}
                          className="p-1.5 text-teal-600  hover:bg-teal-100 rounded-md transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>{" "}
                        <button
                          onClick={() => setEditingPocketId(null)}
                          className="p-1.5 text-slate-500   hover:bg-slate-100  rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>{" "}
                      </div>{" "}
                    </div>
                  ) : (
                    <>
                      {" "}
                      <span className="font-medium text-slate-800  ">
                        {p.name}
                      </span>{" "}
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {" "}
                        <button
                          onClick={() => {
                            setEditingPocketId(p.id);
                            setEditPocketName(p.name);
                          }}
                          className="text-slate-400  p-2 hover:text-teal-600  hover:bg-teal-50  rounded-lg transition-colors"
                        >
                          {" "}
                          <Edit2 className="w-4 h-4" />{" "}
                        </button>{" "}
                        <button
                          onClick={() => handleDeletePocket(p.id)}
                          className="text-slate-400  p-2 hover:text-rose-600   hover:bg-rose-50  rounded-lg transition-colors"
                        >
                          {" "}
                          <Trash2 className="w-4 h-4" />{" "}
                        </button>{" "}
                      </div>{" "}
                    </>
                  )}{" "}
                </div>
              ))}{" "}
              {pockets.length === 0 && (
                <div className="p-4 text-center text-teal-400 font-medium">
                  לא הוגדרו עדיין.
                </div>
              )}{" "}
            </div>{" "}
          </section>{" "}
          {/* Income Sources Section */}{" "}
          <section className="bg-emerald-50   p-5 rounded-2xl ring-1 ring-emerald-100">
            {" "}
            <h3 className="text-lg font-bold text-emerald-900  mb-4 border-r-4 border-emerald-500  pr-3">
              מקורות הכנסה קבועים (למשכורת)
            </h3>{" "}
            <form
              onSubmit={handleAddSource}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4"
            >
              {" "}
              <input
                required
                placeholder="למשל: עבודה כללית, עירייה..."
                className="w-full sm:flex-1 px-4 py-2 bg-white  border border-emerald-200  rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
              />{" "}
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm w-full sm:w-auto"
              >
                {" "}
                <Plus className="w-4 h-4" /> הוסף{" "}
              </button>{" "}
            </form>{" "}
            <div className="bg-white  border border-emerald-100  rounded-xl shadow-sm divide-y divide-emerald-50">
              {" "}
              {incomeSources.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-3"
                >
                  {" "}
                  <span className="font-medium text-slate-800  ">
                    {s.name}
                  </span>{" "}
                  <button
                    onClick={() => handleDeleteSource(s.id)}
                    className="text-slate-400  p-2 hover:text-rose-600   hover:bg-rose-50  rounded-lg transition-colors"
                  >
                    {" "}
                    <Trash2 className="w-4 h-4" />{" "}
                  </button>{" "}
                </div>
              ))}{" "}
              {incomeSources.length === 0 && (
                <div className="p-4 text-center text-emerald-400 font-medium">
                  לא הוגדרו עדיין.
                </div>
              )}{" "}
            </div>{" "}
          </section>{" "}
          {/* Fixed Expenses Section */}{" "}
          <section className="bg-rose-50  p-5 rounded-2xl ring-1 ring-rose-100">
            {" "}
            <h3 className="text-lg font-bold text-rose-900  mb-4 border-r-4 border-rose-500 pr-3">
              הוצאות קבועות (תבניות)
            </h3>{" "}
            <div className="flex items-start gap-2 mb-4 text-rose-700  text-sm bg-rose-100  p-3 rounded-lg border border-rose-200 ">
              {" "}
              <Info className="w-5 h-5 shrink-0" />{" "}
              <p>
                הגדר הוצאות שחוזרות על עצמן בסכום קבוע (כגון שכר דירה, ועד בית)
                כדי לבחור אותן בקלות בדיווח הוצאה חדשה.
              </p>{" "}
            </div>{" "}
            <form
              onSubmit={handleAddFixedExpense}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4"
            >
              {" "}
              <input
                required
                placeholder="שם ההוצאה (למשל: ביטוח...)"
                className="w-full sm:flex-1 px-4 py-2 border border-rose-200  rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                value={newFixedName}
                onChange={(e) => setNewFixedName(e.target.value)}
              />{" "}
              <input
                required
                type="number"
                step="0.01"
                placeholder={`סכום (${getCurrencySymbol(settings.currency)})`}
                className="w-full sm:w-32 px-4 py-2 border border-rose-200  rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                value={newFixedAmount}
                onChange={(e) => setNewFixedAmount(e.target.value)}
              />{" "}
              <button
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-sm w-full sm:w-auto"
              >
                {" "}
                <Plus className="w-4 h-4" /> הוסף{" "}
              </button>{" "}
            </form>{" "}
            <div className="bg-white  border border-rose-100 rounded-xl shadow-sm divide-y divide-rose-50">
              {" "}
              {fixedExpenses.map((f) => (
                <div
                  key={f.id}
                  className="flex justify-between items-center p-3"
                >
                  {" "}
                  <div>
                    {" "}
                    <span className="font-medium text-slate-800  block">
                      {f.name}
                    </span>{" "}
                    <span
                      className="text-sm text-slate-500   font-mono block mt-0.5"
                      dir="ltr"
                    >
                      {formatCurrency(f.amount, settings.currency)}
                    </span>{" "}
                  </div>{" "}
                  <button
                    onClick={() => handleDeleteFixedExpense(f.id)}
                    className="text-slate-400  p-2 hover:text-rose-600   hover:bg-rose-50  rounded-lg transition-colors"
                  >
                    {" "}
                    <Trash2 className="w-4 h-4" />{" "}
                  </button>{" "}
                </div>
              ))}{" "}
              {fixedExpenses.length === 0 && (
                <div className="p-4 text-center text-rose-400  font-medium">
                  לא הוגדרו עדיין.
                </div>
              )}{" "}
            </div>{" "}
          </section>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
