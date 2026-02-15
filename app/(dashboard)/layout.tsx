import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserNav } from '@/components/user-nav'
import { Toaster } from '@/components/ui/toaster'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border-light'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between'>
          <a href='/dashboard' className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-md bg-muted p-1 flex items-center justify-center'>
              <Image
                src='/logo.png'
                alt='Cosmoxis Logo'
                width={32}
                height={32}
                className='w-full h-full object-contain'
                unoptimized
              />
            </div>
            <span className='text-lg sm:text-xl font-semibold text-foreground tracking-tight'>
              Cosmoxis
            </span>
          </a>
          <div className='flex items-center gap-4'>
            <UserNav userEmail={user.email} fullName={profile?.full_name} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
