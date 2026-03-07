'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import useTranslation from '@/hooks/use-translation'
import { ShareIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { use, useEffect, useState } from 'react'

const ChartViewer = ({
  params,
}: PageProps<'/tools/chart_viewer/[region]/[music_id]/[difficulty]'>) => {
  const { loc } = useTranslation()
  const { music_id, region, difficulty } = use(params)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mirrored, setMirrored] = useState(
    searchParams.get('mirrored') === 'true',
  )

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [setLoaded, mirrored])

  const imageUrl = `/tools/chart_viewer/${region}/${music_id}/${difficulty}/image?${mirrored ? 'mirrored=true&' : ''}t=${Date.now()}`

  useEffect(() => {
    setMirrored(searchParams.get('mirrored') === 'true')
  }, [searchParams])

  const toggleMirrored = (checked: boolean) => {
    setMirrored(checked)

    const newParams = new URLSearchParams(searchParams.toString())

    if (checked) {
      newParams.set('mirrored', 'true')
    } else {
      newParams.delete('mirrored')
    }

    const queryString = newParams.toString()

    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  return (
    <Card
      className='max-w-none! min-w-80 min-h-40 p-4 m-8 gap-3'
      variant='main'
    >
      <CardHeader className='flex items-center justify-start px-0'>
        {loc('information.chart.mirrored')}
        <Switch
          checked={mirrored}
          onCheckedChange={toggleMirrored}
          className='cursor-pointer border-border'
        />
      </CardHeader>
      <div className='relative min-w-full sm:min-w-90 min-h-40 bg-accent rounded-md'>
        {!loaded && (
          <div className='w-full h-full absolute top-0 left-0 flex items-center justify-center text-accent-foreground z-1'>
            {loc('information.chart.generating')}
          </div>
        )}
        <img
          className='w-full h-full rounded-sm z-2'
          src={imageUrl}
          key={imageUrl}
          onLoad={() => {
            setLoaded(true)
          }}
        />
        <Button
          size='icon'
          className='absolute top-3 right-3 border-none cursor-pointer'
          variant='outline'
          onClick={() => window.open(imageUrl, '_blank')}
        >
          <ShareIcon />
        </Button>
      </div>
    </Card>
  )
}

export default ChartViewer
