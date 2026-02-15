import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  incrementUsage,
  checkStorageLimit,
  updateStorageUsage,
} from '@/lib/stripe/subscription'
import type { ReceiptInsert } from '@/types/database'

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

    const body = await request.json()
    const {
      merchant_name,
      date,
      total_amount,
      currency,
      category,
      notes,
      image_base64,
      image_size,
      image_type,
      receipt_id,
      raw_extraction_json,
      confidence_score,
    } = body

    // Validate required fields
    if (!merchant_name && !total_amount) {
      return NextResponse.json(
        { error: 'At least merchant name or total amount is required' },
        { status: 400 },
      )
    }

    let image_url: string | null = null

    // If there's an image, upload it to storage
    if (image_base64 && image_size && image_type && receipt_id) {
      // Check storage limit before uploading
      const storageCheck = await checkStorageLimit(user.id, image_size)
      if (!storageCheck.allowed) {
        const usedMB = Math.round(storageCheck.currentUsage / (1024 * 1024))
        const limitMB =
          storageCheck.limit === Infinity
            ? 'unlimited'
            : Math.round(storageCheck.limit / (1024 * 1024))
        return NextResponse.json(
          {
            error: `Storage limit exceeded. You've used ${usedMB}MB out of ${limitMB}MB. Upgrade your plan for more storage.`,
            storageExceeded: true,
            currentUsage: storageCheck.currentUsage,
            limit: storageCheck.limit,
          },
          { status: 403 },
        )
      }

      // Extract base64 data (remove data:image/xxx;base64, prefix)
      const base64Data = image_base64.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')

      // Determine file extension from image type
      const extension = image_type.split('/')[1] || 'jpg'
      const fileName = `${user.id}/${receipt_id}.${extension}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('receipt-images')
        .upload(fileName, buffer, {
          contentType: image_type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        // Continue without image URL if upload fails
      } else {
        // Get public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('receipt-images')
          .getPublicUrl(fileName)

        image_url = urlData?.publicUrl || null

        // Update storage usage after successful upload
        await updateStorageUsage(user.id, image_size)
      }
    }

    // Prepare receipt data
    const receiptData: ReceiptInsert = {
      user_id: user.id,
      merchant_name: merchant_name || null,
      date: date || null,
      total_amount: total_amount || null,
      currency: currency || 'USD',
      category: category || null,
      notes: notes || null,
      image_url: image_url,
      raw_extraction_json: raw_extraction_json || null,
      confidence_score: confidence_score || null,
    }

    // Insert receipt into database
    const { data: receipt, error: insertError } = await supabase
      .from('receipts')
      .insert(receiptData)
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save receipt' },
        { status: 500 },
      )
    }

    // Increment usage counter after successful save
    await incrementUsage(user.id, 'receipt')

    return NextResponse.json({
      success: true,
      receipt,
    })
  } catch (error) {
    console.error('Save receipt error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to save receipt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
