import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface ReceiptItem {
  total_amount: number | null
  category: string | null
  date: string | null
}

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
    const month = searchParams.get('month') // Format: YYYY-MM, or 'all' for all-time

    // Get current month for display
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    // Build the base query for all receipts (for all-time stats)
    let query = supabase
      .from('receipts')
      .select('total_amount, category, date')
      .eq('user_id', user.id)

    // If a specific month is requested (not 'all'), filter by date range
    if (month && month !== 'all') {
      const [year, monthNum] = month.split('-').map(Number)
      const firstDay = `${year}-${String(monthNum).padStart(2, '0')}-01`
      const lastDay = new Date(year, monthNum, 0).toISOString().split('T')[0]

      query = query.gte('date', firstDay).lte('date', lastDay)
    }

    const { data: receipts, error: fetchError } = await query

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 },
      )
    }

    // Calculate totals
    const totalSpent =
      (receipts as ReceiptItem[])?.reduce(
        (sum: number, r: ReceiptItem) => sum + (r.total_amount || 0),
        0,
      ) || 0

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    ;(receipts as ReceiptItem[])?.forEach((r: ReceiptItem) => {
      const cat = r.category || 'other'
      categoryBreakdown[cat] =
        (categoryBreakdown[cat] || 0) + (r.total_amount || 0)
    })

    // Get available months for navigation
    const { data: allReceipts } = await supabase
      .from('receipts')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    const availableMonths = new Set<string>()
    ;(allReceipts as { date: string }[])?.forEach((r: { date: string }) => {
      if (r.date) {
        const [y, m] = r.date.split('-')
        availableMonths.add(`${y}-${m}`)
      }
    })

    return NextResponse.json({
      month: month || 'all',
      totalSpent,
      receiptCount: receipts?.length || 0,
      categoryBreakdown,
      availableMonths: Array.from(availableMonths).sort().reverse(),
      currentMonth,
    })
  } catch (error) {
    console.error('Fetch stats error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
