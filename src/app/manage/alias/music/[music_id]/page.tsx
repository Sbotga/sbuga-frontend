'use client'

import { useEffect, useState } from 'react'
import { useParams, redirect } from 'next/navigation'
import Image from 'next/image'
import mainApi from '@/app/Api'
import { useAuth } from '@/context/AuthContext'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RegionSelect from '@/components/region-select'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'
import { region, regions } from '@/lib/consts'
import useTranslation from '@/hooks/use-translation'

type Alias = {
  id: number
  alias: string
  music_id: number
  region: region | null
  created_at: string
  created_by: string | null
}

type SimpleMusic = {
  id: number
  title: string
  jacket_url: string
  difficulties?: string[]
}

export default function MusicAliasPage() {
  const params = useParams() as { music_id?: string }
  const musicId = Number(params.music_id ?? NaN)

  const { loc } = useTranslation()

  const { loading: authLoading, permissions, getAuthHeader } = useAuth()

  // redirect if no permission
  useEffect(() => {
    if (authLoading) return
    if (!permissions.includes('manage_aliases')) {
      redirect('/')
    }
  }, [authLoading, permissions])

  const [music, setMusic] = useState<SimpleMusic | null>(null)
  const [aliases, setAliases] = useState<Alias[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [newAlias, setNewAlias] = useState('')
  const [newRegion, setNewRegion] = useState<region>(regions[0])

  // load music details (try en then jp) and aliases
  useEffect(() => {
    if (!musicId || Number.isNaN(musicId)) {
      setLoading(false)
      return
    }

    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // try en then jp to find the music simple info
        try {
          const res =
            await mainApi.api.getMusicsSimpleApiPjskDataMusicsSimpleGet({
              region: 'en',
              image_type: 'webp',
            } as any)
          if (!mounted) return
          const data = await res.json().catch(() => null)
          const musics: SimpleMusic[] = data?.musics ?? []
          const found = musics.find((m) => m.id === musicId)
          if (found) setMusic(found)
        } catch (e) {
          // ignore and try jp
        }

        if (!mounted) return

        if (!music) {
          try {
            const res2 =
              await mainApi.api.getMusicsSimpleApiPjskDataMusicsSimpleGet({
                region: 'jp',
                image_type: 'webp',
              } as any)
            if (!mounted) return
            const data2 = await res2.json().catch(() => null)
            const musics2: SimpleMusic[] = data2?.musics ?? []
            const found2 = musics2.find((m) => m.id === musicId)
            if (found2) setMusic(found2)
          } catch (e) {
            // ignore
          }
        }

        // load aliases (endpoint returns all aliases)
        try {
          const ares =
            await mainApi.api.getSongAliasesRouteApiManageAliasSongGet()
          const ajson = await ares.json().catch(() => null)
          const allAliases: Alias[] = ajson?.aliases ?? []
          if (!mounted) return
          setAliases(allAliases.filter((a) => a.music_id === musicId))
        } catch (e) {
          // ignore
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicId])

  const handleDelete = async (aliasId: number) => {
    setActionLoading(true)
    try {
      const res =
        await mainApi.api.removeSongAliasRouteApiManageAliasSongDelete(
          { alias_id: aliasId } as any,
          {
            headers: getAuthHeader()!,
          },
        )
      if (res.ok) {
        setAliases((s) => s.filter((a) => a.id !== aliasId))
      } else {
        // try to read error body for debugging (no UI toast here)
        // eslint-disable-next-line no-console
        console.error('failed delete', await res.json().catch(() => null))
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newAlias || newAlias.trim().length === 0) return
    setActionLoading(true)
    try {
      const body = {
        music_id: musicId,
        alias: newAlias.trim(),
        region: newRegion as region,
      }
      const res = await mainApi.api.addSongAliasRouteApiManageAliasSongPost(
        { ...body, region: (newRegion as any) === 'global' ? null : newRegion },
        {
          headers: getAuthHeader()!,
        },
      )
      if (res.ok) {
        const json = await res.json().catch(() => null)
        // server likely returns created alias in `alias` or `aliases` field; try to extract
        const created: Alias | null =
          json?.alias ??
          json?.created_alias ??
          (json?.aliases ?? []).slice(-1)[0] ??
          null
        if (created) {
          setAliases((s) => [created, ...s])
        } else {
          // fallback: refetch aliases
          try {
            const ares =
              await mainApi.api.getSongAliasesRouteApiManageAliasSongGet()
            const ajson = await ares.json().catch(() => null)
            const allAliases: Alias[] = ajson?.aliases ?? []
            setAliases(allAliases.filter((a) => a.music_id === musicId))
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
          }
        }
        setNewAlias('')
      } else {
        // eslint-disable-next-line no-console
        console.error('failed add', await res.json().catch(() => null))
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className='flex items-center justify-center p-4 w-full'>
        <Card
          className='w-full max-w-3xl'
          variant='main'
        >
          <CardContent className='flex items-center justify-center p-8'>
            <Spinner className='size-8' />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!music) {
    return (
      <div className='flex items-center justify-center p-4 w-full'>
        <Card
          className='w-full max-w-3xl'
          variant='main'
        >
          <CardHeader>
            <CardTitle>
              {loc('manage.alias.music.song_not_found.title')}
            </CardTitle>
            <CardDescription>
              {loc('manage.alias.music.song_not_found.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {loc('manage.alias.music.song_not_found.no_data', {
                id: musicId,
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center p-4 w-full'>
      <Card
        className='w-full max-w-3xl'
        variant='main'
      >
        <CardHeader className='flex items-center gap-4'>
          <div className='shrink-0 w-20 h-20 relative'>
            <Image
              src={music.jacket_url}
              alt={music.title}
              width={80}
              height={80}
              className='rounded-md object-cover w-full h-full'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <CardTitle className='truncate'>{music.title}</CardTitle>
            <CardDescription className='truncate text-sm'>
              {music.id}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-4'>
            <h3 className='font-semibold mb-2'>
              {loc('manage.alias.music.list.title')}
            </h3>
            <div className='flex flex-col gap-2 md:flex-row md:flex-wrap'>
              {aliases.length === 0 ?
                <p className='text-sm text-muted-foreground'>
                  {loc('manage.alias.music.list.empty')}
                </p>
              : aliases.map((a) => (
                  <div
                    key={a.id}
                    className='flex items-center justify-between gap-2 p-2 rounded-md bg-card md:w-[calc(50%-4px)] md:only:w-full'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <Badge className='px-2 py-0 rounded text-lg'>
                        {a.alias}
                      </Badge>
                      <span className='text-sm text-muted-foreground ml-2'>
                        {loc(`regions.${a.region ?? 'global'}`)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDelete(a.id)}
                        disabled={actionLoading}
                        title={String(
                          loc('manage.alias.music.list.delete_confirm'),
                        )}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <h3 className='font-semibold mb-2'>
              {loc('manage.alias.music.list.add_title')}
            </h3>
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <label className='text-xs uppercase text-muted-foreground'>
                  {loc('manage.alias.music.list.alias_label')}
                </label>
                <Input
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder={String(
                    loc('manage.alias.music.list.alias_label'),
                  )}
                />
              </div>

              <div>
                <label className='text-xs uppercase text-muted-foreground'>
                  {loc('manage.alias.music.list.region_label')}
                </label>
                <RegionSelect
                  extra={['global']}
                  value={newRegion}
                  onValueChange={(v: region) => setNewRegion(v)}
                />
              </div>

              <div>
                <Button
                  onClick={handleAdd}
                  disabled={actionLoading || newAlias.trim().length === 0}
                >
                  <Plus className='size-4' />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className='justify-end'>
          <span className='text-sm text-muted-foreground'>
            {loc('manage.alias.music.list.total', { count: aliases.length })}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
