"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./BudgetSettings.module.css";
import dashboardStyles from "../dashboard/Dashboard.module.css";
import { Budget } from "@/types";

type ToastKind = "success" | "error";

interface ToastState {
    kind: ToastKind;
    text: string;
}

type BudgetStatus = "aktywny" | "zarchiwizowany" | "-";
type BudgetRole = "owner" | "member" | "-";

interface BudgetRow {
    id: number;
    name: string;
    createdAt: string;
    createdAtRaw: string | null;
    status: BudgetStatus;
    role: BudgetRole;
}

interface BudgetListResponse {
    data?: Budget[];
}

type SortKey = "lp" | "name" | "createdAt" | "status";

export default function BudgetSettingsPage() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    const [loadingBudgets, setLoadingBudgets] = useState(false);
    const [budgets, setBudgets] = useState<BudgetRow[]>([]);

    const [sortKey, setSortKey] = useState<SortKey>("lp");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const pageSize = 8;
    const [page, setPage] = useState(1);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editBudgetId, setEditBudgetId] = useState<number | null>(null);
    const [editNameValue, setEditNameValue] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [archiveBudgetId, setArchiveBudgetId] = useState<number | null>(null);
    const [savingArchive, setSavingArchive] = useState(false);

    const showToast = (kind: ToastKind, text: string) => {
        setToast({ kind, text });
        window.setTimeout(() => setToast(null), 3500);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsProfileMenuOpen(false);
        router.push("/login");
    };

    const goDashboardFromBreadcrumb = () => {
        router.push("/dashboard");
    };


    const formatDatePL = (d: any) => {
        if (!d) return "-";
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "-";
        return dt.toLocaleDateString("pl-PL");
    };

    const toIsoOrNull = (d: any): string | null => {
        if (!d) return null;
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return null;
        return dt.toISOString();
    };

    const mapStatus = (x: any): BudgetStatus => {
        const isArchived = x?.isArchived ?? x?.archived;
        if (typeof isArchived === "boolean") return isArchived ? "zarchiwizowany" : "aktywny";

        const raw = typeof x?.status === "string" ? x.status.toLowerCase() : "";
        if (raw.includes("arch")) return "zarchiwizowany";
        if (raw.includes("akty") || raw.includes("active")) return "aktywny";

        return "-";
    };

    const mapRole = (x: any): BudgetRole => {
        const isOwner = x?.isOwner ?? x?.owner ?? x?.isBudgetOwner;
        if (typeof isOwner === "boolean") return isOwner ? "owner" : "member";

        const raw = typeof x?.role === "string" ? x.role.toLowerCase() : "";
        if (raw.includes("owner") || raw.includes("właśc")) return "owner";
        if (raw.includes("member") || raw.includes("czł")) return "member";

        return "-";
    };

    const mapBudgetRow = (x: any): BudgetRow | null => {
        const idRaw = x?.id ?? x?.budgetId;
        const id = Number(idRaw);
        if (!Number.isFinite(id)) return null;

        const name = typeof x?.name === "string" && x.name.trim() ? x.name.trim() : "-";

        const createdCandidate =
            x?.creationDate ??
            x?.createdAt ??
            x?.createdDate ??
            x?.dateCreated ??
            x?.date ??
            x?.created ??
            null;

        const createdAt = formatDatePL(createdCandidate);
        const createdAtRaw = toIsoOrNull(createdCandidate);

        const status = mapStatus(x);
        const role = mapRole(x);

        return { id, name, createdAt, createdAtRaw, status, role };
    };

    const fetchBudgets = async () => {
        setLoadingBudgets(true);
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
                showToast("error", "Nie udało się pobrać listy budżetów.");
                return;
            }

            const data = (await res.json()) as Budget[] | BudgetListResponse;

            let budgetsArray: any[] = [];
            if (Array.isArray(data)) budgetsArray = data as any[];
            else if (data?.data && Array.isArray(data.data)) budgetsArray = data.data as any[];

            const mapped = budgetsArray.map(mapBudgetRow).filter((x): x is BudgetRow => Boolean(x));
            setBudgets(mapped);
            setPage(1);
        } catch {
            setBudgets([]);
            showToast("error", "Wystąpił błąd podczas pobierania danych.");
        } finally {
            setLoadingBudgets(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            return;
        }
        setSortKey(key);
        setSortDir("asc");
    };

    const sortedBudgets = useMemo(() => {
        const arr = [...budgets];

        arr.sort((a, b) => {
            if (sortKey === "lp") return 0;

            if (sortKey === "createdAt") {
                const ta = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
                const tb = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
                return sortDir === "asc" ? ta - tb : tb - ta;
            }

            const getVal = (r: BudgetRow) => {
                if (sortKey === "name") return r.name.toLowerCase();
                if (sortKey === "status") return r.status;
                return "";
            };

            const va = String(getVal(a));
            const vb = String(getVal(b));

            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return arr;
    }, [budgets, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sortedBudgets.length / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pagedBudgets = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedBudgets.slice(start, start + pageSize);
    }, [sortedBudgets, page]);

    const openEditModal = (b: BudgetRow) => {
        setEditBudgetId(b.id);
        setEditNameValue(b.name === "-" ? "" : b.name);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditBudgetId(null);
        setEditNameValue("");
    };

    const confirmEdit = async () => {
        if (!editBudgetId) return;

        const newName = editNameValue.trim();
        if (!newName) return;

        setSavingEdit(true);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/login");
                return;
            }

            const res = await fetch(`${apiUrl}/api/budget/${editBudgetId}/edit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newName }),
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/login");
                return;
            }

            if (!res.ok) {
                let msg = "Nie udało się zmienić nazwy budżetu.";

                try {
                    const err = await res.json();
                    if (err?.detail && typeof err.detail === "string") msg = err.detail;
                    else if (err?.title && typeof err.title === "string") msg = err.title;
                } catch { }

                showToast("error", msg);
                return;
            }

            if (String(localStorage.getItem("selectedBudgetId")) === String(editBudgetId)) {
                localStorage.setItem("selectedBudgetName", newName);
            }

            showToast("success", "Nazwa budżetu została zmieniona.");
            closeEditModal();
            await fetchBudgets();
        } catch {
            showToast("error", "Wystąpił błąd podczas zapisu.");
        } finally {
            setSavingEdit(false);
        }
    };


    const openArchiveModal = (b: BudgetRow) => {
        setArchiveBudgetId(b.id);
        setIsArchiveModalOpen(true);
    };

    const closeArchiveModal = () => {
        setIsArchiveModalOpen(false);
        setArchiveBudgetId(null);
    };

    const archiveRow = useMemo(() => {
        if (!archiveBudgetId) return null;
        return budgets.find((x) => x.id === archiveBudgetId) || null;
    }, [archiveBudgetId, budgets]);

    const confirmArchiveToggle = async () => {
        if (!archiveBudgetId) return;
        if (!archiveRow) return;
        if (archiveRow.status === "-") return;

        setSavingArchive(true);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/login");
                return;
            }

            const endpoint =
                archiveRow.status === "zarchiwizowany"
                    ? `${apiUrl}/api/budget/${archiveBudgetId}/unarchive`
                    : `${apiUrl}/api/budget/${archiveBudgetId}/archive`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/login");
                return;
            }

            if (!res.ok) {
                let msg =
                    archiveRow.status === "zarchiwizowany"
                        ? "Nie udało się przywrócić budżetu."
                        : "Nie udało się zarchiwizować budżetu.";

                try {
                    const err = await res.json();
                    if (err?.detail && typeof err.detail === "string") msg = err.detail;
                    else if (err?.title && typeof err.title === "string") msg = err.title;
                } catch { }

                showToast("error", msg);
                return;
            }

            const successMsg =
                archiveRow.status === "zarchiwizowany"
                    ? "Budżet został przywrócony."
                    : "Budżet został zarchiwizowany.";

            showToast("success", successMsg);
            closeArchiveModal();
            await fetchBudgets();
        } catch {
            showToast("error", "Wystąpił błąd podczas zapisu.");
        } finally {
            setSavingArchive(false);
        }
    };

    const goMembers = (b: BudgetRow) => {
        localStorage.setItem("selectedBudgetId", String(b.id));
        localStorage.setItem("selectedBudgetName", b.name || "Wybrany budżet");
        router.push("/budget-team");
    };


    const openCreateBudget = () => {
        router.push("/dashboard");
    };

    return (
        <div className={dashboardStyles.page}>
            <header className={dashboardStyles.header}>
                <div className={dashboardStyles.headerLeft}>
                    <Link href="/dashboard">
                        <img src="/logo.svg" alt="Logo aplikacji" className={dashboardStyles.logoImage} />
                    </Link>
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

                                <button
                                    type="button"
                                    className={dashboardStyles.profileDropdownItemDanger}
                                    onClick={handleLogout}
                                >
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
                        <div
                            className={`${styles.toast} ${toast.kind === "success" ? styles.toastSuccess : styles.toastError
                                }`}
                            role="status"
                        >
                            {toast.text}
                        </div>
                    )}

                    <section className={styles.hero}>
                        <h1 className={styles.heroTitle}>Ustawienia budżetów</h1>
                        <div className={styles.heroUnderline} />
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
                            Ustawienia budżetów
                        </span>
                    </div>

                    <div className={styles.actionCardRow}>
                        <button type="button" className={styles.addMemberCard} onClick={openCreateBudget}>
                            <span className={styles.addIcon}>+</span>
                            <span className={styles.addText}>
                                UTWÓRZ NOWY
                                <br />
                                BUDŻET
                            </span>
                        </button>
                    </div>

                    <section className={styles.tableWrapper}>
                        <table className={styles.memberTable}>
                            <thead>
                                <tr>
                                    <th>lp</th>
                                    <th onClick={() => toggleSort("name")} className={styles.sortableTh}>
                                        nazwa budżetu
                                    </th>
                                    <th onClick={() => toggleSort("createdAt")} className={styles.sortableTh}>
                                        data założenia
                                    </th>
                                    <th onClick={() => toggleSort("status")} className={styles.sortableTh}>
                                        status budżetu
                                    </th>
                                    <th>opcje</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingBudgets ? (
                                    <tr>
                                        <td colSpan={5} className={styles.tableMessage}>
                                            Ładowanie...
                                        </td>
                                    </tr>
                                ) : budgets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.tableMessage}>
                                            Brak danych
                                        </td>
                                    </tr>
                                ) : (
                                    pagedBudgets.map((b, idx) => {
                                        const lp = (page - 1) * pageSize + idx + 1;

                                        const canManage = b.role === "owner";
                                        const archiveDisabled = !canManage || b.status === "-";

                                        return (
                                            <tr key={b.id}>
                                                <td>{lp}</td>
                                                <td>{b.name}</td>
                                                <td>{b.createdAt}</td>
                                                <td>{b.status}</td>
                                                <td className={styles.optionsCell}>
                                                    <button
                                                        type="button"
                                                        className={styles.optionButton}
                                                        onClick={() => openEditModal(b)}
                                                        disabled={!canManage}
                                                    >
                                                        <Image src="/edit.svg" alt="Edycja" width={16} height={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={styles.optionButton}
                                                        onClick={() => openArchiveModal(b)}
                                                        disabled={archiveDisabled}
                                                    >
                                                        <Image src="/block.svg" alt="Archiwizacja" width={16} height={16} />

                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={styles.optionButton}
                                                        onClick={() => goMembers(b)}
                                                    >
                                                        <Image src="/group.svg" alt="Członkowie" width={16} height={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </section>

                    {budgets.length > 0 && (
                        <div className={styles.paginationRow}>
                            <button
                                type="button"
                                className={styles.pagerBtn}
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                {"<"}
                            </button>

                            <span className={styles.pagerCurrent}>{page}</span>

                            <button
                                type="button"
                                className={styles.pagerBtn}
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                {">"}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {isEditModalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeaderRow}>
                            <h2 className={styles.modalTitle}>EDYCJA NAZWY BUDŻETU</h2>
                            <button type="button" className={styles.modalCloseButton} onClick={closeEditModal}>
                                ×
                            </button>
                        </div>

                        <label className={styles.modalLabel}>Nazwa budżetu</label>

                        <input
                            className={styles.modalInput}
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            placeholder="np. Domowy budżet 2026"
                            type="text"
                        />

                        <button
                            type="button"
                            className={styles.modalPrimaryButton}
                            onClick={confirmEdit}
                            disabled={savingEdit || !editNameValue.trim() || !editBudgetId}
                        >
                            {savingEdit ? "ZAPIS..." : "ZATWIERDŹ ZMIANY"}
                        </button>
                    </div>
                </div>
            )}

            {isArchiveModalOpen && archiveRow && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeaderRow}>
                            <h2 className={styles.modalTitle}>
                                {archiveRow.status === "zarchiwizowany" ? "PRZYWRÓCENIE BUDŻETU" : "ARCHIWIZACJA BUDŻETU"}
                            </h2>
                            <button type="button" className={styles.modalCloseButton} onClick={closeArchiveModal}>
                                ×
                            </button>
                        </div>

                        <div className={styles.removeBody}>
                            <p className={styles.removeText}>
                                {archiveRow.status === "zarchiwizowany"
                                    ? "Czy na pewno chcesz przywrócić budżet?"
                                    : "Czy na pewno chcesz zarchiwizować budżet?"}
                            </p>
                        </div>

                        <label className={styles.modalLabel}>Nazwa budżetu</label>

                        <input className={styles.modalInput} value={archiveRow.name} disabled />

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.modalSecondaryButton}
                                onClick={closeArchiveModal}
                                disabled={savingArchive}
                            >
                                ANULUJ
                            </button>

                            <button
                                type="button"
                                className={styles.modalPrimaryButton}
                                onClick={confirmArchiveToggle}
                                disabled={savingArchive || archiveRow.status === "-" || archiveBudgetId === null}
                            >
                                {savingArchive ? "ZAPIS..." : "TAK, ZATWIERDŹ ZMIANY"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
