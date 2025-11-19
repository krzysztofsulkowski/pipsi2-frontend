'use client';

import styles from "./Register.module.css";
import logo from './logo.svg';
import { useState, FormEvent } from 'react';
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL. Sprawdź zmienne środowiskowe.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Hasła nie są takie same.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/authentication/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    username,
                    password
                }),
            });

            const contentType = response.headers.get('content-type') ?? '';

            if (!response.ok) {
                if (contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Rejestracja nie powiodła się');
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Rejestracja nie powiodła się');
                }
            }

            let data: any = null;
            if (contentType.includes('application/json')) {
                data = await response.json();
            }

            setSuccessMessage('Konto zostało utworzone. Możesz się teraz zalogować.');
            setTimeout(() => {
                router.push('/login');
            }, 1500);

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
                        <img src={logo.src} alt="Logo aplikacji" className={styles.logoImage} />

                        <div className={styles.logoSubtitle}>
                            Zachowaj równowagę w domowym budżecie
                        </div>
                    </div>
                </section>

                <section className={styles.rightPanel}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>Rejestracja</h1>

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
                                <label htmlFor="username" className={styles.label}>nazwa użytkownika</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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

                            <div className={styles.field}>
                                <label htmlFor="confirmPassword" className={styles.label}>powtórz hasło</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <button type="submit" className={styles.primaryButton}>
                                Zarejestruj się
                            </button>
                        </form>

                        {error && <p className={styles.errorMessage}>Błąd: {error}</p>}
                        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

                        <p className={styles.bottomText}>
                            Masz już konto?{' '}
                            <a href="/login" className={styles.linkStrong}>
                                Zaloguj się
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
