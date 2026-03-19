import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface PocketGaugeProps {
  /** 0-100: how full the pocket is (remaining budget %) */
  percentage: number
}

export function PocketGauge({ percentage }: PocketGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percentage))

  // SVG dimensions
  const w = 96
  const h = 56
  const cx = w / 2
  const cy = h - 2
  const r = 38
  const stroke = 6

  // Semicircle path (left→right over top)
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`
  const arcLen = Math.PI * r

  // Animated dash offset
  const spring = useSpring(0, { stiffness: 50, damping: 18 })
  const offset = useTransform(spring, (v) => arcLen * (1 - v / 100))

  useEffect(() => {
    spring.set(clamped)
  }, [spring, clamped])

  // Colors based on health
  const fillColor =
    clamped > 70
      ? '#ffffff'
      : clamped > 40
        ? 'rgba(255,255,255,0.75)'
        : clamped > 15
          ? '#fbbf24'
          : '#f87171'

  const label =
    clamped > 70
      ? 'Bolso cheio!'
      : clamped > 40
        ? 'Tá tranquilo'
        : clamped > 15
          ? 'Apertando...'
          : 'Bolso vazio!'

  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Track */}
        <path
          d={arc}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Fill */}
        <motion.path
          d={arc}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          style={{ strokeDashoffset: offset }}
        />
        {/* Percentage */}
        <text
          x={cx}
          y={cy - r * 0.4}
          textAnchor="middle"
          fill="white"
          fontSize="15"
          fontWeight="800"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {Math.round(clamped)}%
        </text>
        {/* "cheio" label */}
        <text
          x={cx}
          y={cy - r * 0.4 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize="7.5"
          fontWeight="600"
          letterSpacing="0.06em"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          CHEIO
        </text>
      </svg>
      <span className="text-[10px] font-medium text-white/45 -mt-1">
        {label}
      </span>
    </div>
  )
}
