import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: Date;
    title: string;
    variant?: 'default' | 'small' | 'hero';
    panic?: boolean;
}

export function Countdown({ targetDate, title, variant = 'default', panic = false }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (variant === 'small') {
        return (
            <div className={`flex flex-col items-center rounded-xl p-3 border transition-all duration-300 ${panic
                    ? 'bg-red-900/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'bg-black/30 backdrop-blur-md border-white/10'
                }`}>
                <div className={`text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1 ${panic ? 'text-red-200' : 'text-gray-400'
                    }`}>
                    {panic && <span className="animate-bounce">🚨</span>}
                    {title}
                </div>
                <div className={`flex gap-2 font-mono text-sm ${panic ? 'text-white font-black drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-white'
                    }`}>
                    <span>{timeLeft.days}g</span>
                    <span>{timeLeft.hours}s</span>
                    <span>{timeLeft.minutes}d</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <h3 className="text-lg font-display text-white mb-4 tracking-wide relative z-10">
                {title}
            </h3>

            <div className="flex gap-4 relative z-10">
                <TimeUnit value={timeLeft.days} label="GÜN" />
                <TimeUnit value={timeLeft.hours} label="SAAT" />
                <TimeUnit value={timeLeft.minutes} label="DK" />
                <TimeUnit value={timeLeft.seconds} label="SN" />
            </div>

            {/* Decorative Glow */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-1 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white font-mono">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest">{label}</span>
        </div>
    );
}
