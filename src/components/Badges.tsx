import { Shield, Zap, Star, Crown } from 'lucide-react';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    minCount: number;
    color: string;
}

export const BADGES: Badge[] = [
    {
        id: 'bronze',
        name: 'Başlangıç Kahramanı',
        description: '100 soru barajını aştın!',
        icon: Shield,
        minCount: 100,
        color: 'text-amber-600' // Bronze
    },
    {
        id: 'silver',
        name: 'Hızlanan Güç',
        description: '300 soruya ulaştın, harikasın!',
        icon: Zap,
        minCount: 300,
        color: 'text-slate-400' // Silver
    },
    {
        id: 'gold',
        name: 'Yarı Tanrı',
        description: '500 soru! Efsane olma yolundasın.',
        icon: Star,
        minCount: 500,
        color: 'text-yellow-400' // Gold
    },
    {
        id: 'diamond',
        name: 'Efsanevi Avengers',
        description: '1000 soru! Sen gerçek bir süper kahramansın.',
        icon: Crown,
        minCount: 1000,
        color: 'text-cyan-400' // Diamond
    }
];

export function getEarnedBadges(totalCount: number): Badge[] {
    return BADGES.filter(badge => totalCount >= badge.minCount);
}

export function getBadgesForCount(count: number): Badge[] {
    return getEarnedBadges(count);
}

export function checkNewBadge(oldTotal: number, newTotal: number): Badge | null {
    const earnedNow = getEarnedBadges(newTotal);
    const earnedBefore = getEarnedBadges(oldTotal);

    if (earnedNow.length > earnedBefore.length) {
        return earnedNow[earnedNow.length - 1]; // En son kazanılan rozeti döndür
    }
    return null;
}
