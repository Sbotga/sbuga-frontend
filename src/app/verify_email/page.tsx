'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import useTranslation from '@/hooks/use-translation'
import { redirect, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import mainApi from '../Api'

const VerifyEmailContent = () => {
  const { loading, user, resendVerificationEmail } = useAuth()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [verified, setVerified] = useState(false)
  const { loc } = useTranslation()

  useEffect(() => {
    if (!token) return
    const tryVerify = async () => {
      // const response = await apiClient('/api/auth/verify_email', {
      //   method: 'POST',
      //   body: JSON.stringify({ token }),
      // })
      const response =
        await mainApi.api.verifyEmailPostApiAccountsEmailVerifyVerifyPost({
          token,
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
      <Card
        variant='main'
        className='min-w-md'
      >
        <CardHeader>
          {verified ?
            <>
              <CardTitle>{loc('verify_email.verified')}</CardTitle>
              <CardDescription>
                {loc('verify_email.verified_description')}
              </CardDescription>
            </>
          : <>
              <CardTitle>{loc('verify_email.title')}</CardTitle>
              <CardDescription>
                {loc('verify_email.description')}
              </CardDescription>
              <p className='text-xs text-muted-foreground'>
                {loc('verify_email.didnt_get_it')}{' '}
                <Button
                  variant='link'
                  className='text-secondary-foreground text-xs px-1 cursor-pointer'
                  onClick={async () => {
                    await resendVerificationEmail()
                  }}
                >
                  {loc('verify_email.resend')}
                </Button>
              </p>
            </>
          }
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
