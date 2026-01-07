"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./TransactionHistory.module.css";
import { Transaction, Budget, mapPaymentMethodIdToName } from "@/types";

const currencySymbol = "ZŁ";

interface ApiResponseWrapper<T> {
  data: T;
}

export default function TransactionHistoryPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const now = new Date();
  
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [rawData, setRawData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBudgetsList = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${apiUrl}/api/budget/my-budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json() as Budget[] | ApiResponseWrapper<Budget[]>;
        const list = Array.isArray(data) ? data : data.data;
        setBudgets(list);
        if (list.length > 0 && !selectedBudgetId) {
          setSelectedBudgetId(list[0].id);
        }
      }
    } catch {
      setBudgets([]);
    }
  };

   const refreshTransactions = async (budgetId: number, year: number, month: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(
        `${apiUrl}/api/Reports/stats?year=${year}&month=${month}&budgetId=${budgetId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json() as Transaction[];
        setRawData(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBudgetsList();
  }, []);

  useEffect(() => {
    if (selectedBudgetId) {
      refreshTransactions(selectedBudgetId, selectedYear, selectedMonth);
    }
  }, [selectedBudgetId, selectedYear, selectedMonth]);


  const { totalIncome, totalExpenses } = useMemo(() => {
    return rawData.reduce(
      (acc, t) => {
        const amount = Number(t.amount) || 0;
        if (t.type === 0) acc.totalIncome += amount;
        if (t.type === 1) acc.totalExpenses += amount;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );
  }, [rawData]);

  const balance = totalIncome - totalExpenses;

   const monthLabel = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    const m = d.toLocaleString("pl-PL", { month: "long" }).toUpperCase();
    return `${m} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const goPrevMonth = () => {
    setSelectedMonth((m) => {
      if (m === 1) {
        setSelectedYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setSelectedMonth((m) => {
      if (m === 12) {
        setSelectedYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  };

  return (
    <main className={styles.pageContainer}>
      <div className={styles.headerTitle}>Historia transakcji</div>

      <div className={styles.divider} />

      <div className={styles.breadcrumbsContainer}>
        <span className={styles.crumbLink}>Dashboard</span>
        <span style={{ color: "#EAC278", margin: "0 4px" }}>&gt;</span>
        <span className={styles.crumbActive}>Historia transakcji</span>
      </div>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Bilans</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>{loading ? "--,--" : balance.toFixed(2)}</span>
            <span className={styles.cardCurrency}>{currencySymbol}</span>
          </div>
          <div className={styles.cardDescription}>
            (różnica między przychodami a wydatkami z danego miesiąca)
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Oszczędności</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>{loading ? "--,--" : "0.00"}</span>
            <span className={styles.cardCurrency}>{currencySymbol}</span>
          </div>
          <div className={styles.cardDescription}>
            (tyle udało Ci się zaoszczędzić z poprzednich miesięcy)
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Przychody</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>{loading ? "--,--" : totalIncome.toFixed(2)}</span>
            <span className={styles.cardCurrency}>{currencySymbol}</span>
          </div>
          <div className={styles.cardDescription} style={{ visibility: "hidden", height: "14px" }}>
            .
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Wydatki</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>{loading ? "--,--" : totalExpenses.toFixed(2)}</span>
            <span className={styles.cardCurrency}>{currencySymbol}</span>
          </div>
          <div className={styles.cardDescription} style={{ visibility: "hidden", height: "14px" }}>
            .
          </div>
        </div>
      </section>

      <section className={styles.dateNavRow}>
        <button className={`${styles.navButton} ${styles.navBox}`} onClick={goPrevMonth} type="button">
          <svg
            width="14"
            height="24"
            viewBox="0 0 14 24"
            fill="none"
            className={styles.iconSvg}
            style={{ transform: "rotate(180deg)" }}
          >
            <path
              d="M1.11328 22.1656L11.1619 11.1558L1.11328 1.06353"
              stroke="white"
              strokeWidth="3.01459"
            />
          </svg>
        </button>

        <div className={`${styles.navBox} ${styles.dateLabel}`}>{monthLabel}</div>

        <button className={`${styles.navButton} ${styles.navBox}`} onClick={goNextMonth} type="button">
          <svg width="14" height="24" viewBox="0 0 14 24" fill="none" className={styles.iconSvg}>
            <path
              d="M1.11328 22.1656L11.1619 11.1558L1.11328 1.06353"
              stroke="white"
              strokeWidth="3.01459"
            />
          </svg>
        </button>
      </section>

      <section className={styles.tableWrapper}>
        <table className={styles.transactionTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Rodzaj transakcji</th>
              <th>Kategoria</th>
              <th>Opis</th>
              <th>Metoda płatności</th>
              <th>Kwota</th>
              <th>Użytkownik</th>
              <th>Opcje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={8}>Ładowanie...</td></tr>
            ) : rawData.length === 0 ? (
               <tr><td colSpan={8}>Brak danych</td></tr>
            ) : (
              rawData.map((t, idx) => (
                <tr key={t.id ?? idx}>
                  <td>{t.date ? new Date(t.date).toLocaleDateString("pl-PL") : "-"}</td>
                  <td>{t.type === 0 ? "PRZYCHÓD" : "WYDATEK"}</td>
                  <td>{t.categoryName ?? "-"}</td>
                  <td>{t.title ?? "-"}</td>
                  <td>{mapPaymentMethodIdToName(t.paymentMethod)}</td>
                  <td style={{ color: t.type === 1 ? "#FF6B6B" : "#8CC279", fontWeight: 700 }}>
                    {t.type === 1 ? "-" : ""}{Number(t.amount).toFixed(2)} {currencySymbol}
                  </td>
                  <td>{t.userName ?? "-"}</td>
                   <td>
                    <button className={styles.optionButton} type="button">
                      Szczegóły
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
