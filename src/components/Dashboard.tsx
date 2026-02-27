import { useState, useMemo, useEffect } from 'react';
import { type User } from '../types';
import { SUBJECTS } from '../data/constants';
import { storage } from '../lib/storage';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Shield, Target, Award, BarChart3, ClipboardList } from 'lucide-react';
import { WeeklyChart } from './charts/WeeklyChart';
import { SubjectReport } from './SubjectReport';
import { Countdown } from './Countdown';

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
    const [dailyAverage, setDailyAverage] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);


    // Kullanıcının rolüne uygun dersleri filtrele
    const availableSubjects = useMemo(() => {
        return SUBJECTS.filter(s => s.role === currentUser.role || s.role === 'common');
    }, [currentUser.role]);

    // Günlük ve Toplam soru sayısını Firebase'den çek
    useEffect(() => {
        const fetchStats = async () => {
            // Önce bağlantıyı test et
            const connection = await storage.testConnection();
            if (!connection.success) {
                setSuccessMessage(`⚠️ Bağlantı Hatası: ${connection.error}`);
                setTimeout(() => setSuccessMessage(''), 10000);
                return;
            }

            // Tüm logları çek (Tarih filtresi olmadan)
            const allLogs = await storage.getLogs(currentUser.id);

            const today = new Date().toISOString().split('T')[0];

            // Günlük Toplam
            const todayTotal = allLogs
                .filter(log => log.date === today)
                .reduce((acc, log) => acc + log.questionCount, 0);

            // Genel Toplam
            const grandTotal = allLogs.reduce((acc, log) => acc + log.questionCount, 0);

            // Günlük Ortalama Hesabı
            const uniqueDates = new Set(allLogs.map(log => log.date));
            const average = uniqueDates.size > 0 ? Math.round(grandTotal / uniqueDates.size) : 0;

            setDailyTotal(todayTotal);
            setDailyAverage(average);
            setTotalQuestions(grandTotal);
        };
        fetchStats();
    }, [currentUser.id, successMessage]);

    // ... (handleSubmit logic remains same)

    // ... (rendering code)



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
        <div className={`min-h-screen p-6 flex flex-col items-center transition-all duration-500 relative`}>

            {/* Background Image/Gradient Layer */}
            <div className={`absolute inset-0 z-0 transition-all duration-500
                ${currentUser.id === 'kivanc' ? 'bg-fenerbahce-blue' :
                    currentUser.id === 'ruya' ? 'bg-avengers-blue' :
                        'bg-slate-950'}`
            }>
                {/* Her kullanıcı için özel arka plan katmanı */}
                <div
                    className="absolute inset-0 opacity-80 bg-[center_top] bg-cover transition-opacity duration-700"
                    style={{
                        backgroundImage: currentUser.id === 'kivanc' || currentUser.id === 'orkan'
                            ? "url('/assets/kivanc_bg.jpg')"
                            : currentUser.id === 'ruya'
                                ? "url('/assets/ruya_bg.jpg')"
                                : "url('/assets/hero_bg.jpg')"
                    }}
                />

                {/* Dinamik Gradyan Katmanı */}
                <div className={`absolute inset-0 bg-gradient-to-b mix-blend-multiply transition-all duration-500
                    ${currentUser.id === 'kivanc' || currentUser.id === 'orkan'
                        ? 'from-fenerbahce-blue/70 via-fenerbahce-blue/50 to-fenerbahce-yellow/20'
                        : currentUser.id === 'ruya'
                            ? 'from-avengers-blue/70 via-avengers-blue/50 to-avengers-red/20'
                            : 'from-slate-900/70 via-slate-900/50 to-avengers-gold/20'
                    }`}
                />

                {/* Üst Şerit Efekti */}
                <div className={`absolute top-0 w-full h-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] bg-gradient-to-r
                    ${currentUser.id === 'kivanc'
                        ? 'from-fenerbahce-blue via-fenerbahce-yellow to-fenerbahce-blue shadow-fenerbahce-yellow/30'
                        : currentUser.id === 'ruya'
                            ? 'from-avengers-blue via-avengers-red to-avengers-blue shadow-avengers-red/30'
                            : 'from-slate-800 via-avengers-gold to-slate-800 shadow-avengers-gold/30'
                    }`}
                />
            </div>

            {/* Süper Baba Avatar (Transparan - Üst Orta) */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-70 hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500/50 overflow-hidden shadow-2xl">
                    <img src="/assets/hero_super_dad.png" alt="Süper Baba" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
            </div>

            {/* Header */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group flex flex-col items-center">
                        <div className={`relative p-1 rounded-full shadow-lg overflow-hidden w-24 h-24 flex items-center justify-center border-4 
                            ${currentUser.avatarColor === 'fenerbahce-yellow' ? 'bg-fenerbahce-yellow shadow-fenerbahce-yellow/40 border-fenerbahce-blue/50' :
                                currentUser.avatarColor === 'avengers-blue' ? 'bg-avengers-blue shadow-avengers-blue/40 border-avengers-red/50' :
                                    'bg-slate-800 shadow-slate-800/40 border-avengers-gold/50'}`}>
                            {currentUser.avatarImage ? (
                                <img src={currentUser.avatarImage} alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <Shield className="w-12 h-12 text-white" />
                            )}
                        </div>

                        {/* LGS/YKS Countdown Buraya Taşındı (Resmin Altı) */}
                        {currentUser.id === 'kivanc' && (
                            <div className="mt-4 transform hover:scale-105 transition-transform">
                                <Countdown targetDate={new Date('2027-06-06')} title="LGS 2027" variant="small" panic={true} />
                            </div>
                        )}
                        {currentUser.id === 'ruya' && (
                            <div className="mt-4 transform hover:scale-105 transition-transform">
                                <Countdown targetDate={new Date('2027-06-19')} title="YKS 2027" variant="small" panic={true} />
                            </div>
                        )}

                        {/* Süper Baba Etiketi (Sağ üst) - Sadece Admin için */}
                        {currentUser.role === 'admin' && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white/20 animate-pulse transform rotate-12">
                                SÜPER BABA
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-display text-white drop-shadow-lg">
                            Merhaba, <span className={currentUser.id === 'kivanc' ? 'text-fenerbahce-yellow' : ''}>{currentUser.name}!</span>
                        </h1>
                        <p className="text-gray-300 text-lg">Bugün dünyayı kurtarmaya hazır mısın?</p>
                    </div>
                </div>

                <Button variant="outline" size="sm" onClick={onLogout} className="whitespace-nowrap">
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
                        <div className={`w-40 h-40 rounded-full border-8 border-gray-700 flex items-center justify-center mb-2 relative ${dailyTotal > 0 ? 'border-avengers-gold' : ''} transition-colors duration-500`}>
                            <span className="text-4xl font-bold text-white">{dailyTotal}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                            <div className="p-3 bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-xl border border-white/10 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-1">Toplam</div>
                                <div className="text-2xl font-black text-white">
                                    {totalQuestions}
                                </div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl border border-white/10 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                                <div className="text-[10px] text-purple-200 font-bold uppercase tracking-widest mb-1">Ortalama</div>
                                <div className="text-2xl font-black text-white">
                                    {dailyAverage}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Haftalık Grafik */}
                <div className="md:col-span-1 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col">
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

                {/* Günlük Rapor */}
                <div className="md:col-span-1 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ClipboardList className="w-32 h-32" />
                    </div>

                    <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2 relative z-10">
                        <span className="text-green-500">📋</span> Detaylı Rapor
                    </h2>

                    <div className="flex-1 relative z-10">
                        <SubjectReport currentUser={currentUser} refreshTrigger={successMessage} />
                    </div>
                </div>

            </div>
        </div>
    );
}
