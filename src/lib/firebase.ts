import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
export const auth = getAuth(app);

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Login failed", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('החלונית נחסמה בדפדפן. אנא אפשר חלונות קופצים (Popups) או פתח את האפליקציה בכרטיסייה חדשה.');
    }
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`דומיין לא מורשה (${window.location.hostname}). יש להוסיף דומיין זה ב-Firebase Console -> Authentication -> Settings -> Authorized domains.`);
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('התחברות עם Google אינה מופעלת עדיין בפרויקט. יש להפעיל את Google ב-Firebase Console -> Authentication -> Sign-in method.');
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('חלונית ההתחברות נסגרה לפני השלמת הפעולה.');
    }
    throw new Error(error.message || 'שגיאה בהתחברות, נסה שנית.');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
