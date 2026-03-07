import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  saveStatsToFirestore, 
  saveTasksToFirestore, 
  subscribeToTasks, 
  getUserId, 
  setUserId,
  getCurrentUserId,
  DayStats,
  TaskState
} from '@/lib/statsService';

type Mode = 'alpha' | 'beta' | 'gamma';

interface Task {
  id: string;
  name: string;
  minTime: number;
  maxTime: number;
  completed: boolean;
  icon: string;
}

const protocols: Record<Mode, { title: string; description: string; tasks: Task[] }> = {
  alpha: {
    title: 'АЛЬФА',
    description: 'Идеальный режим • Подъем в 4:00 • 360 мин',
    tasks: [
      { id: 'breathing', name: 'Дыхательная гимнастика', minTime: 15, maxTime: 15, completed: false, icon: '💨' },
      { id: 'exercise', name: 'Зарядка + Амальгама', minTime: 40, maxTime: 110, completed: false, icon: '⚡' },
      { id: 'shower', name: 'Душ + Закаливание', minTime: 20, maxTime: 20, completed: false, icon: '🚿' },
      { id: 'learning', name: 'Обучение/Чтение', minTime: 30, maxTime: 90, completed: false, icon: '📚' },
      { id: 'personal', name: 'Списки To-Do (Личное)', minTime: 15, maxTime: 30, completed: false, icon: '📋' },
      { id: 'work', name: 'Битрикс24 (Работа)', minTime: 15, maxTime: 30, completed: false, icon: '⚙️' },
      { id: 'breakfast', name: 'Завтрак (7:30 – 8:30)', minTime: 30, maxTime: 30, completed: false, icon: '🍽️' },
    ],
  },
  beta: {
    title: 'БЕТА',
    description: 'Адаптивный режим • Подъем 5:00–6:30 • 210 мин',
    tasks: [
      { id: 'breathing', name: 'Дыхательная гимнастика', minTime: 15, maxTime: 15, completed: false, icon: '💨' },
      { id: 'exercise', name: 'Зарядка + Амальгама', minTime: 40, maxTime: 40, completed: false, icon: '⚡' },
      { id: 'shower', name: 'Душ + Закаливание', minTime: 20, maxTime: 20, completed: false, icon: '🚿' },
      { id: 'learning', name: 'Обучение/Чтение', minTime: 40, maxTime: 40, completed: false, icon: '📚' },
      { id: 'personal', name: 'Списки To-Do', minTime: 15, maxTime: 15, completed: false, icon: '📋' },
      { id: 'work', name: 'Битрикс24', minTime: 15, maxTime: 15, completed: false, icon: '⚙️' },
      { id: 'breakfast', name: 'Завтрак (7:30 – 8:30)', minTime: 30, maxTime: 30, completed: false, icon: '🍽️' },
    ],
  },
  gamma: {
    title: 'ГАММА',
    description: 'Кризисный режим • Подъем 7:00–7:30 • 150 мин',
    tasks: [
      { id: 'breathing', name: 'Дыхательная гимнастика', minTime: 10, maxTime: 10, completed: false, icon: '💨' },
      { id: 'exercise', name: 'Зарядка + Амальгама', minTime: 15, maxTime: 15, completed: false, icon: '⚡' },
      { id: 'learning', name: 'Обучение/Чтение', minTime: 20, maxTime: 20, completed: false, icon: '📚' },
      { id: 'personal', name: 'Списки To-Do', minTime: 10, maxTime: 10, completed: false, icon: '📋' },
      { id: 'work', name: 'Битрикс24', minTime: 10, maxTime: 10, completed: false, icon: '⚙️' },
      { id: 'breakfast', name: 'Завтрак', minTime: 30, maxTime: 30, completed: false, icon: '🍽️' },
    ],
  },
};

interface ProtocolViewProps {
  mode: Mode;
}

