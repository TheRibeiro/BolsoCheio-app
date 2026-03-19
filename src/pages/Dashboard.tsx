import { useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { MonthSummaryCard } from '../components/dashboard/MonthSummaryCard'
import { SubscriptionCard } from '../components/dashboard/SubscriptionCard'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { ExpenseDetailsSheet } from '../components/expenses/ExpenseDetailsSheet'
import { calculateMonthSummary, getCurrentMonth, formatMonth } from '../lib/utils'
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

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
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
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
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
        <MonthSummaryCard summary={summary} />
      </motion.div>

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
