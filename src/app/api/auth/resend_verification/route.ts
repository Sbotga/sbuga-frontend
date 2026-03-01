import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async () => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken)
    return NextResponse.json({ detail: 'No access token' }, { status: 401 })

  const response =
    await mainApi.api.sendVerificationEmailApiAccountsEmailSendPost({
      headers: { Authorization: accessToken },
    })

  return response
}
