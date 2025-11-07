'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WelcomeCarouselProps {
  onDismiss: () => void
}

const slides = [
  {
    title: 'Keep track of your money',
    emoji: '💰',
    description: 'See all your money in one place',
    gradient: 'from-[#FF9966] to-[#FFD93D]'
  },
  {
    title: 'Save towards goals',
    emoji: '🎯',
    description: 'Set goals and watch your progress',
    gradient: 'from-[#52C41A] to-[#389E0D]'
  },
  {
    title: 'See your money grow',
    emoji: '📈',
    description: 'Track your net worth over time',
    gradient: 'from-[#00BCD4] to-[#0097A7]'
  }
]

export default function WelcomeCarousel({ onDismiss }: WelcomeCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3500) // Auto-rotate every 3.5 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#FF4E8D] via-[#FF9966] to-[#FFD93D] p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Illustration Circle */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`w-64 h-64 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-full flex items-center justify-center shadow-2xl mb-8`}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                className="text-8xl"
              >
                {slides[currentSlide].emoji}
              </motion.span>
            </motion.div>

            {/* Content Card */}
            <div className="kids-card text-center mb-8 w-full">
              <h2 className="text-[#5C4033] mb-3 text-2xl">
                {slides[currentSlide].title}
              </h2>
              <p className="text-[#8B7355] text-lg">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex gap-2 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Get Started Button */}
            <button
              onClick={onDismiss}
              className="w-full bg-white text-[#5C4033] font-bold py-4 px-8 rounded-2xl transition-all text-lg shadow-xl hover:shadow-2xl active:scale-95"
            >
              Get Started
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
