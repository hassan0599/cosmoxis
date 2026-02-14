'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserNavProps {
  userEmail: string | undefined
}

export function UserNav({ userEmail }: UserNavProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

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

  return (
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-3 text-sm'>
        <div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center'>
          <User className='h-4 w-4 text-primary' />
        </div>
        <span className='text-muted-foreground hidden md:inline font-medium'>
          {userEmail}
        </span>
      </div>
      <Button
        variant='ghost'
        size='sm'
        onClick={handleSignOut}
        disabled={isLoading}
        className='text-muted-foreground hover:text-foreground hover:bg-muted'>
        <LogOut className='h-4 w-4 mr-2' />
        Sign out
      </Button>
    </div>
  )
}
