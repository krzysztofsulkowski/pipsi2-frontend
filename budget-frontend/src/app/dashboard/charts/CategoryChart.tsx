'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
    '#6A7192', 
    '#969CBD', 
    '#E3A1A1', 
    '#EAC278', 
    '#C9CBD6'
];

export default function CategoryChart({ data }: { data: any[] }) {
    
    const safeData = Array.isArray(data) ? data : [];

    const groupedData = safeData.reduce((acc: any, curr: any) => {
        const cat = curr.category || curr.Category || 'Inne';
        const amount = Number(curr.amount || curr.Amount) || 0;
        
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += amount;
        return acc;
    }, {});

    const chartData = Object.keys(groupedData)
        .map(key => ({
            name: key,
            value: groupedData[key]
        }))
        .sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Brak danych</div>;
    }

    return (
        <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"       
                        cy="90%" 
                        
                        startAngle={180}
                        endAngle={0}
                        innerRadius="80%"  
                        outerRadius="170%"
                        
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#272C3C', 
                            borderColor: '#4B5563', 
                            color: '#F3F4F6',
                            borderRadius: '8px'
                        }}
                        itemStyle={{ color: '#E5E7EB' }}
                        formatter={(value: any) => [`${value.toLocaleString()} zł`, 'Kwota']}
                    />
                    
                    <Legend 
                        verticalAlign="bottom" 
                        wrapperStyle={{ fontSize: '12px', color: '#9CA3AF', bottom: '-10px' }} 
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}