import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAtrm8UvjzpPQyM13YgbtqW66t1_zjfqw8",
  authDomain: "amalgama-system-flow.firebaseapp.com",
  projectId: "amalgama-system-flow",
  storageBucket: "amalgama-system-flow.firebasestorage.app",
  messagingSenderId: "521542608170",
  appId: "1:521542608170:web:4a93ed6714f452323f2a53"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Generate unique user ID (stored in localStorage)
export function getUserId(): string {
  let userId = localStorage.getItem('amalgama-user-id');
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('amalgama-user-id', userId);
  }
  return userId;
}

// Save statistics to Firebase
export async function saveStatsToFirebase(stats: any): Promise<void> {
  try {
    const userId = getUserId();
    const statsRef = ref(database, `users/${userId}/stats`);
    await set(statsRef, {
      ...stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving stats to Firebase:', error);
  }
}

// Load statistics from Firebase
export async function loadStatsFromFirebase(): Promise<any> {
  try {
    const userId = getUserId();
    const statsRef = ref(database, `users/${userId}/stats`);
    const snapshot = await get(statsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading stats from Firebase:', error);
    return null;
  }
}

// Listen for real-time updates
export function listenToStatsUpdates(callback: (stats: any) => void): () => void {
  try {
    const userId = getUserId();
    const statsRef = ref(database, `users/${userId}/stats`);
    
    const unsubscribe = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    }, (error) => {
      console.error('Error listening to stats:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up listener:', error);
    return () => {};
  }
}
