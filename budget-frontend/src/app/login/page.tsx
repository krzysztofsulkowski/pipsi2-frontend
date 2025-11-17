'use client';

import styles from "./Login.module.css";
import { useState, FormEvent } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL. Sprawdź zmienne środowiskowe.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Logowanie nie powiodło się');
            }

            if (data.token) {
                localStorage.setItem('authToken', data.token);
                setSuccessMessage('Zalogowano pomyślnie! Token został zapisany.');
            } else {
                throw new Error("Brak tokenu w odpowiedzi serwera.");
            }

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Wystąpił nieznany błąd');
            }
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <section className={styles.leftPanel}>
                    <div className={styles.logoWrapper}>
                        <img src="/logo.svg" className={styles.logoImage}/>
                        <div className={styles.logoSubtitle}>
                            Zachowaj równowagę w domowym budżecie
                        </div>
                    </div>
                </section>

                <section className={styles.rightPanel}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>Logowanie</h1>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="email" className={styles.label}>e-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="password" className={styles.label}>hasło</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.forgotWrapper}>
                                <a href="/reset-password" className={styles.linkMuted}>
                                    Nie pamiętasz hasła?
                                </a>
                            </div>

                            <button type="submit" className={styles.primaryButton}>
                                Zaloguj się
                            </button>

                            <div className={styles.divider}>
                                <span className={styles.dividerLine} />
                                <span className={styles.dividerText}>lub</span>
                                <span className={styles.dividerLine} />
                            </div>

                            <button type="button" className={`${styles.socialButton} ${styles.socialGoogle}`}>
                                Zaloguj się przez Google
                            </button>

                            <button type="button" className={`${styles.socialButton} ${styles.socialFacebook}`}>
                                Zaloguj się przez Facebook
                            </button>
                        </form>

                        {error && <p className={styles.errorMessage}>Blad: {error}</p>}
                        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

                        <p className={styles.bottomText}>
                            Nie posiadasz konta?{' '}
                            <a href="/register" className={styles.linkStrong}>
                                Zarejestruj się
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
