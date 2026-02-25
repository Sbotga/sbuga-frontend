import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const GET = async () => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken)
    return NextResponse.json({ error: 'No token' }, { status: 401 })

  const response = await mainApi.api.getSelfApiAccountsMeGet({
    headers: { Authorization: accessToken },
  })

  if (!response.ok)
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const { user } = await response.json()
  return NextResponse.json({ user })
}
