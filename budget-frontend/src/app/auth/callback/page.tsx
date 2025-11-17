'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            localStorage.setItem('authToken', token);
            router.replace('/dashboard');
        } else {
            console.error("Błąd podczas logowania zewnętrznego:", error);
            router.replace('/login?error=auth_failed');
        }
    }, [router, searchParams]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#272C3C',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <h2>Proszę czekać...</h2>
            <p>Finalizowanie procesu logowania.</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Ładowanie...</div>}>
            <AuthCallback />
        </Suspense>
    );
}