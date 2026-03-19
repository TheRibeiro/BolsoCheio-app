import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useAnimationControls } from 'framer-motion'
import { formatCurrency } from '../../lib/utils'

interface NumberTickerProps {
  value: number
  className?: string
  style?: React.CSSProperties
}

export function NumberTicker({ value, className = '', style }: NumberTickerProps) {
  const spring = useSpring(0, { mass: 1, bounce: 0, stiffness: 150, damping: 30 })
  const formatted = useTransform(spring, (val) => formatCurrency(val))
  const controls = useAnimationControls()
  const prevValue = useRef(value)

  useEffect(() => {
    spring.set(value)

    // Gravity drop animation when value changes
    if (prevValue.current !== value && prevValue.current !== 0) {
      controls.start({
        y: [0, -5, 0, 2, 0],
        transition: { duration: 0.35, times: [0, 0.2, 0.55, 0.8, 1], ease: 'easeOut' },
      })
    }
    prevValue.current = value
  }, [spring, value, controls])

  return (
    <motion.span className={className} style={style} animate={controls}>
      {formatted}
    </motion.span>
  )
}
