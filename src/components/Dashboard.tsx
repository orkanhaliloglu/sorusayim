import { useState, useMemo, useEffect } from 'react';
import { type User } from '../types';
import { SUBJECTS } from '../data/constants';
import { storage } from '../lib/storage';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Shield, Target, Award, BarChart3 } from 'lucide-react';
import { WeeklyChart } from './charts/WeeklyChart';

interface DashboardProps {
    currentUser: User;
    onLogout: () => void;
}

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questionCount, setQuestionCount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [dailyTotal, setDailyTotal] = useState(0);

    // Kullanıcının rolüne uygun dersleri filtrele
    const availableSubjects = useMemo(() => {
        return SUBJECTS.filter(s => s.role === currentUser.role || s.role === 'common');
    }, [currentUser.role]);

    // Günlük toplam soru sayısını Firebase'den çek
    useEffect(() => {
        const fetchDailyTotal = async () => {
            // Önce bağlantıyı test et
            const connection = await storage.testConnection();
            if (!connection.success) {
                setSuccessMessage(`⚠️ Bağlantı Hatası: ${connection.error}`);
                // 10 saniye ekranda kalsın
                setTimeout(() => setSuccessMessage(''), 10000);
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const logs = await storage.getLogs(currentUser.id, today);
            const total = logs.reduce((acc, log) => acc + log.questionCount, 0);
            setDailyTotal(total);
        };
        fetchDailyTotal();
    }, [currentUser.id, successMessage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject || !questionCount) return;

        setIsSubmitting(true);

        const result = await storage.addLog({
            userId: currentUser.id,
            subjectId: selectedSubject,
            questionCount: parseInt(questionCount),
            date: new Date().toISOString().split('T')[0],
        });

        if (result) {
            setSuccessMessage(`Harika! ${currentUser.name} gücüne güç kattı!`);
            setQuestionCount('');
            setSelectedSubject('');
            // successMessage state güncellemesi useEffect'i tetikleyip veriyi güncelleyecek
        }

        setIsSubmitting(false);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className={`min-h-screen p-6 flex flex-col items-center transition-colors duration-500
            ${currentUser.id === 'hero-thor' ? 'bg-slate-900' :
                currentUser.id === 'hero-widow' ? 'bg-zinc-950' :
                    'bg-gray-900'}`
        }>

            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className={`relative p-1 rounded-full bg-${currentUser.avatarColor} shadow-lg shadow-${currentUser.avatarColor}/20 overflow-hidden w-20 h-20 flex items-center justify-center border-2 border-${currentUser.avatarColor}/50`}>
                            {currentUser.avatarImage ? (
                                <img src={currentUser.avatarImage} alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <Shield className="w-10 h-10 text-white" />
                            )}
                        </div>
                        {/* Süper Baba Etiketi (Sağ üst) - Sadece Admin için */}
                        {currentUser.role === 'admin' && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white/20 animate-pulse transform rotate-12">
                                SÜPER BABA
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-display text-white">
                            Merhaba, {currentUser.name}!
                        </h1>
                        <p className="text-gray-400">Bugün dünyayı kurtarmaya hazır mısın?</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout}>
                    Çıkış Yap
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">

                {/* Soru Giriş Formu */}
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Target className="w-32 h-32" />
                    </div>

                    <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
                        <span className="text-avengers-gold">⚡</span> Görev Raporu
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <Select
                            label="Hangi Ders?"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            options={availableSubjects.map(s => ({ value: s.id, label: s.name }))}
                        />

                        <Input
                            label="Kaç Soru Çözdün?"
                            type="number"
                            min="1"
                            max="1000"
                            placeholder="Örn: 50"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!selectedSubject || !questionCount || isSubmitting}
                        >
                            {isSubmitting ? 'Kaydediliyor...' : 'Görevi Tamamla!'}
                        </Button>

                        {successMessage && (
                            <div className="p-4 bg-green-500/20 border border-green-500 rounded-xl text-green-400 text-center font-bold animate-bounce">
                                {successMessage}
                            </div>
                        )}
                    </form>
                </div>

                {/* Günlük İstatistik */}
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 left-0 p-4 opacity-5">
                        <Award className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-display text-white mb-2">Günlük İlerleme</h2>
                        <div className={`w-48 h-48 rounded-full border-8 border-gray-700 flex items-center justify-center mb-4 relative ${dailyTotal > 0 ? 'border-avengers-gold' : ''} transition-colors duration-500`}>
                            <span className="text-5xl font-bold text-white">{dailyTotal}</span>
                            <span className="text-sm text-gray-400 absolute bottom-10">Soru</span>
                        </div>
                        <p className="text-gray-400">
                            {dailyTotal === 0 ? 'Henüz yolun başındasın!' : 'Harika gidiyorsun!'}
                        </p>
                    </div>
                </div>

                {/* Haftalık Grafik */}
                <div className="md:col-span-2 lg:col-span-1 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <BarChart3 className="w-32 h-32" />
                    </div>

                    <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2 relative z-10">
                        <span className="text-avengers-blue">📊</span> Haftalık Performans
                    </h2>

                    <div className="flex-1 min-h-[200px] relative z-10">
                        <WeeklyChart currentUser={currentUser} refreshTrigger={successMessage} />
                    </div>
                </div>

            </div>
        </div>
    );
}
