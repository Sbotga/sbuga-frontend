'use client'

import Pagination from '@/components/pagination'
import RegionSelect from '@/components/region-select'
import { Badge } from '@/components/ui/badge'
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
import { ChevronDownIcon, Search, Share } from 'lucide-react'
import NextImage from 'next/image'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
  difficulty: z.literal(difficulties),
  mirrored: z.boolean(),
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

  const loadSongs = async ({
    query,
    difficulties,
    image_type,
    region,
    mirrored,
  }: {
    query: string
    difficulties: string[]
    image_type: 'png' | 'webp'
    region: region
    mirrored: boolean
  }) => {
    try {
      const res = await apiClient(
        '/api/tools/music_search',
        {
          body: JSON.stringify({
            region,
            query,
            difficulties,
            image_type,
            mirrored,
          }),
          method: 'POST',
        },
        { unprotected: true },
      )

      const { songs: allSongs } = await res.json()
      setSongs(allSongs)
    } finally {
      setLoading(false)
      setPage(0)
    }
  }

  const [range, setRange] = useState(8)
  const [page, setPage] = useState(0)

  const [selectedSong, setSelectedSong] = useState<song | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [chart, setChart] = useState<Blob | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      region: options.default_region,
      difficulty: 'master',
    },
  })

  const formValues = useWatch({ control: form.control })

  // instante update
  useEffect(() => {
    loadSongs({
      region: formValues.region ?? options.default_region,
      query: formValues.search ?? '',
      difficulties: [formValues.difficulty ?? 'master'],
      image_type: 'webp',
      mirrored: formValues.mirrored ?? false,
    })
  }, [formValues.region, formValues.difficulty, formValues.mirrored])

  // debounce update for query updates
  useEffect(() => {
    const x = setTimeout(() => {
      loadSongs({
        difficulties: [formValues.difficulty ?? 'master'],
        region: formValues.region ?? options.default_region,
        query: formValues.search ?? '',
        image_type: 'webp',
        mirrored: formValues.mirrored ?? false,
      })
    }, 1000)
    return () => clearTimeout(x)
  }, [formValues.search])

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
              difficulty: form.getValues('difficulty'),
              region: form.getValues('region'),
            }),
            method: 'POST',
          },
          { unprotected: true },
        )

        const b = await res.blob()
        setChart(b)
      } finally {
        setChartLoading(false)
      }
    }

    loadChart()
  }, [selectedSong])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    loadSongs({
      region: values.region,
      query: values.search,
      difficulties: [values.difficulty],
      image_type: 'webp',
      mirrored: values.mirrored,
    })
  }

  return (
    <div className='flex items-center justify-center p-2 sm:w-fit h-full flex-col gap-5 w-110'>
      <Card
        className='w-full'
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
                  size='sm'
                  type='submit'
                  className='h-7.5 shadow-xs cursor-pointer'
                >
                  Search
                  <Search className='size-3.5' />
                </Button>
              </div>
              <div className='flex items-end justify-center gap-1 w-full'>
                <FormField
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
                          <DifficultyBadge
                            difficulty={form.getValues('difficulty')}
                          >
                            <SelectTrigger
                              className='border-0 border-none shadow-none focus-visible:ring-0 bg-tranpsarent dark:bg-tranpsarent hover:dark:bg-tranpsarent'
                              size='sm'
                              hideIcon={true}
                            >
                              <SelectValue>
                                {/* {loc(
                                `difficulties.${form.getValues('difficulty')}`,
                              )} */}
                                {loc(
                                  `difficulties.${form.getValues('difficulty')}`,
                                )}
                                {form.getValues('difficulty') === 'append' ?
                                  <ChevronDownIcon className='size-4 text-purple-600 dark:text-purple-400' />
                                : <ChevronDownIcon className='size-4 text-inherit' />
                                }
                              </SelectValue>
                            </SelectTrigger>
                          </DifficultyBadge>
                          <SelectContent>
                            {difficulties.map((diff, i) => (
                              <SelectItem
                                value={diff}
                                key={i}
                              >
                                {/* {loc(`difficulties.${diff}`)} */}
                                <DifficultyBadge difficulty={diff}>
                                  {loc(`difficulties.${diff}`)}
                                </DifficultyBadge>
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
          <div className='flex gap-1 items-stretch justify-start flex-wrap max-w-full w-121 md:w-182 lg:w-243'>
            {songs.slice(page * range, (page + 1) * range).map((song, i) => (
              <Card
                key={i}
                className='sm:w-60 gap-1 hover:scale-101 transition-[scale]'
                variant='main'
                onClick={() => setSelectedSong(song)}
              >
                <CardHeader>
                  <CardTitle>{song.title}</CardTitle>
                </CardHeader>
                <CardContent className='h-full flex flex-col gap-2 items-center justify-between'>
                  <NextImage
                    src={song.jacket_url}
                    alt={song.title}
                    width={800}
                    height={800}
                    className='w-full max-w-80 rounded-md border-2'
                  />
                  <div className='flex w-full items-center justify-start flex-wrap gap-1'>
                    {song.difficulties.map((diff, i) => (
                      <DifficultyBadge
                        key={i}
                        difficulty={diff}
                      >
                        {loc(`difficulties.${diff}`).toUpperCase()}
                      </DifficultyBadge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
          <Dialog
            open={selectedSong !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedSong(null)
            }}
          >
            {selectedSong && (
              <DialogContent className='max-w-none! w-max min-w-80 min-h-40'>
                <DialogHeader className='flex items-center justify-start gap-4 flex-row mb-3'>
                  <DialogTitle>{selectedSong.title}</DialogTitle>
                  <DifficultyBadge difficulty={form.getValues('difficulty')}>
                    {loc(`difficulties.${form.getValues('difficulty')}`)}
                  </DifficultyBadge>
                </DialogHeader>
                {chartLoading || !chart ?
                  <div className='w-2xl aspect-video bg-accent flex items-center justify-center rounded-sm flex-col gap-4'>
                    <p>We're generating your chart...</p>
                    <Spinner className='size-5' />
                  </div>
                : <div className='relative'>
                    <img
                      className='w-2xl rounded-sm'
                      src={URL.createObjectURL(chart)}
                      alt={selectedSong.title}
                    />
                    <Button
                      size='icon'
                      className='absolute top-3 right-3 border-none cursor-pointer'
                      variant='outline'
                      onClick={() => window.open(URL.createObjectURL(chart))}
                    >
                      <Share />
                    </Button>
                  </div>
                }
              </DialogContent>
            )}
          </Dialog>
        </>
      }
    </div>
  )
}

const DifficultyBadge = ({
  difficulty,
  children,
}: {
  difficulty: (typeof difficulties)[number]
  children: React.ReactNode
}) => {
  return (
    <Badge
      className='rounded-md'
      variant={`outline-${difficulty}`}
    >
      {children}
    </Badge>
  )
}

export default ChartViewer
