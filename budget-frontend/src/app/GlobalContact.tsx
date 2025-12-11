"use client";

import { useState, FormEvent } from "react";

export default function GlobalContact() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(false); // ← DODANE

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setHover(true)}   // ← DODANE
                onMouseLeave={() => setHover(false)}  // ← DODANE
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    background: hover
                        ? "rgba(255,255,255,0.28)"
                        : "rgba(255,255,255,0.18)",   // ← ZMIENIONE
                    transform: hover ? "scale(1.08)" : "scale(1)", // ← ZMIENIONE
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
                }}
            >
                ✉
            </button>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(19,23,34,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10000,
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
                                marginBottom: "22px",
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
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#E6C46C",
                                    fontSize: "26px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>

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
                                    marginBottom: "18px",
                                    fontSize: "15px",
                                }}
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
                            marginBottom: "24px",
                            fontSize: "15px",
                            resize: "vertical",
                                }}
                            />

                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "12px 18px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "#1F2330",
                                    color: "#FFFFFF",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                                    textTransform: "lowercase",
                                }}
                            >
                                wyślij wiadomość
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
