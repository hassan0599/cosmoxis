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
import { useReceipts } from '@/hooks/use-receipts'
import {
  formatFieldName,
  formatJsonValue,
  formatFileSize,
  isSizeField,
  isProtectedField,
  isHiddenField,
  isCategoryField,
  DEFAULT_FIELDS,
  isLineItemsArray,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/formatters'

interface ReceiptDetailProps {
  receiptId: string
}

export function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
  const router = useRouter()
  const [receipt, setReceipt] = useState<ReceiptType | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isEditingRaw, setIsEditing] = useState(false)
  const [editedFields, setEditedFields] = useState<Record<string, Json>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isRawExpanded, setIsRawExpanded] = useState(false)
  const { fetchReceipt, updateReceipt, deleteReceipt } = useReceipts()

  useEffect(() => {
    const loadReceipt = async () => {
      const receiptData = await fetchReceipt(receiptId)
      if (receiptData) {
        setReceipt(receiptData)
        // If there's an image URL from Supabase storage, get a signed URL
        if (receiptData.image_url) {
          const supabaseRes = await import('@/lib/supabase/client')
          const supabase = (await supabaseRes).createClient()
          const pathMatch = receiptData.image_url.match(/receipt-images\/(.+)$/)
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
        router.back()
      }
    }

    loadReceipt()
  }, [receiptId, fetchReceipt, router])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    const success = await deleteReceipt(receiptId)
    if (success) {
      router.back()
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

      const updatedReceipt = await updateReceipt(receipt.id, updatePayload)
      if (updatedReceipt) {
        setReceipt(updatedReceipt)
        setIsEditing(false)
        setEditedFields({})
      }
    } catch (error) {
      console.error('Failed to save raw data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!receipt) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
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
          <Button variant='outline' size='sm' onClick={handleDelete}>
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Details */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Receipt Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {receipt.merchant_name && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Merchant
                  </label>
                  <p className='text-lg font-semibold'>
                    {receipt.merchant_name}
                  </p>
                </div>
              )}

              {receipt.date && (
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Date
                    </label>
                    <p className='text-sm'>{formatDate(receipt.date)}</p>
                  </div>
                </div>
              )}

              {receipt.total_amount !== null && (
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Total Amount
                    </label>
                    <p className='text-lg font-semibold'>
                      {formatCurrency(receipt.total_amount, receipt.currency)}
                    </p>
                  </div>
                </div>
              )}

              {receipt.category && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Category
                  </label>
                  <Badge
                    className={`mt-1 ${
                      CATEGORY_COLORS[receipt.category] ||
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {CATEGORY_LABELS[receipt.category] || receipt.category}
                  </Badge>
                </div>
              )}

              {receipt.notes && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Notes
                  </label>
                  <p className='text-sm'>{receipt.notes}</p>
                </div>
              )}

              {confidenceLevel && (
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Confidence Level
                  </label>
                  <Badge
                    className={`mt-1 ${
                      confidenceLevel === 'high'
                        ? 'bg-green-100 text-green-800'
                        : confidenceLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                    {confidenceLevel.charAt(0).toUpperCase() +
                      confidenceLevel.slice(1)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raw Extraction Data */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Raw Extraction Data</CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleEditRawData}
                disabled={isEditingRaw}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingRaw ? (
                <div className='space-y-4'>
                  {Object.entries(editedFields).map(([key, value]) => {
                    if (isProtectedField(key) || isHiddenField(key)) {
                      return null
                    }

                    if (key === 'line_items' && isLineItemsArray(value)) {
                      return (
                        <div key={key} className='space-y-2'>
                          <label className='text-sm font-medium text-muted-foreground'>
                            {formatFieldName(key)}
                          </label>
                          <div className='space-y-2'>
                            {value.map((item, index) => (
                              <div
                                key={index}
                                className='flex gap-2 items-center'>
                                <Input
                                  value={JSON.stringify(item)}
                                  onChange={(e) =>
                                    handleLineItemChange(
                                      index,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                  className='flex-1'
                                />
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => handleRemoveLineItem(index)}>
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            ))}
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={handleAddLineItem}>
                              <Plus className='h-4 w-4 mr-1' />
                              Add Line Item
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={key} className='space-y-1'>
                        <label className='text-sm font-medium text-muted-foreground'>
                          {formatFieldName(key)}
                        </label>
                        <Input
                          value={JSON.stringify(value)}
                          onChange={(e) =>
                            handleFieldChange(key, e.target.value)
                          }
                        />
                      </div>
                    )
                  })}
                  <div className='flex gap-2'>
                    <Button onClick={handleSaveRawData} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4 mr-2' />
                      )}
                      Save
                    </Button>
                    <Button variant='ghost' onClick={handleCancelEdit}>
                      <X className='h-4 w-4 mr-2' />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-2'>
                  {receipt.raw_extraction_json &&
                    typeof receipt.raw_extraction_json === 'object' &&
                    !Array.isArray(receipt.raw_extraction_json) &&
                    Object.entries(receipt.raw_extraction_json).map(
                      ([key, value]) => {
                        if (isHiddenField(key)) return null

                        return (
                          <div
                            key={key}
                            className='flex justify-between items-start'>
                            <span className='text-sm text-muted-foreground'>
                              {formatFieldName(key)}
                            </span>
                            <span className='text-sm text-foreground'>
                              {isSizeField(key) && typeof value === 'number'
                                ? formatFileSize(value)
                                : formatJsonValue(value || null)}
                            </span>
                          </div>
                        )
                      },
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Image */}
        <div className='space-y-6'>
          {imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='relative'>
                  <img
                    src={imageUrl}
                    alt='Receipt'
                    className='w-full h-auto rounded-lg shadow-sm'
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
