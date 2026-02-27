'use client'

import Pagination from '@/components/pagination'
import RegionSelect from '@/components/region-select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useOptions } from '@/context/OptionsContext'
import useTranslation from '@/hooks/use-translation'
import { apiClient } from '@/lib/api-client'
import { region, regions } from '@/lib/consts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const difficulties = [
  'easy',
  'normal',
  'hard',
  'expert',
  'master',
  'append',
] as const

const formSchema = z.object({
  search: z.string(),
  region: z.literal(regions),
  difficulty: z.optional(z.literal(difficulties)),
})

interface song {
  difficulties: ('easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append')[]
  id: number
  jacket_url: string
  title: string
}

const ChartViewer = () => {
  const { loc } = useTranslation()
  const [options] = useOptions()

  const [songs, setSongs] = useState<song[]>([])
  const [loading, setLoading] = useState(true)

  const [range, setRange] = useState(8)
  const [page, setPage] = useState(0)

  const [selectedSong, setSelectedSong] = useState<song | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [chart, setChart] = useState<any | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      region: options.default_region,
      difficulty: 'master',
    },
  })

  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true)
        const res = await apiClient(
          '/api/tools/music_search',
          {
            body: JSON.stringify({
              region: options.default_region,
              query: '',
              difficulties: ['master'],
              image_type: 'webp',
            }),
            method: 'POST',
          },
          { unprotected: true },
        )

        const { songs: allSongs } = await res.json()
        setSongs(allSongs)
      } finally {
        setLoading(false)
      }
    }

    loadSongs()
  }, [])

  useEffect(() => {
    if (!selectedSong) {
      setChart(null)
      return
    }

    const loadChart = async () => {
      try {
        setChartLoading(true)
        const res = await apiClient(
          '/api/tools/chart_viewer',
          {
            body: JSON.stringify({
              music_id: selectedSong.id,
              difficulty: 'master',
              region: form.getValues('region'),
            }),
            method: 'POST',
          },
          { unprotected: true },
        )

        setChart(await res.json())
      } finally {
        setChartLoading(false)
      }
    }

    loadChart()
  }, [selectedSong])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const res = await apiClient(
        '/api/tools/music_search',
        {
          body: JSON.stringify({
            region: values.region,
            query: values.search,
            difficulties: [values.difficulty],
            image_type: 'webp',
          }),
          method: 'POST',
        },
        { unprotected: true },
      )

      const { songs: allSongs } = await res.json()
      setSongs(allSongs)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center p-2 w-full h-full flex-col gap-5'>
      <Card
        className='max-w-lg w-full'
        variant='main'
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-2'
          >
            <CardHeader className='flex items-center justify-center'>
              <div className='flex-1'>
                <CardTitle className='font-header text-lg'>
                  {loc('tools.chart_viewer.title')}
                </CardTitle>
                <CardDescription>
                  {loc('tools.chart_viewer.description')}
                </CardDescription>
              </div>
              <div className='flex flex-col items-end justify-center gap-1'>
                <FormField
                  control={form.control}
                  name='region'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-end justify-center'>
                      <FormLabel className='uppercase text-muted-foreground text-xs'>
                        {loc('regions.title')}
                      </FormLabel>
                      <FormControl>
                        <RegionSelect
                          {...field}
                          onValueChange={(newVal: region) =>
                            form.setValue('region', newVal)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>
            <CardContent className='flex items-center justify-center gap-2 w-full flex-col'>
              <div className='flex items-end justify-center gap-1 w-full'>
                <FormField
                  control={form.control}
                  name='search'
                  render={({ field }) => (
                    <FormItem className='flex flex-col flex-1 items-start justify-center'>
                      <FormLabel className='uppercase text-muted-foreground text-xs'>
                        {loc('tools.chart_viewer.search')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Search...'
                          className='flex-1'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='h-7.5 shadow-xs cursor-pointer'
                >
                  Search
                  <Search className='size-3.5' />
                </Button>
              </div>
              <div className='flex items-end justify-center gap-1 w-full'>
                <FormField
                  control={form.control}
                  name='difficulty'
                  render={({ field }) => (
                    <FormItem className='flex flex-col flex-1 items-start justify-center'>
                      <FormLabel className='uppercase text-muted-foreground text-xs'>
                        {loc('tools.chart_viewer.difficulty')}
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={(v) =>
                            form.setValue('difficulty', v as any)
                          }
                        >
                          <SelectTrigger
                            className='border-border'
                            size='sm'
                          >
                            <SelectValue>
                              {loc(
                                `difficulties.${form.getValues('difficulty') as (typeof difficulties)[number]}`,
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((diff, i) => (
                              <SelectItem
                                value={diff}
                                key={i}
                              >
                                {loc(`difficulties.${diff}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
      {loading ?
        <Card
          className='p-6 col-span-1 md:col-span-2 lg:col-span-3'
          variant='main'
        >
          <Spinner className='size-8' />
        </Card>
      : <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-center gap-1'>
            {songs.slice(page * range, (page + 1) * range).map((song, i) => (
              <Card
                key={i}
                className='w-60 gap-1 hover:scale-101 transition-all'
                variant='main'
                onClick={() => setSelectedSong(song)}
              >
                <CardHeader>
                  <CardTitle>{song.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={song.jacket_url}
                    alt={song.title}
                    width={800}
                    height={800}
                    className='w-full rounded-md border-2'
                  />
                </CardContent>
              </Card>
            ))}
            <div className='flex items-center justify-center mt-2 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex-col gap-2'>
              <p className='text-sm text-muted-foreground'>
                Showing {page * range + 1}{' '}
                {Math.min((page + 1) * range, songs.length) !==
                  page * range + 1 &&
                  `to ${Math.min((page + 1) * range, songs.length)}`}{' '}
                of {songs.length}
              </p>

              <Pagination
                page={page}
                setPage={setPage}
                maxPages={Math.max(0, Math.ceil(songs.length / range) - 1)}
                range={range}
                setRange={setRange}
                itemCountList={[4, 8, 12, 16, 24, 32]}
              />
            </div>
          </div>
          <Dialog
            open={selectedSong !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedSong(null)
            }}
          >
            {selectedSong && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedSong.title}</DialogTitle>
                </DialogHeader>
                {chartLoading ?
                  <Spinner />
                : <div>{JSON.stringify(chart)}</div>}
              </DialogContent>
            )}
          </Dialog>
        </>
      }
    </div>
  )
}

export default ChartViewer
