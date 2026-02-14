'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Subscription, UsageTracking, PlanType } from '@/types/database'

export interface SubscriptionData {
  subscription: Subscription | null
  usage: UsageTracking | null
  limits: {
    receiptsPerMonth: number
    aiScansPerMonth: number
    customCategories: number
    pdfReportsPerMonth: number
    storageBytes: number
  }
}

export interface UseSubscriptionReturn extends SubscriptionData {
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  checkLimit: (
    action: 'receipt' | 'ai_scan' | 'pdf_report',
  ) => Promise<{ allowed: boolean; remaining: number; limit: number }>
  createCheckout: (
    plan: PlanType,
    interval: 'monthly' | 'yearly',
  ) => Promise<{ url: string | null; error?: string }>
  openBillingPortal: () => Promise<{ url: string | null; error?: string }>
}

export function useSubscription(): UseSubscriptionReturn {
  const [data, setData] = useState<SubscriptionData>({
    subscription: null,
    usage: null,
    limits: {
      receiptsPerMonth: 10,
      aiScansPerMonth: 5,
      customCategories: 0,
      pdfReportsPerMonth: 0,
      storageBytes: 100 * 1024 * 1024,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/subscriptions')

      if (!response.ok) {
        throw new Error('Failed to fetch subscription data')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const checkLimit = useCallback(
    async (action: 'receipt' | 'ai_scan' | 'pdf_report') => {
      try {
        const response = await fetch(
          `/api/subscriptions/limits?action=${action}`,
        )

        if (!response.ok) {
          throw new Error('Failed to check limit')
        }

        return await response.json()
      } catch (err) {
        console.error('Error checking limit:', err)
        return { allowed: false, remaining: 0, limit: 0 }
      }
    },
    [],
  )

  const createCheckout = useCallback(
    async (plan: PlanType, interval: 'monthly' | 'yearly') => {
      try {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'checkout', plan, interval }),
        })

        const result = await response.json()

        if (!response.ok) {
          return {
            url: null,
            error: result.error || 'Failed to create checkout session',
          }
        }

        return { url: result.url }
      } catch (err) {
        return {
          url: null,
          error: err instanceof Error ? err.message : 'An error occurred',
        }
      }
    },
    [],
  )

  const openBillingPortal = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal' }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          url: null,
          error: result.error || 'Failed to open billing portal',
        }
      }

      return { url: result.url }
    } catch (err) {
      return {
        url: null,
        error: err instanceof Error ? err.message : 'An error occurred',
      }
    }
  }, [])

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchData,
    checkLimit,
    createCheckout,
    openBillingPortal,
  }
}
