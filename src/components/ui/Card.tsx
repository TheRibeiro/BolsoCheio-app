import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'hero'
}

const springTransition = {
  type: 'spring' as const,
  mass: 1,
  stiffness: 400,
  damping: 30,
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        whileTap={{ scale: 0.98 }}
        className={`rounded-2xl p-5 hero-card ${className}`}
      >
        <div className="relative z-10">{children}</div>
      </motion.div>
    )
  }

  const variantClasses = variant === 'elevated' ? 'card-elevated' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl p-4 ${variantClasses} ${className}`}
      style={{
        backgroundColor: variant === 'outlined' ? 'transparent' : 'var(--bg-card)',
        backdropFilter: variant === 'outlined' ? 'none' : 'blur(24px)',
        WebkitBackdropFilter: variant === 'outlined' ? 'none' : 'blur(24px)',
        border: variant === 'elevated' ? undefined : '1px solid var(--border-color)',
        boxShadow: variant === 'elevated' ? undefined : '0 2px 16px var(--shadow-color)',
      }}
    >
      {children}
    </motion.div>
  )
}
