import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSubscriptionWithUsage,
  createCheckoutSession,
  createBillingPortalSession,
} from '@/lib/stripe/subscription'
import type { PlanType, BillingInterval } from '@/lib/stripe/config'

// GET /api/subscriptions - Get current subscription and usage
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionData = await getSubscriptionWithUsage(user.id)

    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 },
    )
  }
}

// POST /api/subscriptions - Create checkout session or billing portal session
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
    const { action, plan, interval } = body as {
      action: 'checkout' | 'portal'
      plan?: PlanType
      interval?: BillingInterval
    }

    if (action === 'checkout' && plan && interval) {
      const result = await createCheckoutSession(
        user.id,
        user.email || '',
        plan,
        interval,
      )

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ url: result.url })
    }

    if (action === 'portal') {
      const result = await createBillingPortalSession(user.id)

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ url: result.url })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing subscription request:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription request' },
      { status: 500 },
    )
  }
}
