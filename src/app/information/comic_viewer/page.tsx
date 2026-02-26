'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { apiClient } from '@/lib/api-client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const ComicViewer = () => {
  const [loading, setLoading] = useState(true)
  const [comics, setComics] = useState<
    {
      title: string
      image_url: string
      from_user_rank: number
      to_user_rank: number
    }[]
  >([])

  useEffect(() => {
    const getComics = async () => {
      try {
        setLoading(true)
        const res = await apiClient('/api/information/get_comics', {
          method: 'POST',
          body: JSON.stringify({
            region: 'en',
            image_type: 'webp',
          }),
        })

        if (res.ok) {
          const { comics: allComics } = await res.json()
          setComics(allComics)
        }
      } finally {
        setLoading(false)
      }
    }

    getComics()
  }, [])

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1'>
      {loading ?
        <Card
          className='p-6 col-span-1 md:col-span-2 lg:col-span-3'
          variant='main'
        >
          <Spinner className='size-8' />
        </Card>
      : comics.map((comic, i) => (
          <Card
            key={i}
            variant='main'
            className='w-xs'
          >
            <CardHeader>
              <CardTitle>{comic.title}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center'>
              <Image
                src={comic.image_url}
                alt={comic.title}
                loading='eager'
                width={808}
                height={600}
              />
            </CardContent>
          </Card>
        ))
      }
    </div>
  )
}

export default ComicViewer
