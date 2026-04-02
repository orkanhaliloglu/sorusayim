import { useState, useMemo } from 'react';
import { type User } from '../types';
import { Button } from '../components/ui/Button';
import { 
    ArrowLeft, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    Zap,
    Brain,
    BookOpen
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

export function StratejiPage({ currentUser: _, onBack }: StratejiPageProps) {
    const [planType, setPlanType] = useState<'weakness' | 'balanced'>('weakness');

    // Analiz Verileri
    const analysis = useMemo(() => {
        if (!karnelerData || karnelerData.length === 0) return null;

        const subjectStats: Record<string, { totalNet: number, count: number, lastNet: number, soruSayisi: number }> = {};
        const lastExam = karnelerData[karnelerData.length - 1];
        const topicWeaknesses: { konu: string, basari: number }[] = [];

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
                    // basariYuzdesi bazen net (örn: 9.67/20) bazen yüzde (örn: 33.33) olarak geliyor
                    let realPercent = konu.basariYuzdesi;
                    if (konu.basariYuzdesi <= konu.soruSayisi && konu.soruSayisi > 5) {
                        realPercent = (konu.basariYuzdesi / konu.soruSayisi) * 100;
                    }

                    if (realPercent < 60) {
                        topicWeaknesses.push({ konu: konu.konu, basari: realPercent });
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

        // En zayıf dersler
        const sortedWeakSubjects = [...averages].sort((a, b) => a.successRate - b.successRate);
        const criticalSubjects = sortedWeakSubjects.filter(s => s.successRate < 65).slice(0, 3);
        
        // AI Tavsiyesi Oluşturma
        const sonSinavKisaAd = lastExam.sinavAdi.replace(/^.*?S[ıiIİ]nav Karnesi.*?-\s*/i, '').trim() || lastExam.sinavAdi;
        const toplamNet = lastExam.dersler.reduce((acc, d) => acc + d.net, 0);
        
        let aiAdvice = `Kıvanç, son girdiğin "${sonSinavKisaAd}" sınavında toplam ${toplamNet.toFixed(1)} net yaparak gayretini gösterdin. `;
        
        if (criticalSubjects.length > 0) {
            const mainWeak = criticalSubjects[0];
            aiAdvice += `Özellikle ${mainWeak.name} dersinde biraz zorlanmış görünüyorsun (${mainWeak.last} net). `;
            if (topicWeaknesses.length > 0) {
                aiAdvice += `Buna ek olarak ${topicWeaknesses.slice(0, 2).map(t => t.konu).join(' ve ')} konularına bir göz atmak netlerini hızla 400 puan üzerine taşıyacaktır. `;
            }
        } else {
            aiAdvice += "Genel durumun çok dengeli ve başarılı. Mevcut temponu koruyarak hedeflerine emin adımlarla ilerliyorsun! ";
        }
        
        aiAdvice += "Unutma, her yanlış bir öğrenme fırsatıdır. Pes etme, şampiyon sensin! 🚀";

        return { averages, topicWeaknesses, criticalSubjects, lastExamName: sonSinavKisaAd, aiAdvice };
    }, []);

    // Program Oluşturucu
    const weeklyPlan = useMemo((): DayPlan[] => {
        if (!analysis) return [];
        
        const { topicWeaknesses, criticalSubjects } = analysis;
        const weakSubjectNames = criticalSubjects.map(s => s.name);
        
        const getPriority = (subjects: string[]) => {
            return subjects.some(s => weakSubjectNames.includes(s)) ? 'high' : 'medium';
        };

        const schedule: DayPlan[] = [
            {
                day: 'Pazartesi',
                focus: weakSubjectNames.includes('Fen Bilimleri') || weakSubjectNames.includes('Matematik') ? 'Sayısal Odaklı Tekrar' : 'Fen Bilimleri & Paragraf',
                priority: getPriority(['Fen Bilimleri', 'Matematik']),
                tasks: [
                    '20 sayfa kitap okuma',
                    '20 soru Paragraf (Süre tutarak)',
                    ...topicWeaknesses.filter(t => t.konu.toLowerCase().includes('mayoz') || t.konu.toLowerCase().includes('hücre')).map(t => `${t.konu} konu özeti çıkar`),
                    weakSubjectNames.includes('Fen Bilimleri') ? '40 soru Fen Bilimleri (Yanlış analizi ile)' : '25 soru Fen Bilimleri testi'
                ]
            },
            {
                day: 'Salı',
                focus: 'Matematik & İngilizce',
                priority: getPriority(['Matematik', 'İngilizce']),
                tasks: [
                    weakSubjectNames.includes('Matematik') ? '30 soru Matematik (Zorlanılan konular)' : '15 soru Matematik (Yeni nesil)',
                    'Matematik: Son sınavdaki boş soruların çözümü',
                    '15 soru İngilizce kelime çalışması',
                    topicWeaknesses.some(t => t.konu.toLowerCase().includes('fiil')) ? 'Türkçe: Fiiller konusu hızlı tekrar' : 'Okuma pratiği'
                ]
            },
            {
                day: 'Çarşamba',
                focus: weakSubjectNames.includes('Sosyal Bilgiler') || weakSubjectNames.includes('Türkçe') ? 'Sözel Güçlendirme' : 'Türkçe & Sosyal',
                priority: getPriority(['Sosyal Bilgiler', 'Türkçe']),
                tasks: [
                    '20 soru Türkçe Paragraf',
                    weakSubjectNames.includes('Sosyal Bilgiler') ? 'Sosyal Bilgiler: 30 soru + Konu tekrarı' : '15 soru Sosyal Bilgiler',
                    'Din Kültürü: 10 soru genel tekrar',
                    'Haftalık genel kelime listesi kontrolü'
                ]
            },
            {
                day: 'Perşembe',
                focus: 'Sayısal Yoğunluk (Eksik Kapatma)',
                priority: 'high',
                tasks: [
                    'Math & Fen: En çok yanlış yapılan 2\'şer konudan 20\'şer soru',
                    'Video çözümleri izleyerek hata analizi',
                    '10 sayfa kitap okuma',
                    'Hızlı formül ve kural tekrarı'
                ]
            },
            {
                day: 'Cuma',
                focus: 'Genel Değerlendirme',
                priority: 'medium',
                tasks: [
                    'İngilizce: 20 soru deneme tadında test',
                    'Hafta içi çözülemeyen soruların tekrarı',
                    'Türkçe Dil Bilgisi: 15 soru',
                    'Haftalık başarı takibi (SoruSayım Dashboard)'
                ]
            },
            {
                day: 'Cumartesi',
                focus: 'Simülasyon Günü',
                priority: 'high',
                tasks: [
                    'Tam kapsamlı LGS denemesi (Sözel 75 dk, Sayısal 80 dk)',
                    'Deneme sonrası detaylı analiz (Yanlış - Boş kontrolü)',
                    'Puan hesaplama ve hedef karşılaştırma'
                ]
            },
            {
                day: 'Pazar',
                focus: 'Gelecek Stratejisi & Dinlenme',
                priority: 'low',
                tasks: [
                    'Haftalık performans değerlendirmesi',
                    'Eksik kalan konulardan mini test (10 soru)',
                    'Kitap okuma ve hobi zamanı',
                    'Yeni hafta programının gözden geçirilmesi'
                ]
            }
        ];

        return schedule;
    }, [analysis]);

    if (!analysis) return null;

    return (
        <div className="min-h-screen p-6 bg-slate-950 text-white relative">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 z-10 relative">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <Button variant="outline" onClick={onBack} size="sm" className="bg-slate-900 border-slate-700">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
                    </Button>
                    <h1 className="text-3xl font-display text-amber-400 flex items-center gap-3">
                        <Brain className="w-8 h-8" /> Strateji ve Planlama Merkezi
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
                
                {/* Left Panel: Analysis Summary */}
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

                    <div className="bg-red-900/20 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-5 h-5" /> Kritik Konular
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.topicWeaknesses.map((item, i) => (
                                <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                                    {item.konu}
                                </span>
                            ))}
                            {analysis.topicWeaknesses.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Harikasın! Kritik bir eksik bulunamadı.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/30">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="text-amber-400 w-6 h-6 animate-pulse" />
                            <span className="font-bold text-blue-200">AI Tavsiyesi</span>
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            "{analysis.aiAdvice}"
                        </p>
                    </div>
                </div>

                {/* Right Panel: Study Schedule */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Calendar className="text-amber-500" /> Günlük Çalışma Programı (LGS Hazırlık)
                            </h2>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> "{analysis.lastExamName}" Analizi ile Güncellendi
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {weeklyPlan.map((day, idx) => (
                                <div 
                                    key={idx} 
                                    className={`group p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                                        day.priority === 'high' 
                                            ? 'bg-gradient-to-br from-slate-800 to-amber-900/20 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                                            : 'bg-slate-800/50 border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">{day.day}</h4>
                                            <h3 className="text-xl font-bold">{day.focus}</h3>
                                        </div>
                                        {day.priority === 'high' && (
                                            <span className="px-2 py-1 bg-red-600 text-[10px] font-black rounded uppercase">Kritik</span>
                                        )}
                                    </div>
                                    <ul className="space-y-3">
                                        {day.tasks.map((task, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300 group-hover:text-white transition-colors">
                                                <div className="mt-1 w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center flex-shrink-0 group-hover:border-amber-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400"></div>
                                                </div>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 p-6 bg-slate-950/50 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/20 rounded-full">
                                    <BookOpen className="text-blue-400 w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Programı PDF Olarak Al</h4>
                                    <p className="text-xs text-slate-400">Çalışma masana asmak için çıktı alabilirsin.</p>
                                </div>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-500">
                                Dosyayı İndir
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
