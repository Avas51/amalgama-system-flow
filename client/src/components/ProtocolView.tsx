import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
    description: 'Идеальный режим • Подъем в 4:00 • Личное время до 10:00',
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
    description: 'Адаптивный режим • Подъем 5:00 – 6:30 • Сокращенный цикл',
    tasks: [
      { id: 'breathing', name: 'Дыхательная гимнастика', minTime: 15, maxTime: 15, completed: false, icon: '💨' },
      { id: 'exercise', name: 'Зарядка + Амальгама (минимум)', minTime: 40, maxTime: 40, completed: false, icon: '⚡' },
      { id: 'shower', name: 'Душ', minTime: 10, maxTime: 15, completed: false, icon: '🚿' },
      { id: 'learning', name: 'Обучение/Чтение', minTime: 15, maxTime: 20, completed: false, icon: '📚' },
      { id: 'personal', name: 'Списки To-Do + Битрикс24', minTime: 10, maxTime: 10, completed: false, icon: '📋' },
      { id: 'breakfast', name: 'Завтрак (7:30 – 8:30)', minTime: 30, maxTime: 30, completed: false, icon: '🍽️' },
    ],
  },
  gamma: {
    title: 'ГАММА',
    description: 'Кризисный режим • Подъем после 7:00 • Минимальный цикл',
    tasks: [
      { id: 'breathing', name: 'Дыхательная гимнастика', minTime: 15, maxTime: 15, completed: false, icon: '💨' },
      { id: 'amalgama', name: 'Амальгама (прочитать)', minTime: 2, maxTime: 2, completed: false, icon: '✨' },
      { id: 'shower', name: 'Душ', minTime: 5, maxTime: 10, completed: false, icon: '🚿' },
      { id: 'learning', name: 'Обучение/Чтение (1 инсайт)', minTime: 5, maxTime: 5, completed: false, icon: '📚' },
      { id: 'lists', name: 'Списки To-Do + Битрикс24', minTime: 5, maxTime: 5, completed: false, icon: '📋' },
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
    setTasks(protocol.tasks);
  }, [mode]);

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-4xl font-bold text-accent mb-2">{protocol.title}</h2>
        <p className="text-primary-foreground/70">{protocol.description}</p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-3xl bg-card/30 border border-primary-foreground/20"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-primary-foreground">
            Прогресс: {completedCount} из {tasks.length}
          </span>
          <span className="text-xs text-primary-foreground/60">
            {totalMinTime}–{totalMaxTime} мин
          </span>
        </div>
        <div className="w-full h-3 bg-card/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6 }}
            className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
          />
        </div>
      </motion.div>

      {/* Tasks list */}
      <motion.div
        className="space-y-3"
        variants={containerVariants}
      >
        {tasks.map((task, index) => (
          <motion.button
            key={task.id}
            variants={itemVariants}
            onClick={() => toggleTaskComplete(task.id)}
            className={`w-full p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 text-left ${
              task.completed
                ? 'bg-card/40 border-accent/50 opacity-60'
                : 'bg-card/30 border-primary-foreground/20 hover:bg-card/40 hover:border-accent/30'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <motion.div
                animate={{ scale: task.completed ? 1.1 : 1 }}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold ${
                  task.completed
                    ? 'bg-accent border-accent text-accent-foreground'
                    : 'border-primary-foreground/40'
                }`}
              >
                {task.completed && '✓'}
              </motion.div>

              {/* Icon and name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl flex-shrink-0">{task.icon}</span>
                  <span
                    className={`font-semibold truncate ${
                      task.completed
                        ? 'text-primary-foreground/50 line-through'
                        : 'text-primary-foreground'
                    }`}
                  >
                    {task.name}
                  </span>
                </div>
              </div>

              {/* Time range */}
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-mono text-primary-foreground/70">
                  {task.minTime}
                  {task.minTime !== task.maxTime ? `–${task.maxTime}` : ''}
                  <span className="text-xs ml-1">мин</span>
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Key rule */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-3xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-primary-foreground/20"
      >
        <h3 className="text-lg font-bold text-accent mb-3">⚙️ Золотое правило</h3>
        <p className="text-primary-foreground/80 leading-relaxed text-sm">
          Как только вы понимаете, что «идеальное время» упущено, вы официально объявляете: 
          <span className="block mt-2 font-semibold text-accent">
            «Система переходит в Режим {protocol.title}»
          </span>
          Это мгновенно убирает неопределенность и сохраняет контроль.
        </p>
      </motion.div>

      {/* Completion message */}
      {completedCount === tasks.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 text-center"
        >
          <p className="text-lg font-bold text-green-300">
            ✨ Все задачи завершены! Отличная работа!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
