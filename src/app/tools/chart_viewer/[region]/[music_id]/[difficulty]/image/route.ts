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

  const res = await fetch(request.nextUrl.origin + '/api/tools/chart_viewer', {
    method: 'POST',
    body: JSON.stringify({
      mirrored,
      ...body,
      music_id: parseInt(body.music_id),
    }),
  })

  return res
}
