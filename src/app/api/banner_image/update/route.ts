import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken)
    return NextResponse.json({ detail: 'No access token' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file || !(file instanceof File))
    return NextResponse.json({ detail: 'No file provided' }, { status: 400 })

  const response = await mainApi.api.uploadBannerApiAccountsBannerUploadPost(
    {
      file,
    },
    {
      headers: { Authorization: accessToken },
    },
  )

  return response
}
