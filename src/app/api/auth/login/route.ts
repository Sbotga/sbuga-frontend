import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const body = await request.json()

  const res = await mainApi.api.mainApiAccountsLoginPost(body)

  if (!res.ok)
    return new NextResponse(JSON.stringify(await res.json()), {
      status: res.status,
    })

  const { access_token, refresh_token, user } = await res.json()

  const nextResponse = NextResponse.json({ user })

  nextResponse.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  })

  nextResponse.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth/refresh',
  })

  return nextResponse
}
