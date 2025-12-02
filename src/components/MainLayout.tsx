import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PeriodSelector } from '@/components/PeriodSelector'
import { TransactionForm } from '@/components/TransactionForm'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MainLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onTransactionAdded: () => void
}

export function MainLayout({
  children,
  activeTab,
  onTabChange,
  onTransactionAdded,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold">Controle Financeiro</h1>
              </div>
              <div className="flex gap-2 flex-wrap">
                <PeriodSelector />
                <TransactionForm onSuccess={onTransactionAdded} />
                <ThemeToggle />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  )
}

