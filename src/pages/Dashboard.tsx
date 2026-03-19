import { useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Wallet, Lightbulb } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { MonthSummaryCard } from '../components/dashboard/MonthSummaryCard'
import { SubscriptionCard } from '../components/dashboard/SubscriptionCard'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { ExpenseDetailsSheet } from '../components/expenses/ExpenseDetailsSheet'
import {
  calculateMonthSummary,
  getCurrentMonth,
  formatMonth,
  generateQuickInsight,
} from '../lib/utils'
import type { Expense } from '../types'

const containerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
  },
}

function getGreeting(firstName: string, todaySpent: number): string {
  const hour = new Date().getHours()
  const base = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const name = firstName ? `, ${firstName}` : ''

  if (todaySpent > 0) {
    const formatted = todaySpent.toFixed(2).replace('.', ',')
    return `${base}${name} — hoje: -R$ ${formatted}`
  }
  return `${base}${name}`
}

export function Dashboard() {
  const { expenses, settings, deleteExpense, editExpense } = useApp()
  const { profile } = useAuth()
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const currentMonth = getCurrentMonth()
  const firstName = profile?.full_name?.split(' ')[0] || ''

  const summary = useMemo(
    () => calculateMonthSummary(expenses, currentMonth),
    [expenses, currentMonth]
  )

  // Pocket fullness calculation
  const pocketPercent = useMemo(() => {
    const totalBudget = settings.envelopes.reduce((acc, e) => acc + e.limit, 0)
    if (totalBudget <= 0) return null
    return Math.max(0, Math.min(100, ((totalBudget - summary.totalSpent) / totalBudget) * 100))
  }, [settings.envelopes, summary.totalSpent])

  // Quick insight
  const quickInsight = useMemo(
    () => generateQuickInsight(expenses, currentMonth, settings.envelopes),
    [expenses, currentMonth, settings.envelopes]
  )

  // Today's spending for contextual greeting
  const todaySpent = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return expenses
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  return (
    <motion.div
      className="flex flex-col gap-4 pb-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {getGreeting(firstName, todaySpent)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Wallet size={24} style={{ color: 'var(--color-primary)' }} />
            BolsoCheio
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium capitalize px-3 py-1.5 rounded-full" style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
          }}>
            {formatMonth(currentMonth)}
          </p>
        </div>
      </motion.div>

      {/* Resumo do Mês */}
      <motion.div variants={itemVariants}>
        <MonthSummaryCard summary={summary} pocketPercent={pocketPercent} />
      </motion.div>

      {/* Quick Insight */}
      {quickInsight && (
        <motion.div variants={itemVariants}>
          <div
            className="flex gap-2.5 items-start p-3.5 rounded-2xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.9), rgba(13, 148, 136, 0.9))',
              }}
            >
              <Lightbulb size={14} className="text-white" />
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {quickInsight}
            </p>
          </div>
        </motion.div>
      )}

      {/* Assinaturas */}
      <motion.div variants={itemVariants}>
        <SubscriptionCard expenses={expenses} />
      </motion.div>

      {/* Categorias com Envelopes */}
      <motion.div variants={itemVariants}>
        <CategoryBreakdown summary={summary} envelopes={settings.envelopes} />
      </motion.div>

      {/* Gastos Recentes */}
      <motion.div variants={itemVariants}>
        <RecentExpenses expenses={expenses} onClick={setSelectedExpense} />
      </motion.div>

      <ExpenseDetailsSheet
        expense={selectedExpense}
        open={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onDelete={deleteExpense}
        onSave={editExpense}
      />
    </motion.div>
  )
}
