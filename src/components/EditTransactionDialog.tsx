import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { updateTransaction, getCategories, type Category } from '@/lib/api'
import type { Transaction } from '@/components/TransactionList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: EditTransactionDialogProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    subcategory: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', formData.type],
    queryFn: () => getCategories(formData.type),
    enabled: open && !!user,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTransaction>[1] }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setErrors({})
      onOpenChange(false)
      onSuccess()
    },
  })

  useEffect(() => {
    if (transaction && open) {
      // Parsear categoria (formato: "Categoria > Subcategoria" ou apenas "Categoria")
      const categoryParts = transaction.category.split(' > ')
      const mainCategoryName = categoryParts[0]
      const subcategoryName = categoryParts[1]

      // Encontrar IDs das categorias
      const mainCategory = categories.find((c) => c.name === mainCategoryName && !c.parentId)
      const subcategory = subcategoryName
        ? categories.find((c) => c.name === subcategoryName && c.parentId === mainCategory?.id)
        : null

      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: mainCategory?.id || '',
        subcategory: subcategory?.id || '',
      })
      setErrors({})
    }
  }, [transaction, open, categories])

  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const selectedCat = categories.find((c) => c.id === formData.category)
      setSubcategories(selectedCat?.subcategories || [])
      if (!selectedCat?.subcategories?.find((s) => s.id === formData.subcategory)) {
        setFormData((prev) => ({ ...prev, subcategory: '' }))
      }
    } else {
      setSubcategories([])
    }
  }, [formData.category, categories])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.amount || formData.amount.trim() === '') {
      newErrors.amount = 'Valor é obrigatório'
    } else {
      const amountValue = parseFloat(formData.amount)
      if (isNaN(amountValue)) {
        newErrors.amount = 'Valor deve ser um número válido'
      } else if (amountValue <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero'
      } else if (amountValue > 1000000000) {
        newErrors.amount = 'Valor muito alto (máximo: R$ 1.000.000.000)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !transaction) return

    if (!validateForm()) {
      return
    }

    setErrors({})
    try {
      const amountValue = Math.abs(parseFloat(formData.amount))
      const categoryName = formData.category
        ? categories.find((c) => c.id === formData.category)?.name
        : undefined
      const subcategoryName = formData.subcategory
        ? subcategories.find((s) => s.id === formData.subcategory)?.name
        : undefined

      const fullCategory = subcategoryName ? `${categoryName} > ${subcategoryName}` : categoryName

      await updateMutation.mutateAsync({
        id: transaction.id,
        data: {
          description: formData.description.trim(),
          amount: amountValue,
          type: formData.type,
          category: fullCategory,
          subcategory: subcategoryName,
        },
      })
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao atualizar transação' })
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>Edite os dados da transação</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-type">Tipo</Label>
            <select
              id="edit-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
              }
              className="w-full p-2 border rounded-md bg-white dark:bg-white text-gray-900 dark:text-gray-900"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: '' })
              }}
              placeholder="Ex: Salário, Aluguel, etc."
              required
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setFormData({ ...formData, amount: value })
                  if (errors.amount) setErrors({ ...errors, amount: '' })
                }
              }}
              placeholder="0.00"
              required
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria</Label>
            <select
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-md bg-white dark:bg-white text-gray-900 dark:text-gray-900"
            >
              <option value="">Selecione uma categoria</option>
              {categories.filter((c) => !c.parentId).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {subcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory">Subcategoria (opcional)</Label>
              <select
                id="edit-subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full p-2 border rounded-md bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              >
                <option value="">Nenhuma</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

