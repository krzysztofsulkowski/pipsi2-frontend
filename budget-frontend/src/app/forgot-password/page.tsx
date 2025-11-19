'use client';

import styles from "./Forgot.module.css";
import logo from './logo.svg';
import { useState, FormEvent } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email) {
            setError("Podaj adres e-mail.");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError("Brak konfiguracji API URL. Sprawdź zmienne środowiskowe.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${apiUrl}/api/authentication/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    data?.detail ||
                    data?.message ||
                    "Nie udało się wysłać wiadomości. Spróbuj ponownie.";
                setError(message);
                return;
            }

            setSuccessMessage(
                "Jeśli konto z tym adresem istnieje, wysłaliśmy wiadomość z linkiem do resetu hasła."
            );
            setEmail("");
        } catch {
            setError("Wystąpił błąd podczas komunikacji z serwerem.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <section className={styles.leftPanel}>
                    <div className={styles.logoWrapper}>
                        <img
                            src={logo.src}
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

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e-mail"
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <p className={styles.helperText}>
                                Na Twój adres e-mail wyślemy link, który umożliwi Ci zmianę hasła.
                            </p>

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
                                {isSubmitting ? "wysyłanie..." : "wyślij link"}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}