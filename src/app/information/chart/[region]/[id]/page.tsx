'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import useTranslation from '@/hooks/use-translation'
import { region } from '@/lib/consts'
import Image from 'next/image'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { getAdvancedSongDetails } from '../../actions'

interface song {
  id: number
  title: string
  pronunciation: string
  lyricist: string
  composer: string
  arranger: string
  artist: {
    id: number
    name: string
    pronunciation: string
  }
  categories: ('image' | 'mv' | 'mv_2d' | any)[]
  tags: ('all' | 'vocaloid' | 'ligh_music_club' | 'idol' | 'other' | any)[]
  published_at: number
  released_at: number
  is_newly_written: boolean
  is_full_length: boolean
  filler_sec: number
  jacket_url: string
  collaboration: {} | null
  original_video: string
  difficulties: {
    difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append'
    play_level: number
    total_note_count: number
  }[]
  vocals: {
    id: number
    vocal_type:
      | 'instrumental'
      | 'original_song'
      | 'sekai'
      | 'another_vocal'
      | 'april_fool_2022'
      | any
    caption: string
    characters: {
      character_type: 'game_character' | any
      character_id: number
      seq: number
    }[]
    assetbundle_name: string
    published_at: number
    variants: any[]
  }[]
}

const Chart = ({ params }: PageProps<'/information/chart/[region]/[id]'>) => {
  const { loc } = useTranslation()
  const { id, region } = use(params) as { id: string; region: region }

  const [song, setSong] = useState<song | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const getSong = async () => {
      try {
        const s = await getAdvancedSongDetails(region, parseInt(id))
        setSong(s)
      } finally {
        setLoading(false)
      }
    }

    getSong()
  }, [])

  if (loading)
    return (
      <Card
        variant='main'
        className='p-3'
      >
        <Spinner className='size-5.5' />
      </Card>
    )

  if (!song)
    return (
      <Card
        className='min-w-md relative group/card flex items-center justify-center min-h-35'
        variant='main'
      >
        <CardHeader className='w-full items-center justify-center flex flex-col gap-4'>
          <CardTitle className='text-xl'>{loc('404.title')}</CardTitle>
          <CardDescription>
            {loc('404.description', { item: 'song' })}
          </CardDescription>
        </CardHeader>
      </Card>
    )

  return (
    <Card
      variant='main'
      className='max-w-full min-w-full sm:min-w-130 sm:max-w-4/5'
    >
      <CardHeader className='flex flex-row items-start justify-center gap-4 h-40 relative'>
        <div className='h-full aspect-square overflow-hidden'>
          <Image
            src={song.jacket_url}
            alt={song.title}
            width={400}
            height={400}
            loading='eager'
            className='w-full h-full border-2 rounded-md'
          />
        </div>
        <div className='flex flex-col flex-1 items-start justify-start h-full w-full'>
          <CardTitle className='font-header text-lg'>{song.title}</CardTitle>
          <CardDescription>{song.artist.name}</CardDescription>

          <div className='w-full mt-auto flex items-end justify-start flex-wrap gap-1'>
            {song.difficulties.map((diff, i) => (
              <Badge
                variant={`outline-${diff.difficulty}`}
                key={i}
                className='rounded-md'
              >
                {loc(`difficulties.${diff.difficulty}`)}
              </Badge>
            ))}
          </div>
        </div>
        <div className='absolute -top-3 right-3 border rounded-md py-2 px-4 text-sm'>
          {loc(`regions.${region}`)}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <section>
          <h2 className='text-xl mb-4 border-b pb-2 font-header'>
            {loc('information.chart.gameplay_charts')}
          </h2>
          <div
            className={twMerge(
              'grid gap-2 sm:grid-cols-2',
              song.difficulties.length < 2 && 'sm:grid-cols-1',
            )}
          >
            {song.difficulties.map((diff, di) => (
              <div
                key={di}
                className='flex items-center justify-between p-3 rounded-lg border bg-card transition-colors group'
              >
                <div className='flex items-center gap-3'>
                  {/* <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary font-bold text-lg'>
                    {diff.play_level}
                  </div> */}
                  <DifficultyBadge
                    difficulty={diff.difficulty}
                    level={diff.play_level}
                  />
                  <div>
                    <p className='text-sm font-medium leading-none'>
                      {loc(`difficulties.${diff.difficulty}`)}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1 uppercase'>
                      {loc('information.chart.total_combo', {
                        number: diff.total_note_count,
                      })}
                    </p>
                  </div>
                </div>

                <Button
                  size='sm'
                  variant='ghost'
                  asChild
                  className='hover:bg-background hover:shadow-xs hover:border'
                >
                  <Link
                    href={`/tools/chart_viewer/${region}/${id}/${diff.difficulty}`}
                  >
                    {loc('information.chart.view_chart')}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className='text-xl mb-4 border-b pb-2 font-header'>Vocals</h2>
          <div
            className={twMerge(
              'grid gap-4 xl:grid-cols-2',
              song.vocals.length < 2 && 'xl:grid-cols-1',
            )}
          >
            {song.vocals.map((voc, vi) => (
              <div
                key={vi}
                className='p-4 rounded-lg bg-secondary/20 border border-border'
              >
                <p className='text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
                  {voc.caption}
                </p>
                <div className='flex flex-wrap gap-2'>
                  {voc.characters.map((char, ci) => (
                    <Badge
                      variant='default'
                      key={ci}
                      className='text-sm rounded-md'
                    >
                      {getCharName(char.character_id)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

const DifficultyBadge = ({
  difficulty,
  level,
}: {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append'
  level: number
}) =>
  difficulty === 'append' ?
    <div className='flex items-center justify-center w-10 h-10 rounded-full p-[2px] font-bold text-lg bg-linear-135 from-indigo-500 to-fuchsia-500'>
      <div className='flex items-center justify-center w-full h-full rounded-full font-bold text-lg bg-linear-135 from-indigo-200 to-fuchsia-200 dark:from-indigo-800 dark:to-fuchsia-800'>
        <span className='bg-linear-135 from-indigo-800 to-fuchsia-800 dark:from-indigo-200 dark:to-fuchsia-200 text-transparent bg-clip-text'>
          {level}
        </span>
      </div>
    </div>
  : <div
      className={twMerge(
        'flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-lg',
        {
          easy: 'bg-lime-200 border-lime-500 text-lime-800 dark:bg-lime-800 dark:text-lime-200',
          normal:
            'bg-cyan-200 border-cyan-500 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200',
          hard: 'bg-amber-200 border-amber-500 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
          expert:
            'bg-rose-200 border-rose-500 text-rose-800 dark:bg-rose-800 dark:text-rose-200',
          master:
            'bg-purple-200 border-purple-500 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
        }[difficulty],
      )}
    >
      {level}
    </div>

export default Chart

const getCharName = (nameId: number) => {
  const names = [
    'Hoshino Ichika',
    'Tenma Saki',
    'Mochizuki Honami',
    'Hinomori Shiho',
    'Hanasato Minori',
    'Kiritani Haruka',
    'Momoi Airi',
    'Hinomori Shizuku',
    'Azusawa Kohane',
    'Shiraishi An',
    'Shinonome Akito',
    'Aoyagi Toya',
    'Tenma Tsukasa',
    'Otori Emu',
    'Kusanagi Nene',
    'Kamishiro Rui',
    'Yoisaki Kanade',
    'Ashina Mafuyu',
    'Shinonome Ena',
    'Akiyama Mizuki',
    'Hatsune Miku',
    'Kagamine Rin',
    'Kagamine Len',
    'Megurine Luka',
    'Meiko',
    'Kaito',
  ]

  return names[nameId - 1]
}
