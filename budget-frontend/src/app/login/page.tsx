'use client';

import { useState, FormEvent } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Logowanie nie powiodlo sie');
            }

            localStorage.setItem('authToken', data.token);
            setSuccessMessage('Zalogowano pomyslnie! Token zostal zapisany.');

        } catch (err: any) {
            setError(err.message);
        }
    };

    const apiUrlForDisplay = process.env.NEXT_PUBLIC_API_URL;

    return (
        <main style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          
            <div style={{ padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid red', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>DEBUG: Adres API:</p>
                <p style={{ margin: 0, color: 'blue', wordBreak: 'break-all' }}>
                    {apiUrlForDisplay ? apiUrlForDisplay : "Zmienna jest UNDEFINED!"}
                </p>
            </div>
            <h1>Logowanie</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Nazwa uzytkownika:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Haslo:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 15px', width: '100%', cursor: 'pointer' }}>Zaloguj</button>
            </form>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>Blad: {error}</p>}
            {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}
        </main>
    );
}