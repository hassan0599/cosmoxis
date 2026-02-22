'use client'

import { useState, useCallback, useEffect } from 'react'
import { ReceiptService } from '@/services/receipts.service'
import type { Receipt, ReceiptInsert, ReceiptUpdate } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchReceipts = useCallback(
    async (params?: {
      page?: number
      limit?: number
      search?: string
      category?: string
      startDate?: string
      endDate?: string
    }) => {
      setIsLoading(true)
      try {
        const result = await ReceiptService.getReceipts(params)
        setReceipts(result.receipts)
        setPagination(result.pagination)
      } catch (error) {
        console.error('Failed to fetch receipts:', error)
        toast({
          title: 'Error',
          description: 'Failed to load receipts. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const fetchReceipt = useCallback(
    async (id: string): Promise<Receipt | null> => {
      setIsLoading(true)
      try {
        const result = await ReceiptService.getReceipt(id)
        return result.receipts[0] || null
      } catch (error) {
        console.error('Failed to fetch receipt:', error)
        toast({
          title: 'Error',
          description: 'Failed to load receipt details.',
          variant: 'destructive',
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const createReceipt = useCallback(
    async (data: Omit<ReceiptInsert, 'user_id'>): Promise<Receipt | null> => {
      try {
        const result = await ReceiptService.createReceipt(data)
        toast({
          title: 'Success',
          description: 'Receipt saved successfully!',
          variant: 'success',
        })
        return result
      } catch (error) {
        console.error('Failed to create receipt:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to save receipt.',
          variant: 'destructive',
        })
        return null
      }
    },
    [],
  )

  const updateReceipt = useCallback(
    async (
      id: string,
      data: Partial<ReceiptUpdate>,
    ): Promise<Receipt | null> => {
      try {
        const result = await ReceiptService.updateReceipt(id, data)
        toast({
          title: 'Success',
          description: 'Receipt updated successfully!',
          variant: 'success',
        })
        return result.receipt
      } catch (error) {
        console.error('Failed to update receipt:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update receipt.',
          variant: 'destructive',
        })
        return null
      }
    },
    [],
  )

  const deleteReceipt = useCallback(async (id: string): Promise<boolean> => {
    try {
      await ReceiptService.deleteReceipt(id)
      toast({
        title: 'Success',
        description: 'Receipt deleted successfully!',
        variant: 'success',
      })
      return true
    } catch (error) {
      console.error('Failed to delete receipt:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete receipt.',
        variant: 'destructive',
      })
      return false
    }
  }, [])

  const exportCsv = useCallback(async () => {
    try {
      const blob = await ReceiptService.exportCsv()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cosmoxis-receipts-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: 'Receipts exported successfully!',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to export CSV:', error)
      toast({
        title: 'Error',
        description: 'Failed to export receipts.',
        variant: 'destructive',
      })
    }
  }, [])

  return {
    receipts,
    isLoading,
    pagination,
    fetchReceipts,
    fetchReceipt,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    exportCsv,
  }
}
