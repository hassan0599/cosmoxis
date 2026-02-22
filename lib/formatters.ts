import type { Json } from '@/types/database'

// Helper function to format field names
export function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

// Helper function to format JSON values for display
export function formatJsonValue(value: Json): string {
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
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Check if a field is a size field that should be formatted
export function isSizeField(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey.includes('size') ||
    lowerKey === 'file_size' ||
    lowerKey === 'image_size'
  )
}

// Fields that are protected and cannot be edited
export const PROTECTED_FIELDS = [
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
export const HIDDEN_FIELDS = ['image_base64', 'base64']

// Check if a field is protected
export function isProtectedField(key: string): boolean {
  return PROTECTED_FIELDS.some(
    (protectedField) =>
      key.toLowerCase() === protectedField.toLowerCase() ||
      key.toLowerCase().includes('base64') ||
      key.toLowerCase().includes('size'),
  )
}

// Check if a field should be hidden
export function isHiddenField(key: string): boolean {
  return HIDDEN_FIELDS.some(
    (hiddenField) =>
      key.toLowerCase() === hiddenField.toLowerCase() ||
      key.toLowerCase().includes('base64'),
  )
}

// Check if a field is a category field
export function isCategoryField(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey === 'suggested_category' ||
    lowerKey === 'category' ||
    lowerKey.includes('category')
  )
}

// Default fields for manually entered receipts
export const DEFAULT_FIELDS: Record<string, Json> = {
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
export function isLineItemsArray(
  value: Json,
): value is Array<{ [key: string]: any }> {
  if (!value || !Array.isArray(value)) {
    return false
  }

  return (
    value.length === 0 || (value.length > 0 && typeof value[0] === 'object')
  )
}

// Category display labels and colors
export const CATEGORY_LABELS: Record<string, string> = {
  meals: 'Meals & Dining',
  travel: 'Travel',
  office: 'Office Supplies',
  utilities: 'Utilities',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<string, string> = {
  meals: 'bg-orange-100 text-orange-800 border-orange-300',
  travel: 'bg-blue-100 text-blue-800 border-blue-300',
  office: 'bg-purple-100 text-purple-800 border-purple-300',
  utilities: 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
}
