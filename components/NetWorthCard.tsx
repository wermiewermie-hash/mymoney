'use client'

import { motion } from 'framer-motion'
import CurrencyDisplay from './CurrencyDisplay'

interface NetWorthCardProps {
  totalNetWorth: number
  assetCount: number
}

export default function NetWorthCard({ totalNetWorth, assetCount }: NetWorthCardProps) {
  // Sparkle positions - arranged around the card
  const sparkles = [
    { top: '10%', left: '5%', delay: 0, duration: 2.8, scale: 1.15 },
    { top: '15%', left: '90%', delay: 0.2, duration: 3.2, scale: 1.1 },
    { top: '30%', left: '8%', delay: 0.4, duration: 2.5, scale: 1.2 },
    { top: '35%', left: '88%', delay: 0.6, duration: 3.5, scale: 1.12 },
    { top: '50%', left: '3%', delay: 0.8, duration: 2.9, scale: 1.18 },
    { top: '55%', left: '95%', delay: 1.0, duration: 3.1, scale: 1.08 },
    { top: '70%', left: '10%', delay: 1.2, duration: 2.7, scale: 1.14 },
    { top: '75%', left: '85%', delay: 1.4, duration: 3.3, scale: 1.16 },
    { top: '88%', left: '15%', delay: 1.6, duration: 2.6, scale: 1.11 },
    { top: '92%', left: '80%', delay: 1.8, duration: 3.4, scale: 1.13 },
  ]

  return (
    <div className="kids-card overflow-hidden">
      {/* Sparkles */}
      {sparkles.map((sparkle, index) => (
        <motion.div
          key={index}
          className="absolute text-[#FFC107] text-lg pointer-events-none z-[1]"
          style={{
            top: sparkle.top,
            left: sparkle.left,
          }}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, sparkle.scale, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Card Content */}
      <div className="text-center mb-6 relative z-10">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FF9933] rounded-full mb-4 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
        >
          <span className="text-3xl">💰</span>
        </motion.div>
        <h2 className="text-[#5C4033] mb-2">Total Net Worth</h2>
        <motion.div
          className="text-5xl text-[#5C4033] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <CurrencyDisplay amount={totalNetWorth} />
        </motion.div>
        <p className="text-[#8B7355]">
          {assetCount} asset{assetCount !== 1 ? 's' : ''} tracked
        </p>
      </div>
    </div>
  )
}
