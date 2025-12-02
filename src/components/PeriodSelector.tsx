import { usePeriod } from '@/contexts/PeriodContext'
import { Button } from '@/components/ui/button'

export function PeriodSelector() {
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear, formatMonthYear } = usePeriod()

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentMonth(now.getMonth() + 1)
    setCurrentYear(now.getFullYear())
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
        ←
      </Button>
      <div className="min-w-[180px] text-center font-medium">{formatMonthYear()}</div>
      <Button variant="outline" size="sm" onClick={handleNextMonth}>
        →
      </Button>
      <Button variant="ghost" size="sm" onClick={handleToday}>
        Hoje
      </Button>
    </div>
  )
}

