import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkUsageLimit } from '@/lib/stripe/subscription'

// GET /api/subscriptions/limits - Check usage limit for an action
export async function GET(request: NextRequest) {
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
    const action = searchParams.get('action') as
      | 'receipt'
      | 'ai_scan'
      | 'pdf_report'
      | null

    if (!action || !['receipt', 'ai_scan', 'pdf_report'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const result = await checkUsageLimit(user.id, action)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking usage limit:', error)
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 },
    )
  }
}
