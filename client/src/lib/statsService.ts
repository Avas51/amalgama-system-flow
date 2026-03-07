import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

export interface DayStats {
  date: string;
  mode: 'alpha' | 'beta' | 'gamma';
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
  updatedAt: number;
}

// Get or create user ID
function getUserId(): string {
  let userId = localStorage.getItem('amalgama-user-id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('amalgama-user-id', userId);
  }
  return userId;
}

const USER_ID = getUserId();

// Save stats to Firestore
export async function saveStatsToFirestore(stats: DayStats): Promise<void> {
  try {
    const docRef = doc(db, 'users', USER_ID, 'stats', stats.date);
    await setDoc(docRef, {
      ...stats,
      updatedAt: Date.now()
    });
    console.log('Stats saved to Firestore');
  } catch (error) {
    console.error('Error saving stats to Firestore:', error);
  }
}

// Delete stats for a specific date
export async function deleteStatsForDate(date: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', USER_ID, 'stats', date);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting stats:', error);
  }
}

// Load all stats from Firestore
export async function loadStatsFromFirestore(): Promise<DayStats[]> {
  try {
    const statsRef = collection(db, 'users', USER_ID, 'stats');
    const q = query(statsRef, orderBy('date'));
    const querySnapshot = await getDocs(q);
    
    const stats: DayStats[] = [];
    querySnapshot.forEach((doc) => {
      stats.push(doc.data() as DayStats);
    });
    
    return stats;
  } catch (error) {
    console.error('Error loading stats from Firestore:', error);
    return [];
  }
}

// Subscribe to real-time updates
export function subscribeToStats(callback: (stats: DayStats[]) => void): () => void {
  const statsRef = collection(db, 'users', USER_ID, 'stats');
  const q = query(statsRef, orderBy('date'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const stats: DayStats[] = [];
    querySnapshot.forEach((doc) => {
      stats.push(doc.data() as DayStats);
    });
    callback(stats);
  }, (error) => {
    console.error('Error subscribing to stats:', error);
  });
  
  return unsubscribe;
}
