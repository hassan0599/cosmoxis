'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReceiptScanner } from '@/components/receipt-scanner'
import { ReceiptForm } from '@/components/receipt-form'
import { ReceiptList } from '@/components/receipt-list'
import { ManualReceiptEntry } from '@/components/manual-receipt-entry'
import { StatsChart } from '@/components/stats-chart'
import { toast } from '@/hooks/use-toast'
import { useSubscription } from '@/hooks/use-subscription'
import {
  Plus,
  Download,
  DollarSign,
  Receipt as ReceiptIcon,
  TrendingUp,
  Loader2,
  Sparkles,
  Crown,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Receipt } from '@/types/database'

type ViewState = 'list' | 'scanning' | 'reviewing' | 'manual'

interface ExtractedData {
  merchant_name: string | null
  date: string | null
  total_amount: number | null
  currency: string
  suggested_category: string | null
  line_items: Array<{ description: string; amount: number }> | null
  confidence_score: number | null
}

interface ScanResult {
  extractedData: ExtractedData
  imageUrl: string | null
  imageBase64: string
}

interface Stats {
  month: string
  totalSpent: number
  receiptCount: number
  categoryBreakdown: Record<string, number>
  availableMonths: string[]
}

export default function DashboardPage() {
  const [viewState, setViewState] = useState<ViewState>('list')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const isInitialLoad = useRef(true)
  const { subscription, usage, limits, checkLimit } = useSubscription()

  // Debounce search query - only update the actual search after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [receiptsRes, statsRes] = await Promise.all([
        fetch(
          `/api/receipts?limit=20${debouncedSearchQuery ? `&search=${debouncedSearchQuery}` : ''}${
            categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''
          }`,
        ),
        fetch('/api/stats'),
      ])

      if (receiptsRes.ok) {
        const data = await receiptsRes.json()
        setReceipts(data.receipts)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      isInitialLoad.current = false
    }
  }, [debouncedSearchQuery, categoryFilter])

  // Fetch only receipts (for search/filter) without full page loading
  const fetchReceipts = useCallback(async () => {
    setIsLoadingReceipts(true)
    try {
      const receiptsRes = await fetch(
        `/api/receipts?limit=20${debouncedSearchQuery ? `&search=${debouncedSearchQuery}` : ''}${
          categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''
        }`,
      )

      if (receiptsRes.ok) {
        const data = await receiptsRes.json()
        setReceipts(data.receipts)
      }
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
    } finally {
      setIsLoadingReceipts(false)
    }
  }, [debouncedSearchQuery, categoryFilter])

  useEffect(() => {
    if (isInitialLoad.current) {
      fetchData()
    } else {
      fetchReceipts()
    }
  }, [fetchData, fetchReceipts])

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result)
    setViewState('reviewing')
  }

  const handleSaveReceipt = async (data: {
    merchant_name: string
    date: string
    total_amount: number
    currency: string
    category: string
    notes: string
    image_url: string | null
    raw_extraction_json: object
    confidence_score: number | null
  }) => {
    try {
      const response = await fetch('/api/save-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle limit exceeded error
        if (result.limitExceeded) {
          toast({
            title: 'Limit Reached',
            description:
              result.error || 'You have reached your monthly receipt limit.',
            variant: 'destructive',
          })
          throw new Error(result.error)
        }
        throw new Error(result.error || 'Failed to save receipt')
      }

      toast({
        title: 'Success',
        description: 'Receipt saved successfully!',
        variant: 'success',
      })

      setViewState('list')
      setScanResult(null)
      fetchData()
    } catch (error) {
      console.error('Save error:', error)
      if (!(error instanceof Error && error.message.includes('limit'))) {
        toast({
          title: 'Error',
          description: 'Failed to save receipt. Please try again.',
          variant: 'destructive',
        })
      }
      throw error
    }
  }

  const handleDeleteReceipt = async (id: string) => {
    try {
      const response = await fetch(`/api/receipts?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }

      toast({
        title: 'Success',
        description: 'Receipt deleted successfully!',
        variant: 'success',
      })

      fetchData()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete receipt. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleExportCsv = async () => {
    try {
      const response = await fetch('/api/export-csv')
      if (!response.ok) {
        throw new Error('Failed to export')
      }

      const blob = await response.blob()
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
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export receipts. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8 animate-fade-in'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground tracking-tight'>
            Dashboard
          </h1>
          <p className='text-secondary mt-1'>
            Manage your receipts and track spending
          </p>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={handleExportCsv}>
            <Download className='h-4 w-4 mr-2' />
            Export CSV
          </Button>
          <Button variant='outline' onClick={() => setViewState('manual')}>
            <Plus className='h-4 w-4 mr-2' />
            Manual Entry
          </Button>
          <Button onClick={() => setViewState('scanning')}>
            <Sparkles className='h-4 w-4 mr-2' />
            Scan with AI
          </Button>
        </div>
      </div>

      {/* Usage Indicator for Free Plan */}
      {subscription?.plan === 'free' && (
        <Card className='border-blue-200 bg-blue-50'>
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <Crown className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <p className='font-medium text-slate-900'>Free Plan</p>
                  <p className='text-sm text-slate-600'>
                    {usage?.receipts_count || 0}/{limits.receiptsPerMonth}{' '}
                    receipts • {usage?.ai_scans_count || 0}/
                    {limits.aiScansPerMonth} AI scans this month
                  </p>
                </div>
              </div>
              <Button
                size='sm'
                onClick={() => (window.location.href = '/pricing')}>
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {viewState === 'scanning' && (
        <div className='max-w-xl mx-auto animate-fade-in'>
          <Card className='border-0 shadow-md'>
            <CardHeader className='text-center pb-2'>
              <div className='w-11 h-11 rounded-lg bg-muted mx-auto flex items-center justify-center mb-3'>
                <Sparkles className='h-5 w-5 text-primary' />
              </div>
              <CardTitle className='text-xl'>Scan New Receipt</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Upload an image or take a photo of your receipt
              </p>
            </CardHeader>
            <CardContent>
              <ReceiptScanner
                onScanComplete={handleScanComplete}
                onCancel={() => setViewState('list')}
                onManualEntry={() => setViewState('manual')}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {viewState === 'reviewing' && scanResult && (
        <div className='animate-fade-in'>
          <h2 className='text-xl font-semibold text-foreground mb-4'>
            Review Receipt
          </h2>
          <ReceiptForm
            extractedData={scanResult.extractedData}
            imageUrl={scanResult.imageUrl}
            imageBase64={scanResult.imageBase64}
            onSave={handleSaveReceipt}
            onDiscard={() => {
              setViewState('list')
              setScanResult(null)
            }}
          />
        </div>
      )}

      {viewState === 'manual' && (
        <ManualReceiptEntry
          onSave={handleSaveReceipt}
          onCancel={() => setViewState('list')}
        />
      )}

      {viewState === 'list' && (
        <>
          {/* Stats Overview */}
          <div className='grid sm:grid-cols-3 gap-4'>
            <Card className='border-border hover:shadow-sm transition-shadow duration-200'>
              <CardContent className='p-5'>
                <div className='flex items-center gap-4'>
                  <div className='w-11 h-11 rounded-md bg-muted flex items-center justify-center'>
                    <DollarSign className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground font-medium'>
                      Total Spent
                    </p>
                    <p className='text-2xl font-semibold text-foreground tracking-tight'>
                      {formatCurrency(stats?.totalSpent || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-border hover:shadow-sm transition-shadow duration-200'>
              <CardContent className='p-5'>
                <div className='flex items-center gap-4'>
                  <div className='w-11 h-11 rounded-md bg-success-light flex items-center justify-center'>
                    <ReceiptIcon className='h-5 w-5 text-success' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground font-medium'>
                      Receipts
                    </p>
                    <p className='text-2xl font-semibold text-foreground tracking-tight'>
                      {stats?.receiptCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-border hover:shadow-sm transition-shadow duration-200'>
              <CardContent className='p-5'>
                <div className='flex items-center gap-4'>
                  <div className='w-11 h-11 rounded-md bg-muted flex items-center justify-center'>
                    <TrendingUp className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground font-medium'>
                      Period
                    </p>
                    <p className='text-2xl font-semibold text-foreground tracking-tight'>
                      {stats?.month === 'all'
                        ? 'All Time'
                        : stats?.month || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Chart and Receipt List */}
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <h2 className='text-lg font-semibold text-foreground mb-4'>
                Recent Receipts
              </h2>
              <ReceiptList
                receipts={receipts}
                onDelete={handleDeleteReceipt}
                onSearch={setSearchQuery}
                onFilter={setCategoryFilter}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                isLoading={isLoadingReceipts}
              />
            </div>

            <div>
              <h2 className='text-lg font-semibold text-foreground mb-4'>
                Spending by Category
              </h2>
              <StatsChart
                categoryBreakdown={stats?.categoryBreakdown || {}}
                totalSpent={stats?.totalSpent || 0}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
