import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TaskTimerProps {
  taskName: string;
  minTime: number;
  maxTime: number;
  onComplete?: () => void;
}

export default function TaskTimer({ taskName, minTime, maxTime, onComplete }: TaskTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTime, setSelectedTime] = useState(minTime);
  const [timeLeft, setTimeLeft] = useState(selectedTime * 60);
  const [totalTime, setTotalTime] = useState(selectedTime * 60);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play notification sound
            playNotification();
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const playNotification = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedTime * 60);
    setTotalTime(selectedTime * 60);
  };

  const handleTimeChange = (minutes: number) => {
    if (!isRunning) {
      setSelectedTime(minutes);
      setTimeLeft(minutes * 60);
      setTotalTime(minutes * 60);
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary shadow-lg flex items-center justify-center text-white font-bold text-lg hover:shadow-xl transition-shadow"
      >
        <span>⏱️</span>
      </motion.button>

      {/* Timer panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-20 right-0 w-80 bg-gradient-to-br from-card to-card/80 border border-primary-foreground/20 rounded-3xl shadow-2xl p-6 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-accent">Таймер задачи</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Task name */}
          <p className="text-sm text-primary-foreground/70 mb-4 truncate">
            {taskName}
          </p>

          {/* Time display */}
          <div className="text-center mb-6">
            <motion.div
              key={timeLeft}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-accent font-mono"
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-card/50 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-accent to-secondary"
            />
          </div>

          {/* Time range selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[minTime, Math.ceil((minTime + maxTime) / 2), maxTime].map((time) => (
              <motion.button
                key={time}
                onClick={() => handleTimeChange(time)}
                disabled={isRunning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedTime === time
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'bg-card/50 text-primary-foreground hover:bg-card/70 border border-primary-foreground/20'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {time} мин
              </motion.button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!isRunning ? (
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                ▶ Старт
              </motion.button>
            ) : (
              <motion.button
                onClick={handlePause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                ⏸ Пауза
              </motion.button>
            )}
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 bg-card/50 text-primary-foreground border border-primary-foreground/20 rounded-lg font-semibold hover:bg-card/70 transition-colors"
            >
              ↻
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
