'use server'

import mainApi from '@/app/Api'
import { searchMusics } from '@/app/tools/chart_search/actions'
import { region } from '@/lib/consts'

export type Alias = {
  id: number
  alias: string
  music_id: number
  region: region | null
  created_at: string
  created_by: string | null
}

export const getSongsWithAliases = async ({
  query,
  region,
}: {
  query: string
  region: region
}) => {
  const aliasRes = await mainApi.api.getSongAliasesRouteApiManageAliasSongGet()

  // console.log(await aliasRes.json())

  const aliases: Alias[] = (await aliasRes.json()).aliases

  const songsRes = (
    await searchMusics({
      difficulties: ['master'],
      image_type: 'webp',
      query,
      region,
    })
  ).map((m) => {
    const a: Alias[] = []

    for (let i = aliases.length - 1; i >= 0; i--) {
      if (aliases[i].music_id === m.id) {
        a.push(aliases[i])
        aliases.splice(i, 1)
      }
    }

    return { ...m, aliases: a }
  })

  return songsRes
}
