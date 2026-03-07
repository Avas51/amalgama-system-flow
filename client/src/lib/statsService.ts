import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  deleteDoc,
  getDoc
} from 'firebase/firestore';

export interface DayStats {
  date: string;
  mode: 'alpha' | 'beta' | 'gamma';
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
  updatedAt: number;
}

export interface TaskState {
  id: string;
  completed: boolean;
}

export interface DayTasks {
  date: string;
  mode: 'alpha' | 'beta' | 'gamma';
  tasks: TaskState[];
  updatedAt: number;
}

// Get current user ID
export function getUserId(): string {
  return localStorage.getItem('amalgama-user-id') || '';
}

// Set user ID (for syncing between devices)
export function setUserId(newUserId: string): void {
  localStorage.setItem('amalgama-user-id', newUserId);
  // Reload to apply new user ID
  window.location.reload();
}

// Get or create user ID
function getOrCreateUserId(): string {
  let userId = localStorage.getItem('amalgama-user-id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('amalgama-user-id', userId);
  }
  return userId;
}

let CURRENT_USER_ID = getOrCreateUserId();

// Update current user ID (without reload)
export function updateCurrentUserId(newUserId: string): void {
  CURRENT_USER_ID = newUserId;
  localStorage.setItem('amalgama-user-id', newUserId);
}

// Save stats to Firestore
export async function saveStatsToFirestore(stats: DayStats): Promise<void> {
  try {
    const docRef = doc(db, 'users', CURRENT_USER_ID, 'stats', stats.date);
    await setDoc(docRef, {
      ...stats,
      updatedAt: Date.now()
    });
    console.log('Stats saved to Firestore');
  } catch (error) {
    console.error('Error saving stats to Firestore:', error);
  }
}

// Save task states to Firestore
export async function saveTasksToFirestore(date: string, mode: 'alpha' | 'beta' | 'gamma', tasks: TaskState[]): Promise<void> {
  try {
    const docRef = doc(db, 'users', CURRENT_USER_ID, 'tasks', date);
    await setDoc(docRef, {
      date,
      mode,
      tasks,
      updatedAt: Date.now()
    });
    console.log('Tasks saved to Firestore');
  } catch (error) {
    console.error('Error saving tasks to Firestore:', error);
  }
}

// Load task states from Firestore
export async function loadTasksFromFirestore(date: string): Promise<DayTasks | null> {
  try {
    const docRef = doc(db, 'users', CURRENT_USER_ID, 'tasks', date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as DayTasks;
    }
    return null;
  } catch (error) {
    console.error('Error loading tasks from Firestore:', error);
    return null;
  }
}

// Subscribe to real-time task updates
export function subscribeToTasks(date: string, callback: (data: DayTasks | null) => void): () => void {
  const docRef = doc(db, 'users', CURRENT_USER_ID, 'tasks', date);
  
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as DayTasks);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to tasks:', error);
  });
  
  return unsubscribe;
}

// Delete stats for a specific date
export async function deleteStatsForDate(date: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', CURRENT_USER_ID, 'stats', date);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting stats:', error);
  }
}

// Load all stats from Firestore
export async function loadStatsFromFirestore(): Promise<DayStats[]> {
  try {
    const statsRef = collection(db, 'users', CURRENT_USER_ID, 'stats');
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

// Subscribe to real-time stats updates
export function subscribeToStats(callback: (stats: DayStats[]) => void): () => void {
  const statsRef = collection(db, 'users', CURRENT_USER_ID, 'stats');
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

// Get current user ID for external use
export function getCurrentUserId(): string {
  return CURRENT_USER_ID;
}
