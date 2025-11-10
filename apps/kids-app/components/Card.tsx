'use client'

import { motion, MotionProps } from 'motion/react'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  noPadding?: boolean
  onViewportEnter?: () => void
  viewport?: MotionProps['viewport']
}

export default function Card({ children, onClick, className = '', noPadding = false, onViewportEnter, viewport }: CardProps) {
  const baseStyles = `rounded-[24px] ${noPadding ? '' : 'p-[24px]'} border-[0.5px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] ${className}`
  const backgroundGradient = 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)'

  // If onClick is provided, make it tappable with hover and tap animations
  if (onClick) {
    return (
      <motion.div
        className={`${baseStyles} cursor-pointer`}
        style={{ backgroundImage: backgroundGradient }}
        onClick={onClick}
        whileHover={{
          scale: 1.005,
          boxShadow: '0px 10px 12px 0px rgba(0,0,0,0.16)'
        }}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.2 }}
        onViewportEnter={onViewportEnter}
        viewport={viewport}
      >
        {children}
      </motion.div>
    )
  }

  // Non-tappable card (no animations)
  return (
    <div
      className={baseStyles}
      style={{ backgroundImage: backgroundGradient }}
    >
      {children}
    </div>
  )
}
