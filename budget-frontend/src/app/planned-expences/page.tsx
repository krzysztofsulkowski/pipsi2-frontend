"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./PlannedExpences.module.css";
import dashboardStyles from "../dashboard/Dashboard.module.css";
import { Budget } from "@/types";

type ToastKind = "success" | "error";

type BudgetStatus = "aktywny" | "zarchiwizowany" | "-";

type ExpenseKind = "planned" | "recurring";
type ExpenseStatus = "active" | "paused";

interface PlannedExpenseRow {
    id: number;
    kind: ExpenseKind;
    categoryName: string;
    description: string;
    amount: number;
    createdAt: string;
    executionDate: string;
    frequencyLabel: string | null;
    status: ExpenseStatus;
}

interface NotificationRow {
    id: string;
    kind: ExpenseKind;
    categoryName: string;
    description: string;
    amount: number;
    date: string;
}

interface BackendErrorResponse {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    errors?: Record<string, string[]>;
}

type SortKey =
    | "lp"
    | "kind"
    | "categoryName"
    | "description"
    | "amount"
    | "createdAt"
    | "executionDate"
    | "frequencyLabel";

type SortDir = "asc" | "desc";

const currencySymbol = "zł";

const API_PATHS = {
    transactionsSearch: (budgetId: number) => `/api/budget/${budgetId}/transactions/search`,
    toggleExpenseStatus: (expenseId: number) => `/api/planned-expenses/${expenseId}/toggle-status`,
    notifications: (budgetId: number) => `/api/planned-expenses/notifications?budgetId=${budgetId}`,
};


