import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
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
      image_url,
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

    // Prepare receipt data
    const receiptData: ReceiptInsert = {
      user_id: user.id,
      merchant_name: merchant_name || null,
      date: date || null,
      total_amount: total_amount || null,
      currency: currency || 'USD',
      category: category || null,
      notes: notes || null,
      image_url: image_url || null,
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
