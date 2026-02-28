import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const body = await request.json()

  const simpleResponse =
    await mainApi.api.getMusicsSimpleApiPjskDataMusicsSimpleGet(
      {
        region: body.region,
        image_type: body.image_type,
      },
      {
        cache: 'force-cache',
        next: { revalidate: 15 * 60 },
      },
    )

  interface simpleMusic {
    difficulties: (
      | 'easy'
      | 'normal'
      | 'hard'
      | 'expert'
      | 'master'
      | 'append'
    )[]
    id: number
    jacket_url: string
    title: string
  }

  const {
    musics,
  }: {
    musics: simpleMusic[]
  } = await simpleResponse.json()

  if (body.query.length === 0)
    return NextResponse.json({
      songs: musics.filter((x) =>
        x.difficulties.some((y) => body.difficulties.includes(y)),
      ),
    })

  const searchResponse =
    await mainApi.api.searchMusicsApiPjskDataMusicsSearchPost({
      region: body.region,
      query: body.query,
      difficulties: body.difficulties,
    })

  const { ids }: { ids: number[] } = await searchResponse.json()

  const songsList: simpleMusic[] = []

  for (const music of musics) {
    if (ids.includes(music.id)) songsList.push(music)
  }

  return NextResponse.json({ songs: songsList })
}
