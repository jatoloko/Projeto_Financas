import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePeriod } from '@/contexts/PeriodContext'
import { getTransactions, deleteTransaction } from '@/lib/api'
import { TransactionList } from '@/components/TransactionList'
import type { Transaction } from '@/components/TransactionList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Transactions() {
  const { user } = useAuth()
  const { currentMonth, currentYear } = usePeriod()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<'income' | 'expense'>('income')

  const fetchTransactions = async () => {
    if (!user) return

    try {
      const month = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
      const data = await getTransactions(month, activeType)
      setTransactions(data)
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
  }, [user, currentMonth, currentYear, activeType])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      await deleteTransaction(id)
      fetchTransactions()
    } catch (error: any) {
      alert('Erro ao excluir transação: ' + error.message)
    }
  }

  const filteredTransactions = transactions.filter((t) => t.type === activeType)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <Tabs value={activeType} onValueChange={(v) => setActiveType(v as 'income' | 'expense')}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="income">Receitas</TabsTrigger>
        <TabsTrigger value="expense">Despesas</TabsTrigger>
      </TabsList>

      <TabsContent value="income">
        <TransactionList transactions={filteredTransactions} onDelete={handleDelete} />
      </TabsContent>

      <TabsContent value="expense">
        <TransactionList transactions={filteredTransactions} onDelete={handleDelete} />
      </TabsContent>
    </Tabs>
  )
}

