import {
  stripe,
  getPriceId,
  PLAN_PRICES,
  type PlanType,
  type BillingInterval,
} from './config'
import { createClient } from '@/lib/supabase/server'
import type { Subscription, UsageTracking } from '@/types/database'

export interface SubscriptionWithUsage {
  subscription: Subscription | null
  usage: UsageTracking | null
  limits: {
    receiptsPerMonth: number
    aiScansPerMonth: number
    customCategories: number
    pdfReportsPerMonth: number
    storageBytes: number
  }
}

// Get current subscription and usage for a user
export async function getSubscriptionWithUsage(
  userId: string,
): Promise<SubscriptionWithUsage> {
  const supabase = await createClient()

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get current period usage
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single()

  const plan = subscription?.plan || 'free'

  return {
    subscription,
    usage,
    limits: getPlanLimits(plan),
  }
}

// Get limits for a plan
export function getPlanLimits(plan: PlanType) {
  const limits = {
    free: {
      receiptsPerMonth: Infinity,
      aiScansPerMonth: 5,
      customCategories: 0,
      pdfReportsPerMonth: 0,
      storageBytes: 100 * 1024 * 1024, // 100MB
    },
    pro: {
      receiptsPerMonth: Infinity,
      aiScansPerMonth: Infinity,
      customCategories: 10,
      pdfReportsPerMonth: 5,
      storageBytes: 5 * 1024 * 1024 * 1024, // 5GB
    },
    business: {
      receiptsPerMonth: Infinity,
      aiScansPerMonth: Infinity,
      customCategories: Infinity,
      pdfReportsPerMonth: Infinity,
      storageBytes: 50 * 1024 * 1024 * 1024, // 50GB
    },
    enterprise: {
      receiptsPerMonth: Infinity,
      aiScansPerMonth: Infinity,
      customCategories: Infinity,
      pdfReportsPerMonth: Infinity,
      storageBytes: Infinity,
    },
  }

  return limits[plan]
}

// Check if user can perform an action based on their plan limits
export async function checkUsageLimit(
  userId: string,
  action: 'receipt' | 'ai_scan' | 'pdf_report',
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const { subscription, usage, limits } = await getSubscriptionWithUsage(userId)

  const currentUsage = {
    receipt: usage?.receipts_count || 0,
    ai_scan: usage?.ai_scans_count || 0,
    pdf_report: usage?.pdf_reports_count || 0,
  }

  const limitMap = {
    receipt: limits.receiptsPerMonth,
    ai_scan: limits.aiScansPerMonth,
    pdf_report: limits.pdfReportsPerMonth,
  }

  const limit = limitMap[action]
  const used = currentUsage[action]
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used)

  return {
    allowed: limit === Infinity || used < limit,
    remaining,
    limit,
  }
}

// Increment usage counter
export async function incrementUsage(
  userId: string,
  action: 'receipt' | 'ai_scan' | 'pdf_report',
): Promise<void> {
  const supabase = await createClient()

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const columnMap = {
    receipt: 'receipts_count',
    ai_scan: 'ai_scans_count',
    pdf_report: 'pdf_reports_count',
  }

  // Try to update existing record
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single()

  if (existing) {
    // Update existing record
    await supabase
      .from('usage_tracking')
      .update({
        [columnMap[action]]:
          (existing as Record<string, number>)[columnMap[action]] + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (existing as { id: string }).id)
  } else {
    // Create new record
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      [columnMap[action]]: 1,
    })
  }
}

// Create a Stripe checkout session
export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: PlanType,
  interval: BillingInterval,
): Promise<{ url: string | null; error?: string }> {
  if (!stripe) {
    return { url: null, error: 'Stripe is not configured' }
  }

  const priceId = getPriceId(plan, interval)
  if (!priceId) {
    return { url: null, error: 'Invalid plan or interval' }
  }

  try {
    // Get or create Stripe customer
    const supabase = await createClient()
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      // Update subscription with customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
        plan,
        interval,
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return { url: null, error: 'Failed to create checkout session' }
  }
}

// Create a Stripe billing portal session
export async function createBillingPortalSession(
  userId: string,
): Promise<{ url: string | null; error?: string }> {
  if (!stripe) {
    return { url: null, error: 'Stripe is not configured' }
  }

  try {
    const supabase = await createClient()
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!subscription?.stripe_customer_id) {
      return { url: null, error: 'No Stripe customer found' }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return { url: null, error: 'Failed to create billing portal session' }
  }
}

// Handle Stripe webhook events
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan as PlanType
      const interval = session.metadata?.interval as BillingInterval

      if (userId && plan) {
        await supabase
          .from('subscriptions')
          .update({
            plan,
            status: 'active',
            stripe_subscription_id: session.subscription as string,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              new Date().setMonth(
                new Date().getMonth() + (interval === 'yearly' ? 12 : 1),
              ),
            ).toISOString(),
          })
          .eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: userSubscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (userSubscription) {
        const priceId = subscription.items.data[0]?.price.id
        const planInfo = priceId ? getPlanFromPriceId(priceId) : null

        // Cast to access period timestamps (Stripe types may vary by version)
        const subData = subscription as unknown as {
          current_period_start?: number
          current_period_end?: number
        }

        await supabase
          .from('subscriptions')
          .update({
            plan: planInfo?.plan || 'free',
            status:
              subscription.status === 'active' ? 'active' : subscription.status,
            current_period_start: subData.current_period_start
              ? new Date(subData.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subData.current_period_end
              ? new Date(subData.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('user_id', userSubscription.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId)

      break
    }
  }
}

// Import the getPlanFromPriceId function
import { getPlanFromPriceId } from './config'
import type Stripe from 'stripe'
