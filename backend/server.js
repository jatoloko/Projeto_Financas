import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import db from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4173

app.use(cors())
app.use(express.json())

// Servir arquivos estáticos do build do frontend
const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
}

// API Routes

// Transações
app.get('/api/transactions', (req, res) => {
  try {
    const { month, type } = req.query

    let query = 'SELECT * FROM transactions WHERE 1=1'
    const params = []

    if (month) {
      const [year, monthNum] = month.split('-')
      // SQLite armazena como texto ISO, então usamos formato simples
      const startDate = `${year}-${monthNum.padStart(2, '0')}-01 00:00:00`
      // Último dia do mês
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
      const endDate = `${year}-${monthNum.padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`
      query += ' AND created_at >= ? AND created_at <= ?'
      params.push(startDate, endDate)
    }

    if (type && (type === 'income' || type === 'expense')) {
      query += ' AND type = ?'
      params.push(type)
    }

    query += ' ORDER BY created_at DESC'

    const transactions = db.prepare(query).all(...params)

    // Buscar nomes das categorias
    const transactionsWithCategories = transactions.map((t) => {
      let category = 'Outros'
      if (t.category_id) {
        const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(t.category_id)
        if (cat) category = cat.name
      }
      if (t.subcategory_id) {
        const sub = db.prepare('SELECT name FROM categories WHERE id = ?').get(t.subcategory_id)
        if (sub) category = `${category} > ${sub.name}`
      }

      return {
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category,
        created_at: t.created_at,
      }
    })

    res.json(transactionsWithCategories)
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    res.status(500).json({ error: 'Erro ao buscar transações' })
  }
})

app.post('/api/transactions', (req, res) => {
  try {
    const { description, amount, type, category, subcategory } = req.body

    // Validações
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Descrição é obrigatória e deve ser um texto válido' })
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Valor é obrigatório' })
    }

    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(amountNum)) {
      return res.status(400).json({ error: 'Valor deve ser um número válido' })
    }

    if (amountNum <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' })
    }

    if (amountNum > 1000000000) {
      return res.status(400).json({ error: 'Valor muito alto (máximo: R$ 1.000.000.000)' })
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense"' })
    }

    // Buscar IDs das categorias
    let categoryId = null
    let subcategoryId = null

    if (category) {
      const catParts = category.split(' > ')
      const mainCat = catParts[0]
      const subCat = catParts[1]

      const cat = db.prepare('SELECT id FROM categories WHERE name = ? AND type = ?').get(mainCat, type)
      if (cat) {
        categoryId = cat.id
        if (subCat) {
          const sub = db
            .prepare('SELECT id FROM categories WHERE name = ? AND parent_id = ?')
            .get(subCat, categoryId)
          if (sub) subcategoryId = sub.id
        }
      }
    }

    const id = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const createdAt = new Date().toISOString()

    db.prepare(
      'INSERT INTO transactions (id, description, amount, type, category_id, subcategory_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, description.trim(), Math.abs(amountNum), type, categoryId, subcategoryId, createdAt)

    res.status(201).json({ id, description: description.trim(), amount: Math.abs(amountNum), type, category: category || 'Outros', created_at: createdAt })
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    res.status(500).json({ error: 'Erro ao criar transação' })
  }
})

