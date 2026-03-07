import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { subscribeToStats, DayStats } from '@/lib/statsService';

// Extended interface with missed flag
interface DayWithMissed extends DayStats {
  isMissed?: boolean;
}

// Get all dates between two dates
function getDatesBetween(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Monthly group component with collapsible days
function MonthlyGroup({ monthKey, days, missedDays }: { monthKey: string; days: DayWithMissed[]; missedDays: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  
  const [year, month] = monthKey.split('-');
  const monthName = monthNames[parseInt(month) - 1];
  
  // Calculate monthly average (only for active days)
  const activeDays = days.filter(d => !d.isMissed);
  const avgCompletion = activeDays.length > 0 
    ? Math.round(activeDays.reduce((sum, d) => sum + d.completionPercent, 0) / activeDays.length)
    : 0;

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
          <span>{activeDays.length} дн.</span>
          {missedDays > 0 && (
            <span className="text-red-400/70">−{missedDays}</span>
          )}
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
              className={`flex items-center gap-2 py-0.5 px-2 rounded transition-colors ${
                day.isMissed 
                  ? 'bg-red-500/5 hover:bg-red-500/10' 
                  : 'hover:bg-card/30'
              }`}
            >
              {/* Date */}
              <span className={`text-[10px] w-6 ${day.isMissed ? 'text-red-400/50' : 'text-primary-foreground/70'}`}>
                {new Date(day.date).getDate()}
              </span>
              
              {/* Mode badge or missed indicator */}
              {day.isMissed ? (
                <span className="w-3 h-3 rounded flex items-center justify-center text-[8px] bg-red-500/20 text-red-300/70">
                  −
                </span>
              ) : (
                <span className={`w-3 h-3 rounded flex items-center justify-center text-[9px] ${
                  day.mode === 'alpha' ? 'bg-blue-500/30 text-blue-200' :
                  day.mode === 'beta' ? 'bg-amber-500/30 text-amber-200' :
                  'bg-red-500/30 text-red-200'
                }`}>
                  {day.mode.charAt(0).toUpperCase()}
                </span>
              )}
              
              {/* Progress bar or empty line */}
              {day.isMissed ? (
                <div className="flex-1 h-px bg-red-500/20" />
              ) : (
                <div className="flex-1 h-px bg-card/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-secondary"
                    style={{ width: `${day.completionPercent}%` }}
                  />
                </div>
              )}
              
              {/* Tasks & percent or missed text */}
              {day.isMissed ? (
                <span className="text-[9px] text-red-400/50 w-16 text-right">
                  пропуск
                </span>
              ) : (
                <>
                  <span className="text-[9px] text-primary-foreground/50 w-10 text-right">
                    {day.completedTasks}/{day.totalTasks}
                  </span>
                  <span className="text-[10px] font-medium text-accent w-7 text-right">
                    {day.completionPercent}%
                  </span>
                </>
              )}
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
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Load stats from Firestore with real-time updates
  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to real-time updates from Firestore
    const unsubscribe = subscribeToStats((firestoreStats) => {
      if (firestoreStats.length > 0) {
        // Clean up duplicate entries - keep only one entry per day (the one with most completed tasks)
        const dayMap = new Map<string, DayStats>();
        firestoreStats.forEach((stat) => {
          const existing = dayMap.get(stat.date);
          if (!existing || stat.completedTasks > existing.completedTasks) {
            dayMap.set(stat.date, stat);
          }
        });
        
        setStats(Array.from(dayMap.values()));
      } else {
        // Fallback to localStorage if Firestore is empty
        const savedStats = localStorage.getItem('amalgama-stats');
        if (savedStats) {
          try {
            setStats(JSON.parse(savedStats));
          } catch (e) {
            console.error('Failed to parse stats:', e);
            setStats([]);
          }
        }
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Calculate missed days
  const getStatsWithMissedDays = (): DayWithMissed[] => {
    if (stats.length === 0) return [];
    
    // Find date range: from first stat to today
    const sortedDates = stats.map(s => s.date).sort();
    const firstDate = new Date(sortedDates[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allDatesInRange = getDatesBetween(firstDate, today);
    const statsDateSet = new Set(stats.map(s => s.date));
    
    const result: DayWithMissed[] = [];
    
    allDatesInRange.forEach(date => {
      if (statsDateSet.has(date)) {
        const stat = stats.find(s => s.date === date)!;
        result.push({ ...stat, isMissed: false });
      } else {
        // Add missed day
        result.push({
          date,
          mode: 'alpha',
          completedTasks: 0,
          totalTasks: 0,
          completionPercent: 0,
          updatedAt: Date.now(),
          isMissed: true,
        });
      }
    });
    
    return result;
  };

  const statsWithMissed = getStatsWithMissedDays();
  
  const filteredStats = selectedMode === 'all' 
    ? statsWithMissed 
    : statsWithMissed.filter(s => !s.isMissed && s.mode === selectedMode);

  const modeStats = {
    alpha: stats.filter(s => s.mode === 'alpha'),
    beta: stats.filter(s => s.mode === 'beta'),
    gamma: stats.filter(s => s.mode === 'gamma'),
  };
  
  const totalMissedDays = statsWithMissed.filter(s => s.isMissed).length;
  const totalActiveDays = stats.length;

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
      {/* Header with tabs */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl md:text-3xl font-bold text-accent mb-3">📊 Статистика</h2>
        {/* Tabs - same as on main page */}
        <div className="flex gap-2">
          {[
            { id: 'amalgama', label: 'Амальгама', icon: '📖' },
            { id: 'protocol', label: 'Протокол', icon: '📋' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => navigate('/')}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-3 py-2 rounded-xl font-medium transition-all duration-200 text-sm bg-card/30 text-primary-foreground/80 hover:bg-card/50 border border-primary-foreground/10"
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>
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

      {/* Missed days summary */}
      {totalMissedDays > 0 && (
        <motion.div
          variants={itemVariants}
          className="p-3 rounded-xl bg-red-500/10 border border-red-400/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span className="text-xs text-primary-foreground/70">Пропущено дней</span>
            </div>
            <span className="text-sm font-bold text-red-400">{totalMissedDays}</span>
          </div>
          <p className="text-[10px] text-primary-foreground/50 mt-1">
            {totalActiveDays} активных из {totalActiveDays + totalMissedDays} дней отслеживания
          </p>
        </motion.div>
      )}

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
              const groupedByMonth: { [key: string]: DayWithMissed[] } = {};
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
                  missedDays={groupedByMonth[monthKey].filter(d => d.isMissed).length}
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
