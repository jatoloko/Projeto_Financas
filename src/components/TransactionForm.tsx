import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createTransaction, getCategories, type Category } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface TransactionFormProps {
  onSuccess: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    subcategory: '',
  })

  useEffect(() => {
    if (open && user) {
      loadCategories()
      setSubcategories([])
      setFormData((prev) => ({ ...prev, category: '', subcategory: '' }))
    }
  }, [formData.type, open, user])

  const loadCategories = async () => {
    try {
      const cats = await getCategories(formData.type)
      setCategories(cats.filter((c) => !c.parentId))
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  useEffect(() => {
    if (formData.category) {
      const selectedCat = categories.find((c) => c.id === formData.category)
      setSubcategories(selectedCat?.subcategories || [])
      setFormData((prev) => ({ ...prev, subcategory: '' }))
    } else {
      setSubcategories([])
    }
  }, [formData.category, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const categoryName = formData.category
        ? categories.find((c) => c.id === formData.category)?.name
        : undefined
      const subcategoryName = formData.subcategory
        ? subcategories.find((s) => s.id === formData.subcategory)?.name
        : undefined

      const fullCategory = subcategoryName ? `${categoryName} > ${subcategoryName}` : categoryName

      await createTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: fullCategory,
        subcategory: subcategoryName,
      })

      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        subcategory: '',
      })
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      alert('Erro ao criar transação: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nova Transação</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Adicione uma nova receita ou despesa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
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
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Salário, Aluguel, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-md bg-white dark:bg-white text-gray-900 dark:text-gray-900"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {subcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria (opcional)</Label>
              <select
                id="subcategory"
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


