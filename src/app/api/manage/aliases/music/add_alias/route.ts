import mainApi from '@/app/api/Api'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken)
    return NextResponse.json({ error: 'No token' }, { status: 401 })

  const body = await request.json()

  const response = await mainApi.api.addSongAliasRouteApiManageAliasSongPost(
    body,
    {
      headers: { Authorization: accessToken },
    },
  )

  return response
}
