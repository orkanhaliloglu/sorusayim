import { type DailyLog } from '../types';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'daily_logs';

export const storage = {
    // Firestore'dan veri okuma (Async)
    getLogs: async (userId: string, date?: string): Promise<DailyLog[]> => {
        try {
            let q;
            if (date) {
                q = query(
                    collection(db, COLLECTION_NAME),
                    where("userId", "==", userId),
                    where("date", "==", date)
                );
            } else {
                // Tarih yoksa son 7 günü getir (basitleştirilmiş) veya sadece user filtrele
                q = query(
                    collection(db, COLLECTION_NAME),
                    where("userId", "==", userId)
                );
            }

            const querySnapshot = await getDocs(q);
            const logs: DailyLog[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                logs.push({
                    id: doc.id,
                    userId: data.userId,
                    subjectId: data.subjectId,
                    questionCount: data.questionCount,
                    date: data.date,
                    timestamp: data.createdAt ? (data.createdAt as Timestamp).toMillis() : Date.now()
                } as DailyLog);
            });

            return logs;
        } catch (error) {
            console.error('Error reading logs from Firebase:', error);
            return [];
        }
    },

    // Firestore'a veri yazma (Async)
    addLog: async (log: Omit<DailyLog, 'id' | 'timestamp'>) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...log,
                createdAt: Timestamp.now()
            });

            return {
                ...log,
                id: docRef.id,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error saving log to Firebase:', error);
            return null;
        }
    },

    // Bağlantı testi
    testConnection: async () => {
        try {
            // Sadece 1 döküman çekmeyi dene
            await getDocs(query(collection(db, COLLECTION_NAME), where("date", "==", "1900-01-01")));
            return { success: true };
        } catch (error: any) {
            console.error("Connection failed:", error);
            return { success: false, error: error.message || "Bilinmeyen hata" };
        }
    },

    // Geriye dönük uyumluluk için dummy fonksiyon - KULLANILMAMALI
    getUserLogsByDate: () => {
        console.error("DEPRECATED: Use async getLogs() instead");
        return [];
    }
};
