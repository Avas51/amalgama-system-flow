import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'wouter';
import { Button } from '@/components/ui/button';

interface DayStats {
  date: string;
  mode: 'alpha' | 'beta' | 'gamma';
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
}

export default function Statistics() {
  const router = useRouter();
  const [stats, setStats] = useState<DayStats[]>([]);
  const [selectedMode, setSelectedMode] = useState<'all' | 'alpha' | 'beta' | 'gamma'>('all');

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('amalgama-stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to parse stats:', e);
      }
    }
  }, []);

  const filteredStats = selectedMode === 'all' 
    ? stats 
    : stats.filter(s => s.mode === selectedMode);

  const modeStats = {
    alpha: stats.filter(s => s.mode === 'alpha'),
    beta: stats.filter(s => s.mode === 'beta'),
    gamma: stats.filter(s => s.mode === 'gamma'),
  };

  const calculateAverageCompletion = (modeStats: DayStats[]) => {
    if (modeStats.length === 0) return 0;
    const total = modeStats.reduce((sum, s) => sum + s.completionPercent, 0);
    return Math.round(total / modeStats.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with back button */}
      <motion.div variants={itemVariants} className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-accent mb-2">Статистика</h2>
          <p className="text-base md:text-lg text-primary-foreground/70">
            Отслеживайте ваш прогресс и успешные паттерны
          </p>
        </div>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="mt-2"
        >
          ← Назад
        </Button>
      </motion.div>

      {/* Mode filter */}
      <motion.div variants={itemVariants} className="flex gap-2 md:gap-4 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Все режимы', icon: '📊' },
          { id: 'alpha', label: 'Альфа', icon: '⚡' },
          { id: 'beta', label: 'Бета', icon: '🌊' },
          { id: 'gamma', label: 'Гамма', icon: '🔥' },
        ].map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap text-sm md:text-base ${
              selectedMode === mode.id
                ? 'bg-accent text-accent-foreground shadow-lg'
                : 'bg-card/30 text-primary-foreground hover:bg-card/50 border border-primary-foreground/20'
            }`}
          >
            <span className="mr-2">{mode.icon}</span>
            {mode.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Summary cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        {[
          {
            title: 'Альфа',
            icon: '⚡',
            color: 'from-blue-500/20 to-blue-600/20',
            borderColor: 'border-blue-400/30',
            stats: modeStats.alpha,
          },
          {
            title: 'Бета',
            icon: '🌊',
            color: 'from-amber-500/20 to-amber-600/20',
            borderColor: 'border-amber-400/30',
            stats: modeStats.beta,
          },
          {
            title: 'Гамма',
            icon: '🔥',
            color: 'from-red-500/20 to-red-600/20',
            borderColor: 'border-red-400/30',
            stats: modeStats.gamma,
          },
        ].map((mode) => (
          <motion.div
            key={mode.title}
            variants={itemVariants}
            className={`p-6 md:p-8 rounded-3xl bg-gradient-to-br ${mode.color} border ${mode.borderColor}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{mode.icon}</span>
              <h3 className="text-xl md:text-2xl font-bold text-accent">{mode.title}</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm md:text-base text-primary-foreground/70">
                Дней использовано: <span className="font-bold text-accent">{mode.stats.length}</span>
              </p>
              <p className="text-sm md:text-base text-primary-foreground/70">
                Среднее выполнение: <span className="font-bold text-accent">{calculateAverageCompletion(mode.stats)}%</span>
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily stats chart */}
      {filteredStats.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className="p-6 md:p-8 rounded-3xl bg-card/30 border border-primary-foreground/20"
        >
          <h3 className="text-xl md:text-2xl font-bold text-accent mb-6">История выполнения</h3>
          <div className="space-y-3">
            {filteredStats.slice().reverse().map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card/40 hover:bg-card/60 transition-colors"
              >
                {/* Date */}
                <div className="flex-shrink-0 w-24">
                  <p className="text-sm md:text-base font-semibold text-primary-foreground">
                    {new Date(day.date).toLocaleDateString('ru-RU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Mode badge */}
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    day.mode === 'alpha' ? 'bg-blue-500/30 text-blue-200' :
                    day.mode === 'beta' ? 'bg-amber-500/30 text-amber-200' :
                    'bg-red-500/30 text-red-200'
                  }`}>
                    {day.mode.toUpperCase()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-card/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${day.completionPercent}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-accent to-secondary"
                      />
                    </div>
                    <span className="text-sm font-mono text-primary-foreground/70">
                      {day.completedTasks}/{day.totalTasks}
                    </span>
                  </div>
                </div>

                {/* Percentage */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg md:text-xl font-bold text-accent">
                    {day.completionPercent}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="p-8 md:p-12 rounded-3xl bg-card/30 border border-primary-foreground/20 text-center"
        >
          <p className="text-base md:text-lg text-primary-foreground/70">
            📊 Нет данных для отображения. Начните отслеживать ваш прогресс!
          </p>
        </motion.div>
      )}

      {/* Tips */}
      <motion.div
        variants={itemVariants}
        className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-primary-foreground/20"
      >
        <h3 className="text-xl md:text-2xl font-bold text-accent mb-4">💡 Советы</h3>
        <ul className="space-y-2 text-base md:text-lg text-primary-foreground/80">
          <li>✓ Отслеживайте, какой режим работает лучше всего для вас</li>
          <li>✓ Анализируйте паттерны успеха и неудач</li>
          <li>✓ Используйте эту информацию для оптимизации вашего расписания</li>
          <li>✓ Помните: прогресс важнее совершенства</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
