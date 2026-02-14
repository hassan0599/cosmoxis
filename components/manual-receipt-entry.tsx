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
  Edit3,
} from 'lucide-react'

interface ManualReceiptEntryProps {
  onSave: (data: {
    merchant_name: string
    date: string
    total_amount: number
    currency: string
    category: string
    notes: string
    image_url: string | null
    raw_extraction_json: object
    confidence_score: number | null
  }) => Promise<void>
  onCancel: () => void
}

const CATEGORIES = [
  { value: 'meals', label: 'Meals & Dining' },
  { value: 'travel', label: 'Travel' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
]

export function ManualReceiptEntry({
  onSave,
  onCancel,
}: ManualReceiptEntryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [merchantName, setMerchantName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [totalAmount, setTotalAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState('other')
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
        image_url: null,
        raw_extraction_json: { manual_entry: true },
        confidence_score: null,
      })
    } catch (error) {
      console.error('Save error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className='max-w-xl mx-auto'>
      <Card className='shadow-sm'>
        <CardHeader className='text-center pb-2'>
          <div className='w-11 h-11 rounded-lg bg-muted mx-auto flex items-center justify-center mb-3'>
            <Edit3 className='h-5 w-5 text-primary' />
          </div>
          <CardTitle className='text-xl'>Manual Entry</CardTitle>
          <p className='text-sm text-muted-foreground mt-1'>
            Enter receipt details manually without AI scanning
          </p>
        </CardHeader>
        <CardContent className='space-y-5'>
          {/* Merchant Name */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground flex items-center gap-2'>
              <Building2 className='h-4 w-4 text-muted-foreground' />
              Merchant Name <span className='text-error'>*</span>
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
              Date <span className='text-error'>*</span>
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
              Total Amount <span className='text-error'>*</span>
            </label>
            <div className='flex gap-2'>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.value}
                    </SelectItem>
                  ))}
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

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <Button
              onClick={handleSave}
              disabled={isLoading || !merchantName || !totalAmount || !date}
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
            <Button variant='outline' onClick={onCancel} disabled={isLoading}>
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
