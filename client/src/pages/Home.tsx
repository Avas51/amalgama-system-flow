import { useState } from 'react';
import { motion } from 'framer-motion';
import ModeSelector from '@/components/ModeSelector';
import AmalgamaDisplay from '@/components/AmalgamaDisplay';
import ProtocolView from '@/components/ProtocolView';

type Mode = 'alpha' | 'beta' | 'gamma';
type Tab = 'amalgama' | 'protocol';

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>('alpha');
  const [activeTab, setActiveTab] = useState<Tab>('amalgama');

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-primary-foreground/10"
        >
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-accent">
                  ⚙️ Амальгама
                </h1>
                <p className="text-sm text-primary-foreground/70 mt-1">
                  Инженерный протокол управления энергией и сознанием
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 container py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left column: Mode selector */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1 order-2 lg:order-1"
            >
              <div className="sticky top-20 lg:top-24">
                <ModeSelector activeMode={activeMode} onModeChange={setActiveMode} />
              </div>
            </motion.aside>

            {/* Right column: Content area */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 order-1 lg:order-2"
            >
              {/* Tab switcher */}
              <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 overflow-x-auto">
                {[
                  { id: 'amalgama' as Tab, label: '✨ Амальгама', icon: '📖' },
                  { id: 'protocol' as Tab, label: '⏱️ Протокол', icon: '📋' },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap text-sm md:text-base ${
                      activeTab === tab.id
                        ? 'bg-accent text-accent-foreground shadow-lg'
                        : 'bg-card/30 text-primary-foreground hover:bg-card/50 border border-primary-foreground/20'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Content area with animation */}
              <div className="relative">
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
              </div>
            </motion.section>
          </div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 border-t border-primary-foreground/10 backdrop-blur-md bg-background/30"
        >
          <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div>
                <h3 className="font-bold text-accent mb-2">О системе</h3>
                <p className="text-sm text-primary-foreground/70">
                  Амальгама — это инженерный протокол для управления энергией, сознанием и достижением целей через структурированные режимы дня.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-2">Ключевые принципы</h3>
                <ul className="text-sm text-primary-foreground/70 space-y-1">
                  <li>✓ Гибкость в рамках структуры</li>
                  <li>✓ Управление энергией, а не временем</li>
                  <li>✓ Признание реальности и потенциала</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-2">Как использовать</h3>
                <p className="text-sm text-primary-foreground/70">
                  Выберите режим в зависимости от времени пробуждения, читайте амальгаму во время зарядки и отмечайте выполненные задачи в протоколе.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center">
              <p className="text-xs text-primary-foreground/50">
                © 2026 Амальгама Системный Поток • Версия 2.2
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