export default function ProtocolView({ mode }: ProtocolViewProps) {
  const protocol = protocols[mode];
  const [tasks, setTasks] = useState<Task[]>(protocol.tasks);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedKey = `amalgama-tasks-${mode}-${today}`;
    const savedTasks = localStorage.getItem(savedKey);
    
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        // Merge with protocol tasks to get all properties
        const merged = protocol.tasks.map(task => {
          const saved = parsed.find((t: Task) => t.id === task.id);
          return saved ? { ...task, completed: saved.completed } : task;
        });
        setTasks(merged);
      } catch (e) {
        setTasks(protocol.tasks);
      }
    } else {
      setTasks(protocol.tasks);
    }
  }, [mode, protocol.tasks, today]);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToTasks(today, (data) => {
      if (data && data.tasks) {
        setIsSyncing(true);
        setTasks(prev => {
          const merged = prev.map(task => {
            const remoteTask = data.tasks.find(t => t.id === task.id);
            return remoteTask ? { ...task, completed: remoteTask.completed } : task;
          });
          
          // Save to localStorage
          const savedKey = `amalgama-tasks-${mode}-${today}`;
          localStorage.setItem(savedKey, JSON.stringify(merged));
          
          return merged;
        });
        setLastSyncTime(data.updatedAt);
        setTimeout(() => setIsSyncing(false), 500);
      }
    });

    return () => unsubscribe();
  }, [mode, today]);

  // Save tasks to Firestore whenever they change
  const saveTasks = useCallback((updatedTasks: Task[]) => {
    const taskStates: TaskState[] = updatedTasks.map(t => ({
      id: t.id,
      completed: t.completed
    }));
    
    saveTasksToFirestore(today, mode, taskStates);
    setLastSyncTime(Date.now());
  }, [mode, today]);

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      // Save to localStorage
      const savedKey = `amalgama-tasks-${mode}-${today}`;
      localStorage.setItem(savedKey, JSON.stringify(updated));
      
      // Save to Firestore
      saveTasks(updated);
      
      const task = updated.find(t => t.id === id);
      if (task?.completed) {
        toast.success(`✓ ${task.name} выполнена!`, { duration: 2000 });
      }
      
      return updated;
    });
  };

  // Save stats to Firestore
  useEffect(() => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;
    
    const completionPercent = Math.round((completedCount / tasks.length) * 100);
    
    const stats: DayStats = {
      date: today,
      mode,
      completedTasks: completedCount,
      totalTasks: tasks.length,
      completionPercent,
      updatedAt: Date.now(),
    };
    
    saveStatsToFirestore(stats);
    
    // Also save to localStorage as backup
    const savedStats = localStorage.getItem('amalgama-stats');
    let statsArray: any[] = [];
    if (savedStats) {
      try {
        statsArray = JSON.parse(savedStats);
      } catch (e) {
        statsArray = [];
      }
    }
    
    statsArray = statsArray.filter((s: any) => s.date !== today);
    statsArray.push(stats);
    localStorage.setItem('amalgama-stats', JSON.stringify(statsArray));
  }, [tasks, mode, today]);

  const handleCopyUserId = () => {
    const userId = getUserId();
    navigator.clipboard.writeText(userId);
    toast.success('ID скопирован!', { duration: 2000 });
  };

  const handleSetUserId = () => {
    if (newUserId.trim()) {
      setUserId(newUserId.trim());
    }
  };

  const totalMinTime = tasks.reduce((sum, task) => sum + task.minTime, 0);
  const totalMaxTime = tasks.reduce((sum, task) => sum + task.maxTime, 0);
  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sync indicator */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sync button */}
          <button
            onClick={() => setShowSyncPanel(!showSyncPanel)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${
              showSyncPanel 
                ? 'bg-accent/20 text-accent' 
                : 'bg-card/20 text-primary-foreground/60 hover:bg-card/30'
            }`}
          >
            <span className={`text-sm ${isSyncing ? 'animate-spin' : ''}`}>
              {isSyncing ? '🔄' : '🔗'}
            </span>
            <span>Синхронизация</span>
          </button>
          
          {lastSyncTime && (
            <span className="text-xs text-primary-foreground/40">
              {Math.floor((Date.now() - lastSyncTime) / 1000) < 60 
                ? 'только что'
                : `${Math.floor((Date.now() - lastSyncTime) / 60000)} мин назад`
              }
            </span>
          )}
        </div>
      </motion.div>

      {/* Sync panel */}
      <AnimatePresence>
        {showSyncPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-card/30 border border-primary-foreground/10 space-y-3">
              <div className="text-xs text-primary-foreground/60">
                Ваш ID для синхронизации между устройствами:
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-card/50 text-xs font-mono text-primary-foreground/80 truncate">
                  {getUserId()}
                </div>
                <button
                  onClick={handleCopyUserId}
                  className="px-3 py-2 rounded-lg bg-accent/20 text-accent text-xs hover:bg-accent/30 transition-colors"
                >
                  📋 Копировать
                </button>
              </div>
              
              <div className="text-xs text-primary-foreground/40 pt-2 border-t border-primary-foreground/10">
                Введите ID с другого устройства:
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="user_1234567890_abc123"
                  className="flex-1 px-3 py-2 rounded-lg bg-card/50 text-xs text-primary-foreground/80 placeholder:text-primary-foreground/30 outline-none border border-primary-foreground/10 focus:border-accent/50"
                />
                <button
                  onClick={handleSetUserId}
                  disabled={!newUserId.trim()}
                  className="px-3 py-2 rounded-lg bg-accent/20 text-accent text-xs hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Применить
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - compact */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-accent">
            {protocol.title} <span className="text-xl text-primary-foreground/70">— {Math.round(progressPercent)}%</span>
          </h2>
          <p className="text-xs text-primary-foreground/60">{protocol.description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-accent">{completedCount}/{tasks.length}</div>
          <div className="text-xs text-primary-foreground/50">{totalMinTime}–{totalMaxTime} мин</div>
        </div>
      </motion.div>

      {/* Progress bar - thin */}
      <motion.div variants={itemVariants} className="w-full h-1.5 bg-card/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
        />
      </motion.div>

      {/* Tasks list - compact */}
      <motion.div
        className="space-y-1"
        variants={containerVariants}
      >
        {tasks.map((task) => (
          <motion.button
            key={task.id}
            variants={itemVariants}
            onClick={() => toggleTaskComplete(task.id)}
            className={`w-full p-2 rounded-xl cursor-pointer transition-all duration-200 border text-left ${
              task.completed
                ? 'bg-card/30 border-accent/30 opacity-50'
                : 'bg-card/20 border-primary-foreground/10 hover:bg-card/30 hover:border-accent/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Checkbox */}
              <motion.div
                animate={{ scale: task.completed ? 1.05 : 1 }}
                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center text-xs font-bold ${
                  task.completed
                    ? 'bg-accent border-accent text-accent-foreground'
                    : 'border-primary-foreground/30'
                }`}
              >
                {task.completed && '✓'}
              </motion.div>

              {/* Icon */}
              <span className="text-lg flex-shrink-0">{task.icon}</span>

              {/* Name */}
              <span
                className={`flex-1 truncate text-sm ${
                  task.completed
                    ? 'text-primary-foreground/40 line-through'
                    : 'text-primary-foreground/90'
                }`}
              >
                {task.name}
              </span>

              {/* Time */}
              <span className="text-xs font-mono text-primary-foreground/50 flex-shrink-0">
                {task.minTime}{task.minTime !== task.maxTime ? `–${task.maxTime}` : ''} мин
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Completion message */}
      {completedCount === tasks.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-green-500/20 border border-green-400/30 text-center"
        >
          <p className="text-sm font-bold text-green-300">
            ✨ Все задачи завершены!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
