import { useState, useMemo } from 'react';
import { type User } from '../types';
import { Button } from '../components/ui/Button';
import { ArrowLeft, BookOpen, Star, AlertTriangle, PieChart } from 'lucide-react';
import karnelerData from '../data/karneler.json';

interface KarnelerPageProps {
    currentUser: User;
    onBack: () => void;
}

export function KarnelerPage({ currentUser, onBack }: KarnelerPageProps) {
    // Sadece Kıvanç'ın verileri var gibi görünüyor, yine de güvenli tarafta kalalım
    if (currentUser.id !== 'kivanc' && currentUser.id !== 'orkan' && currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-slate-900 text-white">
                <h2 className="text-3xl font-bold mb-4">Yetkisiz Erişim</h2>
                <p className="mb-8">Bu sayfayı görüntüleme yetkiniz yok.</p>
                <Button onClick={onBack}>Geri Dön</Button>
            </div>
        );
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedSinav, setSelectedSinav] = useState<string | null>(null);

    // Genel İstatistik Hesaplamaları (Tüm Sınavlar)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const stats = useMemo(() => {
        let totalNet = 0;
        let totalSoru = 0;
        const dersNetleri: Record<string, { net: number, soru: number }> = {};
        const konuBasarilari: Record<string, { dogru: number, soru: number }> = {};

        karnelerData.forEach(karne => {
            karne.dersler.forEach(ders => {
                totalNet += ders.net;
                totalSoru += ders.soruSayisi;

                if (!dersNetleri[ders.ders]) dersNetleri[ders.ders] = { net: 0, soru: 0 };
                dersNetleri[ders.ders].net += ders.net;
                dersNetleri[ders.ders].soru += ders.soruSayisi;
            });

            karne.konular.forEach(konu => {
                if (!konuBasarilari[konu.konu]) konuBasarilari[konu.konu] = { dogru: 0, soru: 0 };
                konuBasarilari[konu.konu].dogru += konu.dogru;
                konuBasarilari[konu.konu].soru += konu.soruSayisi;
            });
        });

        // En İyi 3 Konu (En az 5 soru sorulmuş olsun)
        const konular = Object.entries(konuBasarilari)
            .filter(([_, data]) => data.soru >= 5)
            .map(([isim, data]) => ({
                isim,
                basari: (data.dogru / data.soru) * 100
            }));

        konular.sort((a, b) => b.basari - a.basari);

        const enIyiKonular = konular.slice(0, 3);
        const enZayifKonular = [...konular].reverse().slice(0, 3); // Sondan 3

        const zayifKritikler = enZayifKonular.filter(k => k.basari <= 50);

        const totalSinav = karnelerData.length;
        const statsOrta = totalSinav > 0 ? (totalNet / totalSinav) : 0;

        // Akıllı paragraf analiz raporu üretme
        let analizRaporu = "";

        if (totalSinav === 0) {
            analizRaporu = "Henüz sistemde analiz edilebilecek bir karne bulunmuyor. Dünyayı kurtarmak için önce biraz pratik yapmalıyız!";
        } else {
            analizRaporu += `${totalSinav} deneme sınavının sonuçlarına baktığımda genel ortalama netin ${statsOrta.toFixed(1)} civarında. `;

            if (enIyiKonular.length > 0) {
                const iyiIsimler = enIyiKonular.map(k => k.isim);
                analizRaporu += `Özellikle ${iyiIsimler.join(', ')} konularında süper bir iş çıkarıyorsun, tebrikler! `;
            }

            if (zayifKritikler.length > 0) {
                const zayifMetinleri = zayifKritikler.map(k => `${k.isim} (Başarı: %${k.basari.toFixed(0)})`);
                analizRaporu += `Ancak bazı konular biraz daha desteğe ihtiyaç duyuyor gibi görünüyor. Örnek olarak: ${zayifMetinleri.join(', ')}. `;

                // Bazı spesifik konularda (Mayoz, vs) özel tavsiyeler eklenebilir.
                const kritikKonular = zayifKritikler.map(k => k.isim.toLowerCase());
                if (kritikKonular.some(k => k.includes('rasyonel'))) {
                    analizRaporu += "Rasyonel sayılarda eksiklik görünüyor, bu konu üzerine bol pratik yapmalısın. ";
                }
                if (kritikKonular.some(k => k.includes('mayoz'))) {
                    analizRaporu += "Mayoz konusu oldukça kritik, hücre bölünmeleri başlığına tekrar bir göz atmanı tavsiye ederim. ";
                }
                if (kritikKonular.some(k => k.includes('matematik') || k.includes('işlemler'))) {
                    analizRaporu += "Matematikte bazı eksiklikler var gibi; bu alanlarda özellikle geçmiş sorulardaki hataları analiz etmek çok faydalı olacaktır. ";
                }

                analizRaporu += "Eğer bu konularda pratiklerini artırırsan, genel ortalamanın harika bir seviyeye çıkacağına eminim!";
            } else {
                analizRaporu += "Şu an için belirgin bir zayıf noktan görünmüyor. Dünyayı kurtarmaya aynı tempoyla devam!";
            }
        }

        return {
            totalSinav,
            ortalamaNet: statsOrta,
            enIyiKonular,
            enZayifKonular,
            analizRaporu
        };
    }, []);

    const selectedKarne = karnelerData.find(k => k.sinavAdi === selectedSinav);

    return (
        <div className="min-h-screen p-6 flex flex-col items-center bg-slate-950 text-white relative">
            {/* Header */}
            <div className="w-full max-w-6xl flex items-center justify-between mb-8 z-10 relative">
                <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Dashboard'a Dön
                </Button>
                <h1 className="text-3xl font-display text-fenerbahce-yellow">Karne Analiz Merkezi</h1>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 relative">

                {/* Sol Menü: Sınav Listesi */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                            <BookOpen className="text-blue-400" /> Sınavlar ({stats.totalSinav})
                        </h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {karnelerData.map((karne, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSinav(karne.sinavAdi)}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedSinav === karne.sinavAdi
                                        ? 'bg-fenerbahce-blue border-fenerbahce-yellow border-2 text-white shadow-lg scale-105'
                                        : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                                        }`}
                                >
                                    <div className="font-semibold text-sm truncate" title={karne.sinavAdi}>
                                        {karne.sinavAdi}
                                    </div>
                                </button>
                            ))}
                            {/* Genel Analiz Butonu */}
                            <button
                                onClick={() => setSelectedSinav(null)}
                                className={`w-full text-left p-4 rounded-lg transition-all duration-200 mt-4 border-2 ${selectedSinav === null
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-white text-white shadow-xl'
                                    : 'bg-gray-800 hover:bg-gray-700 border-purple-500'
                                    }`}
                            >
                                <div className="font-bold flex items-center gap-2 justify-center">
                                    <PieChart className="w-5 h-5" /> GENEL ANALİZ
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sağ Panel: İçeirk */}
                <div className="lg:col-span-2 space-y-6">

                    {selectedSinav === null ? (
                        // GENEL ANALİZ GÖRÜNÜMÜ
                        <div className="space-y-6 animate-fadeIn">
                            {/* Üst İstatistikler */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-900 to-slate-800 p-6 rounded-2xl border border-blue-500/30 flex flex-col items-center justify-center text-center">
                                    <div className="text-blue-200 text-sm font-bold tracking-wider mb-2 uppercase">Toplam Çözülen Deneme</div>
                                    <div className="text-5xl font-black text-white">{stats.totalSinav}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
                                    <div className="flex flex-col space-y-2">
                                        <span className="text-slate-400 text-sm">Değerlendirilen Sınav</span>
                                        <span className="text-3xl font-bold text-white">{stats.totalSinav}</span>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <span className="text-slate-400 text-sm">Ortalama Net (Tüm Sınavlar)</span>
                                        <span className="text-3xl font-bold text-indigo-400">{stats.ortalamaNet.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Akıllı Analiz Paragrafı Eklentisi */}
                            <div className="bg-indigo-900/40 p-6 rounded-xl border border-indigo-700/50 mt-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                <h3 className="text-xl font-bold text-indigo-300 mb-3 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-fenerbahce-yellow" />
                                    SoruSayım Yapay Zeka Analizi
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-lg italic">
                                    "{stats.analizRaporu}"
                                </p>
                            </div>

                            {/* Güçlü ve Zayıf Konular */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Süper Güçler */}
                                <div className="bg-gray-800 p-6 rounded-2xl border border-green-500/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Star className="w-24 h-24 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2 relative z-10">
                                        <Star className="w-5 h-5" /> Şampiyon Olduğun Konular
                                    </h3>
                                    <div className="space-y-3 relative z-10">
                                        {stats.enIyiKonular.map((k, i) => (
                                            <div key={i} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center border border-gray-600">
                                                <span className="font-medium text-gray-200">{k.isim}</span>
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-bold">
                                                    %{k.basari.toFixed(0)} Başarı
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gelişim Alanları */}
                                <div className="bg-gray-800 p-6 rounded-2xl border border-red-500/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <AlertTriangle className="w-24 h-24 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2 relative z-10">
                                        <AlertTriangle className="w-5 h-5" /> Geliştirilmesi Gerekenler
                                    </h3>
                                    <div className="space-y-3 relative z-10">
                                        {stats.enZayifKonular.map((k, i) => (
                                            <div key={i} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center border border-gray-600">
                                                <span className="font-medium text-gray-200">{k.isim}</span>
                                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm font-bold">
                                                    %{k.basari.toFixed(0)} Başarı
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : selectedKarne ? (
                        // TEKİL SINAV GÖRÜNÜMÜ
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl animate-fadeIn">
                            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
                                {selectedKarne.sinavAdi}
                            </h2>

                            <h3 className="text-lg font-semibold text-gray-300 mb-4">Ders Bazlı Netler</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {selectedKarne.dersler.map((ders, i) => (
                                    <div key={i} className="bg-gray-700 p-4 rounded-xl border border-gray-600 flex flex-col items-center justify-center text-center">
                                        <div className="text-sm text-gray-400 font-medium mb-1 truncate w-full" title={ders.ders}>{ders.ders}</div>
                                        <div className="text-3xl font-black text-white">{ders.net}</div>
                                        <div className="text-[10px] text-gray-400 mt-2">
                                            {ders.dogru} D / {ders.yanlis} Y / {ders.bos} B
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedKarne.konular.length > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Konu Analizi</h3>
                                    <div className="space-y-2">
                                        {selectedKarne.konular.map((konu, i) => (
                                            <div key={i} className="bg-gray-700/50 p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-600 gap-2">
                                                <div className="font-medium text-gray-200">{konu.konu}</div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-400">{konu.soruSayisi} Soru</span>
                                                    <div className={`px-2 py-1 rounded font-bold ${konu.basariYuzdesi >= 80 ? 'bg-green-500/20 text-green-400' :
                                                        konu.basariYuzdesi >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        %{konu.basariYuzdesi}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    );
}
