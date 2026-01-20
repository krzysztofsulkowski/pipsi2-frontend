"use client";

import { useState, FormEvent } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

interface ApiResponseWrapper<T> {
    data: T;
}

export default function GlobalContact() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(false);

    const [submitState, setSubmitState] = useState<SubmitState>("idle");
    const [submitText, setSubmitText] = useState<string>("");

    const resetForm = () => {
        setName("");
        setEmail("");
        setMessage("");
        setSubmitState("idle");
        setSubmitText("");
    };

    const closeModal = () => {
        setIsOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitText("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedMessage = message.trim();

        if (!trimmedName || !trimmedEmail || !trimmedMessage) {
            setSubmitState("error");
            setSubmitText("Uzupełnij wszystkie pola.");
            return;
        }

        setSubmitState("loading");

        try {
            const res = await fetch(`${apiUrl}/api/dashboard/submit-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    message: trimmedMessage,
                }),
            });

            if (!res.ok) {
                let backendMsg = "";
                try {
                    const data = (await res.json()) as ApiResponseWrapper<unknown>;
                    backendMsg = typeof data === "object" && data !== null ? JSON.stringify(data) : "";
                } catch {
                    backendMsg = "";
                }

                setSubmitState("error");
                setSubmitText(
                    res.status === 400
                        ? "Nieprawidłowe dane. Sprawdź pola i spróbuj ponownie."
                        : "Nie udało się wysłać wiadomości. Spróbuj ponownie."
                );
                return;
            }

            setSubmitState("success");
            setSubmitText("Wiadomość została wysłana.");
            setName("");
            setEmail("");
            setMessage("");
        } catch {
            setSubmitState("error");
            setSubmitText("Błąd połączenia z serwerem. Spróbuj ponownie.");
        } finally {
            setSubmitState((prev) => (prev === "success" ? "success" : prev));
        }
    };

    const isLoading = submitState === "loading";

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    background: hover ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)",
                    transform: hover ? "scale(1.08)" : "scale(1)",
                    backdropFilter: "blur(4px)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.35)",
                    zIndex: 9999,
                    transition: "transform 0.2s ease, background 0.2s ease",
                    border: "1px solid rgba(255,255,255,0.25)",
                }}
                aria-label="Kontakt"
            >
                ✉
            </button>

            {isOpen && (
                <div
                    onClick={closeModal}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(19,23,34,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10000,
                        padding: "16px",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#2F3445",
                            color: "#FFFFFF",
                            padding: "32px",
                            borderRadius: "18px",
                            width: "100%",
                            maxWidth: "480px",
                            boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
                            border: "1px solid #3E4455",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "18px",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    letterSpacing: "0.5px",
                                    margin: 0,
                                }}
                            >
                                SKONTAKTUJ SIĘ
                            </h2>

                            <button
                                onClick={closeModal}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#E6C46C",
                                    fontSize: "26px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    lineHeight: 1,
                                }}
                                aria-label="Zamknij"
                            >
                                ×
                            </button>
                        </div>

                        {submitText && (
                            <div
                                style={{
                                    marginBottom: "14px",
                                    padding: "10px 12px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    background:
                                        submitState === "success"
                                            ? "rgba(140, 194, 121, 0.16)"
                                            : submitState === "error"
                                                ? "rgba(221, 125, 125, 0.16)"
                                                : "rgba(255,255,255,0.08)",
                                }}
                            >
                                <div style={{ fontSize: "14px" }}>{submitText}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "15px",
                                    marginBottom: "6px",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    style={{
                                        background: "#1F2330",
                                        color: "#FFFFFF",
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        border: "1px solid #3B4050",
                                    }}
                                >
                                    1
                                </span>
                                Imię
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Imię"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3B4050",
                                    background: "#F5F5F5",
                                    color: "#000000",
                                    marginBottom: "14px",
                                    fontSize: "15px",
                                }}
                                disabled={isLoading}
                            />

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "15px",
                                    marginBottom: "6px",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    style={{
                                        background: "#1F2330",
                                        color: "#FFFFFF",
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        border: "1px solid #3B4050",
                                    }}
                                >
                                    2
                                </span>
                                Adres e-mail użytkownika
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e-mail"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3B4050",
                                    background: "#F5F5F5",
                                    color: "#000000",
                                    marginBottom: "14px",
                                    fontSize: "15px",
                                }}
                                disabled={isLoading}
                            />

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "15px",
                                    marginBottom: "6px",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    style={{
                                        background: "#1F2330",
                                        color: "#FFFFFF",
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        border: "1px solid #3B4050",
                                    }}
                                >
                                    3
                                </span>
                                Wiadomość
                            </label>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Wiadomość"
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3B4050",
                                    background: "#F5F5F5",
                                    color: "#000000",
                                    marginBottom: "18px",
                                    fontSize: "15px",
                                    resize: "vertical",
                                }}
                                disabled={isLoading}
                            />

                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "12px 18px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: isLoading ? "rgba(31,35,48,0.65)" : "#1F2330",
                                    color: "#FFFFFF",
                                    fontWeight: 600,
                                    cursor: isLoading ? "default" : "pointer",
                                    fontSize: "15px",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                                    textTransform: "lowercase",
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? "wysyłanie..." : "wyślij wiadomość"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
