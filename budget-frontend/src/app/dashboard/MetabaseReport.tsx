'use client';

import { useEffect, useState } from 'react';

interface MetabaseReportProps {
    dashboardId: number;
}

export default function MetabaseReport({ dashboardId }: MetabaseReportProps) {
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchUrl = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/Metabase/${dashboardId}`, {
                });

                if (!res.ok) throw new Error("Błąd pobierania");

                 let url = await res.text();
               
                if (url.startsWith('"') && url.endsWith('"')) {
                    url = url.slice(1, -1);
                }

                if (!url.includes('http')) {
                    try {
                        const parsed = JSON.parse(url);
                        if (parsed.data) url = parsed.data;
                        else if (parsed.result) url = parsed.result;
                    } catch {
                        console.error("Nie udało się sparsować odpowiedzi:", url);
                    }
                }
                setIframeUrl(url);
            }catch (err: unknown) { 
                console.error("Błąd fetch:", err);
                 if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Wystąpił nieznany błąd');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUrl();
    }, [dashboardId, apiUrl]);

    if (loading) return <div className="p-4 text-gray-500">Ładowanie wykresów...</div>;
    if (error) return <div className="p-4 text-red-500">Błąd: {error}</div>;
    if (!iframeUrl) return null;

    return (
        <div className="w-full">
            <iframe
                src={iframeUrl}
                frameBorder="0"
                width="100%"
                height="800"
                style={{ background: 'transparent', border: 'none' }} 
            />
        </div>
    );
}