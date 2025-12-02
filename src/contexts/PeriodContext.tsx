import { createContext, useContext, useState } from 'react'

interface PeriodContextType {
  currentMonth: number
  currentYear: number
  setCurrentMonth: (month: number) => void
  setCurrentYear: (year: number) => void
  getMonthStart: () => Date
  getMonthEnd: () => Date
  formatMonthYear: () => string
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined)

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1) // 1-12
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  const getMonthStart = () => {
    return new Date(currentYear, currentMonth - 1, 1)
  }

  const getMonthEnd = () => {
    return new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)
  }

  const formatMonthYear = () => {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    return `${monthNames[currentMonth - 1]} ${currentYear}`
  }

  return (
    <PeriodContext.Provider
      value={{
        currentMonth,
        currentYear,
        setCurrentMonth,
        setCurrentYear,
        getMonthStart,
        getMonthEnd,
        formatMonthYear,
      }}
    >
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod() {
  const context = useContext(PeriodContext)
  if (context === undefined) {
    throw new Error('usePeriod must be used within a PeriodProvider')
  }
  return context
}

