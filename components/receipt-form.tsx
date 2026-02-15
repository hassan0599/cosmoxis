'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  Save,
  X,
  Calendar,
  DollarSign,
  Building2,
  Tag,
  Sparkles,
} from 'lucide-react'

interface ReceiptFormProps {
  extractedData: {
    merchant_name: string | null
    date: string | null
    total_amount: number | null
    currency: string
    suggested_category: string | null
    line_items: Array<{ description: string; amount: number }> | null
    confidence_score: number | null
  }
  imageUrl: string | null
  imageBase64: string
  imageSize: number
  imageType: string
  receiptId: string
  onSave: (data: {
    merchant_name: string
    date: string
    total_amount: number
    currency: string
    category: string
    notes: string
    image_base64: string | null
    image_size: number
    image_type: string
    receipt_id: string
    raw_extraction_json: object
    confidence_score: number | null
  }) => Promise<void>
  onDiscard: () => void
}

const CATEGORIES = [
  { value: 'meals', label: 'Meals & Dining' },
  { value: 'travel', label: 'Travel' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
]

export function ReceiptForm({
  extractedData,
  imageUrl,
  imageBase64,
  imageSize,
  imageType,
  receiptId,
  onSave,
  onDiscard,
}: ReceiptFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [merchantName, setMerchantName] = useState(
    extractedData.merchant_name || '',
  )
  const [date, setDate] = useState(extractedData.date || '')
  const [totalAmount, setTotalAmount] = useState(
    extractedData.total_amount?.toString() || '',
  )
  const [currency, setCurrency] = useState(extractedData.currency || 'USD')
  const [category, setCategory] = useState(
    extractedData.suggested_category || 'other',
  )
  const [notes, setNotes] = useState('')

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave({
        merchant_name: merchantName,
        date: date,
        total_amount: parseFloat(totalAmount) || 0,
        currency,
        category,
        notes,
        image_base64: imageBase64,
        image_size: imageSize,
        image_type: imageType,
        receipt_id: receiptId,
        raw_extraction_json: extractedData,
        confidence_score: extractedData.confidence_score,
      })
    } catch (error) {
      console.error('Save error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className='grid md:grid-cols-2 gap-6'>
      {/* Receipt Image */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Sparkles className='h-4 w-4 text-primary' />
            Receipt Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='relative rounded-lg overflow-hidden bg-muted border border-border'>
            <img
              src={imageBase64 || imageUrl || ''}
              alt='Receipt'
              className='w-full object-contain max-h-96'
            />
          </div>
          {extractedData.confidence_score !== null && (
            <div className='mt-4 space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>AI Confidence</span>
                <span className='font-medium text-foreground'>
                  {Math.round((extractedData.confidence_score || 0) * 100)}%
                </span>
              </div>
              <div className='h-2 bg-muted rounded-full overflow-hidden'>
                <div
                  className='h-full bg-primary transition-all rounded-full'
                  style={{
                    width: `${(extractedData.confidence_score || 0) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>
            Review & Edit Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5'>
          {/* Merchant Name */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground flex items-center gap-2'>
              <Building2 className='h-4 w-4 text-muted-foreground' />
              Merchant Name
            </label>
            <Input
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder='Enter merchant name'
            />
          </div>

          {/* Date */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              Date
            </label>
            <Input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Total Amount */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
              Total Amount
            </label>
            <div className='flex gap-2'>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className='w-24'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='GBP'>GBP</SelectItem>
                  <SelectItem value='CAD'>CAD</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type='number'
                step='0.01'
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder='0.00'
                className='flex-1'
              />
            </div>
          </div>

          {/* Category */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground flex items-center gap-2'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add any additional notes...'
              rows={3}
            />
          </div>

          {/* Line Items Preview */}
          {extractedData.line_items && extractedData.line_items.length > 0 && (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Line Items
              </label>
              <div className='bg-muted rounded-xl p-4 space-y-2 max-h-32 overflow-y-auto'>
                {extractedData.line_items.map((item, index) => (
                  <div key={index} className='flex justify-between text-sm'>
                    <span className='text-foreground truncate flex-1'>
                      {item.description}
                    </span>
                    <span className='text-muted-foreground ml-2 font-medium'>
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <Button
              onClick={handleSave}
              disabled={isLoading || !merchantName || !totalAmount}
              className='flex-1'>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Save Receipt
                </>
              )}
            </Button>
            <Button variant='outline' onClick={onDiscard} disabled={isLoading}>
              <X className='h-4 w-4 mr-2' />
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
