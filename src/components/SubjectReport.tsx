import { useEffect, useState, useMemo } from 'react';
import { storage } from '../lib/storage';
import { type User, type DailyLog } from '../types';
import { SUBJECTS } from '../data/constants';
import { Calendar, ClipboardList } from 'lucide-react';

interface SubjectReportProps {
    currentUser: User;
    refreshTrigger: string;
}

interface GroupedLogs {
    date: string;
    subjects: {
        subjectId: string;
        subjectName: string;
        count: number;
    }[];
    total: number;
}

export function SubjectReport({ currentUser, refreshTrigger }: SubjectReportProps) {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const userIdToFetch = currentUser.underlyingUserId || currentUser.id;
            const allLogs = await storage.getLogs(userIdToFetch);

            // Sort by timestamp descending
            const sortedLogs = [...allLogs].sort((a, b) => b.timestamp - a.timestamp);
            setLogs(sortedLogs);
            setIsLoading(false);
        };
        fetchLogs();
    }, [currentUser.id, refreshTrigger]);

    const groupedData = useMemo(() => {
        const groups: Record<string, Record<string, number>> = {};

        logs.forEach(log => {
            if (!groups[log.date]) {
                groups[log.date] = {};
            }
            if (!groups[log.date][log.subjectId]) {
                groups[log.date][log.subjectId] = 0;
            }
            groups[log.date][log.subjectId] += log.questionCount;
        });

        const result: GroupedLogs[] = Object.keys(groups)
            .sort((a, b) => b.localeCompare(a)) // Date descending
            .map(date => {
                const subjects = Object.keys(groups[date]).map(subId => ({
                    subjectId: subId,
                    subjectName: SUBJECTS.find(s => s.id === subId)?.name || 'Bilinmeyen Ders',
                    count: groups[date][subId]
                }));

                return {
                    date,
                    subjects,
                    total: subjects.reduce((sum, s) => sum + s.count, 0)
                };
            });

        return result;
    }, [logs]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-avengers-gold"></div>
            </div>
        );
    }

    if (groupedData.length === 0) {
        return (
            <div className="text-center p-8 text-gray-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Henüz kayıtlı görev bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {groupedData.map((group) => (
                <div key={group.date} className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="bg-gray-800/80 px-4 py-2 flex justify-between items-center border-b border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                            <Calendar className="w-4 h-4 text-avengers-gold" />
                            {new Date(group.date).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                weekday: 'short'
                            })}
                        </div>
                        <div className="text-xs font-black bg-avengers-gold/10 text-avengers-gold px-2 py-0.5 rounded-full border border-avengers-gold/20">
                            {group.total} Soru
                        </div>
                    </div>
                    <div className="p-3 space-y-2">
                        {group.subjects.map((sub) => (
                            <div key={sub.subjectId} className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">{sub.subjectName}</span>
                                <span className="font-mono font-bold text-white">{sub.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
