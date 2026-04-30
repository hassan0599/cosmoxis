import { createClient } from '@/lib/supabase/server'
import { extractReceiptData } from '@/lib/openrouter'
import { checkUsageLimit, incrementUsage } from '@/lib/stripe/subscription'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check AI scan limit before processing
    const limitCheck = await checkUsageLimit(user.id, 'ai_scan')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `You've reached your monthly limit of ${limitCheck.limit} AI scans. Upgrade your plan for unlimited scans.`,
          limitExceeded: true,
          limit: limitCheck.limit,
        },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.',
        },
        { status: 400 },
      )
    }

    // Validate file size (20MB max before compression)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 },
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Extract receipt data using OpenRouter
    const extractedData = await extractReceiptData(base64)

    // Increment AI scan usage counter after successful extraction
    await incrementUsage(user.id, 'ai_scan')

    // Generate a unique ID for the receipt
    const receiptId = crypto.randomUUID()

    // Return extracted data with base64 image - storage upload happens on save
    return NextResponse.json({
      success: true,
      data: {
        ...extractedData,
        image_base64: base64,
        image_size: file.size,
        image_type: file.type,
        receipt_id: receiptId,
      },
    })
  } catch (error) {
    console.error('Upload receipt error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to process receipt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
