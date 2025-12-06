'use client';

import { useState } from 'react';

interface BudgetReportProps {
    reportUrl: string;
}

export default function BudgetReport({ reportUrl }: BudgetReportProps) {
    const [iframeKey, setIframeKey] = useState(0); 
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch('/refresh-data', { method: 'POST' });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Błąd serwera");

            setIframeKey(prev => prev + 1);
            
            alert(`✅ Dane odświeżone (${data.count} wierszy). Wykres zostanie zaktualizowany.`);

        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("Błąd odświeżania:", error);
            alert(`❌ Wystąpił błąd: ${message}`);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full h-full" style={{ minHeight: '350px' }}>
            
            <div className="flex justify-end pr-1">
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    style={{
                        padding: '4px 10px',
                        backgroundColor: isRefreshing ? '#4B5563' : '#374151', 
                        color: 'white',
                        border: '1px solid #6B7280',
                        borderRadius: '4px',
                        cursor: isRefreshing ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s'
                    }}                   
                >
                    {isRefreshing ? '⏳' : '🔄'} {isRefreshing ? 'Czekaj...' : 'Odśwież'}
                </button>
            </div>

            <div style={{ flexGrow: 1, borderRadius: '6px', overflow: 'hidden', background: '#272C3C' }}>
                <iframe
                    key={iframeKey}
                    src={reportUrl}
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
            </div>
        </div>
    );
}