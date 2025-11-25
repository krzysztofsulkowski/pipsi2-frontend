"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Landing.module.css";

function LandingPage() {
    const router = useRouter();
    const [isContactOpen, setIsContactOpen] = useState(false);

    const handleGoToLogin = () => {
        router.push("/login");
    };

    const handleGoToRegister = () => {
        router.push("/register");
    };

    const handleGoToTips = () => {
        router.push("/porady-finansowe");
    };

    const handleGoToFaq = () => {
        router.push("/faq");
    };

    const handleGoToAbout = () => {
        router.push("/o-nas");
    };

    const handleSubmitContact = (e: React.FormEvent) => {
        e.preventDefault();
        setIsContactOpen(false);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>BALANCR</div>
                </div>
                <nav className={styles.nav}>
                    <button className={styles.navLink} onClick={handleGoToTips}>
                        Porady finansowe
                    </button>
                    <button className={styles.navLink} onClick={handleGoToFaq}>
                        FAQ
                    </button>
                    <button className={styles.navLink} onClick={handleGoToAbout}>
                        O nas
                    </button>
                    <button className={styles.profileIcon} onClick={handleGoToLogin}>
                    </button>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Twój{" "}
                            <span className={styles.heroHighlight}>
                                planer
                            </span>
                            {" "}domowego budżetu
                        </h1>
                        <div className={styles.greetingUnderline} />
                        <p className={styles.heroText}>
                            Zaplanuj każdy wydatek i zyskaj pełną kontrolę nad swoim budżetem.
                            Nasza aplikacja pomaga Ci śledzić finanse w sposób przejrzysty i
                            intuicyjny – bez zbędnych arkuszy i skomplikowanych kalkulacji.
                        </p>
                        <div className={styles.heroButtons}>
                            <button
                                className={styles.primaryButton}
                                onClick={handleGoToRegister}
                            >
                                dołącz do nas!
                            </button>
                            <button
                                className={styles.secondaryButton}
                                onClick={handleGoToAbout}
                            >
                                dowiedz się więcej
                            </button>
                        </div>
                    </div>
                    <div className={styles.heroGraphic}>
                        <img
                            src="/wallet.svg"
                            className={styles.heroImage}
                        />
                    </div>

                </section>

                <section className={styles.offerSection}>
                    <h2 className={styles.offerTitle}>co oferujemy?</h2>
                    <div className={styles.offerCards}>
                        <article className={styles.offerCard}>

                            <h3 className={styles.offerCardTitle}>Twórz i dziel budżety</h3>
                            <p className={styles.offerCardText}>
                                Zarządzaj swoimi finansami lub zaproś innych użytkowników do
                                wspólnego planowania wydatków. Idealne rozwiązanie dla rodzin,
                                par i zespołów.
                            </p>
                        </article>

                        <article className={styles.offerCard}>
                            <h3 className={styles.offerCardTitle}>
                                Planuj przyszłe płatności
                            </h3>
                            <p className={styles.offerCardText}>
                                Dodawaj jednorazowe i cykliczne płatności z terminami, by nic Ci
                                nie umknęło. System przypomni Ci o zbliżających się
                                zobowiązaniach.
                            </p>
                        </article>

                        <article className={styles.offerCard}>

                            <h3 className={styles.offerCardTitle}>
                                Analizuj swoje wydatki
                            </h3>
                            <p className={styles.offerCardText}>
                                Sprawdzaj szczegółowe statystyki – wydatki według kategorii,
                                osób, miesięcy i lat. Zyskaj jasny obraz swoich finansów i lepiej
                                planuj kolejne kroki.
                            </p>
                        </article>
                    </div>
                </section>

                <section className={styles.footerCta}>
                    <p className={styles.footerText}>
                        Potrzebujesz inspiracji, jak zachować finansową równowagę? Odkryj
                        praktyczne wskazówki i proste sposoby na mądre planowanie wydatków.
                    </p>
                    <button
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
