import React from 'react';
import styles from './AdminPanel.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel Administracyjny</h1>
        <div className={styles.divider}></div>
      </header>

      <main className={styles.optionsGrid}>
        <Link href="/admin-panel/users" className={styles.card}>
          <div className={styles.icon}>
            <Image 
              src="/users.svg"  
              alt="Users icon" 
              width={61} 
              height={61} 
            />
          </div>
          <span className={styles.cardText}>Użytkownicy</span>
        </Link>

        <button className={styles.card}>
          <div className={styles.icon}>
            <Image 
              src="/lupe.svg" 
              alt="Logs icon" 
              width={61} 
              height={61} 
            />
          </div>
          <span className={styles.cardText}>Logi Systemowe</span>
        </button>
      </main>
    </div>
  );
}