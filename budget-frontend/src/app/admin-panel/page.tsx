'use client';

import React, { useEffect, useState } from 'react';
import styles from './AdminPanel.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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


export default function AdminPage() {
    const { allowed, checked } = useRequireAdmin();
    if (!checked || !allowed) return null;


    return (
        <div className={styles.adminContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Panel Administracyjny</h1>
                <div className={styles.divider}></div>
            </header>

            <main className={styles.optionsGrid}>
                <Link href="/admin-panel/users" className={styles.card}>
                    <div className={styles.icon}>
                        <Image src="/users.svg" alt="Users icon" width={61} height={61} />
                    </div>
                    <span className={styles.cardText}>Użytkownicy</span>
                </Link>

                <Link href="/admin-panel/logs" className={styles.card}>
                    <div className={styles.icon}>
                        <Image src="/lupe.svg" alt="Logs icon" width={61} height={61} />
                    </div>
                    <span className={styles.cardText}>Logi Systemowe</span>
                </Link>
            </main>
        </div>
    );
}
