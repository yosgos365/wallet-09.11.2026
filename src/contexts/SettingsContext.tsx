import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { UserSettings } from "../types";

type SettingsContextType = {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
};

const defaultSettings: UserSettings = {
  currency: "ILS",
  trackInvestments: false,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: false,
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem("fin_user_settings");
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      // ignore
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "fin_users", user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const merged: UserSettings = {
            currency: data.currency === "USD" ? "USD" : "ILS",
            trackInvestments: !!data.trackInvestments,
          };
          setSettings(merged);
          try {
            localStorage.setItem("fin_user_settings", JSON.stringify(merged));
          } catch (e) {
            // ignore
          }
        }
        setLoading(false);
      },
      () => {
        // Fallback to local
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem("fin_user_settings", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    if (user) {
      try {
        await setDoc(
          doc(db, "fin_users", user.uid),
          {
            currency: updated.currency,
            trackInvestments: updated.trackInvestments,
          },
          { merge: true },
        );
      } catch (e) {
        console.error("Failed to sync settings to Firestore:", e);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
