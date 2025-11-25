'use client';

import styles from "./Register.module.css";
import logo from './logo.svg';
import { useState, FormEvent } from 'react';
import { useRouter } from "next/navigation";

function validatePasswordPolicy(password: string): string | null {
    if (password.length < 8) {
        return "Hasło musi mieć co najmniej 8 znaków.";
    }
    if (!/[a-z]/.test(password)) {
        return "Hasło musi zawierać co najmniej jedną małą literę.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Hasło musi zawierać co najmniej jedną wielką literę.";
    }
    if (!/\d/.test(password)) {
        return "Hasło musi zawierać co najmniej jedną cyfrę.";
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        return "Hasło musi zawierać co najmniej jeden znak specjalny.";
    }
    return null;
}

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [emailError, setEmailError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

    const router = useRouter();

    const validateForm = () => {
        let hasError = false;
        setEmailError(null);
        setUsernameError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);

        if (!email) {
            setEmailError("To pole jest wymagane.");
            hasError = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError("Podaj prawidłowy adres e-mail.");
                hasError = true;
            }
        }

        if (!username) {
            setUsernameError("To pole jest wymagane.");
            hasError = true;
        }

        if (!password) {
            setPasswordError("To pole jest wymagane.");
            hasError = true;
        } else {
            const passwordPolicyError = validatePasswordPolicy(password);
            if (passwordPolicyError) {
                setPasswordError(passwordPolicyError);
                hasError = true;
            }
        }

        if (!confirmPassword) {
            setConfirmPasswordError("To pole jest wymagane.");
            hasError = true;
        } else if (password && confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError("Hasła nie są identyczne.");
            hasError = true;
        }

        return !hasError;
    };


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL. Sprawdź zmienne środowiskowe.");
            return;
        }

        const isValid = validateForm();
        if (!isValid) return;

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
                    mapBackendErrors(errorData);
                } else {
                    await response.text();
                    setError("Wystąpił problem z rejestracją. Spróbuj ponownie za chwilę.");
                }
                return;
            }

            if (contentType.includes('application/json')) {
                await response.json();
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

    const handleExternalLogin = (provider: 'Facebook' | 'Google') => {
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
                                {emailError && <p className={styles.fieldError}>{emailError}</p>}
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
                                {usernameError && <p className={styles.fieldError}>{usernameError}</p>}
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
                                {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
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
                                {confirmPasswordError && <p className={styles.fieldError}>{confirmPasswordError}</p>}
                            </div>

                            <button type="submit" className={styles.primaryButton}>
                                Zarejestruj się
                            </button>

                            <div className={styles.divider}>
                                <span className={styles.dividerLine} />
                                <span className={styles.dividerText}>lub</span>
                                <span className={styles.dividerLine} />
                            </div>

                            <button
                                type="button"
                                className={`${styles.socialButton} ${styles.socialGoogle}`}
                                onClick={() => handleExternalLogin('Google')}
                            >
                                Zarejestruj się przez Google
                            </button>

                            <button
                                type="button"
                                className={`${styles.socialButton} ${styles.socialFacebook}`}
                                onClick={() => handleExternalLogin('Facebook')}
                            >
                                Zarejestruj się przez Facebook
                            </button>
                        </form>

                        {error && <p className={styles.errorMessage}>Błąd: {error}</p>}
                        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

                        <p className={styles.bottomText}>
                            Masz już konto{' '}
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
