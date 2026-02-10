import { type User, type Subject } from '../types';

export const USERS: User[] = [
    {
        id: 'hero-iron',
        name: 'Demir Adam',
        role: 'ortaokul', // Varsayılan rol (seçim ekranında değişebilir veya sabit kalabilir, şimdilik sabit)
        avatarColor: 'avengers-red'
    },
    {
        id: 'hero-cap',
        name: 'Kaptan Amerika',
        role: 'lise',
        avatarColor: 'avengers-blue'
    },
    {
        id: 'hero-thor',
        name: 'Thor',
        role: 'ortaokul',
        avatarColor: 'thor-silver'
    },
    {
        id: 'hero-widow',
        name: 'Black Widow',
        role: 'lise',
        avatarColor: 'widow-black'
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
