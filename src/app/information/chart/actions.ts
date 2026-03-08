'use server'

import mainApi from '@/app/Api'
import { region } from '@/lib/consts'

export const getAdvancedSongDetails = async (region: region, id: number) => {
  const res = await mainApi.api.getMusicsApiPjskDataMusicsGet({
    region,
    image_type: 'webp',
  })

  if (!res.ok) return await res.json()

  const json = await res.json()

  const s = json.musics.find((x: any) => x.id === id)

  return s
}
