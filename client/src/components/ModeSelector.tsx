import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'alpha' | 'beta' | 'gamma';

interface ModeSelectorProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modes = [
  {
    id: 'alpha' as Mode,
    name: 'Альфа',
    subtitle: 'Идеальный',
    description: 'Подъём 4:00',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-400/30',
    icon: '⚡',
  },
  {
    id: 'beta' as Mode,
    name: 'Бета',
    subtitle: 'Адаптивный',
    description: 'Подъём 5:00–6:30',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-400/30',
    icon: '🌊',
  },
  {
    id: 'gamma' as Mode,
    name: 'Гамма',
    subtitle: 'Кризисный',
    description: 'Подъём 7:00+',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-400/30',
    icon: '🔥',
  },
];

export default function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-primary-foreground/60 mb-2">Режим</h2>
      
      {/* Compact cards in a row */}
      <div className="grid grid-cols-3 gap-1.5">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2 rounded-xl transition-all duration-200 text-center ${
              activeMode === mode.id
                ? `${mode.bgColor} ${mode.borderColor} border`
                : 'bg-card/20 border border-primary-foreground/10 hover:bg-card/30'
            }`}
          >
            {/* Icon */}
            <motion.div
              animate={{ scale: activeMode === mode.id ? 1.1 : 1 }}
              className="text-lg mb-0.5"
            >
              {mode.icon}
            </motion.div>
            
            {/* Name */}
            <h3 className={`text-xs font-semibold ${
              activeMode === mode.id ? 'text-accent' : 'text-primary-foreground/70'
            }`}>
              {mode.name}
            </h3>
            
            {/* Subtitle */}
            <p className="text-[10px] text-primary-foreground/50">{mode.subtitle}</p>
            
            {/* Active indicator */}
            {activeMode === mode.id && (
              <motion.div
                layoutId="activeModeIndicator"
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Info - compact */}
      <p className="text-[10px] text-primary-foreground/40 text-center">
        💡 Выберите режим по времени пробуждения
      </p>
    </div>
  );
}
