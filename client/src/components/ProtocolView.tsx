import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  const [tasks, setTasks] = useState(protocol.tasks);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedKey = `amalgama-tasks-${mode}-${today}`;
    const savedTasks = localStorage.getItem(savedKey);
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        setTasks(protocol.tasks);
      }
    } else {
      setTasks(protocol.tasks);
    }
  }, [mode, protocol.tasks]);

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      const today = new Date().toISOString().split('T')[0];
      const savedKey = `amalgama-tasks-${mode}-${today}`;
      localStorage.setItem(savedKey, JSON.stringify(updated));
      
      const task = updated.find(t => t.id === id);
      if (task?.completed) {
        toast.success(`✓ ${task.name} выполнена!`, { duration: 2000 });
      }
      
      return updated;
    });
  };

  const totalMinTime = tasks.reduce((sum, task) => sum + task.minTime, 0);
  const totalMaxTime = tasks.reduce((sum, task) => sum + task.maxTime, 0);
  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  useEffect(() => {
    // Only save stats if there are completed tasks
    if (completedCount === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const completionPercent = Math.round((completedCount / tasks.length) * 100);
    
    const stats = {
      date: today,
      mode,
      completedTasks: completedCount,
      totalTasks: tasks.length,
      completionPercent,
    };
    
    const savedStats = localStorage.getItem('amalgama-stats');
    let statsArray: any[] = [];
    if (savedStats) {
      try {
        statsArray = JSON.parse(savedStats);
      } catch (e) {
        statsArray = [];
      }
    }
    
    // Remove any existing entries for today (only keep one entry per day)
    statsArray = statsArray.filter((s: any) => s.date !== today);
    
    // Add current day's stats
    statsArray.push(stats);
    
    localStorage.setItem('amalgama-stats', JSON.stringify(statsArray));
  }, [tasks, mode, completedCount]);

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
      {/* Header - compact */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-accent">{protocol.title}</h2>
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
