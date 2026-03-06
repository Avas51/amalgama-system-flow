import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface DayStats {
  date: string;
  mode: 'alpha' | 'beta' | 'gamma';
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
}

// Monthly group component with collapsible days
function MonthlyGroup({ monthKey, days }: { monthKey: string; days: DayStats[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  
  const [year, month] = monthKey.split('-');
  const monthName = monthNames[parseInt(month) - 1];
  
  // Calculate monthly average
  const avgCompletion = Math.round(days.reduce((sum, d) => sum + d.completionPercent, 0) / days.length);
  const totalCompleted = days.reduce((sum, d) => sum + d.completedTasks, 0);
  const totalTasks = days.reduce((sum, d) => sum + d.totalTasks, 0);
  
  // Count modes
  const modeCounts = {
    alpha: days.filter(d => d.mode === 'alpha').length,
    beta: days.filter(d => d.mode === 'beta').length,
    gamma: days.filter(d => d.mode === 'gamma').length,
  };

  return (
    <div className="rounded-lg bg-card/20 border border-primary-foreground/10 overflow-hidden">
      {/* Month header - clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 hover:bg-card/30 transition-colors"
      >
        {/* Expand icon */}
        <span className={`text-xs text-primary-foreground/50 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
          ▶
        </span>
        
        {/* Month name */}
        <span className="text-sm font-medium text-primary-foreground flex-1 text-left">
          {monthName} {year}
        </span>
        
        {/* Stats summary */}
        <div className="flex items-center gap-3 text-xs text-primary-foreground/60">
          <span>{days.length} дн.</span>
          <span className="text-accent font-medium">{avgCompletion}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-20 h-1 bg-card/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-secondary"
            style={{ width: `${avgCompletion}%` }}
          />
        </div>
      </button>
      
      {/* Days list - collapsible */}
      {isOpen && (
        <div className="border-t border-primary-foreground/5 px-2 py-1 space-y-0.5">
          {days.slice().reverse().map((day) => (
            <div
              key={day.date}
              className="flex items-center gap-2 py-1 px-2 rounded hover:bg-card/30 transition-colors"
            >
              {/* Date */}
              <span className="text-xs text-primary-foreground/70 w-8">
                {new Date(day.date).getDate()}
              </span>
              
              {/* Mode badge */}
              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                day.mode === 'alpha' ? 'bg-blue-500/30 text-blue-200' :
                day.mode === 'beta' ? 'bg-amber-500/30 text-amber-200' :
                'bg-red-500/30 text-red-200'
              }`}>
                {day.mode.charAt(0).toUpperCase()}
              </span>
              
              {/* Progress bar */}
              <div className="flex-1 h-1 bg-card/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-secondary"
                  style={{ width: `${day.completionPercent}%` }}
                />
              </div>
              
              {/* Tasks & percent */}
              <span className="text-[10px] text-primary-foreground/50 w-12 text-right">
                {day.completedTasks}/{day.totalTasks}
              </span>
              <span className="text-xs font-medium text-accent w-8 text-right">
                {day.completionPercent}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Statistics() {
  const [stats, setStats] = useState<DayStats[]>([]);
  const [selectedMode, setSelectedMode] = useState<'all' | 'alpha' | 'beta' | 'gamma'>('all');

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('amalgama-stats');
    if (savedStats) {
      try {
        let parsedStats = JSON.parse(savedStats);
        
        // Clean up duplicate entries - keep only one entry per day (the one with most completed tasks)
        const dayMap = new Map<string, DayStats>();
        parsedStats.forEach((stat: DayStats) => {
          const existing = dayMap.get(stat.date);
          if (!existing || stat.completedTasks > existing.completedTasks) {
            dayMap.set(stat.date, stat);
          }
        });
        
        const cleanedStats = Array.from(dayMap.values());
        
        // Save cleaned stats back to localStorage if there were duplicates
        if (cleanedStats.length !== parsedStats.length) {
          localStorage.setItem('amalgama-stats', JSON.stringify(cleanedStats));
        }
        
        setStats(cleanedStats);
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
        staggerChildren: 0.05,
        delayChildren: 0.1,
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
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with back button - compact */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-accent">📊 Статистика</h2>
        </div>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="sm"
        >
          ← Назад
        </Button>
      </motion.div>

      {/* Mode filter - compact */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Все', icon: '📊' },
          { id: 'alpha', label: 'Альфа', icon: '⚡' },
          { id: 'beta', label: 'Бета', icon: '🌊' },
          { id: 'gamma', label: 'Гамма', icon: '🔥' },
        ].map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id as any)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap text-sm ${
              selectedMode === mode.id
                ? 'bg-accent text-accent-foreground shadow-md'
                : 'bg-card/30 text-primary-foreground/80 hover:bg-card/50 border border-primary-foreground/10'
            }`}
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Summary cards - compact inline */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-3 gap-2"
      >
        {[
          {
            title: 'Альфа',
            icon: '⚡',
            borderColor: 'border-blue-400/30',
            bgColor: 'bg-blue-500/10',
            stats: modeStats.alpha,
          },
          {
            title: 'Бета',
            icon: '🌊',
            borderColor: 'border-amber-400/30',
            bgColor: 'bg-amber-500/10',
            stats: modeStats.beta,
          },
          {
            title: 'Гамма',
            icon: '🔥',
            borderColor: 'border-red-400/30',
            bgColor: 'bg-red-500/10',
            stats: modeStats.gamma,
          },
        ].map((mode) => (
          <motion.div
            key={mode.title}
            variants={itemVariants}
            className={`p-3 rounded-xl ${mode.bgColor} border ${mode.borderColor}`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-lg">{mode.icon}</span>
              <h3 className="text-sm font-semibold text-accent">{mode.title}</h3>
            </div>
            <div className="space-y-0.5 text-xs text-primary-foreground/70">
              <p>Дней: <span className="font-bold text-accent">{mode.stats.length}</span></p>
              <p>Среднее: <span className="font-bold text-accent">{calculateAverageCompletion(mode.stats)}%</span></p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily stats chart - compact with monthly grouping */}
      {filteredStats.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-card/30 border border-primary-foreground/10"
        >
          <h3 className="text-base font-semibold text-accent mb-3">История выполнения</h3>
          <div className="space-y-2">
            {(() => {
              // Group stats by month
              const groupedByMonth: { [key: string]: DayStats[] } = {};
              filteredStats.forEach(day => {
                const date = new Date(day.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!groupedByMonth[monthKey]) {
                  groupedByMonth[monthKey] = [];
                }
                groupedByMonth[monthKey].push(day);
              });

              // Sort months descending
              const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

              return sortedMonths.map(monthKey => (
                <MonthlyGroup 
                  key={monthKey} 
                  monthKey={monthKey} 
                  days={groupedByMonth[monthKey]} 
                />
              ));
            })()}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl bg-card/30 border border-primary-foreground/10 text-center"
        >
          <p className="text-sm text-primary-foreground/60">
            📊 Нет данных. Начните отслеживать прогресс!
          </p>
        </motion.div>
      )}

      {/* Tips - compact */}
      <motion.div
        variants={itemVariants}
        className="p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-accent/10 border border-primary-foreground/10"
      >
        <h3 className="text-sm font-semibold text-accent mb-2">💡 Советы</h3>
        <ul className="space-y-0.5 text-xs text-primary-foreground/70">
          <li>✓ Отслеживайте, какой режим работает лучше</li>
          <li>✓ Анализируйте паттерны успеха</li>
          <li>✓ Прогресс важнее совершенства</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
