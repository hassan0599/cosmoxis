'use client'

import { AlertTriangle, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Receipt } from '@/types/database'

interface DuplicateReceipt {
  id: string
  merchantName: string | null
  date: string | null
  totalAmount: number
  currency: string
  category: string | null
  createdAt: string
}

interface DuplicateDialogProps {
  duplicates: DuplicateReceipt[]
  onProceed: () => void
  onCancel: () => void
  onViewExisting: (id: string) => void
}

export function DuplicateDialog({
  duplicates,
  onProceed,
  onCancel,
  onViewExisting,
}: DuplicateDialogProps) {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='max-w-md w-full p-6'>
        <div className='flex items-start gap-3 mb-4'>
          <div className='p-2 bg-amber-100 rounded-lg'>
            <AlertTriangle className='w-5 h-5 text-amber-600' />
          </div>
          <div>
            <h3 className='font-semibold text-slate-900'>
              Potential Duplicate Detected
            </h3>
            <p className='text-sm text-slate-600 mt-1'>
              We found {duplicates.length} receipt(s) with the same merchant,
              amount, and date.
            </p>
          </div>
        </div>

        <div className='space-y-2 mb-6 max-h-48 overflow-y-auto'>
          {duplicates.map((dup) => (
            <div
              key={dup.id}
              className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'>
              <div>
                <p className='font-medium text-slate-900'>{dup.merchantName}</p>
                <p className='text-sm text-slate-500'>
                  {dup.date} • ${dup.totalAmount.toFixed(2)}
                </p>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onViewExisting(dup.id)}>
                <ExternalLink className='w-4 h-4' />
              </Button>
            </div>
          ))}
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={onCancel} className='flex-1'>
            Cancel
          </Button>
          <Button onClick={onProceed} className='flex-1'>
            Save Anyway
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Hook for checking duplicates
export function useDuplicateCheck() {
  const checkDuplicate = async (
    merchantName: string,
    totalAmount: number,
    date: string,
    excludeId?: string,
  ): Promise<{ isDuplicate: boolean; duplicates: DuplicateReceipt[] }> => {
    try {
      const response = await fetch('/api/receipts/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName,
          totalAmount,
          date,
          excludeId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check for duplicates')
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking duplicates:', error)
      return { isDuplicate: false, duplicates: [] }
    }
  }

  return { checkDuplicate }
}
