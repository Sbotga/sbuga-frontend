import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const body = await request.json()
  if (!body.id)
    return NextResponse.json({ detail: 'invalid_request' }, { status: 403 })

  const advancedResponse = await mainApi.api.getMusicsApiPjskDataMusicsGet(
    {
      region: body.region,
      image_type: body.image_type,
    },
    {
      cache: 'force-cache',
      next: { revalidate: 15 * 60 },
    },
  )

  const json = await advancedResponse.json()

  const { musics } = json

  const selectionList = musics.filter((x: any) => x.id === body.id)

  if (selectionList.length !== 1)
    return NextResponse.json({ detail: 'music_not_found' }, { status: 404 })

  return NextResponse.json({ song: selectionList[0] })
}
