import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePeriod } from '@/contexts/PeriodContext'
import { getTransactions, deleteTransaction } from '@/lib/api'
import { TransactionList } from '@/components/TransactionList'
import type { Transaction } from '@/components/TransactionList'
import { SummaryCard } from '@/components/SummaryCard'

export function Dashboard() {
  const { user } = useAuth()
  const { currentMonth, currentYear } = usePeriod()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  })

  const fetchTransactions = async () => {
    if (!user) return

    try {
      const month = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
      const data = await getTransactions(month)

      setTransactions(data)

      const income = data
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

      const expense = data
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

      setSummary({
        income,
        expense,
        balance: income - expense,
      })
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentMonth, currentYear])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      await deleteTransaction(id)
      fetchTransactions()
    } catch (error: any) {
      alert('Erro ao excluir transação: ' + error.message)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Receitas"
          value={formatCurrency(summary.income)}
          variant="income"
        />
        <SummaryCard
          title="Despesas"
          value={formatCurrency(summary.expense)}
          variant="expense"
        />
        <SummaryCard
          title="Saldo"
          value={formatCurrency(summary.balance)}
          description={
            summary.balance >= 0
              ? 'Você está no azul!'
              : 'Atenção: saldo negativo'
          }
          variant={summary.balance >= 0 ? 'income' : 'expense'}
        />
      </div>

      <TransactionList
        transactions={transactions.slice(0, 10)}
        onDelete={handleDelete}
      />
    </div>
  )
}

