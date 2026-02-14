'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Camera, Loader2, X, Image as ImageIcon } from 'lucide-react'

interface ReceiptScannerProps {
  onScanComplete: (data: {
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
  }) => void
  onCancel: () => void
}

export function ReceiptScanner({
  onScanComplete,
  onCancel,
}: ReceiptScannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG and PNG files are allowed.')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Upload and process
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process receipt')
      }

      onScanComplete({
        extractedData: result.data,
        imageUrl: result.data.image_url,
        imageBase64: result.data.image_base64,
      })
    } catch (err) {
      console.error('Scan error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process receipt')
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const clearPreview = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  return (
    <div className='space-y-4'>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-16 space-y-4'>
          <div className='relative'>
            <div className='w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          </div>
          <div className='text-center'>
            <p className='text-lg font-medium text-foreground'>
              Analyzing receipt with AI
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              This may take a few seconds
            </p>
          </div>
        </div>
      ) : previewUrl ? (
        <div className='relative'>
          <img
            src={previewUrl}
            alt='Receipt preview'
            className='w-full max-h-64 object-contain rounded-lg border border-border'
          />
          <Button
            variant='destructive'
            size='icon'
            className='absolute top-2 right-2 h-8 w-8 rounded-md'
            onClick={clearPreview}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      ) : (
        <>
          <div
            className='border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-muted transition-all duration-200 group'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}>
            <div className='w-14 h-14 rounded-lg bg-muted mx-auto flex items-center justify-center mb-4 group-hover:bg-muted transition-colors'>
              <Upload className='h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors' />
            </div>
            <p className='text-foreground font-medium mb-1'>
              Drag and drop your receipt here
            </p>
            <p className='text-sm text-muted-foreground mb-4'>
              or click to browse (JPG, PNG up to 10MB)
            </p>
            <Button variant='outline' type='button' size='sm'>
              <ImageIcon className='h-4 w-4 mr-2' />
              Choose File
            </Button>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex-1 h-px bg-border' />
            <span className='text-sm text-muted-foreground font-medium'>
              or
            </span>
            <div className='flex-1 h-px bg-border' />
          </div>

          <div className='flex justify-center gap-3'>
            <Button
              variant='outline'
              type='button'
              onClick={() => cameraInputRef.current?.click()}
              className='gap-2'>
              <Camera className='h-4 w-4' />
              Take Photo
            </Button>
            <Button
              variant='ghost'
              type='button'
              onClick={onCancel}
              className='text-muted-foreground'>
              Cancel
            </Button>
          </div>
        </>
      )}

      {error && (
        <div className='p-4 bg-error-light border border-error/20 rounded-xl'>
          <p className='text-sm text-error font-medium'>{error}</p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png,image/jpg'
        onChange={handleFileChange}
        className='hidden'
      />
      <input
        ref={cameraInputRef}
        type='file'
        accept='image/jpeg,image/png,image/jpg'
        capture='environment'
        onChange={handleFileChange}
        className='hidden'
      />
    </div>
  )
}
