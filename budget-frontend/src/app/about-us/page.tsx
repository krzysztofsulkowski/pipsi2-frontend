import Image from 'next/image';
import styles from './AboutUs.module.css';


export default function AboutUs() {
  return (
    <main className={styles.backgroundSection}>
     
      <div className={styles.contentWrapper}>
       
        <section className={styles.textColumn}>
         
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>O nas</h1>
          </div>


          <div className={styles.divider}></div>


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
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </section>


      </div>
    </main>
  );
}