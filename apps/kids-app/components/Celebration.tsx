'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Card from '@/components/Card'

interface CelebrationProps {
  message?: string
  description?: string
}

export default function Celebration({
  message = "Great job!",
  description = "You've added a new asset!"
}: CelebrationProps) {
  const router = useRouter()
  const [confetti, setConfetti] = useState<Array<{
    id: number
    emoji: string
    x: number
    y: number
    rotation: number
    delay: number
    duration: number
    color?: string
  }>>([])

  useEffect(() => {
    // Generate confetti particles
    const particles = []
    const emojis = ['⭐', '✨', '🌟', '💫']
    const colors = ['#FFC107', '#FF9933', '#52C41A', '#00BCD4']

    for (let i = 0; i < 40; i++) {
      const isEmoji = Math.random() > 0.5
      particles.push({
        id: i,
        emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : '●',
        x: Math.random() * 100,
        y: -20 - Math.random() * 20,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: !isEmoji ? colors[Math.floor(Math.random() * colors.length)] : undefined,
      })
    }
    setConfetti(particles)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-2xl pointer-events-none"
          style={{
            left: `${particle.x}%`,
            color: particle.color,
          }}
          initial={{
            y: particle.y,
            opacity: 1,
            rotate: particle.rotation,
          }}
          animate={{
            y: '120vh',
            opacity: [1, 1, 0.5, 0],
            rotate: particle.rotation + 360,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn',
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Celebration Card */}
      <Card className="text-center max-w-md w-full relative z-10">
        <motion.div
          className="text-8xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            times: [0, 0.6, 1],
          }}
        >
          🎉
        </motion.div>

        <motion.h1
          className="text-3xl text-[#5C4033] mb-3 font-semibold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {message}
        </motion.h1>

        <motion.p
          className="text-[#8B7355] mb-8 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {description}
        </motion.p>

        <motion.button
          className="kids-button kids-button-green w-full text-lg py-4"
          onClick={() => router.push('/dashboard')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Go to Dashboard
        </motion.button>
      </Card>
    </div>
  )
}
