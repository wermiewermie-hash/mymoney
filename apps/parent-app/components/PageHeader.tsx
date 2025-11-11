'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  buttonColor: string
}

export default function PageHeader({ title, leftAction, rightAction, buttonColor }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-9">
      {leftAction || <div className="w-10" />}
      <h1 className="text-white font-lora font-semibold text-2xl leading-8">{title}</h1>
      {rightAction || <div className="w-10" />}
    </div>
  )
}

interface HeaderButtonProps {
  onClick?: () => void
  children: ReactNode
  color: string
  className?: string
}

export function HeaderButton({ onClick, children, color, className = '' }: HeaderButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`rounded-full text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] size-[36px] p-0 flex items-center justify-center ${className}`}
      style={{ backgroundColor: color }}
      whileHover={{ opacity: 0.9 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  )
}
