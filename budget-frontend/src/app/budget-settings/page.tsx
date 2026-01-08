"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./BudgetSettings.module.css";
import dashboardStyles from "../budget-settings/BudgetSettings.module.css";

export default function BudgetTeam() {
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
                <section className={dashboardStyles.greeting}>
                    <h1 className={dashboardStyles.greetingTitle}>Ustawienia budżetu</h1>
                    <div className={dashboardStyles.greetingUnderline} />
                </section>

                <div className={styles.breadcrumbsContainer}>
                    <span className={styles.crumbLink}>Dashboard</span>
                    <span style={{ color: "#EAC278", margin: "0 4px" }}>&gt;</span>
                    <span className={styles.crumbActive}>Ustawienia budżetu</span>
                </div>

            </main>
        </div>
    );
}
