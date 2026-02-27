import { useEffect, useState, useMemo } from 'react';
import { storage } from '../lib/storage';
import { type User, type DailyLog } from '../types';
import { SUBJECTS } from '../data/constants';
import { Calendar, ClipboardList, Edit2, Trash2, X, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface SubjectReportProps {
    currentUser: User;
    refreshTrigger: string;
}

interface GroupedLogs {
    date: string;
    subjects: {
        subjectId: string;
        subjectName: string;
        logs: DailyLog[]; // Store individual logs
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

        const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

        const result: GroupedLogs[] = sortedDates.map(date => {
            const subjectsInDate = Array.from(new Set(logs.filter(l => l.date === date).map(l => l.subjectId)));

            const subjects = subjectsInDate.map(subId => {
                const subjectLogs = logs.filter(l => l.date === date && l.subjectId === subId);
                return {
                    subjectId: subId,
                    subjectName: SUBJECTS.find(s => s.id === subId)?.name || 'Bilinmeyen Ders',
                    logs: subjectLogs,
                    count: subjectLogs.reduce((sum, l) => sum + l.questionCount, 0)
                };
            });

            return {
                date,
                subjects,
                total: subjects.reduce((sum, s) => sum + s.count, 0)
            };
        });

        return result;
    }, [logs]);

    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleEditStart = (log: DailyLog) => {
        setEditingLogId(log.id);
        setEditValue(log.questionCount.toString());
    };

    const handleEditCancel = () => {
        setEditingLogId(null);
        setEditValue('');
    };

    const handleUpdate = async (logId: string) => {
        const newCount = parseInt(editValue);
        if (isNaN(newCount) || newCount <= 0) return;

        setIsProcessing(logId);
        const success = await storage.updateLog(logId, { questionCount: newCount });
        if (success) {
            setLogs(prev => prev.map(l => l.id === logId ? { ...l, questionCount: newCount } : l));
            setEditingLogId(null);
        }
        setIsProcessing(null);
    };

    const handleDelete = async (logId: string) => {
        if (!window.confirm('Bu girişi silmek istediğine emin misin?')) return;

        setIsProcessing(logId);
        const success = await storage.deleteLog(logId);
        if (success) {
            setLogs(prev => prev.filter(l => l.id !== logId));
        }
        setIsProcessing(null);
    };

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
                    <div className="p-3 space-y-3">
                        {group.subjects.map((sub) => (
                            <div key={sub.subjectId} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    <span>{sub.subjectName}</span>
                                    <span>Toplam: {sub.count}</span>
                                </div>
                                <div className="space-y-1.5">
                                    {sub.logs.map((log) => (
                                        <div key={log.id} className="group/item flex justify-between items-center text-sm bg-gray-800/30 p-2 rounded-lg border border-transparent hover:border-gray-600/50 transition-all">
                                            {editingLogId === log.id ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-8 py-0 px-2 w-20 text-sm"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleUpdate(log.id)}
                                                        disabled={isProcessing === log.id}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 border-gray-600 hover:bg-gray-700"
                                                        onClick={handleEditCancel}
                                                        disabled={isProcessing === log.id}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex flex-col">
                                                        <span className="font-mono font-bold text-white text-lg">{log.questionCount}</span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditStart(log)}
                                                            className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors opacity-40 hover:opacity-100"
                                                            title="Düzenle"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(log.id)}
                                                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-40 hover:opacity-100"
                                                            title="Sil"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
