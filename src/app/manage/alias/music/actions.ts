'use server'

import mainApi from '@/app/Api'
import {
  Region,
  searchMusics,
  SimpleMusic,
} from '@/app/tools/chart_search/actions'

export type Alias = {
  id: number
  alias: string
  music_id: number
  created_at: string
  created_by: string | null
}

const REGION_ORDER: Region[] = ['jp', 'en']

export const getSongsWithAliases = async ({ query }: { query: string }) => {
  const aliasRes = await mainApi.api.getSongAliasesRouteApiManageAliasSongGet()

  // console.log(await aliasRes.json())

  const aliases: Alias[] = (await aliasRes.json()).aliases

  const songSet: SimpleMusic[] = []

  for (const r of REGION_ORDER) {
    for (const s of await searchMusics({
      difficulties: ['master'],
      image_type: 'webp',
      query,
      region: r,
    })) {
      if (songSet.filter((a) => a.id === s.id).length === 0) songSet.push(s)
    }
  }

  const songs = songSet.map((m) => {
    const a: Alias[] = []

    for (let i = aliases.length - 1; i >= 0; i--) {
      if (aliases[i].music_id === m.id) {
        a.push(aliases[i])
        aliases.splice(i, 1)
      }
    }

    return { ...m, aliases: a }
  })

  return songs
}
