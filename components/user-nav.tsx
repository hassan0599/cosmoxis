'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface UserNavProps {
  userEmail: string | undefined
  fullName?: string | null
}

export function UserNav({ userEmail, fullName }: UserNavProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      setIsLoading(false)
    }
  }

  // Generate initials from full name or email
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors'>
        <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
          <span className='text-xs font-semibold text-primary'>
            {getInitials()}
          </span>
        </div>
        <span className='text-sm text-foreground font-medium hidden sm:inline max-w-[120px] truncate'>
          {fullName || userEmail}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-1 z-50'>
          <div className='px-4 py-3 border-b border-border'>
            <p className='text-sm font-medium text-foreground truncate'>
              {fullName || 'User'}
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {userEmail}
            </p>
          </div>

          <a
            href='/dashboard/settings'
            className='flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors'
            onClick={() => setIsOpen(false)}>
            <Settings className='h-4 w-4 text-muted-foreground' />
            Settings
          </a>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors'>
            <LogOut className='h-4 w-4' />
            {isLoading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
