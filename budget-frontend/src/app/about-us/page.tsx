"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./AboutUs.module.css";
import dashboardStyles from "../dashboard/Dashboard.module.css";

export default function AboutUs() {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setIsProfileMenuOpen(false);
        router.push("/login");
    };


    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsAuthenticated(!!token);
    }, []);

    const handleGoToLogin = () => {
        setIsProfileMenuOpen(false);
        router.push("/login");
    };

    const handleGoToRegister = () => {
        setIsProfileMenuOpen(false);
        router.push("/register");
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
                                {!isAuthenticated ? (
                                    <>
                                        <button
                                            type="button"
                                            className={dashboardStyles.profileDropdownItem}
                                            onClick={handleGoToLogin}
                                        >
                                            Zaloguj się
                                        </button>

                                        <button
                                            type="button"
                                            className={dashboardStyles.profileDropdownItem}
                                            onClick={handleGoToRegister}
                                        >
                                            Załóż konto
                                        </button>
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                </nav>
            </header>

            <main className={dashboardStyles.main}>
                <section className={dashboardStyles.greeting}>
                    <h1 className={dashboardStyles.greetingTitle}>O nas</h1>
                    <div className={dashboardStyles.greetingUnderline} />
                </section>

                <div className={styles.contentWrapper}>
                    <section className={styles.textColumn}>
                        <div className={styles.descriptions}>
                            <p className={styles.textRegular}>
                                Jesteśmy zespołem studentów, którzy stworzyli aplikację do zarządzania
                                budżetem, aby pomóc użytkownikom lepiej kontrolować swoje finanse.
                                Nasz system umożliwia monitorowanie wydatków, tworzenie budżetów
                                i analizowanie danych w czytelnej formie.
                            </p>
                            <p className={styles.textHighlight}>
                                Wierzymy, że nawet proste narzędzia mogą realnie wspierać codzienne
                                decyzje finansowe i ułatwiać planowanie przyszłości.
                            </p>
                        </div>
                    </section>

                    <section className={styles.imageColumn}>
                        <div className={styles.imageBox}>
                            <Image
                                src="/wallet.svg"
                                alt="Portfel"
                                fill
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
