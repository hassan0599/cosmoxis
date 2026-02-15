'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError('Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Error signing in with email:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccessMessage('Check your email for the confirmation link!')
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      console.error('Error signing up:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex bg-background'>
      {/* Left side - Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden'>
        {/* Decorative elements */}
        <div className='absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl' />
        <div className='absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl' />

        <div className='relative z-10'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-white/10 p-1.5 flex items-center justify-center'>
              <Image
                src='/logo.png'
                alt='Cosmoxis Logo'
                width={40}
                height={40}
                className='w-full h-full object-contain'
                unoptimized
              />
            </div>
            <span className='text-2xl font-semibold text-white tracking-tight'>
              Cosmoxis
            </span>
          </div>
        </div>

        <div className='relative z-10 space-y-6'>
          <h1 className='text-4xl font-bold text-white leading-tight'>
            Transform receipts into
            <br />
            structured data instantly
          </h1>
          <p className='text-lg text-white/70 max-w-md'>
            AI-powered receipt scanning that saves you time and keeps your
            finances organized.
          </p>

          <div className='flex gap-8 pt-4'>
            <div>
              <div className='text-3xl font-bold text-white'>10k+</div>
              <div className='text-sm text-white/50'>Receipts Scanned</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-white'>99%</div>
              <div className='text-sm text-white/50'>Accuracy Rate</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-white'>5s</div>
              <div className='text-sm text-white/50'>Avg. Processing</div>
            </div>
          </div>
        </div>

        <div className='relative z-10 text-sm text-white/50'>
          © 2026 Cosmoxis. All rights reserved.
        </div>
      </div>

      {/* Right side - Login */}
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md space-y-8'>
          {/* Mobile logo */}
          <div className='lg:hidden text-center mb-8'>
            <div className='inline-flex items-center gap-2'>
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
              <span className='text-xl font-semibold text-foreground tracking-tight'>
                Cosmoxis
              </span>
            </div>
          </div>

          {/* Sign In Card */}
          <div className='space-y-6'>
            <div className='text-center lg:text-left'>
              <h2 className='text-2xl font-semibold text-foreground'>
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h2>
              <p className='mt-2 text-secondary'>
                {isSignUp
                  ? 'Get started with your free account'
                  : 'Sign in to continue to your dashboard'}
              </p>
            </div>

            <div className='bg-card rounded-lg border border-border p-6 shadow-sm'>
              <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn}>
                <div className='space-y-4'>
                  {/* Email Field */}
                  <div className='space-y-2'>
                    <label
                      htmlFor='email'
                      className='text-sm font-medium text-foreground'>
                      Email
                    </label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='email'
                        type='email'
                        placeholder='name@example.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='pl-10'
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className='space-y-2'>
                    <label
                      htmlFor='password'
                      className='text-sm font-medium text-foreground'>
                      Password
                    </label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className='pl-10 pr-10'
                        disabled={isLoading}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'>
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                    {isSignUp && (
                      <p className='text-xs text-muted-foreground'>
                        Must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className='p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800'>
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className='p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-800'>
                      {successMessage}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full h-11 text-sm font-medium'>
                    {isLoading ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : isSignUp ? (
                      'Create Account'
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-border' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-card px-2 text-muted-foreground'>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant='outline'
                size='lg'
                className='w-full h-11 text-sm font-medium bg-white hover:bg-muted border-border'>
                {isLoading ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <>
                    <svg className='h-5 w-5 mr-3' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            {/* Toggle Sign In / Sign Up */}
            <p className='text-center text-sm text-muted-foreground'>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type='button'
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccessMessage('')
                }}
                className='text-primary hover:underline font-medium'>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>

            <p className='text-center text-sm text-muted-foreground'>
              By signing in, you agree to our{' '}
              <a href='#' className='text-primary hover:underline'>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href='#' className='text-primary hover:underline'>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
