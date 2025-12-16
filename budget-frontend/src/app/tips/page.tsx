"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Tips.module.css";
import dashboardStyles from "../dashboard/Dashboard.module.css";

export default function TipsPage() {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsProfileMenuOpen(false);
        router.push("/login");
    };

    return (
        <div className={dashboardStyles.page}>
            <header className={dashboardStyles.header}>
                <div className={dashboardStyles.headerLeft}>
                    <Link href="/dashboard">
                        <img
                            src="/logo.svg"
                            alt="Logo aplikacji"
                            className={dashboardStyles.logoImage}
                        />
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
                            <Image
                                src="/profile-icon.svg"
                                alt="Profil"
                                width={22}
                                height={22}
                            />
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

            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={dashboardStyles.greetingTitle}>
                        <span className={dashboardStyles.greetingHighlight}>
                            Porady
                        </span>{" "}
                        finansowe
                    </h1>
                    <div className={dashboardStyles.greetingUnderline} />
                </div>

                <section className={styles.contentWrapper}></section>
            </main>
        </div>
    );
}