function formatMoneyPL(n: number) {
    const val = Number.isFinite(n) ? Math.abs(n) : 0;
    return val.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDatePL(d: string) {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("pl-PL");
}

function normalizeKindLabel(k: ExpenseKind) {
    return k === "recurring" ? "cykliczny" : "planowany";
}

function buildNotificationText(n: NotificationRow) {
    const prefix =
        n.kind === "recurring" ? "Masz zbliżającą się płatność cykliczną:" : "Masz zbliżającą się płatność:";
    return `${prefix} ${n.categoryName} - ${n.description}: ${formatMoneyPL(n.amount)} ${currencySymbol} (${formatDatePL(
        n.date
    )})`;
}

function IconPause(props: { className?: string }) {
    return (
        <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-2-6a1 1 0 0 0 1-1V9a1 1 0 1 0-2 0v6a1 1 0 0 0 1 1Zm5 0a1 1 0 0 0 1-1V9a1 1 0 1 0-2 0v6a1 1 0 0 0 1 1Z" />
        </svg>
    );
}

function IconPlay(props: { className?: string }) {
    return (
        <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-1.2-14.352a1.2 1.2 0 0 0-1.8 1.04v6.624a1.2 1.2 0 0 0 1.8 1.04l5.76-3.312a1.2 1.2 0 0 0 0-2.08l-5.76-3.312Z" />
        </svg>
    );
}

export default function PlannedExpencesPage() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [authChecked, setAuthChecked] = useState(false);

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetsLoading, setBudgetsLoading] = useState(true);
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);

    const [isBudgetMenuOpen, setIsBudgetMenuOpen] = useState(false);
    const budgetMenuRef = useRef<HTMLDivElement | null>(null);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [toast, setToast] = useState<{ kind: ToastKind; text: string } | null>(null);

    const [rows, setRows] = useState<PlannedExpenseRow[]>([]);
    const [loadingRows, setLoadingRows] = useState(false);

    const [notifications, setNotifications] = useState<NotificationRow[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const [sortKey, setSortKey] = useState<SortKey>("executionDate");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const [pageIndex, setPageIndex] = useState(1);
    const pageSize = 8;

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<PlannedExpenseRow | null>(null);
    const [confirmBusy, setConfirmBusy] = useState(false);

    const currentBudget = useMemo(() => budgets.find((b) => b.id === selectedBudgetId) ?? null, [budgets, selectedBudgetId]);

    const goDashboardFromBreadcrumb = () => {
        const id = selectedBudgetId ?? null;

        if (id !== null) localStorage.setItem("selectedBudgetId", String(id));
        if (currentBudget?.name) localStorage.setItem("selectedBudgetName", currentBudget.name);

        router.push("/dashboard");
    };


    const isArchivedBudget = (b: Budget) => {
        const maybeArchived = (b as unknown as { isArchived?: boolean; archived?: boolean; status?: string }).isArchived;
        const maybeArchived2 = (b as unknown as { isArchived?: boolean; archived?: boolean; status?: string }).archived;
        if (typeof maybeArchived === "boolean") return maybeArchived;
        if (typeof maybeArchived2 === "boolean") return maybeArchived2;
        const s = (b as unknown as { status?: string }).status;
        if (typeof s === "string") return s.toLowerCase().includes("arch");
        return false;
    };

    const showToast = (kind: ToastKind, text: string) => {
        setToast({ kind, text });
        window.setTimeout(() => setToast(null), 3200);
    };

    const safeJson = async <T,>(res: Response): Promise<T | null> => {
        try {
            return (await res.json()) as T;
        } catch {
            return null;
        }
    };

    const fetchBudgets = async () => {
        setBudgetsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/landing-page");
                return;
            }

            const res = await fetch(`${apiUrl}/api/budget/my-budgets`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/landing-page");
                return;
            }

            if (!res.ok) {
                setBudgets([]);
                return;
            }

            const data = await safeJson<Budget[] | { data?: Budget[] }>(res);
            const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
            const active = arr.filter((b) => !isArchivedBudget(b));
            setBudgets(active);

            const storedIdRaw = localStorage.getItem("selectedBudgetId");
            const storedId = storedIdRaw ? Number(storedIdRaw) : null;

            const validStored = storedId && active.some((b) => b.id === storedId);
            const nextId = validStored ? storedId : active[0]?.id ?? null;

            setSelectedBudgetId(nextId);
            if (nextId) localStorage.setItem("selectedBudgetId", String(nextId));
            if (nextId) {
                const name = active.find((b) => b.id === nextId)?.name ?? "";
                if (name) localStorage.setItem("selectedBudgetName", name);
            }
        } finally {
            setBudgetsLoading(false);
        }
    };

    const mapRowsFromApi = (payload: unknown): PlannedExpenseRow[] => {
        if (!payload) return [];
        if (!Array.isArray(payload)) return [];

        const arr = payload as Array<Record<string, unknown>>;

        const toString = (v: unknown) => (typeof v === "string" ? v : "");
        const toNumber = (v: unknown) => {
            const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
            return Number.isFinite(n) ? n : 0;
        };

        const normalizeStatus = (v: unknown): ExpenseStatus => {
            const s = toString(v).toLowerCase();
            if (s.includes("pause") || s.includes("wstrzym")) return "paused";
            return "active";
        };

        const normalizeKind = (v: unknown): ExpenseKind => {
            const s = toString(v).toLowerCase();
            if (s.includes("recurr") || s.includes("cyk")) return "recurring";
            return "planned";
        };

        const rowsMapped: PlannedExpenseRow[] = arr.map((x) => {
            const id = toNumber(x.id);
            const kind = normalizeKind(x.kind ?? x.expenseType ?? x.type);
            const categoryName = toString(x.categoryName ?? x.category ?? x.categoryLabel);
            const description = toString(x.description ?? x.desc ?? x.title);
            const amount = toNumber(x.amount);
            const createdAt = toString(x.createdAt ?? x.dateCreated ?? x.created ?? x.addedAt);
            const executionDate = toString(x.executionDate ?? x.nextExecutionDate ?? x.startDate ?? x.date);
            const frequencyLabelRaw = toString(x.frequencyLabel ?? x.frequency ?? x.frequencyName);
            const frequencyLabel = frequencyLabelRaw ? frequencyLabelRaw : null;
            const status = normalizeStatus(x.status ?? x.isPaused ?? x.isActive);

            return {
                id,
                kind,
                categoryName: categoryName || "-",
                description: description || "-",
                amount,
                createdAt: createdAt || "",
                executionDate: executionDate || "",
                frequencyLabel,
                status,
            };
        });

        return rowsMapped.filter((r) => r.id > 0);
    };

    const mapRowsFromSearch = (payload: any): PlannedExpenseRow[] => {
        const arr = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        return (arr as Array<any>)
            .map((x) => {
                const id = Number(x?.id) || 0;

                const typeNum = typeof x?.type === "number" ? x.type : Number(x?.type);
                const kind: ExpenseKind = typeNum === 1 ? "recurring" : "planned";

                const statusNum = typeof x?.status === "number" ? x.status : Number(x?.status);
                const status: ExpenseStatus = statusNum === 2 ? "paused" : "active";

                const date = typeof x?.date === "string" ? x.date : "";

                return {
                    id,
                    kind,
                    categoryName: typeof x?.categoryName === "string" && x.categoryName ? x.categoryName : "-",
                    description: typeof x?.title === "string" && x.title ? x.title : "-",
                    amount: Number(x?.amount) || 0,
                    createdAt: date,
                    executionDate: date,
                    frequencyLabel: null,
                    status,
                };
            })
            .filter((r) => r.id > 0);
    };


    const mapNotificationsFromApi = (payload: unknown): NotificationRow[] => {
        if (!payload) return [];
        if (!Array.isArray(payload)) return [];
        const arr = payload as Array<Record<string, unknown>>;

        const toString = (v: unknown) => (typeof v === "string" ? v : "");
        const toNumber = (v: unknown) => {
            const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
            return Number.isFinite(n) ? n : 0;
        };

        const normalizeKind = (v: unknown): ExpenseKind => {
            const s = toString(v).toLowerCase();
            if (s.includes("recurr") || s.includes("cyk")) return "recurring";
            return "planned";
        };

        const mapped: NotificationRow[] = arr
            .map((x) => {
                const id = toString(x.id) || String(toNumber(x.id));
                const kind = normalizeKind(x.kind ?? x.type ?? x.expenseType);
                const categoryName = toString(x.categoryName ?? x.category ?? x.categoryLabel);
                const description = toString(x.description ?? x.desc ?? x.title);
                const amount = toNumber(x.amount);
                const date = toString(x.date ?? x.executionDate ?? x.nextExecutionDate ?? x.startDate);
                return {
                    id: id || `${categoryName}-${description}-${date}`,
                    kind,
                    categoryName: categoryName || "-",
                    description: description || "-",
                    amount,
                    date,
                };
            })
            .filter((n) => n.id && n.date);

        return mapped;
    };

    const fetchRows = async (budgetId: number) => {
        setLoadingRows(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const url = `${apiUrl}${API_PATHS.transactionsSearch(budgetId)}`;

            const body = {
                draw: 1,
                start: 0,
                length: 200,
                searchValue: "",
                orderColumn: 0,
                orderDir: "asc",
                extraFilters: {}
            };

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
                cache: "no-store",
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/landing-page");
                return;
            }

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                setRows([]);
                setPageIndex(1);
                showToast("error", `Błąd pobierania (${res.status}): ${text || res.statusText}`);
                return;
            }

            const json = await safeJson<any>(res);

            const mapped = mapRowsFromSearch(json);
            setRows(mapped);
            setPageIndex(1);

            console.log("TRANSACTIONS_SEARCH_RESPONSE", json);
        } catch {
            setRows([]);
            setPageIndex(1);
            showToast("error", "Nie udało się pobrać planowanych wydatków.");
        } finally {
            setLoadingRows(false);
        }
    };



    const fetchNotifications = async (budgetId: number) => {
        setLoadingNotifications(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const url = `${apiUrl}${API_PATHS.notifications(budgetId)}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/landing-page");
                return;
            }

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                setNotifications([]);
                showToast("error", `Błąd powiadomień (${res.status}): ${text || res.statusText}`);
                return;
            }

            const json = await safeJson<unknown>(res);
            const payload = (json as { data?: unknown })?.data ?? json;
            const mapped = mapNotificationsFromApi(payload);

            setNotifications(mapped);
        } catch {
            setNotifications([]);
        } finally {
            setLoadingNotifications(false);
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsProfileMenuOpen(false);
        router.push("/login");
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
                return;
            }

            const body = { name: newBudgetName.trim() };

            const res = await fetch(`${apiUrl}/api/budget/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await safeJson<BackendErrorResponse>(res);
                const msg = err?.detail || "Nie udało się utworzyć budżetu.";
                setCreateError(msg);
                return;
            }

            setIsCreateModalOpen(false);
            await fetchBudgets();
            showToast("success", "Utworzono nowy budżet.");
        } catch {
            setCreateError("Wystąpił błąd podczas tworzenia budżetu.");
        } finally {
            setIsCreating(false);
        }
    };

    const onHeaderOutsideClick = (e: MouseEvent) => {
        if (isBudgetMenuOpen && budgetMenuRef.current && !budgetMenuRef.current.contains(e.target as Node)) {
            setIsBudgetMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", onHeaderOutsideClick);
        return () => document.removeEventListener("mousedown", onHeaderOutsideClick);
    });

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.replace("/landing-page");
            return;
        }
        setAuthChecked(true);
        fetchBudgets();
    }, []);

    useEffect(() => {
        if (!selectedBudgetId) return;
        localStorage.setItem("selectedBudgetId", String(selectedBudgetId));
        if (currentBudget?.name) localStorage.setItem("selectedBudgetName", currentBudget.name);

        fetchRows(selectedBudgetId);
        fetchNotifications(selectedBudgetId);
    }, [selectedBudgetId]);

    const sortedRows = useMemo(() => {
        const copy = [...rows];

        const dir = sortDir === "asc" ? 1 : -1;
        const toTime = (s: string) => {
            const t = new Date(s).getTime();
            return Number.isFinite(t) ? t : 0;
        };

        const cmpStr = (a: string, b: string) => a.localeCompare(b, "pl", { sensitivity: "base" });
        const cmpNum = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

        copy.sort((ra, rb) => {
            switch (sortKey) {
                case "lp":
                    return 0;
                case "kind":
                    return dir * cmpStr(normalizeKindLabel(ra.kind), normalizeKindLabel(rb.kind));
                case "categoryName":
                    return dir * cmpStr(ra.categoryName, rb.categoryName);
                case "description":
                    return dir * cmpStr(ra.description, rb.description);
                case "amount":
                    return dir * cmpNum(Math.abs(ra.amount), Math.abs(rb.amount));
                case "createdAt":
                    return dir * cmpNum(toTime(ra.createdAt), toTime(rb.createdAt));
                case "executionDate":
                    return dir * cmpNum(toTime(ra.executionDate), toTime(rb.executionDate));
                case "frequencyLabel":
                    return dir * cmpStr(ra.frequencyLabel ?? "", rb.frequencyLabel ?? "");
                default:
                    return 0;
            }
        });

        return copy;
    }, [rows, sortKey, sortDir]);

    const totalPages = useMemo(() => {
        const pages = Math.ceil(sortedRows.length / pageSize);
        return pages > 0 ? pages : 1;
    }, [sortedRows.length]);

    const pagedRows = useMemo(() => {
        const start = (pageIndex - 1) * pageSize;
        return sortedRows.slice(start, start + pageSize);
    }, [sortedRows, pageIndex]);

    const setSort = (k: SortKey) => {
        setPageIndex(1);
        setSortKey((prev) => {
            if (prev !== k) {
                setSortDir("asc");
                return k;
            }
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            return prev;
        });
    };

    const openConfirm = (row: PlannedExpenseRow) => {
        setSelectedRow(row);
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        if (confirmBusy) return;
        setConfirmOpen(false);
        setSelectedRow(null);
    };

    const toggleStatus = async () => {
        if (!selectedRow) return;

        setConfirmBusy(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const url = `${apiUrl}${API_PATHS.toggleExpenseStatus(selectedRow.id)}`;
            const res = await fetch(url, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/landing-page");
                return;
            }

            if (!res.ok) {
                const err = await safeJson<BackendErrorResponse>(res);
                const msg = err?.detail || "Nie udało się zapisać zmian.";
                showToast("error", msg);
                return;
            }

            const nextStatus: ExpenseStatus = selectedRow.status === "active" ? "paused" : "active";

            setRows((prev) => prev.map((r) => (r.id === selectedRow.id ? { ...r, status: nextStatus } : r)));
            showToast("success", "Zapisano zmiany.");
            closeConfirm();
        } catch {
            showToast("error", "Nie udało się zapisać zmian.");
        } finally {
            setConfirmBusy(false);
        }
    };

    const closeTopNotification = () => {
        setNotifications((prev) => prev.slice(1));
    };

    if (!authChecked) return null;

    return (
        <div className={dashboardStyles.page}>
            <header className={dashboardStyles.header}>
                <div className={dashboardStyles.headerLeft}>
                    <Link href="/dashboard">
                        <img src="/logo.svg" alt="Logo aplikacji" className={dashboardStyles.logoImage} />
                    </Link>

                    {budgets.length > 0 && (
                        <div className={dashboardStyles.budgetSelector} ref={budgetMenuRef}>
                            <button
                                type="button"
                                className={dashboardStyles.budgetButton}
                                onClick={() => setIsBudgetMenuOpen(!isBudgetMenuOpen)}
                                disabled={budgetsLoading}
                            >
                                <span className={dashboardStyles.budgetButtonText}>
                                    {currentBudget?.name || (selectedBudgetId ? `Budżet #${selectedBudgetId}` : "")}
                                </span>
                                <Image src="/arrow-down.svg" alt="" width={14} height={14} className={dashboardStyles.budgetArrow} />
                            </button>

                            {isBudgetMenuOpen && (
                                <div className={dashboardStyles.budgetDropdown}>
                                    {budgets.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            className={dashboardStyles.budgetDropdownItem}
                                            onClick={() => {
                                                setSelectedBudgetId(b.id);
                                                setIsBudgetMenuOpen(false);
                                            }}
                                        >
                                            {b.name || `Budżet #${b.id}`}
                                        </button>
                                    ))}

                                    <div className={dashboardStyles.profileDropdownDivider} />

                                    <button
                                        type="button"
                                        className={dashboardStyles.budgetDropdownItem}
                                        onClick={() => {
                                            setIsBudgetMenuOpen(false);
                                            handleOpenCreateModal();
                                        }}
                                    >
                                        Utwórz nowy budżet
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <nav className={dashboardStyles.nav}>
                    <Link href="/tips" className={dashboardStyles.navLink}>
                        Porady finansowe
                    </Link>

                    <Link href="/FAQ" className={dashboardStyles.navLink}>
                        FAQ
                    </Link>

                    <Link href="/about-us" className={dashboardStyles.navLink}>
                        O nas
                    </Link>

                    <div className={dashboardStyles.profileMenu}>
                        <button
                            type="button"
                            className={dashboardStyles.profileButton}
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        >
                            <Image src="/profile-icon.svg" alt="Profil" width={22} height={22} />
                        </button>

                        {isProfileMenuOpen && (
                            <div className={dashboardStyles.profileDropdown}>
                                <button
                                    type="button"
                                    className={dashboardStyles.profileDropdownItem}
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Ustawienia
                                </button>

                                <button
                                    type="button"
                                    className={dashboardStyles.profileDropdownItem}
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Zmiana języka
                                </button>

                                <div className={dashboardStyles.profileDropdownDivider} />

                                <button type="button" className={dashboardStyles.profileDropdownItemDanger} onClick={handleLogout}>
                                    Wyloguj się
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main className={dashboardStyles.main}>
                <div className={styles.pageInner}>
                    {toast && (
                        <div className={`${styles.toast} ${toast.kind === "success" ? styles.toastSuccess : styles.toastError}`}>
                            {toast.text}
                        </div>
                    )}

                    <section className={dashboardStyles.greeting}>
                        <h1 className={dashboardStyles.greetingTitle}>
                            Planowane wydatki budżetu:{" "}
                            <span className={styles.budgetName}>{currentBudget?.name || localStorage.getItem("selectedBudgetName") || "-"}</span>
                        </h1>
                        <div className={dashboardStyles.greetingUnderline} />
                    </section>

                    <div className={styles.breadcrumbsContainer} aria-label="Breadcrumb">
                        <button
                            type="button"
                            className={styles.crumbLinkButton}
                            onClick={goDashboardFromBreadcrumb}
                        >
                            Dashboard
                        </button>

                        <span className={styles.crumbSep}>&gt;</span>

                        <span className={styles.crumbActive} aria-current="page">
                            Planowane wydatki
                        </span>
                    </div>



                    {!loadingNotifications && notifications.length > 0 && (
                        <div className={styles.notificationsWrap}>
                            <div className={styles.notificationItem}>
                                <span className={styles.notificationText}>{buildNotificationText(notifications[0])}</span>
                                <button type="button" className={styles.notificationClose} onClick={closeTopNotification} aria-label="Zamknij">
                                    X
                                </button>
                            </div>

                            {notifications.length > 1 && (
                                <div className={styles.notificationsStack}>
                                    {notifications.slice(1).map((n) => (
                                        <div key={n.id} className={styles.notificationItemStacked}>
                                            <span className={styles.notificationTextMuted}>{buildNotificationText(n)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <section className={styles.tableWrapper}>
                        <div className={styles.tableHeaderRow}>
                            <div className={styles.tableTitle}>Lista planowanych i cyklicznych wydatków</div>
                            <div className={styles.tableMeta}>{loadingRows ? "Ładowanie..." : `${rows.length} pozycji`}</div>
                        </div>

                        <table className={styles.memberTable}>
                            <thead>
                                <tr>
                                    <th onClick={() => setSort("lp")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        lp
                                    </th>
                                    <th onClick={() => setSort("kind")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        rodzaj wydatku
                                    </th>
                                    <th onClick={() => setSort("categoryName")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        kategoria wydatku
                                    </th>
                                    <th onClick={() => setSort("description")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        opis
                                    </th>
                                    <th onClick={() => setSort("amount")} className={`${styles.sortableTh} ${styles.thRight}`} role="button" tabIndex={0}>
                                        kwota
                                    </th>
                                    <th onClick={() => setSort("createdAt")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        data założenia
                                    </th>
                                    <th onClick={() => setSort("executionDate")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        data wykonania
                                    </th>
                                    <th onClick={() => setSort("frequencyLabel")} className={styles.sortableTh} role="button" tabIndex={0}>
                                        częstotliwość
                                    </th>
                                    <th className={styles.thCenter}>opcje</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingRows ? (
                                    <tr>
                                        <td colSpan={9} className={styles.tableMessage}>
                                            Ładowanie...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className={styles.tableMessage}>
                                            Brak zaplanowanych wydatków w tym budżecie.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedRows.map((r, idx) => {
                                        const lp = (pageIndex - 1) * pageSize + idx + 1;
                                        const isRecurring = r.kind === "recurring";
                                        const amountText = `- ${formatMoneyPL(r.amount)} ${currencySymbol}`;

                                        return (
                                            <tr key={r.id}>
                                                <td>{lp}</td>
                                                <td>{normalizeKindLabel(r.kind)}</td>
                                                <td>{r.categoryName}</td>
                                                <td>{r.description}</td>
                                                <td className={styles.tdRight}>
                                                    <span className={styles.amountNegative}>{amountText}</span>
                                                </td>
                                                <td>{r.createdAt ? formatDatePL(r.createdAt) : "-"}</td>
                                                <td>{r.executionDate ? formatDatePL(r.executionDate) : "-"}</td>
                                                <td>{isRecurring ? r.frequencyLabel ?? "-" : "-"}</td>
                                                <td className={styles.optionsCell}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.optionButton} ${r.status === "paused" ? styles.optionButtonPaused : ""}`}
                                                        onClick={() => openConfirm(r)}
                                                        aria-label={r.status === "active" ? "Wstrzymaj płatność" : "Przywróć płatność"}
                                                    >
                                                        {r.status === "active" ? <IconPause className={styles.optionIcon} /> : <IconPlay className={styles.optionIcon} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </section>

                    {rows.length > 0 && (
                        <div className={styles.paginationRow}>
                            <button
                                type="button"
                                className={styles.pagerBtn}
                                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                                disabled={pageIndex <= 1}
                            >
                                {"<"}
                            </button>

                            <span className={styles.pagerCurrent}>
                                {pageIndex} / {totalPages}
                            </span>

                            <button
                                type="button"
                                className={styles.pagerBtn}
                                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                                disabled={pageIndex >= totalPages}
                            >
                                {">"}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {isCreateModalOpen && (
                <div className={dashboardStyles.modalOverlay}>
                    <div className={dashboardStyles.modal}>
                        <h2 className={dashboardStyles.modalTitle}>Utwórz nowy budżet</h2>
                        <form className={dashboardStyles.modalForm} onSubmit={handleCreateBudget}>
                            <div className={dashboardStyles.modalField}>
                                <label className={dashboardStyles.modalLabel}>Nazwa budżetu</label>
                                <input
                                    className={dashboardStyles.modalInput}
                                    type="text"
                                    value={newBudgetName}
                                    onChange={(e) => setNewBudgetName(e.target.value)}
                                    placeholder="Np. Domowy budżet 2025"
                                />
                            </div>

                            {createError && <p className={dashboardStyles.modalError}>{createError}</p>}

                            <div className={dashboardStyles.modalActions}>
                                <button
                                    type="button"
                                    className={dashboardStyles.modalSecondaryButton}
                                    onClick={handleCloseCreateModal}
                                    disabled={isCreating}
                                >
                                    Anuluj
                                </button>
                                <button type="submit" className={dashboardStyles.modalPrimaryButton} disabled={isCreating}>
                                    {isCreating ? "Zapisywanie..." : "Utwórz budżet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmOpen && selectedRow && (
                <div className={styles.confirmOverlay} onMouseDown={closeConfirm}>
                    <div className={styles.confirmModal} onMouseDown={(e) => e.stopPropagation()}>
                        <div className={styles.confirmHeader}>
                            <h3 className={styles.confirmTitle}>
                                {selectedRow.status === "active" ? "Wstrzymywanie płatności" : "Przywracanie płatności"}
                            </h3>
                            <button type="button" className={styles.confirmClose} onClick={closeConfirm} aria-label="Zamknij">
                                X
                            </button>
                        </div>

                        <p className={styles.confirmText}>
                            {selectedRow.status === "active"
                                ? "Czy na pewno chcesz wstrzymać płatność? (W każdej chwili możesz aktywować płatność ponownie)"
                                : "Czy na pewno chcesz przywrócić płatność? (W każdej chwili możesz wstrzymać płatność ponownie)"}
                        </p>

                        <div className={styles.confirmActions}>
                            <button type="button" className={styles.confirmSecondary} onClick={closeConfirm} disabled={confirmBusy}>
                                Anuluj
                            </button>
                            <button type="button" className={styles.confirmPrimary} onClick={toggleStatus} disabled={confirmBusy}>
                                {confirmBusy ? "Zapisywanie..." : "Tak, zatwierdź zmiany"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
