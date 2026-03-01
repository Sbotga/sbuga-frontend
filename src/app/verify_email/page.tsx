'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/lib/api-client'
import { redirect, useSearchParams } from 'next/navigation'

const VerifyEmail = () => {
  const { loading, user } = useAuth()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!loading && (!user || user.email_verified)) {
    redirect('/')
  }

  if (token) {
    const tryVerify = async () => {
      const response = await apiClient('/api/auth/verify_email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })

      console.log(response)
    }

    tryVerify()
  }

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Card
        variant='main'
        className='min-w-md'
      >
        <CardHeader>
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
                await apiClient('/api/auth/resend_verification', {
                  method: 'POST',
                })
              }}
            >
              Resend it.
            </Button>
          </p>
        </CardHeader>
      </Card>
    </div>
  )
}

export default VerifyEmail
