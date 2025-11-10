'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface PrimaryActionButtonProps {
  onClick: () => void
  children: ReactNode
  color: string
  className?: string
}

export default function PrimaryActionButton({ onClick, children, color, className = '' }: PrimaryActionButtonProps) {
  const [isAtTop, setIsAtTop] = useState(true)
  const { scrollY } = useScroll()

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsAtTop(scrollTop < 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-4"
      style={{
        background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 60%, transparent 100%)'
      }}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isAtTop ? 0 : 80,
        opacity: isAtTop ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <motion.button
        onClick={onClick}
        className={`w-full text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg ${className}`}
        style={{
          backgroundImage: `linear-gradient(to bottom, ${color}, ${color}dd)`
        }}
        whileHover={{ scale: 1.02, boxShadow: '0px 12px 20px 0px rgba(0,0,0,0.2)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.button>
    </motion.div>
  )
}
