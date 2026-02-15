'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Receipt,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Receipt as ReceiptType } from '@/types/database'

interface ReceiptListProps {
  receipts: ReceiptType[]
  onDelete: (id: string) => Promise<void>
  onSearch: (query: string) => void
  onFilter: (category: string) => void
  searchQuery: string
  categoryFilter: string
  isLoading?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  meals: 'Meals & Dining',
  travel: 'Travel',
  office: 'Office Supplies',
  utilities: 'Utilities',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  meals: 'bg-orange-100 text-orange-800 border border-orange-200',
  travel: 'bg-blue-100 text-blue-800 border border-blue-200',
  office: 'bg-purple-100 text-purple-800 border border-purple-200',
  utilities: 'bg-green-100 text-green-800 border border-green-200',
  other: 'bg-gray-100 text-gray-800 border border-gray-200',
}

export function ReceiptList({
  receipts,
  onDelete,
  onSearch,
  onFilter,
  searchQuery,
  categoryFilter,
  isLoading = false,
}: ReceiptListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <div className='space-y-4'>
      {/* Search and Filter */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder='Search by merchant name...'
            className='pl-11'
          />
        </div>
        <Select value={categoryFilter} onValueChange={onFilter}>
          <SelectTrigger className='w-full sm:w-48'>
            <SelectValue placeholder='All categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            <SelectItem value='meals'>Meals & Dining</SelectItem>
            <SelectItem value='travel'>Travel</SelectItem>
            <SelectItem value='office'>Office Supplies</SelectItem>
            <SelectItem value='utilities'>Utilities</SelectItem>
            <SelectItem value='other'>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </div>
      )}

      {/* Receipt List */}
      {receipts.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='py-16 text-center'>
            <div className='w-14 h-14 rounded-lg bg-muted mx-auto flex items-center justify-center mb-4'>
              <Receipt className='h-8 w-8 text-muted-foreground' />
            </div>
            <p className='text-foreground font-medium mb-1'>
              No receipts found
            </p>
            <p className='text-sm text-muted-foreground'>
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Scan your first receipt to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {receipts.map((receipt) => (
            <Card
              key={receipt.id}
              className='hover:shadow-sm hover:border-primary/20 transition-all duration-200 group cursor-pointer'
              onClick={() => router.push(`/dashboard/receipts/${receipt.id}`)}>
              <CardContent className='p-5'>
                <div className='flex items-start gap-4'>
                  {/* Thumbnail */}
                  <div className='w-12 h-12 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center'>
                    <span className='text-lg font-semibold text-primary'>
                      {(receipt.merchant_name?.[0] || '?').toUpperCase()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <h3 className='font-semibold text-foreground truncate'>
                          {receipt.merchant_name || 'Unknown Merchant'}
                        </h3>
                        <div className='flex flex-wrap items-center gap-3 mt-2 text-sm'>
                          {receipt.date && (
                            <span className='flex items-center gap-1.5 text-muted-foreground'>
                              <Calendar className='h-3.5 w-3.5' />
                              {formatDate(receipt.date)}
                            </span>
                          )}
                          {receipt.total_amount !== null && (
                            <span className='flex items-center gap-1.5 font-semibold text-foreground'>
                              <DollarSign className='h-3.5 w-3.5 text-success' />
                              {formatCurrency(
                                receipt.total_amount,
                                receipt.currency,
                              )}
                            </span>
                          )}
                          {receipt.category && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                CATEGORY_COLORS[receipt.category] ||
                                CATEGORY_COLORS.other
                              }`}>
                              <Tag className='h-3 w-3' />
                              {CATEGORY_LABELS[receipt.category] ||
                                receipt.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(receipt.id)
                        }}
                        disabled={deletingId === receipt.id}
                        className='text-muted-foreground hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    {receipt.notes && (
                      <p className='mt-2 text-sm text-muted-foreground line-clamp-1'>
                        {receipt.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
