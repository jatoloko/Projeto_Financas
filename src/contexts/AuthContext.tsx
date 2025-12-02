import { createContext, useContext, useState, useEffect } from 'react'

interface AppUser {
  id: string
  email: string
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se a API está disponível
    fetch('/api/categories')
      .then(() => {
        // API disponível - sempre autenticado como usuário local
        setUser({ id: 'local-user', email: 'local@app.com' })
        setLoading(false)
      })
      .catch(() => {
        // API não disponível - ainda carregando ou erro
        setLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
