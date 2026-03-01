import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken)
    return NextResponse.json({ detail: 'No access token' }, { status: 401 })

  const { token } = await request.json()

  const response = mainApi.api.verifyEmailPostApiAccountsEmailVerifyVerifyPost({
    token,
  })

  return response
}
