'use client'

import { useState, useCallback, useEffect } from 'react'
import { StatsService } from '@/services/stats.service'
import type { Stats } from '@/services/stats.service'
import { toast } from '@/hooks/use-toast'

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await StatsService.getStats()
      setStats(result)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load statistics.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    fetchStats,
  }
}
