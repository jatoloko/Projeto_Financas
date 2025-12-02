import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryCardProps {
  title: string
  value: string
  description?: string
  variant?: 'default' | 'income' | 'expense'
}

export function SummaryCard({ title, value, description, variant = 'default' }: SummaryCardProps) {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800',
    income: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    expense: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  }

  const valueStyles = {
    default: 'text-gray-900 dark:text-gray-100',
    income: 'text-green-700 dark:text-green-400',
    expense: 'text-red-700 dark:text-red-400',
  }

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueStyles[variant]}`}>{value}</div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

