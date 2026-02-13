import { type User, type Subject } from '../types';

export const USERS: User[] = [
    {
        id: 'kivanc',
        name: 'Kıvanç',
        role: 'ortaokul',
        avatarColor: 'fenerbahce-yellow',
        underlyingUserId: 'kivanc',
        email: 'kivanc@orkan.com'
    },
    {
        id: 'ruya',
        name: 'Rüya',
        role: 'lise',
        avatarColor: 'avengers-blue',
        underlyingUserId: 'ruya',
        email: 'ruya@orkan.com'
    },
    {
        id: 'orkan',
        name: 'Süper Baba',
        role: 'admin',
        avatarColor: 'slate-800',
        underlyingUserId: 'orkan',
        avatarImage: '/assets/hero_super_dad.png', // Placeholder until image is generated/moved
        email: 'admin@orkan.com'
    }
];

export const SUBJECTS: Subject[] = [
    // Ortaokul Dersleri
    { id: 'tr-orta', name: 'Türkçe', role: 'ortaokul' },
    { id: 'mat-orta', name: 'Matematik', role: 'ortaokul' },
    { id: 'fen', name: 'Fen Bilimleri', role: 'ortaokul' },
    { id: 'sos', name: 'Sosyal Bilgiler', role: 'ortaokul' },
    { id: 'ing-orta', name: 'İngilizce', role: 'ortaokul' },
    { id: 'din-orta', name: 'Din Kültürü', role: 'ortaokul' },

    // Lise Dersleri
    { id: 'edb', name: 'Edebiyat', role: 'lise' },
    { id: 'mat-lise', name: 'Matematik', role: 'lise' },
    { id: 'fiz', name: 'Fizik', role: 'lise' },
    { id: 'kim', name: 'Kimya', role: 'lise' },
    { id: 'biy', name: 'Biyoloji', role: 'lise' },
    { id: 'tar', name: 'Tarih', role: 'lise' },
    { id: 'cog', name: 'Coğrafya', role: 'lise' },
    { id: 'fels', name: 'Felsefe', role: 'lise' },
    { id: 'ing-lise', name: 'İngilizce', role: 'lise' },
];
