import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'alpha' | 'beta' | 'gamma';

interface ModeSelectorProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modes = [
  {
    id: 'alpha' as Mode,
    name: 'АЛЬФА',
    subtitle: 'Идеальный режим',
    description: 'Подъем в 4:00. Полный цикл развития.',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    icon: '⚡',
  },
  {
    id: 'beta' as Mode,
    name: 'БЕТА',
    subtitle: 'Адаптивный режим',
    description: 'Подъем 5:00–6:30. Сокращенный цикл.',
    color: 'from-amber-400 to-amber-600',
    bgColor: 'rgba(251, 146, 60, 0.1)',
    borderColor: 'rgba(251, 146, 60, 0.3)',
    icon: '🌊',
  },
  {
    id: 'gamma' as Mode,
    name: 'ГАММА',
    subtitle: 'Кризисный режим',
    description: 'Подъем после 7:00. Минимальный цикл.',
    color: 'from-red-400 to-red-600',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    icon: '🔥',
  },
];

export default function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Режимы</h2>
      
      <AnimatePresence>
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`relative w-full p-6 rounded-3xl transition-all duration-300 text-left overflow-hidden group ${
              activeMode === mode.id
                ? 'shadow-2xl'
                : 'hover:shadow-lg'
            }`}
            style={{
              backgroundColor: activeMode === mode.id ? mode.bgColor : 'rgba(255, 255, 255, 0.05)',
              borderColor: activeMode === mode.id ? mode.borderColor : 'rgba(255, 255, 255, 0.1)',
              borderWidth: '2px',
            }}
          >
            {/* Background gradient for active state */}
            {activeMode === mode.id && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${mode.color})`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-start gap-4">
              <motion.div
                animate={{ scale: activeMode === mode.id ? 1.2 : 1 }}
                className="text-4xl flex-shrink-0"
              >
                {mode.icon}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-accent mb-1">{mode.name}</h3>
                <p className="text-base md:text-lg text-primary-foreground/70 mb-2">{mode.subtitle}</p>
                <p className="text-sm md:text-base text-primary-foreground/60">{mode.description}</p>
              </div>
            </div>

            {/* Active indicator dot with glow */}
            {activeMode === mode.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute right-6 top-1/2 transform -translate-y-1/2"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 w-4 h-4 bg-accent rounded-full blur-md"
                  />
                  <div className="w-4 h-4 bg-accent rounded-full" />
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 md:p-6 rounded-2xl bg-card/20 border border-primary-foreground/20"
      >
        <p className="text-sm md:text-base text-primary-foreground/60 leading-relaxed">
          💡 <strong>Совет:</strong> Выберите режим в зависимости от времени пробуждения. Система автоматически адаптирует протокол.
        </p>
      </motion.div>
    </div>
  );
}
