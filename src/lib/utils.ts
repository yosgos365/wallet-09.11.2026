import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate Excel Serial Date to JS Date
export function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds,
  );
}

// Format Date safely
export function formatDate(dateStr: string | Date) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch (e) {
    return dateStr.toString();
  }
}

export function formatCurrency(amount: number, currency: "ILS" | "USD" = "ILS"): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  if (currency === "ILS") {
    return `₪${safeAmount.toLocaleString("he-IL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return safeAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function getCurrencySymbol(currency: "ILS" | "USD" = "ILS"): string {
  return currency === "ILS" ? "₪" : "$";
}

