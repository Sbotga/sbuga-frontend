'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/lib/api-client'
import { redirect, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const VerifyEmailContent = () => {
  const { loading, user } = useAuth()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!token) return
    const tryVerify = async () => {
      const response = await apiClient('/api/auth/verify_email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      console.log(response)
      if (response.ok) setVerified(true)
    }
    tryVerify()
  }, [token])

  if (!loading && !verified && (!user || user.email_verified)) {
    redirect('/')
  }

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Card variant='main' className='min-w-md'>
        <CardHeader>
          {verified ? (
            <>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle>Verify your Email Address</CardTitle>
              <CardDescription>
                Check your email for a message from us to verify your email
              </CardDescription>
              <p className='text-xs text-muted-foreground'>
                Didn't get it?{' '}
                <Button
                  variant='link'
                  className='text-secondary-foreground text-xs px-1 cursor-pointer'
                  onClick={async () => {
                    await apiClient('/api/auth/resend_verification', { method: 'POST' })
                  }}
                >
                  Resend it.
                </Button>
              </p>
            </>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}

const VerifyEmail = () => (
  <Suspense>
    <VerifyEmailContent />
  </Suspense>
)

export default VerifyEmail
