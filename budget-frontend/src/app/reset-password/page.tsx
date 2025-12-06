"use client";

import styles from "./Reset.module.css";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function validatePasswordPolicy(password: string): string | null {
    if (password.length < 8) {
        return "Hasło powinno mieć co najmniej 8 znaków.";
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

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!token || !emailFromUrl) {
            setError("Brak wymaganych danych resetu hasła. Użyj ponownie linku z e-maila.");
            return;
        }

        if (!password || !confirmPassword) {
            setError("Wprowadź nowe hasło i jego potwierdzenie.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Hasła nie są takie same.");
            return;
        }

        const passwordPolicyError = validatePasswordPolicy(password);
        if (passwordPolicyError) {
            setError(passwordPolicyError);
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL. Sprawdź zmienne środowiskowe.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${apiUrl}/api/authentication/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailFromUrl,
                    token,
                    newPassword: password
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    data?.detail ||
                    data?.message ||
                    "Nie udało się zresetować hasła. Spróbuj ponownie.";
                setError(message);
                return;
            }

            setSuccessMessage("Hasło zostało zmienione. Możesz zalogować się nowym hasłem.");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch {
            setError("Wystąpił błąd podczas komunikacji z serwerem.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token || !emailFromUrl) {
        return (
            <main className={styles.page}>
                <div className={styles.container}>
                    <section className={styles.leftPanel}>
                        <div className={styles.logoWrapper}>
                            <img
                                src="/logo.svg"
                                alt="Logo aplikacji"
                                className={styles.logoImage}
                            />
                            <div className={styles.logoSubtitle}>
                                Zachowaj równowagę w domowym budżecie
                            </div>
                        </div>
                    </section>

                    <section className={styles.rightPanel}>
                        <div className={styles.card}>
                            <h1 className={styles.title}>Reset hasła</h1>
                            <p className={styles.errorMessage}>
                                Link do resetu hasła jest nieprawidłowy lub wygasł. Poproś o nowy link.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <section className={styles.leftPanel}>
                    <div className={styles.logoWrapper}>
                        <img
                            src="/logo.svg"
                            alt="Logo aplikacji"
                            className={styles.logoImage}
                        />
                        <div className={styles.logoSubtitle}>
                            Zachowaj równowagę w domowym budżecie
                        </div>
                    </div>
                </section>

                <section className={styles.rightPanel}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>Ustaw nowe hasło</h1>

                        <p className={styles.helperText}>
                            Resetujesz hasło dla adresu: <strong>{emailFromUrl}</strong>
                        </p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nowe hasło"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Powtórz nowe hasło"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            {error && (
                                <p className={styles.errorMessage}>
                                    {error}
                                </p>
                            )}

                            {successMessage && (
                                <p className={styles.successMessage}>
                                    {successMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "zapisywanie..." : "zapisz nowe hasło"}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Wczytywanie...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
