'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { apiClient } from '@/lib/api-client'
import Image from 'next/image'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const Account = () => {
  const params = useParams<{ username: string }>()

  const [noAccount, setNoAccount] = useState(false)

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{
    username: string
    display_name: string
    description: string
  } | null>(null)

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await apiClient(
          `/api/user/${params.username}`,
          {
            method: 'GET',
          },
          { noEmailVerify: true, unprotected: true },
        )

        if (!res.ok) {
          setNoAccount(true)
        }

        const data = await res.json()

        setUser(data.user)
      } finally {
        setLoading(false)
      }
    }

    getUserData()
  }, [])

  if (loading) {
    return (
      <Card
        className='p-8'
        variant='main'
      >
        <Spinner className='size-6' />
      </Card>
    )
  }

  if (!user || noAccount)
    return (
      <Card
        className='min-w-md relative group/card flex items-center justify-center min-h-35'
        variant='main'
      >
        <CardHeader className='w-full items-center justify-center flex flex-col gap-4'>
          <CardTitle className='text-xl'>404 Not Found</CardTitle>
          <CardDescription>
            Sorry, this account could not be found.
          </CardDescription>
        </CardHeader>
      </Card>
    )

  return (
    <Card
      className='min-w-md relative group/card'
      variant='main'
    >
      <div className='w-1 h-35' />
      <div className='absolute left-0 right-0 top-0 w-full aspect-10/3 rounded-t-[11px] overflow-hidden bg-accent'>
        <Image
          src={`/api/banner_image/${user.username}`}
          alt=''
          width={1200}
          height={960}
          className='w-full h-full'
          unoptimized
          loading='eager'
        />
      </div>
      <CardHeader className='flex flex-col items-start justify-center gap-4'>
        <div className='absolute left-5 top-25 size-20'>
          <Image
            src={`/api/profile_picture/${user.username}`}
            alt=''
            width={80}
            height={80}
            className='rounded-full bg-secondary border-background border-3 w-full h-full'
            unoptimized
            loading='eager'
          />
        </div>
        <div className='flex flex-col items-start justify-center gap-1'>
          <CardTitle className='font-header text-lg'>
            {user.display_name}
          </CardTitle>
          <CardDescription>{user.username}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {user.description && (
          <p className='text-sm text-muted-foreground not-last:mb-8'>
            {user.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default Account
