"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Landing.module.css";
import dashboardStyles from "../budget-settings/BudgetSettings.module.css";

function LandingPage() {
    const router = useRouter();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleGoToLogin = () => router.push("/login");
    const handleGoToRegister = () => router.push("/register");
    const handleGoToTips = () => router.push("/porady-finansowe");
    const handleGoToFaq = () => router.push("/faq");
    const handleGoToAbout = () => router.push("/o-nas");

    return (
        <div className={dashboardStyles.page}>
            <header className={dashboardStyles.header}>
                <div className={dashboardStyles.headerLeft}>
                    <Link href="/landing-page">
                        <img
                            src="/logo.svg"
                            alt="Logo aplikacji"
                            className={dashboardStyles.logoImage}
                        />
                    </Link>
                </div>

                <nav className={dashboardStyles.nav}>
                    <button
                        type="button"
                        className={dashboardStyles.navLink}
                        onClick={handleGoToTips}
                    >
                        Porady finansowe
                    </button>

                    <button
                        type="button"
                        className={dashboardStyles.navLink}
                        onClick={handleGoToFaq}
                    >
                        FAQ
                    </button>

                    <button
                        type="button"
                        className={dashboardStyles.navLink}
                        onClick={handleGoToAbout}
                    >
                        O nas
                    </button>

                    <div className={dashboardStyles.profileMenu}>
                        <button
                            type="button"
                            className={dashboardStyles.profileButton}
                            onClick={() => setIsProfileMenuOpen(v => !v)}
                            aria-label="Menu"
                        >
                            <Image src="/profile-icon.svg" alt="" width={22} height={22} />
                        </button>

                        {isProfileMenuOpen && (
                            <div className={dashboardStyles.profileDropdown}>
                                <button
                                    type="button"
                                    className={dashboardStyles.profileDropdownItem}
                                    onClick={() => {
                                        setIsProfileMenuOpen(false);
                                        handleGoToLogin();
                                    }}
                                >
                                    Zaloguj się
                                </button>

                                <button
                                    type="button"
                                    className={dashboardStyles.profileDropdownItem}
                                    onClick={() => {
                                        setIsProfileMenuOpen(false);
                                        handleGoToRegister();
                                    }}
                                >
                                    Załóż konto
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Twój <span className={styles.heroHighlight}>planer</span> domowego budżetu
                        </h1>

                        <div className={styles.greetingUnderline} />

                        <p className={styles.heroText}>
                            Zaplanuj każdy wydatek i zyskaj pełną kontrolę nad swoim budżetem.
                            Nasza aplikacja pomaga Ci śledzić finanse w sposób przejrzysty i
                            intuicyjny – bez zbędnych arkuszy i skomplikowanych kalkulacji.
                        </p>

                        <div className={styles.heroButtons}>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleGoToRegister}
                            >
                                dołącz do nas!
                            </button>

                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleGoToLogin}
                            >
                                zaloguj się
                            </button>
                        </div>
                    </div>

                    <div className={styles.heroGraphic}>
                        <img
                            src="/wallet.svg"
                            alt="Ilustracja portfela"
                            className={styles.heroImage}
                        />
                    </div>
                </section>

                <section className={styles.offerSection}>
                    <h2 className={styles.offerTitle}>co oferujemy?</h2>

                    <div className={styles.offerCards}>
                        <article className={styles.offerCard}>
                            <div className={styles.offerCardHeader}>
                                <h3 className={styles.offerCardTitle}>Twórz i dziel budżety</h3>
                            </div>
                            <div className={styles.offerCardBody}>
                                <p className={styles.offerCardText}>
                                    Zarządzaj swoimi finansami lub zaproś innych użytkowników do
                                    wspólnego planowania wydatków. Idealne rozwiązanie dla rodzin,
                                    par i zespołów.
                                </p>
                            </div>
                        </article>

                        <article className={styles.offerCard}>
                            <div className={styles.offerCardHeader}>
                                <h3 className={styles.offerCardTitle}>Planuj przyszłe płatności</h3>
                            </div>
                            <div className={styles.offerCardBody}>
                                <p className={styles.offerCardText}>
                                    Dodawaj jednorazowe i cykliczne płatności z terminami, by nic Ci
                                    nie umknęło. System przypomni Ci o zbliżających się
                                    zobowiązaniach.
                                </p>
                            </div>
                        </article>

                        <article className={styles.offerCard}>
                            <div className={styles.offerCardHeader}>
                                <h3 className={styles.offerCardTitle}>Analizuj swoje wydatki</h3>
                            </div>
                            <div className={styles.offerCardBody}>
                                <p className={styles.offerCardText}>
                                    Sprawdzaj szczegółowe statystyki – wydatki według kategorii,
                                    osób, miesięcy i lat. Zyskaj jasny obraz swoich finansów i lepiej
                                    planuj kolejne kroki.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                <section className={styles.footerCta}>
                    <p className={styles.footerText}>
                        Potrzebujesz inspiracji, jak zachować finansową równowagę? Odkryj
                        praktyczne wskazówki i proste sposoby na mądre planowanie wydatków.
                    </p>

                    <button
                        type="button"
                        className={styles.footerButton}
                        onClick={handleGoToTips}
                    >
                        poznaj porady od BALANCR
                    </button>
                </section>
            </main>
        </div>
    );
}

export default LandingPage;
