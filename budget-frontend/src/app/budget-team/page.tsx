"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./BudgetTeam.module.css";
import dashboardStyles from "../dashboard/Dashboard.module.css";

type ToastKind = "success" | "error";

interface ToastState {
    kind: ToastKind;
    text: string;
}

interface BudgetMemberRow {
    id: string;
    userName: string | null;
    email: string;
    addedAt: string | null;
    role: string;
    status: string;
}

interface InviteRequestBody {
    recipientEmail: string;
    budgetName: string;
    budgetId: number;
}

interface MemberToRemove {
    id: string;
    label: string;
}

export default function BudgetTeam() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const [toast, setToast] = useState<ToastState | null>(null);

    const [loadingMembers, setLoadingMembers] = useState(false);
    const [members, setMembers] = useState<BudgetMemberRow[]>([]);

    const [inviteValue, setInviteValue] = useState("");
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [sendingInvite, setSendingInvite] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
    const [selectedBudgetName, setSelectedBudgetName] = useState("Wybrany budżet");

    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<MemberToRemove | null>(null);
    const [removingMember, setRemovingMember] = useState(false);

    useEffect(() => {
        setMounted(true);

        const rawId = localStorage.getItem("selectedBudgetId");
        const n = rawId ? Number(rawId) : NaN;
        setSelectedBudgetId(Number.isFinite(n) ? n : null);

        const rawName = localStorage.getItem("selectedBudgetName");
        setSelectedBudgetName(rawName && rawName.trim() ? rawName.trim() : "Wybrany budżet");
    }, []);

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
        if (selectedBudgetId !== null) localStorage.setItem("selectedBudgetId", String(selectedBudgetId));
        if (selectedBudgetName && selectedBudgetName.trim()) localStorage.setItem("selectedBudgetName", selectedBudgetName.trim());
        router.push("/dashboard");
    };

    const formatDatePL = (d: string | null) => {
        if (!d) return "-";
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "-";
        return dt.toLocaleDateString("pl-PL");
    };

    const fetchMembers = async (budgetId: number) => {
        setLoadingMembers(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/login");
                return;
            }

            const membersUrl = `${apiUrl}/api/budget/${budgetId}/members`;

            const res = await fetch(membersUrl, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/login");
                return;
            }

            if (!res.ok) {
                setMembers([]);
                showToast("error", "Nie udało się pobrać członków budżetu.");
                return;
            }

            const raw = await res.json();

            const source = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

            const mapped: BudgetMemberRow[] = source.map((x: any) => ({
                id: x.userId ?? x.id ?? "",
                userName: x.user ?? x.userName ?? null,
                email:
                    typeof x.user === "string" && x.user.includes("@")
                        ? x.user
                        : typeof x.email === "string"
                            ? x.email
                            : "",
                addedAt: x.date ?? x.addedAt ?? x.joinedAt ?? null,
                role: x.role ?? "",
                status: x.status ?? "",
            }));

            setMembers(mapped);
        } catch {
            setMembers([]);
            showToast("error", "Wystąpił błąd podczas pobierania danych.");
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        if (!mounted) return;

        if (!selectedBudgetId) {
            router.replace("/dashboard");
            return;
        }

        fetchMembers(selectedBudgetId);
    }, [mounted, selectedBudgetId]);

    const openInviteModal = () => {
        setInviteError(null);
        setInviteValue("");
        setIsInviteModalOpen(true);
    };

    const closeInviteModal = () => {
        setIsInviteModalOpen(false);
    };

    const isProbablyEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const sendInvitation = async () => {
        setInviteError(null);

        const value = inviteValue.trim();
        if (!value) {
            setInviteError("To pole jest wymagane.");
            return;
        }

        if (!isProbablyEmail(value)) {
            setInviteError("Wpisz poprawny adres e-mail.");
            return;
        }

        if (!selectedBudgetId) {
            setInviteError("Brak wybranego budżetu. Wróć do dashboardu.");
            return;
        }

        setSendingInvite(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/login");
                return;
            }

            const body: InviteRequestBody = {
                recipientEmail: value,
                budgetName: selectedBudgetName,
                budgetId: selectedBudgetId,
            };

            const res = await fetch(`${apiUrl}/api/budget/send-invitation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/login");
                return;
            }

            if (!res.ok) {
                showToast("error", "Nie udało się wysłać zaproszenia.");
                return;
            }

            closeInviteModal();
            showToast("success", "Zaproszenie zostało wysłane.");
            await fetchMembers(selectedBudgetId);
        } catch {
            showToast("error", "Wystąpił błąd podczas wysyłania zaproszenia.");
        } finally {
            setSendingInvite(false);
        }
    };

    const openRemoveModal = (m: BudgetMemberRow) => {
        if (!m.id) {
            showToast("error", "Nie można usunąć tego wpisu (brak ID użytkownika).");
            return;
        }

        const label =
            m.userName && m.userName.trim()
                ? m.userName
                : m.email && m.email.trim()
                    ? m.email
                    : "ten użytkownik";

        setMemberToRemove({ id: m.id, label });
        setIsRemoveModalOpen(true);
    };


    const closeRemoveModal = () => {
        setIsRemoveModalOpen(false);
        setMemberToRemove(null);
    };

    const removeMember = async () => {
        if (!selectedBudgetId) {
            showToast("error", "Brak wybranego budżetu.");
            return;
        }

        if (!memberToRemove?.id) {
            showToast("error", "Brak ID użytkownika do usunięcia.");
            return;
        }

        setRemovingMember(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/login");
                return;
            }

            const res = await fetch(
                `${apiUrl}/api/budget/${selectedBudgetId}/members/${encodeURIComponent(memberToRemove.id)}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.status === 401) {
                localStorage.removeItem("authToken");
                router.replace("/login");
                return;
            }

            if (!res.ok) {
                showToast("error", "Nie udało się usunąć członka budżetu.");
                return;
            }

            closeRemoveModal();
            showToast("success", "Członek budżetu został usunięty.");
            await fetchMembers(selectedBudgetId);
        } catch {
            showToast("error", "Wystąpił błąd podczas usuwania członka budżetu.");
        } finally {
            setRemovingMember(false);
        }
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
                        <h1 className={styles.heroTitle}>
                            Członkowie budżetu:
                            <span className={styles.heroBudgetName}>{selectedBudgetName}</span>
                        </h1>
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
                            Członkowie budżetu
                        </span>
                    </div>


                    <div className={styles.actionCardRow}>
                        <button type="button" className={styles.addMemberCard} onClick={openInviteModal}>
                            <span className={styles.addIcon}>+</span>
                            <span className={styles.addText}>
                                DODAJ CZŁONKA
                                <br />
                                BUDŻETU
                            </span>
                        </button>
                    </div>

                    <section className={styles.tableWrapper}>
                        <table className={styles.memberTable}>
                            <thead>
                                <tr>
                                    <th>lp</th>
                                    <th>nazwa użytkownika / adres email</th>
                                    <th>data dołączeniu do budżetu</th>
                                    <th>rola</th>
                                    <th>status</th>
                                    <th>opcje</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingMembers ? (
                                    <tr>
                                        <td colSpan={6} className={styles.tableMessage}>
                                            Ładowanie...
                                        </td>
                                    </tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={styles.tableMessage}>
                                            Brak danych
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((m, idx) => {
                                        const rowKey = m.id ? String(m.id) : `${m.email ?? "no-email"}-${idx}`;
                                        return (
                                            <tr key={rowKey}>
                                                <td>{idx + 1}</td>
                                                <td>{m.userName && m.userName.trim() ? m.userName : m.email}</td>
                                                <td>{formatDatePL(m.addedAt)}</td>
                                                <td>{m.role}</td>
                                                <td>{m.status}</td>
                                                <td className={styles.optionsCell}>
                                                    <button
                                                        type="button"
                                                        className={styles.trashButton}
                                                        onClick={() => openRemoveModal(m)}
                                                    >
                                                        <Image src="/trash.svg" alt="Usuń" width={16} height={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>

            {isInviteModalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>DODAJ NOWEGO CZŁONKA BUDŻETU</h2>
                            <button type="button" className={styles.modalClose} onClick={closeInviteModal}>
                                <span style={{ color: "#EAC278", fontSize: 22, lineHeight: 1 }}>×</span>
                            </button>
                        </div>

                        <label className={styles.modalLabel}>Adres e-mail istniejącego użytkownika</label>

                        <input
                            className={styles.modalInput}
                            value={inviteValue}
                            onChange={(e) => setInviteValue(e.target.value)}
                            placeholder="np. test123@gmail.com"
                            type="email"
                        />

                        {inviteError && <div className={styles.modalError}>{inviteError}</div>}

                        <button
                            type="button"
                            className={styles.modalPrimaryButton}
                            onClick={sendInvitation}
                            disabled={sendingInvite}
                        >
                            {sendingInvite ? "wysyłanie..." : "wyślij zaproszenie"}
                        </button>
                    </div>
                </div>
            )}

            {isRemoveModalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeaderRow}>
                            <h2 className={styles.modalTitle}>USUŃ CZŁONKA BUDŻETU</h2>
                            <button type="button" className={styles.modalCloseButton} onClick={closeRemoveModal}>
                                ×
                            </button>
                        </div>

                        <div className={styles.removeBody}>
                            <p className={styles.removeText}>
                                Czy na pewno chcesz usunąć:{" "}
                                <span className={styles.removeHighlight}>{memberToRemove?.label}</span>?
                            </p>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={`${styles.modalButton} ${styles.modalSecondaryButton}`}
                                onClick={closeRemoveModal}
                                disabled={removingMember}
                            >
                                ANULUJ
                            </button>

                            <button
                                type="button"
                                className={`${styles.modalButton} ${styles.modalPrimaryButton}`}
                                onClick={removeMember}
                                disabled={removingMember}
                            >
                                {removingMember ? "USUWANIE..." : "USUŃ"}
                            </button>
                        </div>

                    </div>
                </div>
            )}


        </div>
    );
}
