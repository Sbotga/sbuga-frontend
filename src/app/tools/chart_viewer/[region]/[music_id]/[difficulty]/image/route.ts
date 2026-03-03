import mainApi from '@/app/api/Api'
import { region } from '@/lib/consts'
import { NextRequest } from 'next/server'

export const GET = async (
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      region: string
      music_id: string
      difficulty: string
    }>
  },
) => {
  const body = await params
  const mirrored = request.nextUrl.searchParams.get('mirrored') === 'true'

  const res = await mainApi.api.getChartApiToolsChartViewerGet({
    difficulty: body.difficulty as
      | 'easy'
      | 'normal'
      | 'hard'
      | 'expert'
      | 'master'
      | 'append',
    music_id: parseInt(body.music_id),
    region: body.region as region,
    mirrored,
  })

  return res
}
