'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  formatDateTimeWithTimezone,
} from '@/lib/utils'
import type { Receipt as ReceiptType, Json } from '@/types/database'
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

// Helper function to format field names
function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

// Helper function to format JSON values for display
function formatJsonValue(value: Json): string {
  if (value === null) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string') return value || 'N/A'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None'
    return value
      .map((item) =>
        typeof item === 'object' ? JSON.stringify(item) : String(item),
      )
      .join(', ')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

// Format file size in human-readable format (KB, MB, etc.)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Check if a field is a size field that should be formatted
function isSizeField(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey.includes('size') ||
    lowerKey === 'file_size' ||
    lowerKey === 'image_size'
  )
}

// Fields that are protected and cannot be edited
const PROTECTED_FIELDS = [
  'image_size',
  'image_base64',
  'image_url',
  'image_path',
  'file_size',
  'file_name',
  'created_at',
  'updated_at',
  'user_id',
  'id',
  'receipt_id',
  'manual_entry',
]

// Fields that should be hidden from display (but still preserved)
const HIDDEN_FIELDS = ['image_base64', 'base64']

// Check if a field is protected
function isProtectedField(key: string): boolean {
  return PROTECTED_FIELDS.some(
    (protectedField) =>
      key.toLowerCase() === protectedField.toLowerCase() ||
      key.toLowerCase().includes('base64') ||
      key.toLowerCase().includes('size'),
  )
}

// Check if a field should be hidden
function isHiddenField(key: string): boolean {
  return HIDDEN_FIELDS.some(
    (hiddenField) =>
      key.toLowerCase() === hiddenField.toLowerCase() ||
      key.toLowerCase().includes('base64'),
  )
}

// Check if a field is a category field
function isCategoryField(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey === 'suggested_category' ||
    lowerKey === 'category' ||
    lowerKey.includes('category')
  )
}

// Default fields for manually entered receipts
const DEFAULT_FIELDS: Record<string, Json> = {
  merchant_name: null,
  date: null,
  total_amount: null,
  subtotal: null,
  tax: null,
  suggested_category: null,
  payment_method: null,
  line_items: [],
  notes: null,
}

// Check if a value is an array of objects (like line_items)
function isLineItemsArray(value: Json): boolean {
  return (
    Array.isArray(value) && (value.length === 0 || typeof value[0] === 'object')
  )
}

