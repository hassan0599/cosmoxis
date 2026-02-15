'use client'

import { useState } from 'react'
import { Check, X, Sparkles, Building, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for trying out Cosmoxis',
    icon: Sparkles,
    features: [
      { text: 'Unlimited receipts', included: true },
      { text: '5 AI scans per month', included: true },
      { text: 'Unlimited manual entry', included: true },
      { text: '5 default categories', included: true },
      { text: 'CSV export', included: true },
      { text: '100MB storage', included: true },
      { text: 'Basic email support', included: true },
      { text: 'Custom categories', included: false },
      { text: 'Budget tracking', included: false },
      { text: 'PDF reports', included: false },
    ],
    cta: 'Get Started',
    popular: false,
    planKey: 'free',
  },
  {
    name: 'Pro',
    price: { monthly: 9, yearly: 89 },
    description: 'For individual power users and freelancers',
    icon: Sparkles,
    features: [
      { text: 'Unlimited receipts', included: true },
      { text: 'Unlimited AI scans', included: true },
      { text: '10 custom categories', included: true },
      { text: 'Tags system', included: true },
      { text: 'Budget tracking', included: true },
      { text: 'PDF reports (5/month)', included: true },
      { text: 'Email forwarding', included: true },
      { text: 'Merchant intelligence', included: true },
      { text: '5GB storage', included: true },
      { text: 'Priority email support', included: true },
    ],
    cta: 'Start Pro',
    popular: true,
    planKey: 'pro',
  },
  {
    name: 'Business',
    price: { monthly: 29, yearly: 290 },
    description: 'For small teams and businesses',
    icon: Building,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team workspace (up to 5 users)', included: true },
      { text: 'Unlimited custom categories', included: true },
      { text: 'Unlimited PDF reports', included: true },
      { text: 'Approval workflows', included: true },
      { text: 'Bank/card integration', included: true },
      { text: 'QuickBooks/Xero sync', included: true },
      { text: 'API access', included: true },
      { text: '50GB storage', included: true },
      { text: 'Phone + email support', included: true },
    ],
    cta: 'Start Business Trial',
    popular: false,
    planKey: 'business',
    comingSoon: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, yearly: null },
    description: 'For large organizations with specific needs',
    icon: Users,
    features: [
      { text: 'Everything in Business', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'SSO/SAML authentication', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee (99.9% uptime)', included: true },
      { text: 'On-premise deployment option', included: true },
      { text: 'Custom data retention', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Unlimited storage', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    planKey: 'enterprise',
    comingSoon: true,
  },
]

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(
    'monthly',
  )

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'free') {
      window.location.href = '/login'
      return
    }

    if (planKey === 'enterprise') {
      window.location.href = 'mailto:sales@cosmoxis.com'
      return
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          plan: planKey,
          interval: billingInterval,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      {/* Hero */}
      <section className='container mx-auto px-4 py-16 text-center'>
        <h1 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4'>
          Simple, Transparent Pricing
        </h1>
        <p className='text-xl text-slate-600 max-w-2xl mx-auto mb-8'>
          Choose the plan that fits your needs. Start free and upgrade anytime.
        </p>

        {/* Billing Toggle */}
        <div className='inline-flex items-center gap-4 bg-slate-100 rounded-full p-1'>
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}>
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingInterval === 'yearly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}>
            Yearly
            <Badge
              variant='secondary'
              className='ml-2 bg-green-100 text-green-800 border border-green-200'>
              Save 2 months
            </Badge>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className='container mx-auto px-4 pb-20'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {plans.map((plan) => {
            const Icon = plan.icon
            const price =
              billingInterval === 'monthly'
                ? plan.price.monthly
                : plan.price.yearly

            return (
              <Card
                key={plan.name}
                className={`relative p-6 flex flex-col ${
                  plan.popular
                    ? 'border-2 border-blue-500 shadow-lg scale-105'
                    : 'border border-slate-200'
                }`}>
                {plan.popular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                    <Badge className='bg-blue-600 text-white border-blue-700'>
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.comingSoon && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                    <Badge className='bg-amber-500 text-white border-amber-600'>
                      Coming Soon
                    </Badge>
                  </div>
                )}

                <div className='flex items-center gap-3 mb-4'>
                  <div
                    className={`p-2 rounded-lg ${
                      plan.popular ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                    <Icon
                      className={`w-5 h-5 ${
                        plan.popular ? 'text-blue-600' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <h3 className='text-xl font-semibold text-slate-900'>
                    {plan.name}
                  </h3>
                </div>

                <div className='mb-4'>
                  {price === null ? (
                    <span className='text-3xl font-bold text-slate-900'>
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className='text-3xl font-bold text-slate-900'>
                        ${price}
                      </span>
                      <span className='text-slate-600'>
                        /{billingInterval === 'monthly' ? 'month' : 'year'}
                      </span>
                    </>
                  )}
                </div>

                <p className='text-sm text-slate-600 mb-6'>
                  {plan.description}
                </p>

                <ul className='space-y-3 mb-6 flex-1'>
                  {plan.features.map((feature, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      {feature.included ? (
                        <Check className='w-5 h-5 text-green-500 shrink-0 mt-0.5' />
                      ) : (
                        <X className='w-5 h-5 text-slate-300 shrink-0 mt-0.5' />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.planKey)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : plan.planKey === 'free'
                        ? 'bg-slate-900 hover:bg-slate-800'
                        : ''
                  }`}
                  variant={
                    plan.planKey === 'enterprise' ? 'outline' : 'default'
                  }
                  disabled={plan.comingSoon}>
                  {plan.comingSoon ? 'Coming Soon' : plan.cta}
                </Button>
              </Card>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className='container mx-auto px-4 py-16 border-t'>
        <h2 className='text-2xl font-bold text-slate-900 text-center mb-12'>
          Frequently Asked Questions
        </h2>

        <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          <div>
            <h3 className='font-semibold text-slate-900 mb-2'>
              Can I switch plans anytime?
            </h3>
            <p className='text-slate-600 text-sm'>
              Yes! You can upgrade or downgrade your plan at any time. When
              upgrading, you'll be charged the prorated difference. When
              downgrading, the credit will be applied to future billing cycles.
            </p>
          </div>

          <div>
            <h3 className='font-semibold text-slate-900 mb-2'>
              What happens when I hit my limit?
            </h3>
            <p className='text-slate-600 text-sm'>
              On the Free plan, you'll be notified when you approach your
              limits. You can still use manual entry for receipts even after
              hitting AI scan limits.
            </p>
          </div>

          <div>
            <h3 className='font-semibold text-slate-900 mb-2'>
              Is there a free trial for paid plans?
            </h3>
            <p className='text-slate-600 text-sm'>
              Yes! Both Pro and Business plans come with a 14-day free trial. No
              credit card required to start.
            </p>
          </div>

          <div>
            <h3 className='font-semibold text-slate-900 mb-2'>
              What payment methods do you accept?
            </h3>
            <p className='text-slate-600 text-sm'>
              We accept all major credit cards (Visa, MasterCard, American
              Express) through Stripe. Enterprise customers can also pay by
              invoice.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t py-8'>
        <div className='container mx-auto px-4 text-center text-sm text-slate-600'>
          <p>© 2026 Cosmoxis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
