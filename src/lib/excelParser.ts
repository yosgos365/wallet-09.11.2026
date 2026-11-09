import * as XLSX from "xlsx";
import { excelDateToJSDate } from "./utils";
import { TransactionType, IncomeType } from "../types";

export type ParsedRow = {
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  incomeType?: IncomeType;
  raw: any;
  status: "valid" | "invalid";
  error?: string;
};

export function parseExcelBuffer(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    dateNF: "yyyy-mm-dd",
  });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of arrays so we can dynamically find columns
  // or use JSON array. Let's use JSON array.
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  return jsonData.map((row: any) => {
    let dateStr = "";
    let amount = 0;
    let description = "";
    let type: TransactionType = "expense";
    let incomeType: IncomeType | undefined = undefined;
    let status: "valid" | "invalid" = "valid";
    let error = "";

    // Heuristics to find columns (Hebrew/English)
    const keys = Object.keys(row);

    // Find Date
    const dateKey = keys.find(
      (k) => k.includes("תאריך") || k.toLowerCase().includes("date"),
    );
    if (dateKey && row[dateKey]) {
      const val = row[dateKey];
      if (val instanceof Date) {
        // Fix timezone offset issue if it's considered UTC by XLSX
        dateStr = new Date(val.getTime() - val.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0];
      } else if (typeof val === "number") {
        dateStr = excelDateToJSDate(val).toISOString().split("T")[0];
      } else if (typeof val === "string") {
        // Assume DD/MM/YYYY
        const parts = val.split("/");
        if (parts.length === 3) {
          dateStr = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        } else {
          dateStr = new Date(val).toISOString().split("T")[0];
        }
      }
    }

    // Find Amount
    const amountKey = keys.find(
      (k) =>
        k.includes("סכום") ||
        k.toLowerCase().includes("amount") ||
        k.includes("חובה") ||
        k.includes("זכות"),
    );
    // Default type determination based on amount
    if (amountKey && typeof row[amountKey] === "number") {
      amount = Math.abs(row[amountKey]);
      if (row[amountKey] > 0 && !String(amountKey).includes("חובה")) {
        type = "income";
        incomeType = "ONETIME";
      } else {
        type = "expense";
      }
    }

    // Explicit Type determination if it exists in the row
    const typeKey = keys.find(
      (k) =>
        k.includes("סוג") ||
        k.toLowerCase() === "type" ||
        k.toLowerCase() === "transaction type",
    );
    if (typeKey && row[typeKey]) {
      const v = String(row[typeKey]).toLowerCase();
      if (v.includes("expense") || v.includes("הוצאה")) {
        type = "expense";
      } else if (
        v.includes("income") ||
        v.includes("הכנסה") ||
        v.includes("salary") ||
        v.includes("משכורת")
      ) {
        type = "income";
        incomeType =
          v.includes("salary") || v.includes("משכורת") ? "SALARY" : "ONETIME";
      }
    }

    // Find Description
    const descKey = keys.find(
      (k) =>
        k.includes("תיאור") ||
        k.includes("פרטים") ||
        k.toLowerCase().includes("desc"),
    );
    if (descKey) {
      description = String(row[descKey]);
      if (description.includes("משכורת")) {
        type = "income";
        incomeType = "SALARY";
      }
    }

    if (!dateStr || isNaN(amount) || amount === 0) {
      status = "invalid";
      error = "חסרים נתוני חובה (תאריך, סכום)";
    }

    return {
      date: dateStr,
      amount,
      description,
      type,
      incomeType,
      raw: row,
      status,
      error,
    };
  });
}