app.put('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params
    const { description, amount, type, category, subcategory } = req.body

    // Validações
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Descrição é obrigatória e deve ser um texto válido' })
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Valor é obrigatório' })
    }

    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(amountNum)) {
      return res.status(400).json({ error: 'Valor deve ser um número válido' })
    }

    if (amountNum <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' })
    }

    if (amountNum > 1000000000) {
      return res.status(400).json({ error: 'Valor muito alto (máximo: R$ 1.000.000.000)' })
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense"' })
    }

    // Verificar se transação existe
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' })
    }

    // Buscar IDs das categorias
    let categoryId = null
    let subcategoryId = null

    if (category) {
      const catParts = category.split(' > ')
      const mainCat = catParts[0]
      const subCat = catParts[1]

      const cat = db.prepare('SELECT id FROM categories WHERE name = ? AND type = ?').get(mainCat, type)
      if (cat) {
        categoryId = cat.id
        if (subCat) {
          const sub = db
            .prepare('SELECT id FROM categories WHERE name = ? AND parent_id = ?')
            .get(subCat, categoryId)
          if (sub) subcategoryId = sub.id
        }
      }
    }

    const result = db
      .prepare(
        'UPDATE transactions SET description = ?, amount = ?, type = ?, category_id = ?, subcategory_id = ? WHERE id = ?'
      )
      .run(description.trim(), Math.abs(amountNum), type, categoryId, subcategoryId, id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' })
    }

    // Buscar transação atualizada
    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)
    let categoryName = 'Outros'
    if (updated.category_id) {
      const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(updated.category_id)
      if (cat) categoryName = cat.name
    }
    if (updated.subcategory_id) {
      const sub = db.prepare('SELECT name FROM categories WHERE id = ?').get(updated.subcategory_id)
      if (sub) categoryName = `${categoryName} > ${sub.name}`
    }

    res.json({
      id: updated.id,
      description: updated.description,
      amount: updated.amount,
      type: updated.type,
      category: categoryName,
      created_at: updated.created_at,
    })
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    res.status(500).json({ error: 'Erro ao atualizar transação' })
  }
})

app.delete('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params
    const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar transação:', error)
    res.status(500).json({ error: 'Erro ao deletar transação' })
  }
})

// Categorias
app.get('/api/categories', (req, res) => {
  try {
    const { type } = req.query

    let query = 'SELECT * FROM categories WHERE parent_id IS NULL'
    const params = []

    if (type && (type === 'income' || type === 'expense')) {
      query += ' AND type = ?'
      params.push(type)
    }

    query += ' ORDER BY name'

    const categories = db.prepare(query).all(...params)

    // Buscar subcategorias
    const categoriesWithSubs = categories.map((cat) => {
      const subcategories = db.prepare('SELECT * FROM categories WHERE parent_id = ? ORDER BY name').all(cat.id)
      return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        parentId: cat.parent_id || null,
        subcategories,
      }
    })

    res.json(categoriesWithSubs)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({ error: 'Erro ao buscar categorias' })
  }
})

app.post('/api/categories', (req, res) => {
  try {
    const { name, type, parentId } = req.body

    // Validações
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense"' })
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Nome da categoria muito longo (máximo: 100 caracteres)' })
    }

    const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const createdAt = new Date().toISOString()

    db.prepare('INSERT INTO categories (id, name, type, parent_id, created_at) VALUES (?, ?, ?, ?, ?)').run(
      id,
      name.trim(),
      type,
      parentId || null,
      createdAt
    )

    res.status(201).json({ id, name: name.trim(), type, parentId: parentId || null })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({ error: 'Erro ao criar categoria' })
  }
})

app.put('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, type, parentId } = req.body

    // Validações
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense"' })
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Nome da categoria muito longo (máximo: 100 caracteres)' })
    }

    const result = db
      .prepare('UPDATE categories SET name = ?, type = ?, parent_id = ? WHERE id = ?')
      .run(name.trim(), type, parentId || null, id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    res.json({ id, name: name.trim(), type, parentId: parentId || null })
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
})

app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params

    // Verificar se tem transações usando esta categoria
    const transactions = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ? OR subcategory_id = ?').get(id, id)
    if (transactions.count > 0) {
      return res.status(400).json({ error: 'Não é possível excluir categoria com transações associadas' })
    }

    // Deletar subcategorias primeiro
    db.prepare('DELETE FROM categories WHERE parent_id = ?').run(id)

    // Deletar categoria
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    res.status(500).json({ error: 'Erro ao deletar categoria' })
  }
})

// SPA Routing - servir index.html para todas as rotas não-API
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Rota não encontrada' })
  }
  res.sendFile(join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`📁 Banco de dados: ${join(__dirname, '..', 'data', 'financas.db')}`)
})

