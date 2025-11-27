'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserBarChart({ data }: { data: any[] }) {
    
    const safeData = Array.isArray(data) ? data : [];

    const groupedData = safeData.reduce((acc: any, curr: any) => {
        const user = curr.userName || 'Nieznany'; 
        const amount = Number(curr.amount) || 0;
        
        if (!acc[user]) acc[user] = 0;
        acc[user] += amount;
        return acc;
    }, {});

    const chartData = Object.keys(groupedData).map(key => ({
        name: key,
        kwota: groupedData[key]
    }));

    if (chartData.length === 0) return <div className="text-gray-400 text-center py-10">Brak danych do wykresu</div>;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
                    <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.1)'}}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="kwota" fill="#EAC278" radius={[4, 4, 0, 0]} name="Kwota Wydatków" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}