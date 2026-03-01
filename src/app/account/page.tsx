'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { Card } from '@/components/ui/card'

const AccountRedirect = () => {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) redirect('/login')
    else if (!user.email_verified) redirect('/verify_email')
    else redirect(`/account/${user.username}`)
  }, [loading, user])

  return (
    <Card className='p-8' variant='main'>
      <Spinner className='size-6' />
    </Card>
  )
}

export default AccountRedirect
