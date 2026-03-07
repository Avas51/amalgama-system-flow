import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClZHZrMRfFrjaMhAHzZtDLnGEZC3-_ymU",
  authDomain: "amalgama-stats.firebaseapp.com",
  projectId: "amalgama-stats",
  storageBucket: "amalgama-stats.firebasestorage.app",
  messagingSenderId: "943337906975",
  appId: "1:943337906975:web:5b54be12bb3ad61a5a462a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
