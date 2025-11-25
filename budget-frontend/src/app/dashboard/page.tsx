"use client";

import styles from "./Dashboard.module.css";

const currencySymbol = "zł";

function DashboardPage() {
    const monthLabel = new Date().toLocaleDateString("pl-PL", {
        month: "long",
        year: "numeric",
    });
    const yearLabel = new Date().getFullYear();

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>BALANCR</div>
                    <div className={styles.budgetSelector}>
                        <button className={styles.budgetButton}>
                            <span>[nazwa wybranego budżetu]</span>
                            <span className={styles.budgetArrow}>▼</span>
                        </button>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <button className={styles.navLink}>Porady finansowe</button>
                    <button className={styles.navLink}>FAQ</button>
                    <button className={styles.navLink}>O nas</button>
                </nav>
            </header>


            <main className={styles.main}>
                <section className={styles.greeting}>
                    <h1 className={styles.greetingTitle}>
                        Cześć, <span className={styles.greetingHighlight}>[imię użytkownika]</span>!
                    </h1>
                    <p className={styles.greetingSubtitle}>
                        Twoja finansowa{" "}
                        <span className={styles.greetingHighlight}>równowaga</span> zaczyna się tutaj.
                    </p>
                    <div className={styles.greetingUnderline} />
                </section>

                <section className={styles.topRow}>
                    <div className={styles.topCards}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <p className={styles.cardTitle}>Twój aktualny bilans</p>
                            </div>
                            <div className={styles.cardValue}>
                                <span className={styles.cardValueNumber}>--,--</span>
                                <span className={styles.cardValueCurrency}>{currencySymbol}</span>
                            </div>
                            <p className={styles.cardDescription}>
                                różnica między przychodami a wydatkami z bieżącego miesiąca
                            </p>
                        </div>


                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <p className={styles.cardTitle}>Oszczędności</p>
                            </div>
                            <div className={styles.cardValue}>
                                <span className={styles.cardValueNumber}>--,--</span>
                                <span className={styles.cardValueCurrency}>{currencySymbol}</span>
                            </div>
                            <p className={styles.cardDescription}>
                                tyle udało Ci się zaoszczędzić z poprzednich miesięcy
                            </p>
                        </div>


                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <p className={styles.cardTitle}>Przychody</p>
                            </div>
                            <div className={styles.cardValue}>
                                <span className={styles.cardValueNumber}>--,--</span>
                                <span className={styles.cardValueCurrency}>{currencySymbol}</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button className={styles.primaryButton}>Dodaj przychód</button>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <p className={styles.cardTitle}>Wydatki</p>
                            </div>
                            <div className={styles.cardValue}>
                                <span className={styles.cardValueNumber}>--,--</span>
                                <span className={styles.cardValueCurrency}>{currencySymbol}</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button className={styles.secondaryButton}>Dodaj wydatek</button>
                            </div>
                        </div>
                    </div>

                    <aside className={styles.sidePanel}>
                        <div className={styles.historyCard}>
                            <div className={styles.historyHeader}>
                                <p className={styles.cardTitle}>Historia transakcji</p>
                            </div>
                            <div className={styles.historyBody}>
                                <p className={styles.historyEmptyTitle}>Brak danych do wyświetlenia.</p>
                                <p className={styles.historyEmptyText}>
                                    Dodaj swoje pierwsze przychody i wydatki, aby zobaczyć historię transakcji.
                                </p>
                            </div>
                        </div>

                        <div className={styles.fabList}>
                            <button className={styles.fabItem}>
                                <span className={styles.fabLabel}>Planowane wydatki</span>
                            </button>
                            <button className={styles.fabItem}>
                                <span className={styles.fabLabel}>Członkowie budżetu</span>
                            </button>
                            <button className={styles.fabItem}>
                                <span className={styles.fabLabel}>Ustawienia budżetu</span>
                            </button>
                        </div>
                    </aside>
                </section>

                <section className={styles.statsGrid}>
                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <p className={styles.statsTitle}>
                                wydatki zespołu z podziałem na kategorie
                            </p>
                            <p className={styles.statsSubtitle}>miesiąc: {monthLabel}</p>
                        </div>
                        <div className={styles.statsBody}>
                            <p className={styles.statsEmptyText}>
                                Brak danych do wyświetlenia. Dodaj swoje pierwsze przychody i wydatki,
                                aby zobaczyć statystyki i wykresy.
                            </p>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <p className={styles.statsTitle}>
                                wydatki z podziałem na członków budżetu
                            </p>
                            <p className={styles.statsSubtitle}>miesiąc: {monthLabel}</p>
                        </div>
                        <div className={styles.statsBody}>
                            <p className={styles.statsEmptyText}>
                                Brak danych do wyświetlenia. Dodaj swoje pierwsze przychody i wydatki,
                                aby zobaczyć statystyki i wykresy.
                            </p>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <p className={styles.statsTitle}>
                                wydatki zespołu z podziałem na kategorie
                            </p>
                            <p className={styles.statsSubtitle}>rok: {yearLabel}</p>
                        </div>
                        <div className={styles.statsBody}>
                            <p className={styles.statsEmptyText}>
                                Brak danych do wyświetlenia. Dodaj swoje pierwsze przychody i wydatki,
                                aby zobaczyć statystyki i wykresy.
                            </p>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <p className={styles.statsTitle}>
                                wydatki z podziałem na członków budżetu
                            </p>
                            <p className={styles.statsSubtitle}>rok: {yearLabel}</p>
                        </div>
                        <div className={styles.statsBody}>
                            <p className={styles.statsEmptyText}>
                                Brak danych do wyświetlenia. Dodaj swoje pierwsze przychody i wydatki,
                                aby zobaczyć statystyki i wykresy.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.footerCta}>
                    <p className={styles.footerText}>
                        Potrzebujesz inspiracji, jak zachować finansową równowagę? Odkryj praktyczne
                        wskazówki i proste sposoby na mądre planowanie wydatków.
                    </p>
                    <button className={styles.footerButton}>
                        poznaj porady od BALANCR
                    </button>
                </section>
            </main>
        </div>
    );
}

export default DashboardPage;
