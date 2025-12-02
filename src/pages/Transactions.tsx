import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { usePeriod } from '@/contexts/PeriodContext'
import { getTransactions, deleteTransaction } from '@/lib/api'
import { TransactionList } from '@/components/TransactionList'
import type { Transaction } from '@/components/TransactionList'
import { EditTransactionDialog } from '@/components/EditTransactionDialog'
import { TransactionSkeleton } from '@/components/TransactionSkeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Transactions() {
  const { user } = useAuth()
  const { currentMonth, currentYear } = usePeriod()
  const [activeType, setActiveType] = useState<'income' | 'expense'>('income')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const month = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', month, activeType],
    queryFn: () => getTransactions(month, activeType),
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

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

  const filteredTransactions = transactions.filter((t) => t.type === activeType)

  return (
    <Tabs value={activeType} onValueChange={(v) => setActiveType(v as 'income' | 'expense')}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="income">Receitas</TabsTrigger>
        <TabsTrigger value="expense">Despesas</TabsTrigger>
      </TabsList>

      {isLoading ? (
        <TransactionSkeleton />
      ) : (
        <>
          <TabsContent value="income">
            <TransactionList transactions={filteredTransactions} onDelete={handleDelete} onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="expense">
            <TransactionList transactions={filteredTransactions} onDelete={handleDelete} onEdit={handleEdit} />
          </TabsContent>
        </>
      )}

      <EditTransactionDialog
        transaction={editingTransaction}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {}}
      />
    </Tabs>
  )
}

