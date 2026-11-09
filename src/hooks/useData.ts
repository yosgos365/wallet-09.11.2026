import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, handleFirestoreError } from "../lib/firebase";
import type { Transaction, Pocket, IncomeSource } from "../types";

export function useTransactions(userId: string | undefined) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, `fin_users/${userId}/fin_transactions`),
      orderBy("date", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            createdAt: d.createdAt?.toDate?.() || new Date(),
            updatedAt: d.updatedAt?.toDate?.() || new Date(),
          } as Transaction;
        });
        items.sort((a, b) => {
          const timeA = new Date(a.date).getTime() || 0;
          const timeB = new Date(b.date).getTime() || 0;
          if (timeB !== timeA) return timeB - timeA;
          return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
        });
        setData(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          "list" as any,
          `fin_users/${userId}/fin_transactions`,
        );
      },
    );
    return () => unsubscribe();
  }, [userId]);

  return { data, loading };
}

export function usePockets(userId: string | undefined) {
  const [data, setData] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, `fin_users/${userId}/fin_pockets`),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              ...d,
              id: doc.id,
              createdAt: d.createdAt?.toDate?.() || new Date(),
              updatedAt: d.updatedAt?.toDate?.() || new Date(),
            } as Pocket;
          }),
        );
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          "list" as any,
          `fin_users/${userId}/fin_pockets`,
        );
      },
    );
    return () => unsubscribe();
  }, [userId]);

  return { data, loading };
}

export function useIncomeSources(userId: string | undefined) {
  const [data, setData] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, `fin_users/${userId}/fin_income_sources`),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              ...d,
              id: doc.id,
              createdAt: d.createdAt?.toDate?.() || new Date(),
              updatedAt: d.updatedAt?.toDate?.() || new Date(),
            } as IncomeSource;
          }),
        );
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          "list" as any,
          `fin_users/${userId}/fin_income_sources`,
        );
      },
    );
    return () => unsubscribe();
  }, [userId]);

  return { data, loading };
}

export function useFixedExpenses(userId: string | undefined) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, `fin_users/${userId}/fin_fixed_expenses`),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              ...d,
              id: doc.id,
              createdAt: d.createdAt?.toDate?.() || new Date(),
              updatedAt: d.updatedAt?.toDate?.() || new Date(),
            } as any;
          }),
        );
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          "list" as any,
          `fin_users/${userId}/fin_fixed_expenses`,
        );
      },
    );
    return () => unsubscribe();
  }, [userId]);

  return { data, loading };
}
