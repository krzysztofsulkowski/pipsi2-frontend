'use client';

import { Suspense, useState, useEffect, FormEvent } from 'react';
import styles from "./Login.module.css";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const externalAuthError = searchParams.get('error');

    useEffect(() => {
        if (externalAuthError === 'auth_failed') {
            setError('Logowanie za pomocą zewnętrznego dostawcy nie powiodło się.');
        }
    }, [externalAuthError]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL. Sprawdź zmienne środowiskowe.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/authentication/login`, {
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
                router.push('/dashboard');
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

    const handleExternalLogin = (provider: 'Facebook') => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL.");
            return;
        }

        const returnUrl = `${window.location.origin}/auth/callback`;
        const externalLoginUrl = `${apiUrl}/api/authentication/external-login?provider=${provider}&returnUrl=${encodeURIComponent(returnUrl)}`;
        window.location.href = externalLoginUrl;
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <section className={styles.leftPanel}>
                    <div className={styles.logoWrapper}>
                        <img src="/logo.svg" alt="Logo aplikacji" className={styles.logoImage} />
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
                                <a href="/forgot-password" className={styles.linkMuted}>
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

                            <button
                                type="button"
                                className={`${styles.socialButton} ${styles.socialFacebook}`}
                                onClick={() => handleExternalLogin('Facebook')}
                            >
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

export default function LoginPage() {
    return (
        <main className={styles.page}>
            <Suspense fallback={<div className={styles.container}>Ładowanie formularza...</div>}>
                <LoginForm />
            </Suspense>
        </main>
    );
}
