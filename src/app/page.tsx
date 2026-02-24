'use client'

import NextImage from 'next/image'
import { useEffect, useState } from 'react'
import { allSbuga } from '@/lib/consts'

const getRandomSbuga = () => {
  return allSbuga[Math.floor(Math.random() * allSbuga.length)]
}

const Home = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    setImageUrl(`/${getRandomSbuga()}`)
  }, [])

  return (
    <div className='flex items-center justify-center flex-col gap-6'>
      <h1 className='font-header text-4xl z-1'>Sbuga</h1>
      {imageUrl && (
        <NextImage
          src={imageUrl}
          alt='Sbuga'
          width={96}
          height={96}
          className='size-50 z-1'
          loading='eager'
          onClick={() => setImageUrl(`/${getRandomSbuga()}`)}
        />
      )}
    </div>
  )
}

export default Home
