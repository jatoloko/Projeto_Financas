import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory, type Category } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeType, setActiveType] = useState<'income' | 'expense'>('income')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'income' as 'income' | 'expense',
    parentId: '',
  })

  const loadCategories = async () => {
    try {
      const cats = await getCategories(activeType)
      setCategories(cats)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          type: formData.type,
          parentId: formData.parentId || null,
        })
      } else {
        await createCategory({
          name: formData.name,
          type: formData.type,
          parentId: formData.parentId || null,
        })
      }

      setFormData({ name: '', type: 'income', parentId: '' })
      setEditingCategory(null)
      setDialogOpen(false)
      loadCategories()
    } catch (error: any) {
      alert('Erro ao salvar categoria: ' + error.message)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      parentId: category.parentId || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await deleteCategory(id)
      loadCategories()
    } catch (error: any) {
      alert('Erro ao excluir categoria: ' + error.message)
    }
  }

  const handleNewCategory = (type: 'income' | 'expense') => {
    setEditingCategory(null)
    setFormData({ name: '', type, parentId: '' })
    setDialogOpen(true)
  }

  const handleNewSubcategory = (parentId: string) => {
    const parent = categories.find((c) => c.id === parentId)
    if (!parent) return
    setEditingCategory(null)
    setFormData({ name: '', type: parent.type, parentId })
    setDialogOpen(true)
  }

  const mainCategories = categories.filter((c) => !c.parentId && c.type === activeType)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categorias e Subcategorias</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleNewCategory(activeType)}>Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {formData.parentId
                  ? 'Adicione uma subcategoria'
                  : 'Crie uma nova categoria para organizar suas transações'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Salário, Alimentação, etc."
                  required
                />
              </div>
              {!formData.parentId && (
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
              )}
              <Button type="submit" className="w-full">
                {editingCategory ? 'Salvar Alterações' : 'Criar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as 'income' | 'expense')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Categorias de Receita</TabsTrigger>
          <TabsTrigger value="expense">Categorias de Despesa</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          {mainCategories.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Nenhuma categoria de receita criada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            mainCategories.map((category) => {
              const subcategories = category.subcategories || []
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{category.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewSubcategory(category.id)}
                        >
                          + Subcategoria
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subcategories.length > 0 ? (
                      <div className="space-y-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <span className="text-sm">{sub.name}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(sub)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(sub.id)}
                                className="text-red-600"
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma subcategoria</p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          {categories.filter((c) => !c.parentId && c.type === 'expense').length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Nenhuma categoria de despesa criada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            categories.filter((c) => !c.parentId && c.type === 'expense').map((category) => {
              const subcategories = category.subcategories || []
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{category.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewSubcategory(category.id)}
                        >
                          + Subcategoria
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subcategories.length > 0 ? (
                      <div className="space-y-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <span className="text-sm">{sub.name}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(sub)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(sub.id)}
                                className="text-red-600"
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma subcategoria</p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