export function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
  const router = useRouter()
  const [receipt, setReceipt] = useState<ReceiptType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isEditingRaw, setIsEditing] = useState(false)
  const [editedFields, setEditedFields] = useState<Record<string, Json>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isRawExpanded, setIsRawExpanded] = useState(false)

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

  const handleEditRawData = () => {
    // For manually entered receipts, start with default fields
    if (!receipt?.raw_extraction_json) {
      setEditedFields({ ...DEFAULT_FIELDS })
      setIsEditing(true)
      return
    }

    const rawData = receipt.raw_extraction_json
    if (
      typeof rawData === 'object' &&
      rawData !== null &&
      !Array.isArray(rawData)
    ) {
      // Merge with default fields to ensure all fields are available
      setEditedFields({ ...DEFAULT_FIELDS, ...rawData } as Record<string, Json>)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedFields({})
  }

  const handleFieldChange = (key: string, value: string) => {
    // Try to parse as JSON for arrays/objects, otherwise keep as string
    let parsedValue: Json = value
    try {
      const parsed = JSON.parse(value)
      parsedValue = parsed
    } catch {
      // Keep as string if not valid JSON
    }
    setEditedFields((prev) => ({
      ...prev,
      [key]: parsedValue,
    }))
  }

  // Handle line item changes
  const handleLineItemChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setEditedFields((prev) => {
      const lineItems = Array.isArray(prev.line_items)
        ? [...prev.line_items]
        : []
      const item = (lineItems[index] as Record<string, Json>) || {}
      return {
        ...prev,
        line_items: [
          ...lineItems.slice(0, index),
          { ...item, [field]: value },
          ...lineItems.slice(index + 1),
        ],
      }
    })
  }

  // Add a new line item
  const handleAddLineItem = () => {
    setEditedFields((prev) => {
      const lineItems = Array.isArray(prev.line_items)
        ? [...prev.line_items]
        : []
      // Determine field names based on existing items or use defaults
      if (lineItems.length > 0) {
        const firstItem = lineItems[0] as Record<string, Json> | null
        if (firstItem && typeof firstItem === 'object') {
          // Use same field structure as existing items
          const hasDescription = 'description' in firstItem
          const hasAmount = 'amount' in firstItem
          const newItem = hasDescription
            ? { description: '', amount: 0 }
            : hasAmount
              ? { description: '', amount: 0 }
              : { name: '', quantity: 1, price: 0 }
          return {
            ...prev,
            line_items: [...lineItems, newItem],
          }
        }
      }
      // Default to description/amount format
      return {
        ...prev,
        line_items: [...lineItems, { description: '', amount: 0 }],
      }
    })
  }

  // Remove a line item
  const handleRemoveLineItem = (index: number) => {
    setEditedFields((prev) => {
      const lineItems = Array.isArray(prev.line_items)
        ? [...prev.line_items]
        : []
      return {
        ...prev,
        line_items: lineItems.filter((_, i) => i !== index),
      }
    })
  }

  const handleSaveRawData = async () => {
    if (!receipt) return

    try {
      setIsSaving(true)

      // Check if suggested_category was changed and update main category too
      const updatePayload: Record<string, unknown> = {
        id: receipt.id,
        raw_extraction_json: editedFields,
      }

      // Find any category field that was changed
      const categoryField = Object.keys(editedFields).find(
        (key) => isCategoryField(key) && !isProtectedField(key),
      )
      const rawJson = receipt.raw_extraction_json as Record<string, Json> | null
      if (
        categoryField &&
        rawJson &&
        editedFields[categoryField] !== rawJson[categoryField]
      ) {
        updatePayload.category = editedFields[categoryField]
      }

      const response = await fetch('/api/receipts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      if (response.ok) {
        const data = await response.json()
        setReceipt(data.receipt)
        setIsEditing(false)
        setEditedFields({})
        toast({
          title: 'Success',
          description: 'Raw extraction data updated successfully',
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Failed to save raw data:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save raw extraction data',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
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
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Raw Extraction Data
                </CardTitle>
                <div className='flex items-center gap-2'>
                  {!isEditingRaw && (
                    <>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleEditRawData}>
                        <Edit className='h-4 w-4 mr-1' />
                        Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsRawExpanded(!isRawExpanded)}>
                        {isRawExpanded ? (
                          <ChevronUp className='h-4 w-4' />
                        ) : (
                          <ChevronDown className='h-4 w-4' />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingRaw ? (
                <div className='space-y-4'>
                  <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800'>
                    <strong>Note:</strong> Protected fields (shown with gray
                    background) cannot be modified.
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isRawExpanded ? 'max-h-[2000px]' : 'max-h-[300px]'
                    }`}>
                    <div className='grid gap-3'>
                      {Object.entries(editedFields)
                        .filter(([key]) => !isHiddenField(key))
                        .map(([key, value]) => {
                          const isProtected = isProtectedField(key)
                          const isSize =
                            isSizeField(key) && typeof value === 'number'
                          const isCategory =
                            isCategoryField(key) && !isProtected
                          const isLineItems = key === 'line_items'

                          // Skip line items here - we'll render them separately
                          if (isLineItems) return null

                          const displayValue =
                            typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value ?? '')
                          return (
                            <div
                              key={key}
                              className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-lg ${
                                isProtected
                                  ? 'bg-slate-100 border border-slate-200'
                                  : 'bg-muted/50'
                              }`}>
                              <span
                                className={`text-sm font-medium sm:min-w-[150px] ${
                                  isProtected
                                    ? 'text-slate-500'
                                    : 'text-muted-foreground'
                                }`}>
                                {formatFieldName(key)}
                                {isProtected && (
                                  <span className='ml-2 text-xs text-slate-400'>
                                    (protected)
                                  </span>
                                )}
                              </span>
                              {isProtected ? (
                                <span className='text-sm text-slate-600 break-all'>
                                  {isSize
                                    ? formatFileSize(value as number)
                                    : formatJsonValue(value)}
                                </span>
                              ) : isCategory ? (
                                <Select
                                  value={String(value ?? '')}
                                  onValueChange={(newValue) =>
                                    handleFieldChange(key, newValue)
                                  }>
                                  <SelectTrigger className='text-sm flex-1'>
                                    <SelectValue placeholder='Select category' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(CATEGORY_LABELS).map(
                                      ([catKey, catLabel]) => (
                                        <SelectItem key={catKey} value={catKey}>
                                          {catLabel}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={displayValue}
                                  onChange={(e) =>
                                    handleFieldChange(key, e.target.value)
                                  }
                                  className='text-sm flex-1'
                                  placeholder={`Enter ${formatFieldName(key)}`}
                                />
                              )}
                            </div>
                          )
                        })}

                      {/* Line Items Section */}
                      {editedFields.line_items && (
                        <div className='col-span-full border rounded-lg p-4 bg-slate-50'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='text-sm font-medium text-slate-700'>
                              Line Items
                            </h4>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={handleAddLineItem}
                              type='button'>
                              <Plus className='h-4 w-4 mr-1' />
                              Add Item
                            </Button>
                          </div>
                          <div className='space-y-3'>
                            {Array.isArray(editedFields.line_items) &&
                            editedFields.line_items.length > 0 ? (
                              editedFields.line_items.map((item, index) => {
                                const lineItem =
                                  typeof item === 'object' && item !== null
                                    ? (item as Record<string, Json>)
                                    : {}
                                // Support various field names for line items
                                const description =
                                  lineItem.description ||
                                  lineItem.name ||
                                  lineItem.item ||
                                  ''
                                const amount =
                                  lineItem.amount ||
                                  lineItem.price ||
                                  lineItem.total ||
                                  0
                                const qty =
                                  lineItem.quantity || lineItem.qty || null
                                // Determine which field names to use based on existing data
                                const descField =
                                  lineItem.description !== undefined
                                    ? 'description'
                                    : lineItem.name !== undefined
                                      ? 'name'
                                      : 'description'
                                const amtField =
                                  lineItem.amount !== undefined
                                    ? 'amount'
                                    : lineItem.price !== undefined
                                      ? 'price'
                                      : 'amount'
                                const qtyField =
                                  lineItem.quantity !== undefined
                                    ? 'quantity'
                                    : lineItem.qty !== undefined
                                      ? 'qty'
                                      : 'quantity'
                                return (
                                  <div
                                    key={index}
                                    className='flex flex-col sm:flex-row gap-2 p-3 bg-white rounded border'>
                                    <Input
                                      value={String(description)}
                                      onChange={(e) =>
                                        handleLineItemChange(
                                          index,
                                          descField,
                                          e.target.value,
                                        )
                                      }
                                      className='text-sm flex-1'
                                      placeholder='Item description'
                                    />
                                    <Input
                                      type='number'
                                      value={qty ? String(qty) : ''}
                                      onChange={(e) =>
                                        handleLineItemChange(
                                          index,
                                          qtyField,
                                          e.target.value,
                                        )
                                      }
                                      className='text-sm w-20'
                                      placeholder='Qty'
                                      min='1'
                                    />
                                    <Input
                                      type='number'
                                      value={String(amount)}
                                      onChange={(e) =>
                                        handleLineItemChange(
                                          index,
                                          amtField,
                                          e.target.value,
                                        )
                                      }
                                      className='text-sm w-24'
                                      placeholder='Amount'
                                      step='0.01'
                                    />
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        handleRemoveLineItem(index)
                                      }
                                      className='text-red-500 hover:text-red-700 hover:bg-red-50'>
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                )
                              })
                            ) : (
                              <p className='text-sm text-muted-foreground text-center py-4'>
                                No line items. Click "Add Item" to add one.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isRawExpanded &&
                    Object.keys(editedFields).filter(
                      (key) => !isHiddenField(key),
                    ).length > 5 && (
                      <div className='text-center mt-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsRawExpanded(true)}
                          className='text-muted-foreground'>
                          <ChevronDown className='h-4 w-4 mr-1' />
                          Show all fields
                        </Button>
                      </div>
                    )}
                  <div className='flex justify-end gap-2 pt-4 border-t'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCancelEdit}
                      disabled={isSaving}>
                      <X className='h-4 w-4 mr-1' />
                      Cancel
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleSaveRawData}
                      disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4 mr-1' />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isRawExpanded ? 'max-h-[2000px]' : 'max-h-[200px]'
                    }`}>
                    <div className='grid gap-3'>
                      {receipt.raw_extraction_json ? (
                        Object.entries(
                          receipt.raw_extraction_json as Record<string, Json>,
                        )
                          .filter(([key]) => !isHiddenField(key))
                          .map(([key, value]) => {
                            const isProtected = isProtectedField(key)
                            const isSize =
                              isSizeField(key) && typeof value === 'number'
                            const isLineItems = key === 'line_items'

                            // Skip line items here - render separately
                            if (isLineItems) return null

                            return (
                              <div
                                key={key}
                                className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-lg ${
                                  isProtected
                                    ? 'bg-slate-100 border border-slate-200'
                                    : 'bg-muted/50'
                                }`}>
                                <span
                                  className={`text-sm font-medium sm:min-w-[150px] ${
                                    isProtected
                                      ? 'text-slate-500'
                                      : 'text-muted-foreground'
                                  }`}>
                                  {formatFieldName(key)}
                                  {isProtected && (
                                    <span className='ml-2 text-xs text-slate-400'>
                                      (protected)
                                    </span>
                                  )}
                                </span>
                                <span
                                  className={`text-sm break-all ${
                                    isProtected
                                      ? 'text-slate-600'
                                      : 'text-foreground'
                                  }`}>
                                  {isSize
                                    ? formatFileSize(value as number)
                                    : formatJsonValue(value)}
                                </span>
                              </div>
                            )
                          })
                      ) : (
                        <div className='text-center py-8 text-muted-foreground'>
                          <p>No extraction data available.</p>
                          <p className='text-sm mt-1'>
                            Click "Edit" to add data for this manually entered
                            receipt.
                          </p>
                        </div>
                      )}

                      {/* Line Items Display */}
                      {receipt.raw_extraction_json &&
                        Array.isArray(
                          (receipt.raw_extraction_json as Record<string, Json>)
                            .line_items,
                        ) &&
                        (
                          (receipt.raw_extraction_json as Record<string, Json>)
                            .line_items as Json[]
                        ).length > 0 && (
                          <div className='border rounded-lg p-4 bg-slate-50'>
                            <h4 className='text-sm font-medium text-slate-700 mb-3'>
                              Line Items
                            </h4>
                            <div className='space-y-2'>
                              {(
                                (
                                  receipt.raw_extraction_json as Record<
                                    string,
                                    Json
                                  >
                                ).line_items as Json[]
                              ).map((item, index) => {
                                const lineItem =
                                  typeof item === 'object' && item !== null
                                    ? (item as Record<string, Json>)
                                    : {}
                                // Support various field names for line items
                                const description =
                                  lineItem.description ||
                                  lineItem.name ||
                                  lineItem.item ||
                                  'Unnamed Item'
                                const amount =
                                  lineItem.amount ||
                                  lineItem.price ||
                                  lineItem.total ||
                                  0
                                const qty =
                                  lineItem.quantity || lineItem.qty || null
                                return (
                                  <div
                                    key={index}
                                    className='flex items-center gap-4 p-2 bg-white rounded border text-sm'>
                                    <span className='flex-1 font-medium'>
                                      {String(description)}
                                    </span>
                                    {qty && (
                                      <span className='text-muted-foreground'>
                                        x{String(qty)}
                                      </span>
                                    )}
                                    <span className='font-medium'>
                                      {formatCurrency(
                                        Number(amount),
                                        receipt.currency,
                                      )}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  {!isRawExpanded &&
                    receipt.raw_extraction_json &&
                    Object.entries(
                      receipt.raw_extraction_json as Record<string, Json>,
                    ).filter(([key]) => !isHiddenField(key)).length > 5 && (
                      <div className='text-center mt-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsRawExpanded(true)}
                          className='text-muted-foreground'>
                          <ChevronDown className='h-4 w-4 mr-1' />
                          Show all fields
                        </Button>
                      </div>
                    )}
                </>
              )}
            </CardContent>
          </Card>
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
