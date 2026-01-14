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

interface RoleDto {
  id: string;
  name: string;
}

export default function UsersManagementPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  // States
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState<RoleDto[]>([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ column: 1, direction: "asc" as "asc" | "desc" });

   // Form State
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


  const fetchRoles = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}/api/adminPanel/users/roles`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        if (data.length > 0) {
            const defaultRole = data.find((r: RoleDto) => !r.name.toLowerCase().includes("admin")) || data[0];
            setFormData(prev => ({ ...prev, roleId: defaultRole.id }));
        }
      }
    } catch (error) { console.error("Błąd pobierania ról:", error); }
  }, [apiUrl]);

  useEffect(() => { 
    fetchUsers(); 
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}/api/adminPanel/users/create-user`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: formData.email,
          UserName: formData.userName,
          RoleId: formData.roleId
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchUsers();
        setFormData({ email: "", userName: "", password: "", confirmPassword: "", roleId: roles[0]?.id || "" });
      } else {
        const error = await response.json();
        alert(`Błąd: ${error.message || "Błąd serwera"}`);
      }
    } catch (error) { console.error(error); }
  };

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

 {/* MODAL FORMULARZA */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setShowModal(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                 <path d="M1 1L17 17M17 1L1 17" stroke="#EAC278" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </button>

            <h2 className={styles.formTitle}>DODAJ NOWEGO UŻYTKOWNIKA</h2>

            <form onSubmit={handleCreateUser}>
              {/* E-mail */}
              <div className={styles.formGroup}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepCircle}>1</div>
                  <label className={styles.inputLabel}>Adres e-mail użytkownika</label>
                </div>
                <input 
                  type="email" 
                  className={styles.inputField} 
                  placeholder="e-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {/*Nazwa */}
              <div className={styles.formGroup}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepCircle}>2</div>
                  <label className={styles.inputLabel}>Nazwa użytkownika</label>
                </div>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  placeholder="nazwa użytkownika"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  required
                />
              </div>

              {/* Hasła */}
              <div className={styles.formGroup}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepCircle}>3</div>
                  <label className={styles.inputLabel}>Hasło</label>
                </div>
                <input 
                  type="password" 
                  className={styles.inputField} 
                  placeholder="hasło"
                  style={{marginBottom: '10px'}}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <input 
                  type="password" 
                  className={styles.inputField} 
                  placeholder="powtórz hasło"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepCircle}>4</div>
                  <label className={styles.inputLabel}>Rola</label>
                </div>
                <div className={styles.roleSelection}>
                  {roles.map((role) => {
                    const isAdmin = role.name.toLowerCase().includes("admin");
                    return (
                      <div 
                        key={role.id}
                        className={`${styles.roleBtn} ${formData.roleId === role.id ? styles.roleBtnActive : ""}`}
                        onClick={() => setFormData({...formData, roleId: role.id})}
                      >
                        <span className={isAdmin ? styles.roleTextAdmin : styles.roleTextStandard}>
                          {isAdmin ? "administrator" : "użytkownik standardowy"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <button type="submit" className={styles.submitBtn}>utwórz użytkownika</button>
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