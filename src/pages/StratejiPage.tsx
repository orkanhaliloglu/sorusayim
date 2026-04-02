import { useState, useMemo } from 'react';
import { type User } from '../types';
import { Button } from '../components/ui/Button';
import { 
    ArrowLeft, 
    Calendar, 
    CheckCircle2, 
    TrendingUp, 
    Zap,
    Brain
} from 'lucide-react';
import karnelerData from '../data/karneler.json';

interface StratejiPageProps {
    currentUser: User;
    onBack: () => void;
}

interface DayPlan {
    day: string;
    focus: string;
    tasks: string[];
    priority: 'high' | 'medium' | 'low';
}

// Konu - Ders Eşleştirme Sözlüğü (LGS Odaklı)
const TOPIC_TO_SUBJECT: Record<string, string> = {
    // Fen Bilimleri
    'hücre': 'Fen Bilimleri', 'mayoz': 'Fen Bilimleri', 'mitoz': 'Fen Bilimleri', 'enerji': 'Fen Bilimleri',
    'kütle': 'Fen Bilimleri', 'ağırlık': 'Fen Bilimleri', 'saf maddeler': 'Fen Bilimleri', 'karışımlar': 'Fen Bilimleri',
    'yıldızlar': 'Fen Bilimleri', 'galaksiler': 'Fen Bilimleri', 'uzay': 'Fen Bilimleri', 'iş ve enerji': 'Fen Bilimleri',
    'aynalar': 'Fen Bilimleri', 'ışık': 'Fen Bilimleri',
    // Matematik
    'rasyonel': 'Matematik', 'tam sayılar': 'Matematik', 'cebirsel': 'Matematik', 'eşitlik': 'Matematik',
    'denklem': 'Matematik', 'oran': 'Matematik', 'orantı': 'Matematik', 'yüzdeler': 'Matematik',
    'veri analizi': 'Matematik', 'çarpanlar': 'Matematik', 'üslü': 'Matematik', 'kareköklü': 'Matematik',
    // Türkçe
    'fiiller': 'Türkçe', 'ek-fiil': 'Türkçe', 'zarflar': 'Türkçe', 'cümlenin ögeleri': 'Türkçe',
    'noktalama': 'Türkçe', 'yazım kuralları': 'Türkçe', 'anlatım bozukluğu': 'Türkçe', 'paragraf': 'Türkçe',
    // Sosyal / İnkılap
    'göç': 'Türkçe', 'nüfus': 'Türkçe', 'iletişim': 'Türkçe', 'ekonomi': 'Türkçe', 'demokrasi': 'Türkçe',
    'büyük bir yolculuk': 'Sosyal Bilgiler', 'ülkemizin nüfus özellikleri': 'Sosyal Bilgiler',
    // Din
    'melek': 'Din Kültürü', 'ahiret': 'Din Kültürü', 'hz. ismail': 'Din Kültürü', 'hz. salih': 'Din Kültürü',
    'kader': 'Din Kültürü', 'zekat': 'Din Kültürü', 'hac': 'Din Kültürü'
};

function inferSubject(topic: string): string {
    const t = topic.toLowerCase();
    for (const [key, subject] of Object.entries(TOPIC_TO_SUBJECT)) {
        if (t.includes(key)) return subject;
    }
    return 'Diğer';
}

