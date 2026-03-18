import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { formatCurrency } from '../../lib/utils'

interface NumberTickerProps {
  value: number
  className?: string
  style?: React.CSSProperties
}

export function NumberTicker({ value, className = '', style }: NumberTickerProps) {
  const spring = useSpring(0, { mass: 1, bounce: 0, stiffness: 150, damping: 30 })
  const formatted = useTransform(spring, (val) => formatCurrency(val))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className} style={style}>{formatted}</motion.span>
}
