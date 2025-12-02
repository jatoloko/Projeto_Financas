import { useState, useEffect } from 'react'
import { PeriodProvider, usePeriod } from '@/contexts/PeriodContext'
import { MainLayout } from '@/components/MainLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { Categories } from '@/pages/Categories'

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)
  const { currentMonth, currentYear } = usePeriod()

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  useEffect(() => {
    setRefreshKey((prev) => prev + 1)
  }, [currentMonth, currentYear])

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onTransactionAdded={handleTransactionAdded}
    >
      {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}
      {activeTab === 'transactions' && <Transactions key={refreshKey} />}
      {activeTab === 'categories' && <Categories />}
    </MainLayout>
  )
}

export function MainApp() {
  return (
    <PeriodProvider>
      <MainAppContent />
    </PeriodProvider>
  )
}

