import { useState } from "react";
import { loginWithGoogle } from "./lib/firebase";
import { Wallet, ShieldCheck, Zap, ExternalLink, AlertCircle } from "lucide-react";
export default function Auth() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-900    font-sans p-4 relative overflow-hidden"
      dir="rtl"
    >
      {" "}
      {/* Settings / Dark Mode at the top */}{" "}
      <div className="absolute top-4 left-4 z-50"> </div>{" "}
      {/* Abstract background shapes mimicking premium fintech app glassmorphism */}{" "}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-teal-400/10 blur-[90px]" />
      <div className="max-w-md w-full p-8 sm:p-10 bg-white/95  backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] _25px_60px_-15px_rgba(0,0,0,0.7)] space-y-8 text-center flex flex-col items-center border border-emerald-500/10 ">
        <div
          className="w-20 h-20 bg-emerald-50  text-emerald-600  rounded-[2rem] flex items-center justify-center shadow-inner border border-emerald-100/50  relative animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          {" "}
          <Wallet className="w-10 h-10" />{" "}
          <div className="absolute -top-1 -right-1 bg-emerald-50   text-white p-1 rounded-full border-2 border-white">
            {" "}
            <Zap className="w-3 h-3 fill-white" />{" "}
          </div>{" "}
        </div>{" "}
        <div className="space-y-2">
          {" "}
          <h2 className="text-3xl font-extrabold text-slate-900  -white tracking-tight">
            כניסה לפיננסים
          </h2>{" "}
          <p className="text-slate-500   text-sm leading-relaxed max-w-sm">
            הארנק הדיגיטלי החכם לניהול ההוצאות והתקציב שלך. קל, מהיר ומאובטח כמו
            ביט ופייבוקס!
          </p>{" "}
        </div>{" "}
        {error && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-start gap-3 text-sm text-right">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold leading-relaxed">{error}</p>
              {error.includes("דומיין לא מורשה") && (
                <div className="mt-2 pt-2 border-t border-rose-200 flex flex-col gap-2">
                  <span className="text-xs text-rose-800">הדומיין שיש להוסיף ב-Authorized domains:</span>
                  <div className="flex items-center gap-2 bg-white/80 px-2.5 py-1.5 rounded-lg border border-rose-200 font-mono text-xs text-slate-800 break-all select-all">
                    {window.location.hostname}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-rose-800 font-bold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> פתח בחלון חדש
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="w-full space-y-3">
          {" "}
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600  text-white py-4 px-5 rounded-2xl hover:bg-emerald-700  active:scale-[0.98] transition-all font-semibold flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(5,150,105,0.2)] _10px_20px_rgba(5,150,105,0.4)] hover:shadow-[0_12px_24px_rgba(5,150,105,0.3)] text-base"
          >
            {" "}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              {" "}
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />{" "}
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
                className="opacity-90"
              />{" "}
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
                className="opacity-85"
              />{" "}
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
                className="opacity-95"
              />{" "}
            </svg>{" "}
            התחברות מהירה ומאובטחת{" "}
          </button>{" "}
        </div>{" "}
        <div className="pt-4 border-t border-slate-100  w-full flex items-center justify-center gap-1.5 text-xs text-slate-400  font-medium">
          {" "}
          <ShieldCheck className="w-4 h-4 text-emerald-500" />{" "}
          <span>חיבור מוצפן ומאובטח בחסות Google Auth</span>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
