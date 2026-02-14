import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/receipts/check-duplicate - Check for duplicate receipts
export async function POST(request: NextRequest) {
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
    const { merchantName, totalAmount, date, excludeId } = body

    if (!merchantName || totalAmount === undefined || !date) {
      return NextResponse.json(
        { error: 'Merchant name, amount, and date are required' },
        { status: 400 },
      )
    }

    // Look for similar receipts
    // A duplicate is defined as:
    // - Same merchant name (case-insensitive, trimmed)
    // - Same total amount (within 0.01 tolerance)
    // - Same date

    let query = supabase
      .from('receipts')
      .select(
        'id, merchant_name, date, total_amount, currency, category, created_at',
      )
      .eq('user_id', user.id)
      .ilike('merchant_name', merchantName.trim())
      .eq('date', date)

    // Exclude the current receipt if editing
    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data: receipts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    type ReceiptData = {
      id: string
      merchant_name: string | null
      date: string | null
      total_amount: number | null
      currency: string
      category: string | null
      created_at: string
    }

    // Filter by amount (with tolerance for floating point comparison)
    const duplicates = ((receipts as ReceiptData[]) || []).filter((receipt) => {
      const amountDiff = Math.abs(
        Number(receipt.total_amount) - Number(totalAmount),
      )
      return amountDiff < 0.01
    })

    return NextResponse.json({
      isDuplicate: duplicates.length > 0,
      duplicates: duplicates.map((d) => ({
        id: d.id,
        merchantName: d.merchant_name,
        date: d.date,
        totalAmount: Number(d.total_amount),
        currency: d.currency,
        category: d.category,
        createdAt: d.created_at,
      })),
    })
  } catch (error) {
    console.error('Error checking for duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 },
    )
  }
}
