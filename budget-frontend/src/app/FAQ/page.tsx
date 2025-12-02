'use client';


import React from 'react';
import styles from './FAQ.module.css';


const faqData = [
  {
    id: 1,
    question: "Czym jest BALANCR?",
    answer: "To internetowy system do zarządzania budżetem, który pozwala śledzić wydatki, planować przychody i kontrolować finanse w prosty, przejrzysty sposób."
  },
  {
    id: 2,
    question: "Czy korzystanie z aplikacji jest darmowe?",
    answer: "Tak, aplikacja została stworzona w ramach projektu studenckiego i jest całkowicie darmowa do użytku."
  },
  {
    id: 3,
    question: "Czy mogę tworzyć więcej niż jeden budżet?",
    answer: "Tak, użytkownik może tworzyć dowolną liczbę budżetów – np. osobny dla siebie, partnera lub całej rodziny, czy też z podziałem na różne waluty."
  },
  {
    id: 4,
    question: "Czy mogę udostępnić budżet innym osobom?",
    answer: "Tak, aplikacja umożliwia zapraszanie innych użytkowników do wspólnego budżetu. Wszyscy uczestnicy mogą dodawać wydatki i przeglądać statystyki."
  },
  {
    id: 5,
    question: "Jakie dane są zapisywane w systemie?",
    answer: "Przechowujemy podstawowe dane potrzebne do działania aplikacji – takie jak e-mail użytkownika, hasło (zaszyfrowane), kwoty wydatków i ich kategorie."
  },
  {
    id: 6,
    question: "Czy moje dane są bezpieczne?",
    answer: "Tak. Wszystkie dane są zabezpieczone zgodnie z aktualnymi standardami bezpieczeństwa i nie są udostępniane osobom trzecim."
  },
  {
    id: 7,
    question: "Czy mogę edytować lub usunąć wpisy o wydatkach?",
    answer: "Tak. W każdej chwili możesz edytować lub usuwać te dane."
  }
];


export default function FAQPage() {
  return (
    <main className={styles.container}>
     
      <div className={styles.header}>
        <h1 className={styles.title}>
          FAQ - Najczęściej zadawane pytania
        </h1>
        <div className={styles.separator} />
      </div>


      <section className={styles.gridWrapper}>
        <div className={styles.cardsGrid}>
          {faqData.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.questionSection}>
                <h2 className={styles.questionText}>
                  {item.question}
                </h2>
              </div>
              <div className={styles.answerSection}>
                <p className={styles.answerText}>
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}