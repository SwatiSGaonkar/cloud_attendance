import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCmbk2CbJ6K5E9OisWfBmdg_A3O98ZrX6E",
    authDomain: "attendance-291fe.firebaseapp.com",
    projectId: "attendance-291fe",
    storageBucket: "attendance-291fe.firebasestorage.app",
    messagingSenderId: "1015311697128",
    appId: "1:1015311697128:web:b5711a3537dd6f5a20355d",
    measurementId: "G-Q1RXKNDFEK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);