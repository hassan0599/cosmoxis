'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  formatDateTimeWithTimezone,
} from '@/lib/utils'
import type { Receipt as ReceiptType } from '@/types/database'
import { toast } from '@/hooks/use-toast'

interface ReceiptDetailProps {
  receiptId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  meals: 'Meals & Dining',
  travel: 'Travel',
  office: 'Office Supplies',
  utilities: 'Utilities',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  meals: 'bg-orange-100 text-orange-800 border-orange-300',
  travel: 'bg-blue-100 text-blue-800 border-blue-300',
  office: 'bg-purple-100 text-purple-800 border-purple-300',
  utilities: 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
}

export function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
  const router = useRouter()
  const [receipt, setReceipt] = useState<ReceiptType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchReceipt()
  }, [receiptId])

  const fetchReceipt = async () => {
    setIsLoading(true)
    try {
      const [receiptRes, supabaseRes] = await Promise.all([
        fetch(`/api/receipts?id=${receiptId}`),
        import('@/lib/supabase/client'),
      ])

      if (receiptRes.ok) {
        const data = await receiptRes.json()
        if (data.receipts && data.receipts.length > 0) {
          const receiptData = data.receipts[0]
          setReceipt(receiptData)

          // If there's an image URL from Supabase storage, get a signed URL
          if (receiptData.image_url) {
            const supabase = (await supabaseRes).createClient()
            const pathMatch = receiptData.image_url.match(
              /receipt-images\/(.+)$/,
            )
            if (pathMatch) {
              const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                  .from('receipt-images')
                  .createSignedUrl(pathMatch[1], 3600) // 1 hour expiry

              if (!signedUrlError && signedUrlData?.signedUrl) {
                setImageUrl(signedUrlData.signedUrl)
              }
            }
          }
        } else {
          toast({
            title: 'Error',
            description: 'Receipt not found',
            variant: 'destructive',
          })
          router.back()
        }
      } else {
        throw new Error('Failed to fetch receipt')
      }
    } catch (error) {
      console.error('Failed to fetch receipt:', error)
      toast({
        title: 'Error',
        description: 'Failed to load receipt details',
        variant: 'destructive',
      })
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/receipts?id=${receiptId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Receipt deleted successfully',
        })
        router.back()
      } else {
        throw new Error('Failed to delete receipt')
      }
    } catch (error) {
      console.error('Failed to delete receipt:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete receipt',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <p className='text-muted-foreground'>Receipt not found</p>
      </div>
    )
  }

  const confidenceLevel =
    receipt.confidence_score !== null
      ? receipt.confidence_score >= 0.8
        ? 'high'
        : receipt.confidence_score >= 0.5
          ? 'medium'
          : 'low'
      : null

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to List
        </Button>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDelete}
            disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4 mr-2' />
            )}
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Merchant & Amount */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-2xl'>
                    {receipt.merchant_name || 'Unknown Merchant'}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Added on {formatDateTimeWithTimezone(receipt.created_at)}
                  </p>
                </div>
                {receipt.total_amount !== null && (
                  <div className='text-right'>
                    <p className='text-3xl font-bold text-foreground'>
                      {formatCurrency(receipt.total_amount, receipt.currency)}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Quick Info Grid */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                {receipt.date && (
                  <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
                    <Calendar className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Date</p>
                      <p className='font-medium'>{formatDate(receipt.date)}</p>
                    </div>
                  </div>
                )}
                {receipt.category && (
                  <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
                    <Tag className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Category</p>
                      <Badge
                        variant='outline'
                        className={
                          CATEGORY_COLORS[receipt.category] ||
                          CATEGORY_COLORS.other
                        }>
                        {CATEGORY_LABELS[receipt.category] || receipt.category}
                      </Badge>
                    </div>
                  </div>
                )}
                {confidenceLevel && (
                  <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
                    <FileText className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Confidence
                      </p>
                      <Badge
                        className={`mt-1 ${
                          confidenceLevel === 'high'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : confidenceLevel === 'medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                        variant='outline'>
                        {Math.round((receipt.confidence_score || 0) * 100)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {receipt.notes && (
                <div className='pt-4 border-t'>
                  <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                    Notes
                  </h4>
                  <p className='text-foreground'>{receipt.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raw Extraction Data */}
          {receipt.raw_extraction_json && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Raw Extraction Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='text-xs bg-muted p-4 rounded-lg overflow-x-auto'>
                  {JSON.stringify(receipt.raw_extraction_json, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Image */}
        <div className='space-y-6'>
          {imageUrl || receipt.image_url ? (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <ImageIcon className='h-5 w-5' />
                  Receipt Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='relative rounded-lg overflow-hidden border'>
                  <img
                    src={imageUrl || receipt.image_url || ''}
                    alt='Receipt'
                    className='w-full h-auto'
                  />
                  <a
                    href={imageUrl || receipt.image_url || '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-background transition-colors'>
                    <ExternalLink className='h-4 w-4' />
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='py-12 text-center'>
                <div className='w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4'>
                  <ImageIcon className='h-8 w-8 text-muted-foreground' />
                </div>
                <p className='text-muted-foreground'>No image available</p>
              </CardContent>
            </Card>
          )}

          {/* Receipt Info */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg'>Receipt Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>ID</span>
                <span className='font-mono text-xs truncate max-w-[150px]'>
                  {receipt.id}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Currency</span>
                <span className='font-medium'>{receipt.currency}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Created</span>
                <span className='font-medium'>
                  {formatDateTimeWithTimezone(receipt.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
