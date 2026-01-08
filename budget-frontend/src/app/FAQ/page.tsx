"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./FAQ.module.css";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const faqData = [
    {
        id: 1,
        question: "Czym jest BALANCR?",
        answer:
            "To internetowy system do zarządzania budżetem, który pozwala śledzić wydatki, planować przychody i kontrolować finanse w prosty, przejrzysty sposób.",
    },
    {
        id: 2,
        question: "Czy korzystanie z aplikacji jest darmowe?",
        answer:
            "Tak, aplikacja została stworzona w ramach projektu studenckiego i jest całkowicie darmowa do użytku.",
    },
    {
        id: 3,
        question: "Czy mogę tworzyć więcej niż jeden budżet?",
        answer:
            "Tak, użytkownik może tworzyć dowolną liczbę budżetów – np. osobny dla siebie, partnera lub całej rodziny, czy też z podziałem na różne waluty.",
    },
    {
        id: 4,
        question: "Czy mogę udostępnić budżet innym osobom?",
        answer:
            "Tak, aplikacja umożliwia zapraszanie innych użytkowników do wspólnego budżetu. Wszyscy uczestnicy mogą dodawać wydatki i przeglądać statystyki.",
    },
    {
        id: 5,
        question: "Jakie dane są zapisywane w systemie?",
        answer:
            "Przechowujemy podstawowe dane potrzebne do działania aplikacji – takie jak e-mail użytkownika, hasło (zaszyfrowane), kwoty wydatków i ich kategorie.",
    },
    {
        id: 6,
        question: "Czy moje dane są bezpieczne?",
        answer:
            "Tak. Wszystkie dane są zabezpieczone zgodnie z aktualnymi standardami bezpieczeństwa i nie są udostępniane osobom trzecim.",
    },
    {
        id: 7,
        question: "Czy mogę edytować lub usunąć wpisy o wydatkach?",
        answer: "Tak. W każdej chwili możesz edytować lub usuwać te dane.",
    },
];

export default function FAQPage() {
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
                    <h1 className={dashboardStyles.greetingTitle}>
                        <span className={dashboardStyles.greetingHighlight}>FAQ</span>
                        {" "}– Najczęściej zadawane pytania
                    </h1>
                    <div className={dashboardStyles.greetingUnderline} />
                </section>

                <section className={styles.gridWrapper}>
                    <div className={styles.cardsGrid}>
                        {faqData.map((item) => (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>{item.question}</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
