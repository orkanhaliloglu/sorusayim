export type UserRole = 'ortaokul' | 'lise';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatarColor: string; // Tailwind class prefix e.g. 'avengers-red', 'thor-silver'
}

export interface Subject {
    id: string;
    name: string;
    role: UserRole | 'common';
}

export interface DailyLog {
    id: string;
    userId: string;
    subjectId: string;
    questionCount: number;
    date: string; // ISO date string YYYY-MM-DD
    timestamp: number;
}
