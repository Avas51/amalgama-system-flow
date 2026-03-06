'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const blocks = [
  {
    emoji: "🌀",
    title: "Блок 1: Согласие и Потенциал",
    content: "Я забочусь о моем мире, а мой мир заботится обо мне. Мой сжатый потенциал плавно раскрывается, превращаясь в поток чистой созидательной энергии. Я выбираю благополучие как мой естественный и гармоничный путь. Мой мир обеспечивает мне абсолютный комфорт и надёжность."
  },
  {
    emoji: "👑",
    title: "Блок 2: Право на Владение",
    content: "Я — экстраординарная личность, создающая свою судьбу. Я позволяю себе иметь всё, что пожелаю, по праву моего намерения. Моя уверенность спокойна и непоколебима. Я достоин успеха, богатства и признания здесь и сейчас."
  },
  {
    emoji: "⚙️",
    title: "Блок 3: Профессиональная Реализация",
    content: "Я — востребованный специалист и успешный инженер-инноватор. Денежный поток течёт ко мне легко и непрерывно, обеспечивая процветание моей семьи. Мой мир крутится вокруг меня, предоставляя лучшие возможности для моих изобретений и проектов."
  },
  {
    emoji: "🌿",
    title: "Блок 4: Гармония и Регенерация",
    content: "Мой тыл надежен, мой дом — полная чаша. Гармония наполняет мою жизнь и мой дом. Я принимаю любовь и тепло с легкостью и благодарностью. Моё тело наполняется здоровьем, мой локоть восстанавливается, моя жизненная энергия растёт день ото дня."
  }
]

const instructions = [
  "Читайте амальгаму во время дыхательной гимнастики каждое утро",
  "Проговаривайте вслух для большей эффективности",
  "Фокусируйтесь на ощущениях в теле, а не на логике",
  "Позволяйте системе реагировать естественно"
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header Section */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-amber-500/20">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-teal-200 bg-clip-text text-transparent mb-4">
            Амальгама: Системный Поток
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Инженерный протокол управления энергией и сознанием
          </p>
          <Separator className="mt-8 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </header>

        {/* Main Content Blocks */}
        <main className="space-y-6">
          {blocks.map((block, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:bg-slate-900/70 hover:border-slate-700/50 transition-all duration-500 hover:shadow-lg hover:shadow-amber-500/5"
            >
              {/* Subtle gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <span className="text-2xl sm:text-3xl flex-shrink-0 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    {block.emoji}
                  </span>
                  <span className="text-slate-100 font-medium">
                    {block.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-slate-300 text-base sm:text-lg leading-relaxed italic pl-4 border-l-2 border-amber-500/30">
                  &ldquo;{block.content}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </main>

        {/* How to Use Section */}
        <section className="mt-12 sm:mt-16">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/50 border-amber-500/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-teal-500/5" />
            
            <CardHeader className="relative">
              <CardTitle className="text-xl sm:text-2xl text-center text-slate-100">
                <span className="mr-2">📋</span>
                Как использовать
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-4">
                {instructions.map((instruction, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300"
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                      ✓
                    </span>
                    <span className="text-slate-300 text-base sm:text-lg pt-1">
                      {instruction}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center">
          <Separator className="mb-8 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
          <p className="text-slate-500 text-sm">
            Практикуйте осознанно • Живите гармонично
          </p>
        </footer>
      </div>
    </div>
  )
}
