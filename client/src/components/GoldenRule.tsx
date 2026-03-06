import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

type Mode = 'alpha' | 'beta' | 'gamma';

interface GoldenRuleProps {
  activeMode: Mode;
}

const modeInfo = {
  alpha: {
    title: 'АЛЬФА',
    time: '4:00',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-400/30',
    ruleText: 'Время не упущено, всё как и планировалось. Неопределённости нет.',
    isPositive: true,
  },
  beta: {
    title: 'БЕТА',
    time: '5:00–6:30',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-400/30',
    ruleText: 'Идеальное время упущено — официально объявите переход в этот режим.',
    isPositive: false,
  },
  gamma: {
    title: 'ГАММА',
    time: '7:00+',
    color: 'text-red-300',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-400/30',
    ruleText: 'Кризисный режим — официально объявите переход и действуйте.',
    isPositive: false,
  },
};

export default function GoldenRule({ activeMode }: GoldenRuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const current = modeInfo[activeMode];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3"
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-3 rounded-xl ${current.bgColor} border ${current.borderColor} transition-all duration-200 text-left`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-semibold text-accent">Золотое правило</span>
          </div>
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-xs text-primary-foreground/50"
          >
            ▶
          </motion.span>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-primary-foreground/10">
                <motion.div
                  key={activeMode}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-lg ${current.bgColor} border ${current.borderColor} text-center`}
                >
                  <span className={`text-sm font-bold ${current.color}`}>
                    {current.ruleText}
                  </span>
                </motion.div>
                {!current.isPositive && (
                  <p className="text-[10px] text-primary-foreground/50 mt-2 text-center">
                    Это мгновенно убирает неопределённость и сохраняет контроль
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
