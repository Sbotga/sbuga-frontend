'use client'

import RegionSelect from '@/components/region-select'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useOptions } from '@/context/OptionsContext'
import useTranslation from '@/hooks/use-translation'
import { apiClient } from '@/lib/api-client'
import { region } from '@/lib/consts'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface stamp {
  balloon_url: string
  character_ids: number[]
  description: string
  game_character_unit_id: number | null
  image_url: string
  name: string
  published_at: number
  stamp_type:
    | 'illustration'
    | 'text'
    | 'cheerful_carnival_message'
    | 'non_character_illustration'
}

const StampViewer = () => {
  const { loc } = useTranslation()
  const [options] = useOptions()
  const [region, setRegion] = useState(options.default_region)
  const [loading, setLoading] = useState(true)
  const [stamps, setStamps] = useState<stamp[]>([])

  useEffect(() => {
    const getComics = async () => {
      try {
        setLoading(true)
        const res = await apiClient(
          '/api/information/get_stamps',
          {
            method: 'POST',
            body: JSON.stringify({
              region,
              image_type: 'webp',
            }),
          },
          { unprotected: true },
        )

        if (res.ok) {
          const { stamps: allStamps } = await res.json()
          setStamps(allStamps)
          console.log(allStamps)
        }
      } finally {
        setLoading(false)
      }
    }

    getComics()
  }, [region])

  return (
    <>
      <div className='flex items-center justify-center w-full h-full p-1 flex-col'>
        {loading ?
          <Card
            className='p-6 col-span-1 md:col-span-2 lg:col-span-3'
            variant='main'
          >
            <Spinner className='size-8' />
          </Card>
        : <>
            <Card
              className='sm:w-md w-full mb-2'
              variant='main'
            >
              <CardHeader className='flex items-center justify-center'>
                <div className='flex-1'>
                  <CardTitle className='font-header text-lg'>
                    {loc('information.stamp_viewer.title')}
                  </CardTitle>
                  <CardDescription>
                    {loc('information.stamp_viewer.description')}
                  </CardDescription>
                </div>
                <div className='flex flex-col items-end justify-center gap-1'>
                  <Label className='uppercase text-muted-foreground text-xs'>
                    {loc('regions.title')}
                  </Label>
                  <RegionSelect
                    value={region}
                    onValueChange={(v) => setRegion(v as region)}
                  />
                </div>
              </CardHeader>
            </Card>
            <div className='flex items-center justify-start flex-wrap gap-2'>
              {stamps.map((stamp, i) => (
                <Card
                  key={i}
                  className='w-30 h-30 flex items-center justify-center p-2'
                  variant='main'
                >
                  <Image
                    src={stamp.image_url}
                    alt={stamp.name}
                    width={256}
                    height={256}
                    className='w-full aspect-auto'
                  />
                </Card>
              ))}
            </div>
          </>
        }
      </div>
    </>
  )
}

export default StampViewer
