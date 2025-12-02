import React from 'react';
import styles from './TransactionHistory.module.css';


const transactions = [
  {
    id: 1,
    date: '01.09.2025',
    type: 'Przelew',
    category: 'Usługi',
    description: 'Abonament Internet',
    method: 'BLIK',
    amount: '-89,00',
    user: 'Jan Kowalski',
  },
  {
    id: 2,
    date: '20.09.2025',
    type: 'Przychód',
    category: 'Wynagrodzenie',
    description: 'Wypłata Wrzesień',
    method: 'Przelew bankowy',
    amount: '12 344,50',
    user: 'Firma XYZ',
  },
  {
    id: 3,
    date: '28.09.2025',
    type: 'Karta',
    category: 'Spożywcze',
    description: 'Zakupy spożywcze',
    method: 'Visa',
    amount: '-142,20',
    user: 'Jan Kowalski',
  },
];


export default function TransactionHistoryPage() {
  return (
    <main className={styles.pageContainer}>
     
      <div className={styles.headerTitle}>
        Historia transakcji
      </div>


      <div className={styles.divider} />


      <div className={styles.breadcrumbsContainer}>
        <span className={styles.crumbLink}>Dashboard</span>
        <span style={{ color: '#EAC278', margin: '0 4px' }}>&gt;</span>
        <span className={styles.crumbActive}>Historia transakcji</span>
      </div>


      <section className={styles.statsRow}>
       
        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Bilans</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>6 023, 17</span>
            <span className={styles.cardCurrency}>ZŁ</span>
          </div>
          <div className={styles.cardDescription}>
            (różnica między przychodami a wydatkami z danego miesiąca)
          </div>
        </div>


        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Oszczędności</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>10 901, 21</span>
            <span className={styles.cardCurrency}>ZŁ</span>
          </div>
          <div className={styles.cardDescription}>
            (tyle udało Ci się zaoszczędzić z poprzednich miesięcy)
          </div>
        </div>


        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Przychody</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>12 344, 50</span>
            <span className={styles.cardCurrency}>ZŁ</span>
          </div>
          <div className={styles.cardDescription} style={{ visibility: 'hidden', height: '14px' }}>.</div>
        </div>


        <div className={styles.statCard}>
          <div className={styles.cardTitle}>Wydatki</div>
          <div className={styles.cardValueWrapper}>
            <span className={styles.cardValue}>6 321, 33</span>
            <span className={styles.cardCurrency}>ZŁ</span>
          </div>
          <div className={styles.cardDescription} style={{ visibility: 'hidden', height: '14px' }}>.</div>
        </div>
      </section>


      <section className={styles.dateNavRow}>
        <button className={`${styles.navButton} ${styles.navBox}`}>
          <svg
            width="14" height="24" viewBox="0 0 14 24" fill="none"
            className={styles.iconSvg}
            style={{ transform: 'rotate(180deg)' }}
          >
            <path d="M1.11328 22.1656L11.1619 11.1558L1.11328 1.06353" stroke="white" strokeWidth="3.01459"/>
          </svg>
        </button>


        <div className={`${styles.navBox} ${styles.dateLabel}`}>
          WRZESIEŃ 2025
        </div>


        <button className={`${styles.navButton} ${styles.navBox}`}>
          <svg
            width="14" height="24" viewBox="0 0 14 24" fill="none"
            className={styles.iconSvg}
          >
            <path d="M1.11328 22.1656L11.1619 11.1558L1.11328 1.06353" stroke="white" strokeWidth="3.01459"/>
          </svg>
        </button>
      </section>


      <section className={styles.tableWrapper}>
        <table className={styles.transactionTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Rodzaj transakcji</th>
              <th>Kategoria</th>
              <th>Opis</th>
              <th>Metoda płatności</th>
              <th>Kwota</th>
              <th>Użytkownik</th>
              <th>Opcje</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>{t.description}</td>
                <td>{t.method}</td>
                <td style={{
                  fontWeight: '700',
                  color: t.amount.includes('-') ? '#FF6B6B' : '#EAC278'
                }}>
                  {t.amount} ZŁ
                </td>
                <td>{t.user}</td>
                <td>
                  <button className={styles.optionButton}>Szczegóły</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>


    </main>
  );
}