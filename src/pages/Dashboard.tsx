import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { usePeriod } from '@/contexts/PeriodContext'
import { getTransactions, deleteTransaction } from '@/lib/api'
import { TransactionList } from '@/components/TransactionList'
import type { Transaction } from '@/components/TransactionList'
import { SummaryCard } from '@/components/SummaryCard'
import { EditTransactionDialog } from '@/components/EditTransactionDialog'
import { TransactionSkeleton } from '@/components/TransactionSkeleton'
import { SummaryCardSkeleton } from '@/components/SummaryCardSkeleton'

export function Dashboard() {
  const { user } = useAuth()
  const { currentMonth, currentYear } = usePeriod()
  const queryClient = useQueryClient()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const month = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', month],
    queryFn: () => getTransactions(month),
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [transactions])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      await deleteMutation.mutateAsync(id)
    } catch (error: any) {
      alert('Erro ao excluir transação: ' + error.message)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SummaryCardSkeleton />
        <TransactionSkeleton />
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
        onEdit={handleEdit}
      />

      <EditTransactionDialog
        transaction={editingTransaction}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  )
}

