import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { type User } from '../../types';
import { storage } from '../../lib/storage';

interface DailyStats {
    name: string;
    soru: number;
}

interface WeeklyChartProps {
    currentUser: User;
    refreshTrigger: string; // Used to force refresh when new data is added
}

export function WeeklyChart({ currentUser, refreshTrigger }: WeeklyChartProps) {
    const [data, setData] = useState<DailyStats[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const today = new Date();
            const last7Days: DailyStats[] = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                // Firebase'den o günün verilerini çek
                let dayTotal = 0;
                try {
                    const logs = await storage.getLogs(currentUser.id, dateStr);
                    dayTotal = logs.reduce((acc, log) => acc + log.questionCount, 0);
                } catch (error) {
                    console.error("Error fetching logs for chart:", error);
                }

                last7Days.push({
                    name: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                    soru: dayTotal,
                });
            }
            setData(last7Days);
        };

        loadData();
    }, [currentUser.id, refreshTrigger]);

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#9CA3AF' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#9CA3AF' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                        }}
                        cursor={{ fill: '#374151', opacity: 0.4 }}
                    />
                    <Bar
                        dataKey="soru"
                        fill={
                            currentUser.id === 'hero-thor' ? '#00BFFF' : // Lightning Blue
                                currentUser.id === 'hero-widow' ? '#FF0000' : // Widow Red
                                    currentUser.role === 'ortaokul' ? '#B82E3E' : '#002D5C'
                        }
                        radius={[4, 4, 0, 0]}
                        name="Çözülen Soru"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