export function StratejiPage({ currentUser: _, onBack }: StratejiPageProps) {
    const [planType, setPlanType] = useState<'weakness' | 'balanced'>('weakness');

    // Analiz Verileri
    const analysis = useMemo(() => {
        if (!karnelerData || karnelerData.length === 0) return null;

        const subjectStats: Record<string, { totalNet: number, count: number, lastNet: number, soruSayisi: number }> = {};
        const lastExam = karnelerData[karnelerData.length - 1];
        const topicWeaknessesBySubject: Record<string, string[]> = {
            'Matematik': [],
            'Fen Bilimleri': [],
            'Türkçe': [],
            'Sosyal Bilgiler': [],
            'İngilizce': [],
            'Din Kültürü': []
        };

        karnelerData.forEach((karne, idx) => {
            const isLast = idx === karnelerData.length - 1;
            
            karne.dersler.forEach(ders => {
                if (!subjectStats[ders.ders]) {
                    subjectStats[ders.ders] = { totalNet: 0, count: 0, lastNet: 0, soruSayisi: ders.soruSayisi };
                }
                subjectStats[ders.ders].totalNet += ders.net;
                subjectStats[ders.ders].count += 1;
                if (isLast) subjectStats[ders.ders].lastNet = ders.net;
            });

            if (isLast) {
                karne.konular.forEach(konu => {
                    let realPercent = konu.basariYuzdesi;
                    if (konu.basariYuzdesi <= konu.soruSayisi && konu.soruSayisi > 5) {
                        realPercent = (konu.basariYuzdesi / konu.soruSayisi) * 100;
                    }

                    if (realPercent < 65) {
                        const subject = inferSubject(konu.konu);
                        if (topicWeaknessesBySubject[subject]) {
                            topicWeaknessesBySubject[subject].push(konu.konu);
                        } else if (subject !== 'Diğer') {
                            topicWeaknessesBySubject[subject] = [konu.konu];
                        }
                    }
                });
            }
        });

        const averages = Object.entries(subjectStats).map(([name, stats]) => {
            const avgNet = stats.totalNet / stats.count;
            const successRate = (stats.lastNet / stats.soruSayisi) * 100;
            return {
                name,
                avg: avgNet,
                last: stats.lastNet,
                soruSayisi: stats.soruSayisi,
                successRate,
                trend: stats.lastNet >= avgNet ? 'up' : 'down'
            };
        });

        const sortedWeakSubjects = [...averages].sort((a, b) => a.successRate - b.successRate);
        const criticalSubjects = sortedWeakSubjects.filter(s => s.successRate < 70).slice(0, 3);
        
        const sonSinavKisaAd = lastExam.sinavAdi.replace(/^.*?S[ıiIİ]nav Karnesi.*?-\s*/i, '').trim() || lastExam.sinavAdi;
        
        let aiAdvice = `Kıvanç, son girdiğin "${sonSinavKisaAd}" sınavına göre zayıf halkaları belirledim. `;
        
        if (criticalSubjects.length > 0) {
            const mainWeak = criticalSubjects[0];
            aiAdvice += `Özellikle ${mainWeak.name} dersinde (${mainWeak.last} net) ve ${topicWeaknessesBySubject[mainWeak.name]?.slice(0, 2).join(', ') || 'bazı temel'} konularında desteğe ihtiyacın var. `;
        }
        
        aiAdvice += "Yeni programına bu konuları 'Kritik Görev' olarak ekledim. Pes etmek yok! 🚀";

        return { averages, topicWeaknessesBySubject, criticalSubjects, lastExamName: sonSinavKisaAd, aiAdvice };
    }, []);

    // Program Oluşturucu
    const weeklyPlan = useMemo((): DayPlan[] => {
        if (!analysis) return [];
        
        const { topicWeaknessesBySubject, criticalSubjects } = analysis;
        const weakSubjectNames = criticalSubjects.map(s => s.name);
        
        const getPriority = (subjects: string[]) => subjects.some(s => weakSubjectNames.includes(s)) ? 'high' : 'medium';
        
        const getTopicTasks = (subject: string, limit = 2) => {
            const topics = topicWeaknessesBySubject[subject] || [];
            return topics.slice(0, limit).map(t => `${t} (Konu Analizi + 15 Soru)`);
        };

        const schedule: DayPlan[] = [
            {
                day: 'Pazartesi',
                focus: 'Fen Bilimleri & Paragraf',
                priority: getPriority(['Fen Bilimleri']),
                tasks: [
                    '20 soru Paragraf (Süre tutarak)',
                    ...getTopicTasks('Fen Bilimleri', 3),
                    weakSubjectNames.includes('Fen Bilimleri') ? 'Fen: Yanlış yapılan soruların video çözümleri' : '20 sayfa kitap okuma'
                ]
            },
            {
                day: 'Salı',
                focus: 'Matematik & İngilizce',
                priority: getPriority(['Matematik']),
                tasks: [
                    ...getTopicTasks('Matematik', 2),
                    'Matematik: Boş soruların (NFT-4) tekrar çözülmesi',
                    'İngilizce: Haftalık kelime listesi (NFT-4 hatalı kelimeler)',
                    '15 soru İngilizce reading pratiği'
                ]
            },
            {
                day: 'Çarşamba',
                focus: 'Türkçe & Sosyal',
                priority: getPriority(['Türkçe', 'Sosyal Bilgiler']),
                tasks: [
                    ...getTopicTasks('Türkçe', 2),
                    ...getTopicTasks('Sosyal Bilgiler', 2),
                    '20 soru Türkçe Dil Bilgisi',
                    'Sosyal: 1 ünite hızlı kavram tekrarı'
                ]
            },
            {
                day: 'Perşembe',
                focus: 'Sayısal Yoğunluk',
                priority: 'high',
                tasks: [
                    'Matematik: En zayıf konudan (Rasyonel/Cebirsel) 30 soru',
                    'Fen: Zorlanılan konulardan 20 soru',
                    'Hata Defteri: Haftanın yanlışlarının kontrolü',
                    '15 sayfa kitap okuma'
                ]
            },
            {
                day: 'Cuma',
                focus: 'Sözel & Din Kültürü',
                priority: getPriority(['Din Kültürü']),
                tasks: [
                    ...getTopicTasks('Din Kültürü', 2),
                    'İngilizce: 20 soru genel deneme',
                    'Din: Kavram sözlüğü çalışması',
                    'Türkçe: Sözel Mantık 10 soru'
                ]
            },
            {
                day: 'Cumartesi',
                focus: 'Deneme & Analiz',
                priority: 'high',
                tasks: [
                    'Tam kapsamlı LGS denemesi (Zamana karşı)',
                    'Deneme sonrası yanlışların nedenlerinin belirlenmesi',
                    'Eksik kalan okul ödevlerinin tamamlanması'
                ]
            },
            {
                day: 'Pazar',
                focus: 'Strateji & Dinlenme',
                priority: 'low',
                tasks: [
                    'Gelecek hafta hedeflerinin belirlenmesi',
                    'Zihin boşaltma: Spor veya Hobi zamanı',
                    '10 sayfa kitap okuma',
                    'SoruSayım Dashboard kontrolü'
                ]
            }
        ];

        return schedule;
    }, [analysis]);

    if (!analysis) return null;

    return (
        <div className="min-h-screen p-6 bg-slate-950 text-white relative">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 z-10 relative">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <Button variant="outline" onClick={onBack} size="sm" className="bg-slate-900 border-slate-700">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
                    </Button>
                    <h1 className="text-3xl font-display text-amber-400 flex items-center gap-3">
                        <Brain className="w-8 h-8" /> Strateji Merkezi
                    </h1>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => setPlanType('weakness')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${planType === 'weakness' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                        Eksik Odaklı
                    </button>
                    <button 
                        onClick={() => setPlanType('balanced')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${planType === 'balanced' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Dengeli
                    </button>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 z-10 relative">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                            <TrendingUp className="w-5 h-5" /> Durum Analizi
                        </h3>
                        <div className="space-y-4">
                            {analysis.averages.map((avg, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300">{avg.name}</span>
                                        <span className={`font-bold ${avg.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                            {avg.last.toFixed(1)} Net
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${avg.successRate > 75 ? 'bg-green-500' : avg.successRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(100, Math.max(5, avg.successRate))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-red-900/20 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 shadow-xl text-center">
                        <div className="flex items-center gap-3 mb-2 justify-center">
                            <Zap className="text-amber-400 w-6 h-6 animate-pulse" />
                            <span className="font-bold text-blue-200 uppercase tracking-tighter">AI Tavsiyesi</span>
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            "{analysis.aiAdvice}"
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Calendar className="text-amber-500" /> Günlük Çalışma Programı
                            </h2>
                            <div className="hidden md:flex text-sm text-slate-400 items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> "{analysis.lastExamName}" Baz Alındı
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {weeklyPlan.map((day, idx) => (
                                <div 
                                    key={idx} 
                                    className={`group p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                                        day.priority === 'high' 
                                            ? 'bg-gradient-to-br from-slate-800 to-amber-900/20 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                                            : 'bg-slate-800/50 border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">{day.day}</h4>
                                            <h3 className="text-lg font-bold">{day.focus}</h3>
                                        </div>
                                        {day.priority === 'high' && (
                                            <span className="px-2 py-0.5 bg-red-600 text-[10px] font-black rounded uppercase">Kritik</span>
                                        )}
                                    </div>
                                    <ul className="space-y-2.5">
                                        {day.tasks.map((task, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300 group-hover:text-white transition-colors">
                                                <div className="mt-1 w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center flex-shrink-0 group-hover:border-amber-400">
                                                    <div className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400"></div>
                                                </div>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
