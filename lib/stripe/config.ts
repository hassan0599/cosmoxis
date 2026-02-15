import Stripe from 'stripe'

// Initialize Stripe only if the secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : null

// Stripe product and price IDs
export const STRIPE_PRODUCTS = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  },
  business: {
    monthly:
      process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_business_monthly',
    yearly:
      process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || 'price_business_yearly',
  },
} as const

// Plan prices for display
export const PLAN_PRICES = {
  free: {
    monthly: 0,
    yearly: 0,
  },
  pro: {
    monthly: 9,
    yearly: 89, // 2 months free
  },
  business: {
    monthly: 29,
    yearly: 290, // 2 months free
  },
  enterprise: {
    monthly: null, // Custom pricing
    yearly: null,
  },
} as const

export type PlanType = 'free' | 'pro' | 'business' | 'enterprise'
export type BillingInterval = 'monthly' | 'yearly'

export function getPriceId(
  plan: PlanType,
  interval: BillingInterval,
): string | null {
  if (plan === 'free' || plan === 'enterprise') return null
  return STRIPE_PRODUCTS[plan][interval]
}

export function getPlanFromPriceId(
  priceId: string,
): { plan: PlanType; interval: BillingInterval } | null {
  for (const [plan, prices] of Object.entries(STRIPE_PRODUCTS)) {
    for (const [interval, id] of Object.entries(prices)) {
      if (id === priceId) {
        return { plan: plan as PlanType, interval: interval as BillingInterval }
      }
    }
  }
  return null
}
