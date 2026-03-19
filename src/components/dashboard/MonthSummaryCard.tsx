import { useState } from 'react'
import { TrendingDown, TrendingUp, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/Card'
import { NumberTicker } from '../ui/NumberTicker'
import { PocketGauge } from './PocketGauge'
import { formatCurrency, vibrate } from '../../lib/utils'
import type { MonthSummary } from '../../types'

interface MonthSummaryCardProps {
  summary: MonthSummary
  pocketPercent: number | null // null = no envelopes configured
}

function getHealthClass(pct: number): string {
  if (pct > 70) return 'health-great'
  if (pct > 40) return ''
  if (pct > 15) return 'health-tight'
  return 'health-critical'
}

export function MonthSummaryCard({ summary, pocketPercent }: MonthSummaryCardProps) {
  const [isVisible, setIsVisible] = useState(true)
  const totalExpenses = summary.totalSpent

  const healthClass = pocketPercent !== null ? getHealthClass(pocketPercent) : ''

  return (
    <Card variant="hero" className={`relative overflow-hidden ${healthClass}`}>
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-white/60">
            Seu Bolso
          </p>
          <button
            onClick={() => {
              setIsVisible(!isVisible)
              vibrate(40)
            }}
            className="p-2.5 -m-1 rounded-lg hover:bg-white/10 transition-colors text-white/50"
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Amount + Gauge side by side */}
        <div className="flex items-end justify-between">
          {/* Left: Amount */}
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm font-semibold text-white/40">
                R$
              </span>
              <AnimatePresence mode="wait">
                {isVisible ? (
                  <NumberTicker
                    key="visible"
                    value={totalExpenses}
                    className="text-3xl sm:text-4xl font-bold"
                    style={{
                      letterSpacing: '-0.05em',
                      color: '#ffffff',
                      display: 'inline-block'
                    }}
                  />
                ) : (
                  <motion.span
                    key="hidden"
                    className="text-3xl sm:text-4xl font-bold tracking-widest translate-y-[-2px] text-white"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    ••••••••
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[11px] font-medium text-white/35 mt-0.5">
              gasto este mês
            </p>
          </div>

          {/* Right: Pocket Gauge */}
          {pocketPercent !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
            >
              <PocketGauge percentage={pocketPercent} />
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <motion.div
          className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-white/10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.15 }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/15">
            <TrendingDown size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-white/50">Fixos</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(summary.fixedTotal)}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-white/10"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.2 }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/15">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-white/50">Variáveis</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(summary.variableTotal)}
            </p>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
