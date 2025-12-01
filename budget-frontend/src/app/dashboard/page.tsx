"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import CategoryChart from "./charts/CategoryChart";
import UserBarChart from "./charts/UserBarChart";

const currencySymbol = "zł";
export interface Transaction {
    category?: string;
    Category?: string; 
    amount?: number | string;
    Amount?: number | string;
    userName?: string;
}

function DashboardPage() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [rawData, setRawData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; 
               
                const url = `${apiUrl}/api/Reports/stats?year=${selectedYear}&month=${selectedMonth}`;
                
                console.log("Pobieram dane z:", url); 
    
                const res = await fetch(url);
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setRawData(data);
                } else {
                    setRawData([]); 
                }
            } catch (e) {
                console.error("Błąd pobierania danych", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear, selectedMonth]); 

    const totalExpenses = rawData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 className={styles.greetingTitle}>
                                Cześć, <span className={styles.greetingHighlight}>[imię użytkownika]</span>!
                            </h1>
                            <p className={styles.greetingSubtitle}>
                                Twoja finansowa <span className={styles.greetingHighlight}>równowaga</span> zaczyna się tutaj.
                                <br/>
                                <span style={{ fontSize: '0.9em', opacity: 0.8, fontWeight: 'normal' }}>
                                    Wybrany okres: {selectedMonth === 0 ? "Cały Rok" : selectedMonth} / {selectedYear}
                                </span>
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                style={{ padding: '8px', borderRadius: '6px', background: '#374151', color: 'white', border: '1px solid #4B5563' }}
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>

                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                style={{ padding: '8px', borderRadius: '6px', background: '#374151', color: 'white', border: '1px solid #4B5563' }}
                            >
                                <option value={0}>Cały rok</option>
                                <option value={1}>Styczeń</option>
                                <option value={2}>Luty</option>
                                <option value={3}>Marzec</option>
                                <option value={4}>Kwiecień</option>
                                <option value={5}>Maj</option>
                                <option value={6}>Czerwiec</option>
                                <option value={7}>Lipiec</option>
                                <option value={8}>Sierpień</option>
                                <option value={9}>Wrzesień</option>
                                <option value={10}>Październik</option>
                                <option value={11}>Listopad</option>
                                <option value={12}>Grudzień</option>
                            </select>
                        </div>
                    </div>

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
                                <span className={styles.cardValueNumber}>{totalExpenses.toFixed(2)}</span>
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
                        <div className={styles.statsHeader}><h3>Wydatki wg Kategorii</h3></div>
                        <div className={styles.statsBody}>
                            {loading ? <p style={{color: '#aaa', textAlign: 'center'}}>Ładowanie danych...</p> : <CategoryChart data={rawData} />}
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}><h3>Wydatki wg Członków</h3></div>
                        <div className={styles.statsBody}>
                            {loading ? <p style={{color: '#aaa', textAlign: 'center'}}>Ładowanie danych...</p> : <UserBarChart data={rawData} />}
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