import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAiZJrWE0UvxZzY29ysGA8CJsIzrAWKaxw",
    authDomain: "soru-takip-8cff8.firebaseapp.com",
    projectId: "soru-takip-8cff8",
    storageBucket: "soru-takip-8cff8.firebasestorage.app",
    messagingSenderId: "169936329419",
    appId: "1:169936329419:web:c6fa0c62803f9563ec194e",
    measurementId: "G-M2XYX25FND"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Auth with persistence settings optimized for Capacitor/mobile
export const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});
