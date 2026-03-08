'use client'

import mainApi from '@/app/Api'
import Pagination from '@/components/pagination'
import RegionSelect from '@/components/region-select'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useOptions } from '@/context/OptionsContext'
import useTranslation from '@/hooks/use-translation'
import { region } from '@/lib/consts'
import { TriangleAlert } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface leaderboardUser {
  userId: number
  score: number
  rank: number
  isOwn: boolean
  name: string
  userCard: {
    cardId: number
    level: number
    masterRank: number
    specialTrainingStatus: 'done' | any
    defaultImage: 'special_training' | any
  }
  userProfile: {
    userId: number
    word: string
    twitterId: string
    profileImageType: 'leader' | any
  }
  userProfileHonors: {
    seq: number
    profileHonorType: 'normal' | any
    honorId: number
    honorLevel: number
    bondsHonorViewType: 'none' | any
    bondsHonorWordId: number
  }[]
  userCheerfulCarnival: {} | any
  userRankMatchSeason: {
    rankMatchSeasonId: number
    rankMatchTierId: number
    tierPoint: number
    totalTierPoint: number
    maxRankMatchTierId: number
    maxTierPoint: number
    maxTotalTierPoint: number
    playCount: number
    consecutiveWinCount: number
    maxConsecutiveWinCount: number
    winCount: number
    loseCount: number
    drawCount: number
    penaltyCount: number
    playableAt: number
  }
  userHonorMissions: {
    honorMissionType: string
    progress: number
  }[]
}

interface season {
  season_id: number
  season_name: string
  season_status: 'going' | 'end'
}

const RankedLeaderboard = () => {
  const [options, _] = useOptions()
  const { loc } = useTranslation()
  const [region, setRegion] = useState<region | 'tw' | 'kr'>(
    options.default_region,
  )

  const lastUpdated = useRef('')

  const [leaderboard, setLeaderboard] = useState<leaderboardUser[]>([])
  const [season, setSeason] = useState<season | null>(null)

  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(0)
  const [range, setRange] = useState(10)

  const [cheaters, setCheaters] = useState<number[]>([])

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const getLeaderboards = async (toggleSpinner: boolean = false) => {
    setLoading(toggleSpinner)
    try {
      const res = await mainApi.api.currentRankedApiPjskDataCurrentRankedGet({
        region,
      })

      const json = await res.json()

      console.log(json)
      setSeason({
        season_id: json.season_id,
        season_name: json.season_name,
        season_status: json.season_status,
      })
      setLeaderboard(json.top_100.rankings)
      setCheaters(json.cheaters.map((s: string) => parseInt(s)))

      const now = Date.now()
      const nextUpdate = json.next_available_update * 1000
      const delay = Math.max(0, nextUpdate - now)

      timeoutRef.current = setTimeout(getLeaderboards, delay)

      lastUpdated.current = new Date().toLocaleString()
    } finally {
      if (toggleSpinner) setPage(0)
      setLoading(false)
    }
  }

  useEffect(() => {
    getLeaderboards(true)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [region])

  return (
    <div className='flex flex-col gap-4 w-full sm:w-3/5 items-center justify-center'>
      <Card
        className='w-full'
        variant='main'
      >
        <CardHeader className='flex items-center justify-center'>
          <div className='flex-1'>
            <CardTitle className='font-header text-lg'>
              {loc('information.ranked_leaderboard.title')}
            </CardTitle>
            <CardDescription>
              {loc('information.ranked_leaderboard.description')}
            </CardDescription>
          </div>
          <div className='flex flex-col items-end justify-center gap-1'>
            <Label className='uppercase text-muted-foreground text-xs'>
              {loc('regions.title')}
            </Label>
            <RegionSelect
              extra={['kr', 'tw']}
              value={region}
              onValueChange={(v) => setRegion(v as region)}
            />
          </div>
        </CardHeader>
      </Card>
      {loading || !season ?
        <Card
          className='p-6 col-span-1 md:col-span-2 lg:col-span-3'
          variant='main'
        >
          <Spinner className='size-8' />
        </Card>
      : <>
          <Card
            className='w-full'
            variant='main'
          >
            <CardHeader className='flex flex-row gap-0 items-center'>
              <CardTitle className='font-header text-lg flex-1'>
                {season.season_name}
              </CardTitle>
              <Badge
                className='rounded-md'
                variant={
                  season.season_status === 'going' ? 'default' : 'destructive'
                }
              >
                {loc(
                  `information.ranked_leaderboard.season_status.${season.season_status}`,
                )}
              </Badge>
            </CardHeader>
          </Card>
          <div className='flex flex-col w-full gap-1'>
            <TooltipProvider>
              {leaderboard.slice(page * range, (page + 1) * range).map((x) => (
                <LeaderboardCard
                  user={x}
                  key={x.userId}
                  isCheater={cheaters.includes(x.userId)}
                />
              ))}
            </TooltipProvider>
          </div>
          <Pagination
            page={page}
            setPage={setPage}
            range={range}
            setRange={setRange}
            itemCountList={[5, 10, 20, 100]}
            maxPages={Math.max(0, Math.ceil(leaderboard.length / range) - 1)}
          />
          <p className='text-sm text-muted-foreground'>
            Last updated at {lastUpdated.current}
          </p>
        </>
      }
    </div>
  )
}

const RANKMATCH_GRADES = {
  1: 'Beginner',
  2: 'Bronze',
  3: 'Silver',
  4: 'Gold',
  5: 'Platinum',
  6: 'Diamond',
  7: 'Master',
}

const calculateRankDetails = (player: leaderboardUser) => {
  const tierId = player.userRankMatchSeason.rankMatchTierId
  const tierPoint = player.userRankMatchSeason.tierPoint

  const grade = Math.min(Math.ceil(tierId / 4), 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7
  let kurasu = tierId - 4 * (grade - 1)
  if (!kurasu) kurasu = 4

  const gradeName = RANKMATCH_GRADES[grade]
  const isMaster = grade === 7

  return {
    grade,
    grade_name: gradeName,
    class: isMaster ? '' : `CLASS ${kurasu}`,
    points: isMaster ? `♪ × ${tierPoint}` : `${tierPoint}/5`,
  }
}

const getRankStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        circle:
          'bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 shadow-[0_0_8px_rgba(234,179,8,0.4)]',
        border: 'bg-gradient-to-br from-yellow-400 via-yellow-200 to-amber-600',
      }
    case 2:
      return {
        circle:
          'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 shadow-[0_0_8px_rgba(148,163,184,0.4)]',
        border: 'bg-gradient-to-br from-slate-400 via-slate-200 to-slate-500',
      }
    case 3:
      return {
        circle:
          'bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 shadow-[0_0_8px_rgba(194,65,12,0.4)]',
        border:
          'bg-gradient-to-br from-orange-400 via-orange-200 to-orange-700',
      }
    default:
      return {
        circle: 'bg-accent',
        border: 'bg-background',
      }
  }
}

