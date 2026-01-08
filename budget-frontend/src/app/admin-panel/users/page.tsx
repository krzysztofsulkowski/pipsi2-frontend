"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import styles from "./UsersPage.module.css";

interface UserDto {
  userId: string;
  userName: string;
  email: string;
  roleId: string;
  roleName: string;
  isLocked: boolean;
}

export default function UsersManagementPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ column: 1, direction: "asc" as "asc" | "desc" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/adminPanel/users/get-all-users`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          Draw: 1,
          Start: (currentPage - 1) * pageSize,
          Length: pageSize,
          SearchValue: "",
          OrderColumn: sortConfig.column,
          OrderDir: sortConfig.direction
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
        setTotalRecords(result.recordsFiltered);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [apiUrl, currentPage, pageSize, sortConfig]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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

      <button className={styles.addButton} type="button">
        <Image src="/income.svg" alt="Add" width={16} height={16} className={styles.addIcon} />
        <span className={styles.btnText}>DODAJ UŻYTKOWNIKA</span>
      </button>

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
            {loading ? (
              <tr><td colSpan={6} style={{textAlign:'center', padding: '40px'}}>Ładowanie danych...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId}>
                  <td style={{color:'#777'}}>{user.userId.substring(0, 8)}...</td>
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
                      <button className={styles.actionBtn}><Image src="/edit.svg" alt="Edit" width={22} height={22}/></button>
                      <button className={styles.actionBtn}><Image src="/delete.svg" alt="Delete" width={22} height={22}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}