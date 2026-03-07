import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import ModeSelector from '@/components/ModeSelector';
import GoldenRule from '@/components/GoldenRule';
import AmalgamaDisplay from '@/components/AmalgamaDisplay';
import ProtocolView from '@/components/ProtocolView';
import TaskTimer from '@/components/TaskTimer';

type Mode = 'alpha' | 'beta' | 'gamma';
type Tab = 'amalgama' | 'protocol';

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>('alpha');
  const [activeTab, setActiveTab] = useState<Tab>('amalgama');

  // Load state from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('amalgama-mode') as Mode | null;
    const savedTab = localStorage.getItem('amalgama-tab') as Tab | null;
    if (savedMode) setActiveMode(savedMode);
    if (savedTab) setActiveTab(savedTab);
  }, []);

  // Save mode to localStorage
  const handleModeChange = (mode: Mode) => {
    setActiveMode(mode);
    localStorage.setItem('amalgama-mode', mode);
  };

  // Save tab to localStorage
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('amalgama-tab', tab);
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-800 to-amber-700" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.3), transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Main container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - compact */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-primary-foreground/10"
        >
          <div className="container py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-accent">⚙️ Амальгама</h1>
              </div>
              <Link href="/statistics">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-xl bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors border border-accent/30"
                >
                  📊 Статистика
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 container py-4">
          {/* Tab switcher - compact, at top */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-2 mb-3"
          >
            {[
              { id: 'amalgama' as Tab, label: 'Амальгама', icon: '📖' },
              { id: 'protocol' as Tab, label: 'Протокол', icon: '📋' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 px-3 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                  activeTab === tab.id
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'bg-card/30 text-primary-foreground/80 hover:bg-card/50 border border-primary-foreground/10'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Mode selector - only show for protocol tab */}
          {activeTab === 'protocol' && (
            <>
              {/* Golden Rule - interactive, above mode cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-3"
              >
                <GoldenRule activeMode={activeMode} />
              </motion.div>
              
              {/* Mode cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mb-4"
              >
                <ModeSelector activeMode={activeMode} onModeChange={handleModeChange} />
              </motion.div>
            </>
          )}

          {/* Content area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {activeTab === 'amalgama' && (
              <motion.div
                key="amalgama"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AmalgamaDisplay />
              </motion.div>
            )}

            {activeTab === 'protocol' && (
              <motion.div
                key="protocol"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ProtocolView mode={activeMode} />
              </motion.div>
            )}
          </motion.div>
        </main>

        {/* Task Timer */}
        <TaskTimer taskName="Текущая задача" minTime={15} maxTime={60} />

        {/* Footer - compact */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-primary-foreground/10 backdrop-blur-md bg-background/30"
        >
          <div className="container py-4">
            <p className="text-xs text-primary-foreground/40 text-center">
              © 2026 Амальгама • Управление энергией и сознанием
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
