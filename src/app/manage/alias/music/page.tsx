'use client'

import mainApi from '@/app/Api'
import { searchMusics } from '@/app/tools/chart_search/actions'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/AuthContext'
import { useOptions } from '@/context/OptionsContext'
import useTranslation from '@/hooks/use-translation'
import { region, regions } from '@/lib/consts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search } from 'lucide-react'
import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import z from 'zod'
import { Alias, getSongsWithAliases } from './actions'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

const formSchema = z.object({
  search: z.string(),
  region: z.literal(regions),
})

interface song {
  difficulties: ('easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append')[]
  id: number
  jacket_url: string
  title: string

  aliases: Alias[]
}

const MusicAliases = () => {
  const { loc } = useTranslation()
  const [options, _] = useOptions()

  const { loading: authLoading, permissions } = useAuth()

  if (!authLoading && !permissions.includes('manage_aliases')) redirect('/')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      region: options.default_region,
    },
  })

  const [songs, setSongs] = useState<song[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async ({
    query,
    region,
  }: {
    query: string
    region: region
  }) => {
    try {
      const songsRes = await getSongsWithAliases({
        query,
        region,
      })
      setSongs(songsRes)
    } finally {
      setLoading(false)
      setPage(0)
    }
  }

  const [range, setRange] = useState(5)
  const [page, setPage] = useState(0)

  const formValues = useWatch({ control: form.control })

  useEffect(() => {
    loadData({
      region: formValues.region ?? options.default_region,
      query: formValues.search ?? '',
    })
  }, [formValues.region])

  useEffect(() => {
    const x = setTimeout(() => {
      loadData({
        region: formValues.region ?? options.default_region,
        query: formValues.search ?? '',
      })
    }, 1000)
    return () => clearTimeout(x)
  }, [formValues.search])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    loadData({
      region: values.region,
      query: values.search,
    })
  }

  return (
    <div className='flex items-center justify-center p-2 sm:w-3/5 h-full flex-col gap-5 w-110'>
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
                  {loc('manage.alias.music.search.title')}
                </CardTitle>
                <CardDescription>
                  {loc('manage.alias.music.search.description')}
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
                        {loc('tools.chart_search.search')}
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
                  {loc('tools.chart_search.search')}
                  <Search className='size-3.5' />
                </Button>
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
          <div className='flex gap-1 items-center justify-center w-full flex-col'>
            {songs.slice(page * range, (page + 1) * range).map((song, i) => (
              <SongCard
                song={song}
                key={i}
              />
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
              itemCountList={[5, 10, 25, 50]}
            />
          </div>
        </>
      }
    </div>
  )
}

const SongCard = ({ song }: { song: song }) => {
  const { loc } = useTranslation()
  const router = useRouter()
  return (
    <Card
      variant='main'
      className='w-full p-4 group'
      onClick={() => router.push(`/manage/alias/music/${song.id}`)}
    >
      <div className='flex items-start gap-4'>
        <div className='relative shrink-0'>
          <Image
            src={song.jacket_url}
            alt={song.title}
            width={80}
            height={80}
            className='aspect-square rounded-md object-cover shadow-sm group-hover:shadow-md transition-shadow'
          />
        </div>

        <div className='flex flex-1 flex-col min-w-0'>
          <div className='flex justify-between items-start'>
            <CardTitle className='truncate text-base font-semibold'>
              {song.title}
            </CardTitle>
            <span className='text-[10px] text-muted-foreground whitespace-nowrap ml-2 uppercase'>
              {song.aliases.length === 1 ?
                loc('manage.alias.alias_count.single')
              : loc('manage.alias.alias_count.multiple', {
                  count: song.aliases.length,
                })
              }
            </span>
          </div>

          <div className='flex flex-wrap gap-1 mt-2'>
            {song.aliases.slice(0, 3).map((a, i) => (
              <Badge
                key={i}
                variant='secondary'
                className='text-[10px] px-1.5 py-0 rounded-sm'
              >
                {a.alias}
              </Badge>
            ))}
            {song.aliases.length > 3 && (
              <Badge
                variant='outline'
                className='text-[10px] px-1.5 py-0 border-dashed rounded-sm'
              >
                +{song.aliases.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MusicAliases