const LeaderboardCard = ({
  user,
  isCheater,
}: {
  user: leaderboardUser
  isCheater: boolean
}) => {
  const rankDetails = calculateRankDetails(user)
  const styles = getRankStyles(user.rank)
  const isTop3 = user.rank <= 3

  const { loc } = useTranslation()

  return (
    <div
      className={twMerge(
        'rounded-xl p-[2px] w-full',
        styles.border,
        isCheater && 'bg-red-200 dark:bg-red-950',
      )}
    >
      <Card
        variant='main'
        className={twMerge(
          'w-full flex flex-row items-center justify-center p-3 gap-3 border-none shadow-none text-card-foreground',
          isTop3 ? 'rounded-[10px]' : '',
          user.isOwn && !isTop3 && 'ring-2 ring-primary',
          isCheater && 'bg-red-200 dark:bg-red-950',
        )}
      >
        <div className='flex flex-col items-center justify-center min-w-[3rem] shrink-0 z-10'>
          <span
            className={twMerge(
              'text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-none mb-1',
              isCheater && 'text-red-800 dark:text-red-300',
            )}
          >
            {loc('information.ranked_leaderboard.rank')}
          </span>
          <div className='relative size-10 flex items-center justify-center flex-col'>
            <div
              className={twMerge(
                'absolute inset-0 rounded-full',
                styles.circle,
                isCheater && 'bg-red-400 dark:bg-red-600',
              )}
            />
            <span
              className={twMerge(
                'relative z-10 font-black italic text-lg text-center',
                user.rank <= 3 ? 'text-white' : 'text-accent-foreground',
                isCheater && 'text-red-950 dark:text-red-100',
              )}
            >
              {user.rank}
            </span>
          </div>
        </div>

        <div className='relative group'>
          <Image
            className='w-12 h-auto drop-shadow-md transition-transform group-hover:scale-110'
            src={`/player-classes/${rankDetails.grade_name.toLowerCase()}.png`}
            alt={rankDetails.grade_name}
            width={48}
            height={48}
            loading='lazy'
          />
        </div>

        <div className='flex-1 min-w-0 h-full flex flex-col items-start justify-center'>
          <div className='w-full flex flex-row items-center justify-start gap-1.5'>
            <h2 className='text-lg font-bold truncate tracking-tight leading-tight'>
              {user.name}
            </h2>
            <Badge
              variant={isCheater ? 'destructive' : 'secondary'}
              className='rounded-md whitespace-nowrap py-0 px-1.5 text-[10px] h-4 font-bold'
            >
              {rankDetails.points}
            </Badge>
          </div>

          <UserWord word={user.userProfile.word} />

          {isCheater && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='destructive'
                  className='rounded-md uppercase cursor-pointer'
                >
                  <TriangleAlert />
                  {loc('information.ranked_leaderboard.cheater.title')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {loc('information.ranked_leaderboard.cheater.description')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {!rankDetails.grade_name.includes('Master') && (
          <div className='hidden sm:block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest vertical-text'>
            {rankDetails.class}
          </div>
        )}
      </Card>
    </div>
  )
}

const UserWord = ({ word }: { word: string }) => {
  const colorMatch = word.match(/<#([0-9A-Fa-f]{3,6})>/)
  const hexColor = colorMatch ? `#${colorMatch[1]}` : undefined
  const cleanWord = word.replace(/<[^>]*>/g, '')

  return (
    <p
      className={twMerge(
        'text-xs text-muted-foreground truncate w-full',
        'italic antialiased',
      )}
      style={{ color: hexColor }}
      title={cleanWord} // Shows full text on hover for accessibility
    >
      {cleanWord && `"${cleanWord}"`}
    </p>
  )
}

export default RankedLeaderboard
