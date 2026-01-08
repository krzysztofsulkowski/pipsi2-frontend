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

interface DataTableResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: UserDto[];
}

export default function UsersManagementPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [tableParams] = useState({
    draw: 1,
    start: 0,
    length: 10,
    searchValue: "",
    orderColumn: 0,
    orderDir: "asc"
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/adminPanel/users/get-all-users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Draw: tableParams.draw,
          Start: tableParams.start,
          Length: tableParams.length,
          SearchValue: tableParams.searchValue,
          OrderColumn: tableParams.orderColumn,
          OrderDir: tableParams.orderDir
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as DataTableResponse;
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error("Błąd pobierania:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, tableParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel Administracyjny</h1>
        <div className={styles.divider}></div>
        <p className={styles.subtitle}>Zarządzanie Użytkownikami</p>
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
              <tr><td colSpan={6} className={styles.infoCell}>Ładowanie danych...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className={styles.infoCell}>Brak użytkowników w systemie.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId}>
                  <td className={styles.idCell}>{user.userId.substring(0, 8)}...</td>
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
                      <button className={styles.actionBtn}>
                        <Image src="/edit.svg" alt="Edytuj" width={22} height={22} />
                      </button>
                      <button className={styles.actionBtn}>
                        <Image src="/delete.svg" alt="Usuń" width={22} height={22} />
                      </button>
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