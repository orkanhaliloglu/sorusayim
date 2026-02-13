export type UserRole = 'ortaokul' | 'lise' | 'admin';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatarColor: string; // Tailwind class prefix e.g. 'avengers-red'
    avatarImage?: string; // Path to the avatar image
    underlyingUserId: string; // 'kivanc' or 'ruya' for database aggregation
    email?: string; // Optional for now to support existing code if any
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
