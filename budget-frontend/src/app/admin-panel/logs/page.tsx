"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./LogsPage.module.css";
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

interface HistoryLogDto {
    creationDate: string;
    eventType: string;
    objectId: string;
    objectType: string;
    before: string;
    after: string;
    userId: string;
    userEmail: string;
}

interface DataTableResponse {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: HistoryLogDto[];
}

export default function SystemLogsPage() {
    const { allowed, checked } = useRequireAdmin();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [logs, setLogs] = useState<HistoryLogDto[]>([]);
    const [loading, setLoading] = useState(true);

    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        column: 0,
        direction: "desc" as "asc" | "desc",
    });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const response = await fetch(`${apiUrl}/api/historyLog/get-history-logs`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
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
                const result = (await response.json()) as DataTableResponse;
                setLogs(result.data || []);
                setTotalRecords(result.recordsFiltered);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, currentPage, pageSize, sortConfig]);

    useEffect(() => {
        if (!checked || !allowed) return;
        fetchLogs();
    }, [fetchLogs, checked, allowed]);

    const handleSort = (colIndex: number) => {
        setSortConfig((prev) => ({
            column: colIndex,
            direction: prev.column === colIndex && prev.direction === "desc" ? "asc" : "desc",
        }));
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    if (!checked || !allowed) return null;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Panel Administracyjny</h1>
                <div className={styles.divider}></div>
                <div className={styles.navigation}>
                    <span className={styles.navAccent}>Panel Administracyjny</span>
                    <span className={styles.navNormal}> &gt; Logi systemowe</span>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.logsTable}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort(0)} className={styles.sortable}>
                                DATA {sortConfig.column === 0 && (sortConfig.direction === "asc" ? "↑" : "↓")}
                            </th>
                            <th>ZDARZENIE</th>
                            <th>OBIEKT</th>
                            <th>E-MAIL</th>
                            <th>PRZED</th>
                            <th>PO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className={styles.infoCell}>
                                    Ładowanie...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.infoCell}>
                                    Brak logów
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, index) => (
                                <tr key={`${log.objectId}-${index}`}>
                                    <td className={styles.dateCell}>{new Date(log.creationDate).toLocaleString()}</td>
                                    <td>
                                        <span className={styles.eventTypeBadge}>{log.eventType}</span>
                                    </td>
                                    <td>{log.objectType}</td>
                                    <td>{log.userEmail}</td>
                                    <td className={styles.dataCell}>
                                        <div className={styles.truncate} title={log.before}>
                                            {log.before || "-"}
                                        </div>
                                    </td>
                                    <td className={styles.dataCell}>
                                        <div className={styles.truncate} title={log.after}>
                                            {log.after || "-"}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    <div className={styles.pageInfo}>Razem: {totalRecords}</div>
                    <div className={styles.pageControls}>
                        <button className={styles.pageBtn} onClick={() => setCurrentPage((c) => c - 1)} disabled={currentPage === 1}>
                            Poprzednia
                        </button>
                        <span className={styles.pageLabel}>
                            Strona {currentPage} z {totalPages}
                        </span>
                        <button className={styles.pageBtn} onClick={() => setCurrentPage((c) => c + 1)} disabled={currentPage >= totalPages}>
                            Następna
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
