"use client";

import React, { useEffect, useState } from "react";
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
                            <Image
                                src="/profile-icon.svg"
                                alt="Profil"
                                width={22}
                                height={22}
                            />
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

                <section className={styles.contentWrapper}>
                    <div className={styles.articleTop}>
                        <p className={styles.lead}>
                            Zarządzanie finansami nie musi być skomplikowane.
                            Wystarczy kilka podstawowych zasad, które pomagają uporządkować wydatki i lepiej planować codzienne decyzje.
                        </p>

                        <div className={styles.quoteBox}>
                            <p className={styles.quoteText}>
                                „Nie chodzi o to, żeby mieć więcej pieniędzy. Chodzi o to, żeby lepiej nimi zarządzać.”
                            </p>
                        </div>
                    </div>

                    <section className={styles.gridWrapper}>
                        <div className={styles.cardsGrid}>
                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Wydawaj mniej niż zarabiasz</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Jeśli miesiąc w miesiąc bilans jest na minusie, to nawet małe kwoty z czasem robią
                                        duży problem. Najpierw domknij podstawy, potem dopiero „ulepszaj” budżet.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Rób prosty budżet</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Podziel pieniądze na: opłaty stałe, codzienne życie i „przyjemności”.
                                        Nawet prosty podział ogranicza impulsy i ułatwia decyzje.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Poduszka finansowa</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Odkładaj regularnie, nawet małe kwoty. Celem są oszczędności pozwalające przetrwać
                                        kilka miesięcy bez dochodu lub w razie nagłego wydatku.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Uważaj na „drobne” wydatki</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Małe zakupy powtarzane często potrafią zjadać budżet. Raz w tygodniu rzuć okiem
                                        na historię transakcji i zobacz, co realnie się nazbierało.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Unikaj impulsywnych zakupów</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Zastosuj zasadę „odczekaj”: jeśli to nie jest pilna potrzeba, wróć do tematu
                                        następnego dnia. Bardzo często ochota mija.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Ogranicz długi konsumpcyjne</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Unikaj kupowania „bo teraz”, jeśli będziesz to spłacać długo później.
                                        Zadłużenie na zachcianki szybko blokuje swobodę finansową.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Automatyzuj oszczędzanie</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Najłatwiej oszczędzać, gdy decyzja dzieje się „z automatu”.
                                        Ustal stałą kwotę po wypłacie i traktuj ją jak rachunek do opłacenia.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Pilnuj stałych kosztów</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Subskrypcje, pakiety, prowizje, opłaty „co miesiąc” — to często pieniądze,
                                        które uciekają bez bólu. Raz na jakiś czas zrób przegląd i tnij zbędne.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.questionSection}>
                                    <h2 className={styles.questionText}>Regularnie rób podsumowania</h2>
                                </div>
                                <div className={styles.answerSection}>
                                    <p className={styles.answerText}>
                                        Ustal prosty rytm: raz w tygodniu szybki przegląd, raz w miesiącu większe
                                        podsumowanie. Bez oceniania się — tylko fakty i decyzje na kolejny miesiąc.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className={styles.articleBottom}>
                        <h2 className={styles.bottomTitle}>Mały plan na start</h2>

                        <div className={styles.callout}>
                            <ul className={styles.stepsList}>
                                <li className={styles.stepItem}>Zrób 7 dni obserwacji wydatków bez zmian w zachowaniu.</li>
                                <li className={styles.stepItem}>Wybierz 1 rzecz do ograniczenia (najłatwiejszą).</li>
                                <li className={styles.stepItem}>Ustal stałą kwotę oszczędzania i trzymaj ją przez miesiąc.</li>
                                <li className={styles.stepItem}>Na koniec miesiąca sprawdź: co działało, co nie i dlaczego.</li>
                            </ul>
                        </div>

                    </div>
                </section>


            </main>
        </div>
    );
}
