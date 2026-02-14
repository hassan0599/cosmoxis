'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { PieChart } from 'lucide-react'

interface StatsChartProps {
  categoryBreakdown: Record<string, number>
  totalSpent: number
}

const CATEGORY_COLORS: Record<string, string> = {
  meals: '#1a1a1a',
  travel: '#1a8f6e',
  office: '#737373',
  utilities: '#8b5cf6',
  other: '#a3a3a3',
}

const CATEGORY_BG_COLORS: Record<string, string> = {
  meals: 'bg-gray-800',
  travel: 'bg-emerald-600',
  office: 'bg-gray-500',
  utilities: 'bg-violet-500',
  other: 'bg-gray-400',
}

const CATEGORY_LABELS: Record<string, string> = {
  meals: 'Meals & Dining',
  travel: 'Travel',
  office: 'Office Supplies',
  utilities: 'Utilities',
  other: 'Other',
}

export function StatsChart({ categoryBreakdown, totalSpent }: StatsChartProps) {
  const categories = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b - a,
  )

  if (categories.length === 0) {
    return (
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-semibold'>
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-12'>
            <div className='w-12 h-12 rounded-lg bg-muted mx-auto flex items-center justify-center mb-4'>
              <PieChart className='h-7 w-7 text-muted-foreground' />
            </div>
            <p className='text-muted-foreground font-medium'>
              No spending data available
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              Add receipts to see your spending breakdown
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-semibold'>
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Bar Chart */}
        <div className='space-y-4'>
          {categories.map(([category, amount]) => {
            const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
            const bgColor =
              CATEGORY_BG_COLORS[category] || CATEGORY_BG_COLORS.other

            return (
              <div key={category} className='space-y-2'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='font-medium text-foreground'>
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className='text-muted-foreground font-medium'>
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className='h-2.5 bg-muted rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${bgColor}`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className='pt-4 border-t border-border'>
          <div className='grid grid-cols-2 gap-3'>
            {categories.map(([category, amount]) => {
              const bgColor =
                CATEGORY_BG_COLORS[category] || CATEGORY_BG_COLORS.other
              const percentage =
                totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0

              return (
                <div key={category} className='flex items-center gap-2'>
                  <div className={`w-2.5 h-2.5 rounded-full ${bgColor}`} />
                  <span className='text-xs text-muted-foreground'>
                    {CATEGORY_LABELS[category] || category}: {percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
