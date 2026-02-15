'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  CreditCard,
  Tag,
  Palette,
  Crown,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubscriptionCard } from '@/components/subscription-badge'
import { CategoryManager } from '@/components/category-manager'
import { useSubscription } from '@/hooks/use-subscription'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { subscription, openBillingPortal } = useSubscription()
  const [activeTab, setActiveTab] = useState('subscription')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const plan = subscription?.plan || 'free'

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Redirect to home page after sign out
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setIsDeleting(false)
    }
  }

  const tabs = [
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'categories', label: 'Categories & Tags', icon: Tag },
  ]

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-slate-900 flex items-center gap-2'>
          <Settings className='w-6 h-6' />
          Settings
        </h1>
        <p className='text-slate-600 mt-1'>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 mb-6 border-b'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}>
              <Icon className='w-4 h-4' />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'subscription' && (
        <div className='space-y-6'>
          <SubscriptionCard />

          {plan === 'free' && (
            <Card className='p-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50'>
              <div className='flex items-start gap-4'>
                <div className='p-3 bg-blue-100 rounded-lg'>
                  <Crown className='w-6 h-6 text-blue-700' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-slate-900 mb-1'>
                    Upgrade to Pro
                  </h3>
                  <p className='text-sm text-slate-700 mb-4'>
                    Get unlimited receipts, AI scans, custom categories, tags,
                    and more. Starting at just $9/month.
                  </p>
                  <Button variant='accent' asChild>
                    <a href='/pricing'>View Plans</a>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className='p-6'>
            <h3 className='font-semibold text-slate-900 mb-4'>Plan Features</h3>
            <div className='space-y-3'>
              <FeatureRow label='Receipts per month' value={'Unlimited'} />
              <FeatureRow
                label='AI scans per month'
                value={plan === 'free' ? '5' : 'Unlimited'}
              />
              <FeatureRow
                label='Custom categories'
                value={
                  plan === 'free' ? '0' : plan === 'pro' ? '10' : 'Unlimited'
                }
              />
              <FeatureRow label='Tags' value={plan === 'free' ? '❌' : '✅'} />
              <FeatureRow
                label='PDF reports'
                value={
                  plan === 'free'
                    ? '❌'
                    : plan === 'pro'
                      ? '5/month'
                      : 'Unlimited'
                }
              />
              <FeatureRow
                label='Budget tracking'
                value={plan === 'free' ? '❌' : '✅'}
              />
              <FeatureRow
                label='Bank integration'
                value={
                  plan === 'business' || plan === 'enterprise' ? '✅' : '❌'
                }
              />
              <FeatureRow
                label='API access'
                value={
                  plan === 'business' || plan === 'enterprise' ? '✅' : '❌'
                }
              />
              <FeatureRow
                label='Storage'
                value={
                  plan === 'free'
                    ? '100MB'
                    : plan === 'pro'
                      ? '5GB'
                      : plan === 'business'
                        ? '50GB'
                        : 'Unlimited'
                }
              />
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className='p-6 border-red-200 bg-red-50/50'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-red-100 rounded-lg'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-slate-900 mb-1'>
                  Delete Account
                </h3>
                <p className='text-sm text-slate-600 mb-4'>
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                  <Button
                    variant='outline'
                    className='border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700'
                    onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete Account
                  </Button>
                ) : (
                  <div className='space-y-3'>
                    <p className='text-sm font-medium text-red-600'>
                      Are you sure? This will permanently delete all your data.
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        variant='destructive'
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'categories' && (
        <Card className='p-6'>
          <CategoryManager />
        </Card>
      )}
    </div>
  )
}

function FeatureRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between py-2 border-b last:border-0'>
      <span className='text-slate-600'>{label}</span>
      <span className='font-medium text-slate-900'>{value}</span>
    </div>
  )
}
