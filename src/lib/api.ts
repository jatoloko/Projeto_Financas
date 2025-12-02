const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  parentId?: string | null
  subcategories?: Category[]
}

// Transações
export async function getTransactions(month?: string, type?: 'income' | 'expense'): Promise<Transaction[]> {
  const params = new URLSearchParams()
  if (month) params.append('month', month)
  if (type) params.append('type', type)

  const response = await fetch(`${API_BASE_URL}/transactions?${params}`)
  if (!response.ok) throw new Error('Erro ao buscar transações')
  return response.json()
}

export async function createTransaction(data: {
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
  subcategory?: string
}): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar transação')
  }
  return response.json()
}

export async function updateTransaction(
  id: string,
  data: {
    description: string
    amount: number
    type: 'income' | 'expense'
    category?: string
    subcategory?: string
  }
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar transação')
  }
  return response.json()
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar transação')
  }
}

// Categorias
export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  const params = new URLSearchParams()
  if (type) params.append('type', type)

  const response = await fetch(`${API_BASE_URL}/categories?${params}`)
  if (!response.ok) throw new Error('Erro ao buscar categorias')
  return response.json()
}

export async function createCategory(data: {
  name: string
  type: 'income' | 'expense'
  parentId?: string | null
}): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar categoria')
  }
  return response.json()
}

export async function updateCategory(id: string, data: { name: string; type: 'income' | 'expense'; parentId?: string | null }): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar categoria')
  }
  return response.json()
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar categoria')
  }
}

