'use server'

import mainApi from '../../Api'

export type Difficulty =
  | 'easy'
  | 'normal'
  | 'hard'
  | 'expert'
  | 'master'
  | 'append'

export type Region = 'en' | 'jp'

export interface SimpleMusic {
  difficulties: Difficulty[]
  id: number
  jacket_url: string
  title: string
}

export async function searchMusics({
  region,
  query,
  difficulties,
  image_type,
}: {
  region: Region
  query: string
  difficulties: Difficulty[]
  image_type: 'png' | 'webp'
}): Promise<SimpleMusic[]> {
  'use server'

  const simpleResponse =
    await mainApi.api.getMusicsSimpleApiPjskDataMusicsSimpleGet(
      {
        region,
        image_type,
      },
      {
        cache: 'force-cache',
        next: { revalidate: 15 * 60 },
      },
    )

  const { musics }: { musics: SimpleMusic[] } = await simpleResponse.json()

  if (!query || query.length === 0) {
    return musics.filter((x) =>
      x.difficulties.some((y) => difficulties.includes(y)),
    )
  }

  const searchResponse =
    await mainApi.api.searchMusicsApiPjskDataMusicsSearchPost({
      region,
      query,
      difficulties,
    })

  const { ids }: { ids: number[] } = await searchResponse.json()

  const songsList: SimpleMusic[] = []
  for (const id of ids) {
    const song = musics.find((x) => x.id === id)
    if (song) songsList.push(song)
  }

  return songsList
}
