import { useState, useCallback, DragEvent } from "react";

import { parseExcelBuffer, ParsedRow } from "../lib/excelParser";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../lib/firebase";

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import { Pocket } from "../types";

import { X, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

import { formatDate, formatCurrency } from "../lib/utils";
import { useSettings } from "../contexts/SettingsContext";

type Props = { isOpen: boolean; onClose: () => void; pockets: Pocket[] };

export default function ExcelUploadModal({ isOpen, onClose, pockets }: Props) {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [dragActive, setDragActive] = useState(false);

  const [rows, setRows] = useState<ParsedRow[]>([]);

  const [pocketId, setPocketId] = useState("");

  const [loading, setLoading] = useState(false);

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const onFileLoad = async (file: File) => {
    const buffer = await file.arrayBuffer();

    try {
      const parsed = parseExcelBuffer(buffer);
      setRows(parsed);
      setUploadStatus("idle");
    } catch (e) {
      alert("שגיאה בפירוק הקובץ: " + (e as Error).message);
    }
  };
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileLoad(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!user || !pocketId || rows.length === 0) return;
    setLoading(true);
    setUploadStatus("uploading");

    try {
      const validRows = rows.filter((r) => r.status === "valid");

      if (validRows.length === 0) {
        throw new Error("אין שורות תקינות לייבוא.");
      }
      /* Process in batches of 500 max */
      const batch = writeBatch(db);
      validRows.forEach((row) => {
        const newRef = doc(
          collection(db, `fin_users/${user.uid}/fin_transactions`),
        );

        const data: any = {
          userId: user.uid,
          amount: row.amount,
          date: row.date,
          description: row.description || "ללא תיאור",
          type: row.type,
          pocketId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (row.type === "income") {
          data.incomeType = row.incomeType || "ONETIME";
          /* Note */
        }
        batch.set(newRef, data);
      });

      await batch.commit();
      setUploadStatus("success");
    } catch (e) {
      console.error(e);
      setUploadStatus("error");
      alert("שגיאה בהעלאה: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      dir="rtl"
    >
      <div className="bg-white  rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100  bg-slate-50  shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900  ">
            <UploadCloud className="w-5 h-5 text-teal-600 " /> ייבוא עסקאות
            מאקסל
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400  hover:text-slate-600  transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {" "}
          {rows.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                dragActive
                  ? "border-emerald-500  bg-emerald-50   "
                  : "border-zinc-300  bg-zinc-50 "
              }
`}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.cvs"
                onChange={(e) =>
                  e.target.files && onFileLoad(e.target.files[0])
                }
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white  rounded-full flex items-center justify-center shadow-sm mb-4">
                  <UploadCloud className="w-8 h-8 text-emerald-600 " />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 mb-1">
                  גרור קובץ אקסל לכאן
                </h3>
                <p className="text-sm text-zinc-500">
                  או לחץ כדי לבחור קובץ (XLSX)
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {" "}
              {uploadStatus === "success" ? (
                <div className="bg-emerald-50   text-emerald-700  p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6" />
                  <div className="font-medium">העלאה הושלמה בהצלחה!</div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-zinc-900">
                      תצוגה מקדימה ({rows.length}
                      שורות)
                    </h3>
                    <button
                      onClick={() => setRows([])}
                      className="text-sm text-red-600 hover:underline"
                    >
                      {" "}
                      נקה ובחר מחדש
                    </button>
                  </div>
                  <div className="bg-zinc-50  p-4 rounded-xl border border-zinc-200  flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        לאיזה כיס לשייך את העסקאות השאובות?
                      </label>
                      <select
                        required
                        value={pocketId}
                        onChange={(e) => setPocketId(e.target.value)}
                        className="w-full px-4 py-2 bg-white  border border-zinc-200  rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="">בחר כיס...</option>{" "}
                        {pockets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      disabled={
                        loading ||
                        !pocketId ||
                        rows.filter((r) => r.status === "valid").length === 0
                      }
                      onClick={handleUpload}
                      className="bg-emerald-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {" "}
                      {loading
                        ? "מייבא..."
                        : `ייבא ${
                            rows.filter((r) => r.status === "valid").length
                          }
 מסמכים`}
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-zinc-200  rounded-xl">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-zinc-100  text-zinc-600  border-b border-zinc-200 ">
                        <tr>
                          <th className="px-4 py-3 font-medium">סטטוס</th>
                          <th className="px-4 py-3 font-medium">תאריך</th>
                          <th className="px-4 py-3 font-medium">תיאור</th>
                          <th className="px-4 py-3 font-medium">סוג</th>
                          <th className="px-4 py-3 font-medium text-left">
                            סכום
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {" "}
                        {rows.map((row, i) => (
                          <tr
                            key={i}
                            className={
                              row.status === "invalid"
                                ? "bg-red-50/50"
                                : "bg-white  "
                            }
                          >
                            <td className="px-4 py-3">
                              {" "}
                              {row.status === "valid" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <AlertCircle
                                  className="w-4 h-4 text-red-500"
                                  title={row.error}
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-600 ">
                              {formatDate(row.date)}
                            </td>
                            <td className="px-4 py-3 text-zinc-900 line-clamp-1">
                              {row.description}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  row.type === "income"
                                    ? "bg-emerald-100  text-emerald-700  "
                                    : "bg-rose-100  text-rose-700  "
                                }
`}
                              >
                                {" "}
                                {row.type === "income" ? "הכנסה" : "הוצאה"}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-3 font-mono text-left font-medium ${
                                row.type === "income"
                                  ? "text-emerald-600 "
                                  : "text-zinc-900"
                              }
`}
                            >
                              {formatCurrency(row.amount, settings.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
