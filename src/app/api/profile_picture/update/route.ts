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

  console.log('profile_picture/update called', { hasFile: !!file })

  if (!file || !(file instanceof File))
    return NextResponse.json({ detail: 'No file provided' }, { status: 400 })

  console.log('profile_picture/update file size', file.size, 'name', file.name)

  const response = await mainApi.api.uploadProfileApiAccountsProfileUploadPost(
    { file },
    { headers: { Authorization: accessToken } },
  )

  return response
}
