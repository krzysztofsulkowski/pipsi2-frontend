"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import styles from "./UsersPage.module.css";
import { useRouter } from "next/navigation";

export function useRequireAdmin() {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("authToken");

            if (!token) {
                router.replace("/login");
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${apiUrl}/api/adminPanel/users/roles`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (res.status === 401) {
                router.replace("/login");
                return;
            }

            if (res.status === 403) {
                router.replace("/dashboard");
                return;
            }

            if (!res.ok) {
                router.replace("/dashboard");
                return;
            }

            setAllowed(true);
            setChecked(true);
        })();
    }, [router]);

    return { allowed, checked };
}

interface UserDto {
    userId: string;
    userName: string;
    email: string;
    roleId: string;
    roleName: string;
    isLocked: boolean;
}

interface RoleDto {
    id: string;
    name: string;
}

export default function UsersManagementPage() {
    const { allowed, checked } = useRequireAdmin();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [users, setUsers] = useState<UserDto[]>([]);
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ column: 1, direction: "asc" as "asc" | "desc" });

    const [formData, setFormData] = useState({
        email: "",
        userName: "",
        password: "",
        confirmPassword: "",
        roleId: "",
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const response = await fetch(`${apiUrl}/api/adminPanel/users/get-all-users`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    Draw: 1,
                    Start: (currentPage - 1) * pageSize,
                    Length: pageSize,
                    SearchValue: "",
                    OrderColumn: sortConfig.column,
                    OrderDir: sortConfig.direction,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setUsers(result.data || []);
                setTotalRecords(result.recordsFiltered);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, currentPage, pageSize, sortConfig]);

    const fetchRoles = useCallback(async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const response = await fetch(`${apiUrl}/api/adminPanel/users/roles`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = (await response.json()) as RoleDto[];
                setRoles(data);
            }
        } catch (error) {
            console.error(error);
        }
    }, [apiUrl]);

    useEffect(() => {
        if (!checked || !allowed) return;
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles, checked, allowed]);

    const handleEditClick = async (userId: string) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const response = await fetch(`${apiUrl}/api/adminPanel/users/get-user-by-id?userId=${userId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const userToEdit = (await response.json()) as UserDto;
                setEditingUserId(userId);
                setFormData({
                    email: userToEdit.email,
                    userName: userToEdit.userName,
                    password: "",
                    confirmPassword: "",
                    roleId: userToEdit.roleId,
                });
                setShowModal(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUserId(null);
        setFormData({ email: "", userName: "", password: "", confirmPassword: "", roleId: roles[0]?.id || "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");
        if (!token) return;

        if (!editingUserId && formData.password !== formData.confirmPassword) {
            alert("Hasła nie są identyczne!");
            return;
        }

        const endpoint = editingUserId ? "update-user" : "create-user";
        const body = editingUserId
            ? { UserId: editingUserId, Email: formData.email, UserName: formData.userName, RoleId: formData.roleId }
            : { Email: formData.email, UserName: formData.userName, RoleId: formData.roleId };

        try {
            const response = await fetch(`${apiUrl}/api/adminPanel/users/${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                closeModal();
                fetchUsers();
            } else {
                const error = (await response.json()) as { message?: string };
                alert(`Błąd: ${error.message || "Błąd zapisu"}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleLock = async (userId: string, isCurrentlyLocked: boolean) => {
        const action = isCurrentlyLocked ? "unlock-user" : "lock-user";

        if (!isCurrentlyLocked && !confirm("Czy na pewno chcesz zablokować tego użytkownika?")) return;

        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const response = await fetch(`${apiUrl}/api/adminPanel/users/${action}/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const errorData = (await response.json()) as { message?: string };
                alert(errorData.message || "Błąd podczas zmiany statusu użytkownika");
            }
        } catch (error) {
            console.error("Lock error:", error);
        }
    };

    if (!checked || !allowed) return null;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Panel Administracyjny</h1>
                <div className={styles.divider}></div>
                <div className={styles.navigation}>
                    <span className={styles.navAccent}>Panel Administracyjny</span>
                    <span className={styles.navNormal}> &gt; Zarządzanie użytkownikami</span>
                </div>
            </header>

            <button className={styles.addButton} onClick={() => setShowModal(true)}>
                <Image src="/income.svg" alt="Add" width={16} height={16} className={styles.addIcon} />
                <span className={styles.btnText}>DODAJ UŻYTKOWNIKA</span>
            </button>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button type="button" className={styles.closeButton} onClick={closeModal}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M1 1L17 17M17 1L1 17" stroke="#EAC278" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </button>

                        <h2 className={styles.formTitle}>{editingUserId ? "EDYTUJ UŻYTKOWNIKA" : "DODAJ NOWEGO UŻYTKOWNIKA"}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <div className={styles.stepHeader}>
                                    <div className={styles.stepCircle}>1</div>
                                    <label className={styles.inputLabel}>Adres e-mail użytkownika</label>
                                </div>
                                <input
                                    type="email"
                                    className={styles.inputField}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.stepHeader}>
                                    <div className={styles.stepCircle}>2</div>
                                    <label className={styles.inputLabel}>Nazwa użytkownika</label>
                                </div>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    value={formData.userName}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    required
                                />
                            </div>

                            {!editingUserId && (
                                <div className={styles.formGroup}>
                                    <div className={styles.stepHeader}>
                                        <div className={styles.stepCircle}>3</div>
                                        <label className={styles.inputLabel}>Hasło</label>
                                    </div>
                                    <input
                                        type="password"
                                        className={styles.inputField}
                                        placeholder="hasło"
                                        style={{ marginBottom: "10px" }}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        className={styles.inputField}
                                        placeholder="powtórz hasło"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <div className={styles.stepHeader}>
                                    <div className={styles.stepCircle}>{editingUserId ? "3" : "4"}</div>
                                    <label className={styles.inputLabel}>Rola</label>
                                </div>
                                <div className={styles.roleSelection}>
                                    {roles.map((role) => {
                                        const isAdminRole = role.name.toLowerCase().includes("admin");
                                        return (
                                            <div
                                                key={role.id}
                                                className={`${styles.roleBtn} ${formData.roleId === role.id ? styles.roleBtnActive : ""}`}
                                                onClick={() => setFormData({ ...formData, roleId: role.id })}
                                            >
                                                <span className={isAdminRole ? styles.roleTextAdmin : styles.roleTextStandard}>
                                                    {isAdminRole ? "administrator" : "użytkownik standardowy"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingUserId ? "zapisz zmiany" : "utwórz użytkownika"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.userTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ADRES E-MAIL</th>
                            <th>NAZWA UŻYTKOWNIKA</th>
                            <th>STATUS</th>
                            <th>ROLA</th>
                            <th>OPCJE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading &&
                            users.map((user) => (
                                <tr key={user.userId}>
                                    <td style={{ color: "#777" }}>{user.userId.substring(0, 8)}...</td>
                                    <td>{user.email}</td>
                                    <td>{user.userName}</td>
                                    <td>
                                        <span className={user.isLocked ? styles.statusLocked : styles.statusActive}>
                                            {user.isLocked ? "ZABLOKOWANY" : "AKTYWNY"}
                                        </span>
                                    </td>
                                    <td>{user.roleName || "Brak roli"}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.actionBtn} onClick={() => handleEditClick(user.userId)}>
                                                <Image src="/edit.svg" alt="Edit" width={22} height={22} />
                                            </button>
                                            <button className={styles.actionBtn} onClick={() => handleToggleLock(user.userId, user.isLocked)}>
                                                <Image src="/delete.svg" alt="Toggle Lock" width={22} height={22} style={{ opacity: user.isLocked ? 0.5 : 1 }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
