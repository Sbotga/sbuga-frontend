'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/lib/api-client'
import { Edit } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { useRef } from 'react'

const Account = () => {
  const { loading, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  if (!user) redirect('/login')

  const handleEditBanner = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient('/api/banner_image/update', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Refresh the page to show the updated banner
        window.location.reload()
      } else {
        console.error('Failed to upload banner image')
      }
    } catch (error) {
      console.error('Error uploading banner image:', error)
    }
  }

  return (
    <Card
      className='min-w-md relative'
      variant='main'
    >
      <div className='w-1 h-35' />
      <Image
        src={`/api/banner_image/${user.username}`}
        alt=''
        width={40}
        height={40}
        className='absolute left-0 right-0 top-0 w-full aspect-10/3  rounded-t-[11px] overflow-hidden bg-accent'
      />
      <CardHeader className='flex flex-col items-start justify-center gap-4'>
        <Image
          src={`/api/profile_picture/${user.username}`}
          alt=''
          width={40}
          height={40}
          className='rounded-full bg-secondary size-20 border-background border-3 absolute left-5 top-25'
        />
        <div className='flex flex-col items-start justify-center gap-1'>
          <CardTitle>{user.display_name}</CardTitle>
          <CardDescription>{user.username}</CardDescription>
        </div>
      </CardHeader>
      {/* <Button
        className='absolute top-2 right-2 cursor-pointer hover:bg-muted'
        size='icon-sm'
        variant='outline'
        onClick={handleEditBanner}
      >
        <Edit />
      </Button> */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />
    </Card>
  )
}

export default Account
