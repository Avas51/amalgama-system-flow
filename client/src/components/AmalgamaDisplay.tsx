import { motion } from 'framer-motion';
import { useState } from 'react';

const amalgamaBlocks = [
  {
    id: 1,
    title: 'Согласие и Потенциал',
    text: 'Я живу в согласии с собой и моим миром. Мой сжатый потенциал плавно раскрывается, превращаясь в поток чистой созидательной силы. Я выбираю благополучие как свой естественный и безопасный путь. Мой мир обеспечивает мой абсолютный комфорт и стабильность.',
    explanation: 'Этот блок устраняет внутренние конфликты. Мы признаем наличие огромной энергии (сжатого потенциала) и даем ей команду на безопасное раскрытие. Фраза «мой мир» утверждает вашу субъектность.',
    color: 'from-blue-500/20 to-blue-600/20',
    accentColor: '#3b82f6',
    icon: '🌀',
  },
  {
    id: 2,
    title: 'Право на Владение',
    text: 'Я — экстраординарная личность, создающая свою судьбу. Я позволяю себе иметь всё, что пожелаю, по праву своего намерения. Моя уверенность — это моё спокойное и естественное состояние. Я достоин успеха, богатства и признания здесь и сейчас.',
    explanation: 'Работа с «Судьей». Мы не просим разрешения, а констатируем право. Уверенность подается как естественный фон, что убирает необходимость в «откатах» после активности.',
    color: 'from-amber-500/20 to-amber-600/20',
    accentColor: '#fb923c',
    icon: '👑',
  },
  {
    id: 3,
    title: 'Профессиональная Реализация',
    text: 'Я — востребованный специалист и успешный инженер-инноватор. Денежный поток течет ко мне легко и постоянно, обеспечивая процветание моей семьи. Мой мир крутится вокруг меня, предоставляя лучшие возможности для моих изобретений и проектов.',
    explanation: 'Фокусировка на социальной роли. Мы связываем ваш инженерный талант с финансовым результатом и ставим вас в центр вашей профессиональной вселенной.',
    color: 'from-orange-500/20 to-orange-600/20',
    accentColor: '#f97316',
    icon: '⚙️',
  },
  {
    id: 4,
    title: 'Гармония и Регенерация',
    text: 'Мой тыл надежен, мой дом — полная чаша. Я живу в гармонии с собой и миром. Я принимаю любовь и тепло с легкостью и благодарностью. Моё тело наполняется здоровьем, мой локоть восстанавливается, моя жизненная энергия растет с каждым вдохом.',
    explanation: 'Блок заземления и восстановления. Мы легализуем получение тепла и направляем энергию на физическое исцеление.',
    color: 'from-green-500/20 to-green-600/20',
    accentColor: '#22c55e',
    icon: '🌿',
  },
];

export default function AmalgamaDisplay() {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

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
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-4xl font-bold text-primary-foreground mb-2">Амальгама</h2>
        <p className="text-primary-foreground/70 text-lg">
          Инженерный протокол настройки сознания
        </p>
      </motion.div>

      {/* Blocks */}
      <motion.div className="space-y-4" variants={containerVariants}>
        {amalgamaBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            variants={itemVariants}
            onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
            className={`p-6 rounded-3xl backdrop-blur-sm border-2 cursor-pointer transition-all duration-300 overflow-hidden group relative ${
              expandedBlock === block.id
                ? 'shadow-2xl'
                : 'shadow-lg hover:shadow-xl'
            }`}
            style={{
              borderColor: expandedBlock === block.id ? block.accentColor : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: expandedBlock === block.id ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Animated background glow */}
            {expandedBlock === block.id && (
              <motion.div
                layoutId={`glow-${block.id}`}
                className="absolute inset-0 opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${block.accentColor}33, transparent)`,
                }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Content */}
            <div className="relative z-10">
              {/* Header with icon and title */}
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  animate={{ scale: expandedBlock === block.id ? 1.3 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl flex-shrink-0"
                >
                  {block.icon}
                </motion.div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-1 transition-colors duration-300"
                    style={{
                      color: expandedBlock === block.id ? block.accentColor : '#c86432',
                    }}
                  >
                    {block.title}
                  </h3>
                  <p className="text-xs text-primary-foreground/50">Блок {block.id}</p>
                </div>
              </div>

              {/* Main text */}
              <motion.div
                animate={{
                  marginBottom: expandedBlock === block.id ? 16 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-primary-foreground leading-relaxed italic text-sm">
                  "{block.text}"
                </p>
              </motion.div>

              {/* Explanation - expands on click */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: expandedBlock === block.id ? 1 : 0,
                  height: expandedBlock === block.id ? 'auto' : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-primary-foreground/20">
                  <p className="text-xs text-primary-foreground/80 leading-relaxed">
                    <strong>Пояснение:</strong> {block.explanation}
                  </p>
                </div>
              </motion.div>

              {/* Click hint */}
              <motion.div
                animate={{ opacity: expandedBlock === block.id ? 0.5 : 0.3 }}
                className="mt-4 text-xs text-primary-foreground/50 text-right"
              >
                {expandedBlock === block.id ? '▼ Скрыть' : '▶ Подробнее'}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Instructions */}
      <motion.div
        variants={itemVariants}
        className="mt-8 p-6 rounded-3xl bg-card/20 border border-primary-foreground/20"
      >
        <h3 className="text-lg font-bold text-accent mb-3">Как использовать</h3>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li>✓ Читайте амальгаму во время дыхательной гимнастики каждое утро</li>
          <li>✓ Проговаривайте вслух для большей эффективности</li>
          <li>✓ Фокусируйтесь на ощущениях в теле, а не на логике</li>
          <li>✓ Позволяйте системе реагировать естественно</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
