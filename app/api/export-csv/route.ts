import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Receipt } from '@/types/database'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: receipts, error: fetchError } = await query

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch receipts' },
        { status: 500 },
      )
    }

    // Generate CSV
    const headers = [
      'ID',
      'Merchant',
      'Date',
      'Amount',
      'Currency',
      'Category',
      'Notes',
      'Created At',
    ]

    const csvRows = [
      headers.join(','),
      ...(receipts?.map((r: Receipt) =>
        [
          r.id,
          `"${(r.merchant_name || '').replace(/"/g, '""')}"`,
          r.date || '',
          r.total_amount || '',
          r.currency,
          r.category || '',
          `"${(r.notes || '').replace(/"/g, '""')}"`,
          new Date(r.created_at).toISOString(),
        ].join(','),
      ) || []),
    ]

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cosmoxis-receipts-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to export CSV'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
