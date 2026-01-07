"use client";

import { useEffect, useState, FormEvent, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import CategoryChart from "./charts/CategoryChart";
import UserBarChart from "./charts/UserBarChart";
import Link from "next/link";
import Image from "next/image";
import { Transaction, Budget } from "@/types";

const currencySymbol = "zł";

interface UserResponse {
    userName: string;
    email?: string;
}

interface BudgetListResponse { data?: Budget[] } 

interface CategoryDto {
    id: number;
    name: string;
}

interface PaymentMethodDto {
    value: number;
    name: string;
}

interface FrequencyDto {
    value: number;
    name: string;
}

interface ExpenseRequestBody { 
    categoryId: number;
    description: string;
    paymentMethod: number;
    amount: number;
    expenseType: number;
    receiptImageUrl: string | null;
    frequency: number | null;
    startDate: string | null;
    endDate: string | null;
}

function DashboardPage() {
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [userName, setUserName] = useState<string>("Użytkowniku");

    const [rawData, setRawData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetsLoading, setBudgetsLoading] = useState(true);

    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const [isBudgetMenuOpen, setIsBudgetMenuOpen] = useState(false);
    const budgetMenuRef = useRef<HTMLDivElement | null>(null);

    const currentBudget = budgets.find(b => b.id === selectedBudgetId);

    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [incomeDescription, setIncomeDescription] = useState("");
    const [incomeAmountInput, setIncomeAmountInput] = useState("");
    const [incomeErrors, setIncomeErrors] = useState<{ description?: string; amount?: string; form?: string }>({});
    const [isIncomeSaving, setIsIncomeSaving] = useState(false);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseCategories, setExpenseCategories] = useState<CategoryDto[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
    const [frequencies, setFrequencies] = useState<FrequencyDto[]>([]);
    const [dictionariesLoading, setDictionariesLoading] = useState(false);

    const [expenseCategoryId, setExpenseCategoryId] = useState<string>("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expensePaymentMethod, setExpensePaymentMethod] = useState<string>("");
    const [expenseAmountInput, setExpenseAmountInput] = useState("");
    const [expenseType, setExpenseType] = useState<"instant" | "recurring" | "planned">("instant");
    const [expenseFrequency, setExpenseFrequency] = useState<string>("");
    const [expenseStartDate, setExpenseStartDate] = useState<string>("");
    const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({});
    const [isExpenseSaving, setIsExpenseSaving] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const refreshBudgetsList = async () => {
        setBudgetsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const res = await fetch(`${apiUrl}/api/budget/my-budgets`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json() as Budget[] | BudgetListResponse; 
                let budgetsArray: Budget[] = [];
                if (Array.isArray(data)) {
                    budgetsArray = data;
                } else if (data && data.data && Array.isArray(data.data)) { 
                    budgetsArray = data.data;
                }
                setBudgets(budgetsArray);

                if (budgetsArray.length > 0) {
                    const currentIdValid = selectedBudgetId && budgetsArray.some(b => b.id === selectedBudgetId);
                    if (!currentIdValid) {
                        setSelectedBudgetId(budgetsArray[0].id);
                    }
                } else {
                    setLoading(false);
                }
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

    const refreshStats = async (budgetId: number, year: number, month: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const url = `${apiUrl}/api/Reports/stats?year=${year}&month=${month}&budgetId=${budgetId}`;

            const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
            const res = await fetch(url, { headers });

            if (!res.ok) {
                if (res.status === 401) setBudgets([]);
                return;
            }

            const data = await res.json() as Transaction[];
            setRawData(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Błąd pobierania statystyk", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;

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
        if (!selectedBudgetId) return;
        refreshStats(selectedBudgetId, selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, selectedBudgetId]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!isBudgetMenuOpen) return;
            if (!budgetMenuRef.current) return;
            if (!budgetMenuRef.current.contains(e.target as Node)) {
                setIsBudgetMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [isBudgetMenuOpen]);

    const { totalIncome, totalExpenses } = rawData.reduce(
        (acc, curr) => {
            const amount = Number(curr.amount) || 0; 
            if (curr.type === 0) { 
                acc.totalIncome += amount;
            } else if (curr.type === 1) {
                acc.totalExpenses += amount;
            }
            return acc;
        },
        { totalIncome: 0, totalExpenses: 0 }
    );

    const currentBalance = totalIncome - totalExpenses;

    const hasBudgets = budgets.length > 0;
    const expenseOnlyData = rawData.filter(t => t.type === 1);
     const recentTransactions = useMemo(() => {
        const toTime = (d: string | Date | undefined) => { 
            const t = d ? new Date(d).getTime() : 0;
            return Number.isFinite(t) ? t : 0;
        };

        return [...rawData]
            .sort((a, b) => toTime(b.date) - toTime(a.date)) 
            .slice(0, 7);
    }, [rawData]);

     const formatDatePL = (d: string | Date | undefined) => {
        if (!d) return "-";
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "-";
        return dt.toLocaleDateString("pl-PL");
    };

    const formatAmountPL = (amount: number | string | undefined) => {
        const n = Number(amount);
        const val = Number.isFinite(n) ? Math.abs(n) : 0;
        return val.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };


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

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsProfileMenuOpen(false);
        router.push("/login");
    };

    const isValidMoneyInput = (value: string) => {
        if (!value.trim()) return false;
        const normalized = value.replace(",", ".");
        return /^\d+(\.\d{0,2})?$/.test(normalized);
    };

    const normalizeMoneyToTwoDecimals = (value: string) => {
        const normalized = value.replace(",", ".").trim();
        if (!normalized) return "";
        if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return value;
        const num = Number(normalized);
        if (!Number.isFinite(num)) return value;
        return num.toFixed(2);
    };

    const handleOpenIncomeModal = () => {
        if (!selectedBudgetId) return;
        setIncomeDescription("");
        setIncomeAmountInput("");
        setIncomeErrors({});
        setIsIncomeModalOpen(true);
    };

    const handleCloseIncomeModal = () => {
        setIsIncomeModalOpen(false);
    };

    const handleSaveIncome = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedBudgetId) return;

        const nextErrors: { description?: string; amount?: string; form?: string } = {};

        if (!incomeDescription.trim()) nextErrors.description = "To pole jest wymagane.";
        if (!incomeAmountInput.trim()) {
            nextErrors.amount = "To pole jest wymagane.";
        } else if (!isValidMoneyInput(incomeAmountInput)) {
            nextErrors.amount = "Wprowadź prawidłową kwotę.";
        } else {
            const num = Number(incomeAmountInput.replace(",", "."));
            if (!Number.isFinite(num) || num <= 0) nextErrors.amount = "Wprowadź prawidłową kwotę.";
        }

        setIncomeErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsIncomeSaving(true);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setIncomeErrors({ form: "Nie jesteś zalogowany." });
                return;
            }

            const amount = Number(incomeAmountInput.replace(",", "."));
            const body = {
                description: incomeDescription.trim(),
                amount,
                date: new Date().toISOString()
            };

            const res = await fetch(`${apiUrl}/api/budget/${selectedBudgetId}/income`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                setIncomeErrors({ form: "Nie udało się dodać przychodu." });
                return;
            }

            setIsIncomeModalOpen(false);
            await refreshStats(selectedBudgetId, selectedYear, selectedMonth);
        } catch (err) {
            console.error("Błąd dodawania przychodu", err);
            setIncomeErrors({ form: "Wystąpił błąd podczas dodawania przychodu." });
        } finally {
            setIsIncomeSaving(false);
        }
    };

    const loadExpenseDictionaries = async () => {
        setDictionariesLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

             const headers = { "Authorization": `Bearer ${token}` };
            
            const [catRes, pmRes, frRes] = await Promise.all([
                fetch(`${apiUrl}/api/categories`, { headers }),
                fetch(`${apiUrl}/api/payment-methods`, { headers }),
                fetch(`${apiUrl}/api/dictionaries/frequencies`, { headers })
            ]);

            if (catRes.ok) {
                 const cats = await catRes.json() as CategoryDto[];
                setExpenseCategories(Array.isArray(cats) ? cats : []);
            } else {
                setExpenseCategories([]);
            }

             if (pmRes.ok) {
                const pms = await pmRes.json();
                const pmData = Array.isArray(pms) ? pms : (pms.data || []);
                
                const formattedPms: PaymentMethodDto[] = pmData.map((item: { id?: number; value?: number; name: string }) => ({
                    value: item.id ?? item.value ?? 0,
                    name: item.name
                }));
                setPaymentMethods(formattedPms);
            } else {
                console.error("Nie udało się pobrać metod płatności:", pmRes.status);
                setPaymentMethods([]);
            }


            if (frRes.ok) {
                const frs = await frRes.json() as FrequencyDto[];
                setFrequencies(Array.isArray(frs) ? frs : []);
            } else {
                setFrequencies([]);
            }
        } catch (e) {
            console.error("Błąd pobierania słowników", e);
            setExpenseCategories([]);
            setPaymentMethods([]);
            setFrequencies([]);
        } finally {
            setDictionariesLoading(false);
        }
    };

    const handleOpenExpenseModal = async () => {
        if (!selectedBudgetId) return;

        setExpenseErrors({});
        setExpenseCategoryId("");
        setExpenseDescription("");
        setExpensePaymentMethod("");
        setExpenseAmountInput("");
        setExpenseType("instant");
        setExpenseFrequency("");
        setExpenseStartDate("");

        setIsExpenseModalOpen(true);
        await loadExpenseDictionaries();
    };

    const handleCloseExpenseModal = () => {
        setIsExpenseModalOpen(false);
    };

    const validateExpenseForm = () => {
        const next: Record<string, string> = {};

        if (!expenseCategoryId) next.categoryId = "To pole jest wymagane.";
        if (!expenseDescription.trim()) next.description = "To pole jest wymagane.";
        if (!expensePaymentMethod) next.paymentMethod = "To pole jest wymagane.";

        if (!expenseAmountInput.trim()) {
            next.amount = "To pole jest wymagane.";
        } else if (!isValidMoneyInput(expenseAmountInput)) {
            next.amount = "Wprowadź prawidłową kwotę.";
        } else {
            const num = Number(expenseAmountInput.replace(",", "."));
            if (!Number.isFinite(num) || num <= 0) next.amount = "Wprowadź prawidłową kwotę.";
        }

        if (!expenseType) next.expenseType = "To pole jest wymagane.";

        if (expenseType === "recurring") {
            if (!expenseFrequency) next.frequency = "To pole jest wymagane.";
            if (!expenseStartDate) next.startDate = "To pole jest wymagane.";
        }

        if (expenseType === "planned") {
            if (!expenseStartDate) next.startDate = "To pole jest wymagane.";
        }

        return next;
    };

    const handleSaveExpense = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedBudgetId) return;

        const nextErrors = validateExpenseForm();
        setExpenseErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsExpenseSaving(true);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setExpenseErrors({ form: "Nie jesteś zalogowany." });
                return;
            }

            const expenseTypeValue = expenseType === "instant" ? 0 : expenseType === "recurring" ? 1 : 2;

            const body: ExpenseRequestBody = { 
                categoryId: Number(expenseCategoryId),
                description: expenseDescription.trim(),
                paymentMethod: Number(expensePaymentMethod),
                amount: Number(expenseAmountInput.replace(",", ".")),
                expenseType: expenseTypeValue,
                receiptImageUrl: null,
                frequency: expenseType === "recurring" ? Number(expenseFrequency) : null, 
                startDate: (expenseType === "recurring" || expenseType === "planned") ? new Date(expenseStartDate).toISOString() : null, // Mapowanie daty
                endDate: null
            };

            const res = await fetch(`${apiUrl}/api/budget/${selectedBudgetId}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                let message = "Nie udało się dodać wydatku.";
                try {
                    const err = await res.json();
                    if (err?.detail && typeof err.detail === "string") message = err.detail;
                } catch { }

                setExpenseErrors({ form: message });
                return;
            }

            setIsExpenseModalOpen(false);
            await refreshStats(selectedBudgetId, selectedYear, selectedMonth);
        } catch (err) {
            console.error("Błąd dodawania wydatku", err);
            setExpenseErrors({ form: "Wystąpił błąd podczas dodawania wydatku." });
        } finally {
            setIsExpenseSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/logo.svg" alt="Logo aplikacji" className={styles.logoImage} />
                    {hasBudgets && (
                        <div className={styles.budgetSelector} ref={budgetMenuRef}>
                            <button
                                type="button"
                                className={styles.budgetButton}
                                onClick={() => setIsBudgetMenuOpen(!isBudgetMenuOpen)}
                            >
                                <span className={styles.budgetButtonText}>
                                    {currentBudget?.name || (currentBudget as any)?.budgetName || (selectedBudgetId ? `Budżet #${selectedBudgetId}` : "")}
                                </span>
                                <Image
                                    src="/arrow-down.svg"
                                    alt=""
                                    width={14}
                                    height={14}
                                    className={styles.budgetArrow}
                                />
                            </button>

                            {isBudgetMenuOpen && (
                                <div className={styles.budgetDropdown}>
                                    {budgets.map(b => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            className={styles.budgetDropdownItem}
                                            onClick={() => {
                                                setSelectedBudgetId(b.id);
                                                setIsBudgetMenuOpen(false);
                                            }}
                                        >
                                            {b.name || (b as any).budgetName || `Budżet #${b.id}`}
                                        </button>
                                    ))}

                                    <div className={styles.profileDropdownDivider} />

                                    <button
                                        type="button"
                                        className={styles.budgetDropdownItem}
                                        onClick={() => {
                                            setIsBudgetMenuOpen(false);
                                            handleOpenCreateModal();
                                        }}
                                    >
                                        Dodaj nowy budżet
                                    </button>
                                </div>
                            )}
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

                    <div className={styles.profileMenu}>
                        <button
                            type="button"
                            className={styles.profileButton}
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        >
                            <Image
                                src="/profile-icon.svg"
                                alt="Profil"
                                width={22}
                                height={22}
                            />
                        </button>

                        {isProfileMenuOpen && (
                            <div className={styles.profileDropdown}>
                                <button
                                    type="button"
                                    className={styles.profileDropdownItem}
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Ustawienia
                                </button>

                                <button
                                    type="button"
                                    className={styles.profileDropdownItem}
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Zmiana języka
                                </button>

                                <div className={styles.profileDropdownDivider} />

                                <button
                                    type="button"
                                    className={styles.profileDropdownItemDanger}
                                    onClick={handleLogout}
                                >
                                    Wyloguj się
                                </button>
                            </div>
                        )}
                    </div>
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
                                            style={{
                                                color: currentBalance < 0 ? "#DD7D7D" : "#8CC279"
                                            }}
                                        >
                                            {loading ? "--,--" : currentBalance.toFixed(2)}
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
                                    <span className={styles.cardValueNumber}>
                                        {loading ? "--,--" : "0.00"}
                                    </span>
                                    <span className={styles.cardValueCurrency}>
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
                                            style={{ color: "#8CC279" }}
                                        >
                                            {loading ? "--,--" : totalIncome.toFixed(2)}
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
                                            type="button"
                                            onClick={handleOpenIncomeModal}
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
                                            style={{ color: "#DD7D7D" }}
                                        >
                                            {loading ? "--,--" : totalExpenses.toFixed(2)}
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
                                            type="button"
                                            onClick={handleOpenExpenseModal}
                                        >
                                            Dodaj wydatek
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <aside className={styles.sidePanel}>
                                        <div className={styles.historyCard}>
                                            <div className={styles.historyHeader}>
                                                <p className={styles.historyTitle}>historia transakcji</p>
                                            </div>

                                            <div className={styles.historyBody}>
                                                {rawData.length === 0 ? (
                                                    <>
                                                        <p className={styles.historyEmptyTitle}>Brak danych.</p>
                                                        <p className={styles.historyEmptyText}>Dodaj pierwsze transakcje.</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={styles.historyTable}>
                                                            {recentTransactions.map((t: any, idx: number) => {
                                                                const label =
                                                                    t.type === 0
                                                                        ? "Przychód"
                                                                        : `Wydatek: ${t.categoryName ?? "-"}`;

                                                                return (
                                                                    <div key={t.id ?? idx} className={styles.historyRow}>
                                                                        <span className={styles.historyLabel}>{label}</span>

                                                                        <span className={styles.historyAmount}>
                                                                            {(t.type === 1 ? "-" : "")}{formatAmountPL(t.amount)} {currencySymbol}
                                                                        </span>

                                                                        <span className={styles.historyDate}>
                                                                            {formatDatePL(t.date)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <Link href="/transactions" className={styles.historyButton}>
                                                            <div className={styles.historyIcon}>
                                                                <Image
                                                                    src="/history-icon.svg"
                                                                    alt="Ikona historii"
                                                                    width={40}
                                                                    height={40}
                                                                />
                                                            </div>
                                                            <span className={styles.historyButtonText}>
                                                                ZOBACZ PEŁNĄ HISTORIĘ
                                                            </span>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>


                                        <div className={styles.fabList}>
                                            <button className={styles.fabItem}>
                                                <span className={styles.fabLabel}>Planowane wydatki</span>
                                                <Image
                                                    src="/calendar.svg"
                                                    alt=""
                                                    width={36}
                                                    height={36}
                                                    className={styles.fabIcon}
                                                />
                                            </button>

                                            <button className={styles.fabItem}>
                                                <span className={styles.fabLabel}>Członkowie budżetu</span>
                                                <Image
                                                    src="/group.svg"
                                                    alt=""
                                                    width={36}
                                                    height={36}
                                                    className={styles.fabIcon}
                                                />
                                            </button>

                                            <button className={styles.fabItem}>
                                                <span className={styles.fabLabel}>Ustawienia budżetu</span>
                                                <Image
                                                    src="/settings.svg"
                                                    alt=""
                                                    width={36}
                                                    height={36}
                                                    className={styles.fabIcon}
                                                />
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
                                    <CategoryChart data={expenseOnlyData} />
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
                                    <UserBarChart data={expenseOnlyData} />
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
                                <Link href="/tips" className={styles.navLink}>
                                    poznaj porady od BALANCR
                                </Link>
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

            {isIncomeModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeaderRow}>
                            <h2 className={styles.modalTitle}>Dodaj przychód</h2>
                            <button type="button" className={styles.modalCloseButton} onClick={handleCloseIncomeModal}>
                                X
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleSaveIncome}>
                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Opis przychodu</label>
                                <input
                                    className={styles.modalInput}
                                    type="text"
                                    value={incomeDescription}
                                    onChange={(e) => setIncomeDescription(e.target.value)}
                                    placeholder='Np. "premia", "zwrot za zakupy"'
                                />
                                {incomeErrors.description && <p className={styles.fieldError}>{incomeErrors.description}</p>}
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Kwota ({currencySymbol})</label>
                                <input
                                    className={styles.modalInput}
                                    type="text"
                                    inputMode="decimal"
                                    value={incomeAmountInput}
                                    onChange={(e) => setIncomeAmountInput(e.target.value)}
                                    onBlur={() => setIncomeAmountInput(normalizeMoneyToTwoDecimals(incomeAmountInput))}
                                    placeholder="0,00"
                                />
                                {incomeErrors.amount && <p className={styles.fieldError}>{incomeErrors.amount}</p>}
                            </div>

                            {incomeErrors.form && (
                                <p className={styles.modalError}>
                                    {incomeErrors.form}
                                </p>
                            )}

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.modalSecondaryButton}
                                    onClick={handleCloseIncomeModal}
                                    disabled={isIncomeSaving}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className={styles.modalPrimaryButton}
                                    disabled={isIncomeSaving}
                                >
                                    {isIncomeSaving ? "Zapisywanie..." : "Dodaj przychód"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isExpenseModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeaderRow}>
                            <h2 className={styles.modalTitle}>Dodaj wydatek</h2>
                            <button type="button" className={styles.modalCloseButton} onClick={handleCloseExpenseModal}>
                                X
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleSaveExpense}>
                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Kategoria wydatku</label>
                                <select
                                    className={styles.modalSelect}
                                    value={expenseCategoryId}
                                    onChange={(e) => setExpenseCategoryId(e.target.value)}
                                    disabled={dictionariesLoading}
                                >
                                    <option value="">Wybierz kategorię</option>
                                    {expenseCategories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {expenseErrors.categoryId && <p className={styles.fieldError}>{expenseErrors.categoryId}</p>}
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Opis wydatku</label>
                                <input
                                    className={styles.modalInput}
                                    type="text"
                                    value={expenseDescription}
                                    onChange={(e) => setExpenseDescription(e.target.value)}
                                    placeholder='Np. "urodziny Ani", "kolacja w restauracji"'
                                />
                                {expenseErrors.description && <p className={styles.fieldError}>{expenseErrors.description}</p>}
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Metoda płatności</label>
                                <select
                                    className={styles.modalSelect}
                                    value={expensePaymentMethod}
                                    onChange={(e) => setExpensePaymentMethod(e.target.value)}
                                    disabled={dictionariesLoading}
                                >
                                    <option value="">Wybierz metodę</option>
                                    {paymentMethods.map(pm => (
                                        <option key={pm.value} value={pm.value}>
                                            {pm.name}
                                        </option>
                                    ))}
                                </select>
                                {expenseErrors.paymentMethod && <p className={styles.fieldError}>{expenseErrors.paymentMethod}</p>}
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Kwota ({currencySymbol})</label>
                                <input
                                    className={styles.modalInput}
                                    type="text"
                                    inputMode="decimal"
                                    value={expenseAmountInput}
                                    onChange={(e) => setExpenseAmountInput(e.target.value)}
                                    onBlur={() => setExpenseAmountInput(normalizeMoneyToTwoDecimals(expenseAmountInput))}
                                    placeholder="0,00"
                                />
                                {expenseErrors.amount && <p className={styles.fieldError}>{expenseErrors.amount}</p>}
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Rodzaj wydatku</label>
                                <div className={styles.radioRow}>
                                    <label className={styles.radioOption}>
                                        <input
                                            type="radio"
                                            name="expenseType"
                                            checked={expenseType === "instant"}
                                            onChange={() => setExpenseType("instant")}
                                        />
                                        <span>Płatność jednorazowa</span>
                                    </label>

                                    <label className={styles.radioOption}>
                                        <input
                                            type="radio"
                                            name="expenseType"
                                            checked={expenseType === "recurring"}
                                            onChange={() => setExpenseType("recurring")}
                                        />
                                        <span>Płatność cykliczna</span>
                                    </label>

                                    <label className={styles.radioOption}>
                                        <input
                                            type="radio"
                                            name="expenseType"
                                            checked={expenseType === "planned"}
                                            onChange={() => setExpenseType("planned")}
                                        />
                                        <span>Płatność planowana</span>
                                    </label>
                                </div>
                                {expenseErrors.expenseType && <p className={styles.fieldError}>{expenseErrors.expenseType}</p>}
                            </div>

                            {expenseType === "recurring" && (
                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel}>Częstotliwość</label>
                                    <select
                                        className={styles.modalSelect}
                                        value={expenseFrequency}
                                        onChange={(e) => setExpenseFrequency(e.target.value)}
                                        disabled={dictionariesLoading}
                                    >
                                        <option value="">Wybierz częstotliwość</option>
                                        {frequencies.map(f => (
                                            <option key={f.value} value={f.value}>
                                                {f.name}
                                            </option>
                                        ))}
                                    </select>
                                    {expenseErrors.frequency && <p className={styles.fieldError}>{expenseErrors.frequency}</p>}

                                    <div style={{ height: "10px" }} />

                                    <label className={styles.modalLabel}>Rozpoczyna się w dniu</label>
                                    <input
                                        className={styles.modalInput}
                                        type="date"
                                        value={expenseStartDate}
                                        onChange={(e) => setExpenseStartDate(e.target.value)}
                                    />
                                    {expenseErrors.startDate && <p className={styles.fieldError}>{expenseErrors.startDate}</p>}

                                    <p className={styles.modalHint}>
                                        Płatność cykliczna będzie odliczana automatycznie, jeżeli Twój bilans będzie wynosił powyżej 0zł. Otrzymasz powiadomienie o zbliżającej się kolejnej płatności cyklicznej - w aplikacji i na skrzynkę e-mail.
                                    </p>
                                </div>
                            )}

                            {expenseType === "planned" && (
                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel}>Data wykonania płatności</label>
                                    <input
                                        className={styles.modalInput}
                                        type="date"
                                        value={expenseStartDate}
                                        onChange={(e) => setExpenseStartDate(e.target.value)}
                                    />
                                    {expenseErrors.startDate && <p className={styles.fieldError}>{expenseErrors.startDate}</p>}

                                    <p className={styles.modalHint}>
                                        Płatność zostanie odliczona automatycznie, jeżeli Twój bilans będzie wynosił powyżej 0zł. Otrzymasz powiadomienie o zbliżającej się płatności planowanej - w aplikacji i na skrzynkę e-mail.
                                    </p>
                                </div>
                            )}


                            {expenseErrors.form && (
                                <p className={styles.modalError}>
                                    {expenseErrors.form}
                                </p>
                            )}

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.modalSecondaryButton}
                                    onClick={handleCloseExpenseModal}
                                    disabled={isExpenseSaving}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className={styles.modalPrimaryButton}
                                    disabled={isExpenseSaving}
                                >
                                    {isExpenseSaving ? "Zapisywanie..." : "Dodaj wydatek"}
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
