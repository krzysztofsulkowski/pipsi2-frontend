"use client";

import { useEffect, useState, FormEvent } from "react";
import styles from "./Dashboard.module.css";
import CategoryChart from "./charts/CategoryChart";
import UserBarChart from "./charts/UserBarChart";
import Link from "next/link";
import Image from "next/image";

const currencySymbol = "zł";

export interface Transaction {
    category?: string;
    Category?: string;
    amount?: number | string;
    Amount?: number | string;
    userName?: string;
}

interface Budget {
    id?: number;
    name?: string;
    budgetName?: string;
    [key: string]: string | number | undefined | unknown; 
}

interface UserResponse {
    userName: string;
    email?: string;
}

type ApiResponse = Budget[] | { data: Budget[] };

function DashboardPage() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [userName, setUserName] = useState<string>("Użytkowniku");

    const [rawData, setRawData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetsLoading, setBudgetsLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const refreshBudgetsList = async () => {
        setBudgetsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${apiUrl}/api/budget/my-budgets`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                let budgetsArray: Budget[] = [];
                if (Array.isArray(data)) {
                    budgetsArray = data;
                } else if ('data' in data && Array.isArray(data.data)) {
                    budgetsArray = data.data;
                }
                setBudgets(budgetsArray);
            } else {
                 setBudgets([]);
            }
        } catch (e) {
            console.error("Błąd pobierania budżetów", e);
            setBudgets([]);
        } finally {
            setBudgetsLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

            const fetchUser = async () => {
                try {
                    const res = await fetch(`${apiUrl}/api/authentication/me`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data: UserResponse = await res.json();
                        if (data.userName) setUserName(data.userName);
                    }
                } catch (error) {
                    console.error("Błąd user data", error);
                }
            };

            await Promise.all([
                fetchUser(),
                refreshBudgetsList()
            ]);
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("authToken");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                const url = `${apiUrl}/api/Reports/stats?year=${selectedYear}&month=${selectedMonth}`;

                const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
                const res = await fetch(url, { headers });

                if (!res.ok) {
                    if (res.status === 401) console.log("Nieautoryzowany dostęp");
                    setBudgets([]); 
                    return;
                }
                const data = await res.json();
                setRawData(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Błąd pobierania statystyk", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [selectedYear, selectedMonth]);
    const totalExpenses = rawData.reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0
    );

    const hasBudgets = budgets.length > 0;

    const handleOpenCreateModal = () => {
        setCreateError(null);
        setNewBudgetName("");
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateBudget = async (event: FormEvent) => {
        event.preventDefault();
        setCreateError(null);

        if (!newBudgetName.trim()) {
            setCreateError("Podaj nazwę budżetu.");
            return;
        }

        setIsCreating(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

             const token = localStorage.getItem("authToken");

            if (!token) {
                setCreateError("Nie jesteś zalogowany.");
                setIsCreating(false);
                return;
            }

            const body = {
                name: newBudgetName.trim()
            };

            const res = await fetch(`${apiUrl}/api/budget/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                setCreateError("Nie udało się utworzyć budżetu.");
                return;
            }

            setIsCreateModalOpen(false);
            await refreshBudgetsList();            
        } catch (e) {
            console.error("Błąd tworzenia budżetu", e);
            setCreateError("Wystąpił błąd podczas tworzenia budżetu.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>BALANCR</div>
                    {hasBudgets && (
                        <div className={styles.budgetSelector}>
                            <button className={styles.budgetButton}>
                                <span>[nazwa wybranego budżetu]</span>
                                <span className={styles.budgetArrow}>▼</span>
                            </button>
                        </div>
                    )}
                </div>

                <nav className={styles.nav}>
                    <Link href="/tips" className={styles.navLink}>
                        Porady finansowe
                    </Link>

                    <Link href="/FAQ" className={styles.navLink}>
                        FAQ
                    </Link>

                    <Link href="/about-us" className={styles.navLink}>
                        O nas
                    </Link>
                </nav>
            </header>

            <main className={styles.main}>
                {budgetsLoading ? (
                    <div className={styles.loadingWrapper}>
                        <p className={styles.loadingText}>
                            Ładowanie Twoich budżetów...
                        </p>
                    </div>
                ) : !hasBudgets ? (
                    <section className={styles.emptyState}>
                        <div className={styles.emptyHero}>
                            <div className={styles.emptyTextColumn}>
                                <h1 className={styles.greetingTitle}>
                                    Cześć,{" "}
                                    <span className={styles.greetingHighlight}>
                                        {userName} 
                                    </span>
                                    !
                                    </h1>
                                    <div className={styles.greetingUnderline} />

                                <p className={styles.emptySubtitle}>
                                    Twoja finansowa{" "}
                                    <span
                                        className={styles.greetingHighlight}
                                    >
                                        równowaga
                                    </span>{" "}
                                    zaczyna się tutaj.
                                </p>

                                <div className={styles.emptyBox}>
                                    <p className={styles.emptyTitle}>
                                        Nie masz jeszcze żadnego budżetu.
                                    </p>
                                    <p className={styles.emptyDescription}>
                                        Utwórz swój pierwszy, by śledzić
                                        wydatki, planować oszczędności i odkryć,
                                        jak wygląda Twoja finansowa codzienność
                                        w liczbach.
                                    </p>
                                    <button
                                        type="button"
                                        className={styles.emptyButton}
                                        onClick={handleOpenCreateModal}
                                    >
                                        Utwórz nowy budżet
                                    </button>
                                </div>
                            </div>

                                <div className={styles.heroGraphic}>
                                     <Image
                                        src="/wallet.svg"
                                        alt="Portfel"
                                        width={400}
                                        height={400}
                                        className={styles.heroImage}
                                        priority
                                    />
                                </div>
                        </div>
                    </section>
                ) : (
                    <>
                        <section className={styles.greeting}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    flexWrap: "wrap",
                                    gap: "20px"
                                }}
                            >
                                <div>
                                    <h1 className={styles.greetingTitle}>
                                        Cześć,{" "}
                                        <span
                                            className={styles.greetingHighlight}
                                        >
                                           {userName}
                                        </span>
                                        !
                                    </h1>

                                <div className={styles.greetingUnderline} />

                                    <p className={styles.greetingSubtitle}>
                                        Twoja finansowa{" "}
                                        <span
                                            className={styles.greetingHighlight}
                                        >
                                            równowaga
                                        </span>{" "}
                                        zaczyna się tutaj.
                                        <br />
                                        <span
                                            style={{
                                                fontSize: "0.9em",
                                                opacity: 0.8,
                                                fontWeight: "normal"
                                            }}
                                        >
                                            Wybrany okres:{" "}
                                            {selectedMonth === 0
                                                ? "Cały Rok"
                                                : selectedMonth}{" "}
                                            / {selectedYear}
                                        </span>
                                    </p>
                                </div>

                                <div 
                                    style={{ display: "flex", gap: "10px" }}
                                >
                                    <select
                                        value={selectedYear}
                                        onChange={(e) =>
                                            setSelectedYear(
                                                Number(e.target.value)
                                            )
                                        }
                                        style={{
                                            padding: "8px",
                                            borderRadius: "6px",
                                            background: "#374151",
                                            color: "white",
                                            border: "1px solid #4B5563"
                                        }}
                                    >
                                        <option value={2024}>2024</option>
                                        <option value={2025}>2025</option>
                                        <option value={2026}>2026</option>
                                    </select>

                                    <select
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(
                                                Number(e.target.value)
                                            )
                                        }
                                        style={{
                                            padding: "8px",
                                            borderRadius: "6px",
                                            background: "#374151",
                                            color: "white",
                                            border: "1px solid #4B5563"
                                        }}
                                    >
                                        <option value={0}>Cały rok</option>
                                        <option value={1}>Styczeń</option>
                                        <option value={2}>Luty</option>
                                        <option value={3}>Marzec</option>
                                        <option value={4}>Kwiecień</option>
                                        <option value={5}>Maj</option>
                                        <option value={6}>Czerwiec</option>
                                        <option value={7}>Lipiec</option>
                                        <option value={8}>Sierpień</option>
                                        <option value={9}>Wrzesień</option>
                                        <option value={10}>Październik</option>
                                        <option value={11}>Listopad</option>
                                        <option value={12}>Grudzień</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.greetingUnderline} />
                        </section>

                        <section className={styles.topRow}>
                            <div className={styles.topCards}>
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <p className={styles.cardTitle}>
                                            Twój aktualny bilans
                                        </p>
                                    </div>
                                    <div className={styles.cardValue}>
                                        <span
                                            className={styles.cardValueNumber}
                                        >
                                            --,--
                                        </span>
                                        <span
                                            className={styles.cardValueCurrency}
                                        >
                                            {currencySymbol}
                                        </span>
                                    </div>
                                    <p className={styles.cardDescription}>
                                        różnica między przychodami a
                                        wydatkami z bieżącego miesiąca
                                    </p>
                                </div>

                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <p className={styles.cardTitle}>
                                            Oszczędności
                                        </p>
                                    </div>
                                    <div className={styles.cardValue}>
                                        <span
                                            className={styles.cardValueNumber}
                                        >
                                            --,--
                                        </span>
                                        <span
                                            className={styles.cardValueCurrency}
                                        >
                                            {currencySymbol}
                                        </span>
                                    </div>
                                    <p className={styles.cardDescription}>
                                        tyle udało Ci się zaoszczędzić z
                                        poprzednich miesięcy
                                    </p>
                                </div>

                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <p className={styles.cardTitle}>
                                            Przychody
                                        </p>
                                    </div>
                                    <div className={styles.cardValue}>
                                        <span
                                            className={styles.cardValueNumber}
                                        >
                                            --,--
                                        </span>
                                        <span
                                            className={styles.cardValueCurrency}
                                        >
                                            {currencySymbol}
                                        </span>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.primaryButton}
                                        >
                                            Dodaj przychód
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <p className={styles.cardTitle}>
                                            Wydatki
                                        </p>
                                    </div>
                                    <div className={styles.cardValue}>
                                        <span
                                            className={styles.cardValueNumber}
                                        >
                                            {totalExpenses.toFixed(2)}
                                        </span>
                                        <span
                                            className={styles.cardValueCurrency}
                                        >
                                            {currencySymbol}
                                        </span>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.secondaryButton}
                                        >
                                            Dodaj wydatek
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <aside className={styles.sidePanel}>
                                <div className={styles.historyCard}>
                                    <div className={styles.historyHeader}>
                                        <p className={styles.cardTitle}>
                                            Historia transakcji
                                        </p>
                                    </div>
                                    <div className={styles.historyBody}>
                                        <p
                                            className={
                                                styles.historyEmptyTitle
                                            }
                                        >
                                            Brak danych do wyświetlenia.
                                        </p>
                                        <p
                                            className={
                                                styles.historyEmptyText
                                            }
                                        >
                                            Dodaj swoje pierwsze
                                            przychody i wydatki, aby
                                            zobaczyć historię
                                            transakcji.
                                        </p>
                                        <Link
                                            href="/transactions"
                                            className={styles.historyButton}
                                        >
                                            <div className={styles.historyIcon}>
                                                <Image
                                                    src="/history-icon.svg"
                                                    alt="Ikona historii"
                                                    width={51}
                                                    height={51}
                                                />
                                            </div>
                                            <span
                                                className={
                                                    styles.historyButtonText
                                                }
                                            >
                                                ZOBACZ PEŁNĄ HISTORIĘ
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                <div className={styles.fabList}>
                                    <button className={styles.fabItem}>
                                        <span className={styles.fabLabel}>
                                            Planowane wydatki
                                        </span>
                                    </button>
                                    <button className={styles.fabItem}>
                                        <span className={styles.fabLabel}>
                                            Członkowie budżetu
                                        </span>
                                    </button>
                                    <button className={styles.fabItem}>
                                        <span className={styles.fabLabel}>
                                            Ustawienia budżetu
                                        </span>
                                    </button>
                                </div>
                            </aside>
                        </section>

                        <section className={styles.statsGrid}>
                            <div className={styles.statsCard}>
                                <div className={styles.statsHeader}>
                                    <h3>Wydatki wg Kategorii</h3>
                                </div>
                                <div className={styles.statsBody}>
                                    {loading ? (
                                        <p
                                            style={{
                                                color: "#aaa",
                                                textAlign: "center"
                                            }}
                                        >
                                            Ładowanie danych...
                                        </p>
                                    ) : (
                                        <CategoryChart data={rawData} />
                                    )}
                                </div>
                            </div>

                            <div className={styles.statsCard}>
                                <div className={styles.statsHeader}>
                                    <h3>Wydatki wg Członków</h3>
                                </div>
                                <div className={styles.statsBody}>
                                    {loading ? (
                                        <p
                                            style={{
                                                color: "#aaa",
                                                textAlign: "center"
                                            }}
                                        >
                                            Ładowanie danych...
                                        </p>
                                    ) : (
                                        <UserBarChart data={rawData} />
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className={styles.footerCta}>
                            <p className={styles.footerText}>
                                Potrzebujesz inspiracji, jak zachować
                                finansową równowagę? Odkryj praktyczne
                                wskazówki i proste sposoby na mądre
                                planowanie wydatków.
                            </p>
                            <button className={styles.footerButton}>
                                poznaj porady od BALANCR
                            </button>
                        </section>
                    </>
                )}
            </main>

            {isCreateModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>
                            Utwórz nowy budżet
                        </h2>
                        <form
                            className={styles.modalForm}
                            onSubmit={handleCreateBudget}
                        >
                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>
                                    Nazwa budżetu
                                </label>
                                <input
                                    className={styles.modalInput}
                                    type="text"
                                    value={newBudgetName}
                                    onChange={(e) =>
                                        setNewBudgetName(e.target.value)
                                    }
                                    placeholder="Np. Domowy budżet 2025"
                                />
                            </div>

                            {createError && (
                                <p className={styles.modalError}>
                                    {createError}
                                </p>
                            )}

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.modalSecondaryButton}
                                    onClick={handleCloseCreateModal}
                                    disabled={isCreating}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className={styles.modalPrimaryButton}
                                    disabled={isCreating}
                                >
                                    {isCreating
                                        ? "Zapisywanie..."
                                        : "Utwórz budżet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
