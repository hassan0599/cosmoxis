'use client'

import { useState } from 'react'
import {
  Crown,
  CreditCard,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/hooks/use-subscription'
import type { PlanType } from '@/types/database'

const planNames: Record<PlanType, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
}

const planColors: Record<PlanType, string> = {
  free: 'bg-slate-100 text-slate-700',
  pro: 'bg-blue-100 text-blue-700',
  business: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
}

interface SubscriptionBadgeProps {
  showManage?: boolean
  className?: string
}

export function SubscriptionBadge({
  showManage = false,
  className = '',
}: SubscriptionBadgeProps) {
  const { subscription, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className='h-6 w-16 bg-slate-200 rounded' />
      </div>
    )
  }

  const plan = subscription?.plan || 'free'

  return (
    <Badge className={planColors[plan]}>
      {plan === 'pro' || plan === 'business' ? (
        <Crown className='w-3 h-3 mr-1' />
      ) : null}
      {planNames[plan]}
    </Badge>
  )
}

interface SubscriptionCardProps {
  onUpgrade?: (plan: PlanType) => void
}

export function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const { subscription, usage, limits, isLoading, error, openBillingPortal } =
    useSubscription()
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 w-24 bg-slate-200 rounded' />
          <div className='h-4 w-32 bg-slate-200 rounded' />
          <div className='h-4 w-48 bg-slate-200 rounded' />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='p-6 border-red-200 bg-red-50'>
        <div className='flex items-center gap-2 text-red-700'>
          <AlertCircle className='w-5 h-5' />
          <span>Error loading subscription: {error}</span>
        </div>
      </Card>
    )
  }

  const plan = subscription?.plan || 'free'
  const receiptsUsed = usage?.receipts_count || 0
  const aiScansUsed = usage?.ai_scans_count || 0
  const receiptsLimit = limits.receiptsPerMonth
  const aiScansLimit = limits.aiScansPerMonth

  const handleManageBilling = async () => {
    if (plan === 'free') return

    setIsOpeningPortal(true)
    const result = await openBillingPortal()

    if (result.url) {
      window.location.href = result.url
    }
    setIsOpeningPortal(false)
  }

  return (
    <Card className='p-6'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='text-lg font-semibold text-slate-900'>
              {planNames[plan]} Plan
            </h3>
            <Badge className={planColors[plan]}>
              {plan === 'pro' || plan === 'business' ? (
                <Crown className='w-3 h-3 mr-1' />
              ) : null}
              {plan === 'free' ? 'Current' : 'Active'}
            </Badge>
          </div>
          {subscription?.current_period_end && (
            <p className='text-sm text-slate-500'>
              {subscription.cancel_at_period_end ? (
                <>
                  Expires{' '}
                  {new Date(
                    subscription.current_period_end,
                  ).toLocaleDateString()}
                </>
              ) : (
                <>
                  Renews{' '}
                  {new Date(
                    subscription.current_period_end,
                  ).toLocaleDateString()}
                </>
              )}
            </p>
          )}
        </div>

        {plan !== 'free' && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleManageBilling}
            disabled={isOpeningPortal}>
            <CreditCard className='w-4 h-4 mr-2' />
            Manage Billing
            <ExternalLink className='w-3 h-3 ml-1' />
          </Button>
        )}
      </div>

      {/* Usage Stats */}
      <div className='space-y-4'>
        <div>
          <div className='flex items-center justify-between text-sm mb-1'>
            <span className='text-slate-600'>Receipts this month</span>
            <span className='font-medium text-slate-900'>
              {receiptsUsed}
              {receiptsLimit !== Infinity && ` / ${receiptsLimit}`}
            </span>
          </div>
          {receiptsLimit !== Infinity && (
            <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all ${
                  receiptsUsed >= receiptsLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(100, (receiptsUsed / receiptsLimit) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        <div>
          <div className='flex items-center justify-between text-sm mb-1'>
            <span className='text-slate-600'>AI scans this month</span>
            <span className='font-medium text-slate-900'>
              {aiScansUsed}
              {aiScansLimit !== Infinity && ` / ${aiScansLimit}`}
            </span>
          </div>
          {aiScansLimit !== Infinity && (
            <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all ${
                  aiScansUsed >= aiScansLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(100, (aiScansUsed / aiScansLimit) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Upgrade CTA for Free users */}
      {plan === 'free' && (
        <div className='mt-6 pt-6 border-t'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-slate-900'>Need more?</p>
              <p className='text-sm text-slate-500'>
                Upgrade to Pro for unlimited receipts and AI scans
              </p>
            </div>
            <Button onClick={() => onUpgrade?.('pro')}>Upgrade Now</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

interface UpgradePromptProps {
  feature: string
  requiredPlan: PlanType
  onUpgrade: (plan: PlanType) => void
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  onUpgrade,
}: UpgradePromptProps) {
  return (
    <Card className='p-6 border-blue-200 bg-blue-50'>
      <div className='flex items-start gap-4'>
        <div className='p-2 bg-blue-100 rounded-lg'>
          <Crown className='w-5 h-5 text-blue-600' />
        </div>
        <div className='flex-1'>
          <h4 className='font-semibold text-slate-900 mb-1'>
            Upgrade to {planNames[requiredPlan]}
          </h4>
          <p className='text-sm text-slate-600 mb-4'>
            {feature} is available on the {planNames[requiredPlan]} plan.
            Upgrade to unlock this feature and more.
          </p>
          <Button onClick={() => onUpgrade(requiredPlan)}>
            Upgrade to {planNames[requiredPlan]}
          </Button>
        </div>
      </div>
    </Card>
  )
}

interface FeatureGateProps {
  feature: string
  requiredPlan: PlanType
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({
  feature,
  requiredPlan,
  children,
  fallback,
}: FeatureGateProps) {
  const { subscription, isLoading } = useSubscription()

  const planHierarchy: PlanType[] = ['free', 'pro', 'business', 'enterprise']
  const currentPlan = subscription?.plan || 'free'
  const currentPlanIndex = planHierarchy.indexOf(currentPlan)
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan)

  if (isLoading) {
    return <div className='animate-pulse h-24 bg-slate-100 rounded-lg' />
  }

  if (currentPlanIndex >= requiredPlanIndex) {
    return <>{children}</>
  }

  return (
    <>
      {fallback || (
        <UpgradePrompt
          feature={feature}
          requiredPlan={requiredPlan}
          onUpgrade={() => {}}
        />
      )}
    </>
  )
}
