import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken)
    return NextResponse.json({ detail: 'No access token' }, { status: 401 })

  const data: {
    username?: string
    display_name?: string
    description?: string
    password?: string
  } = await request.json()

  // const response = await mainApi.api.mainApiAccountsUsernamePost()

  let response = new NextResponse(
    JSON.stringify({ ...data, password: undefined }),
  )

  if (data.username) {
    if (!data.password) {
      return NextResponse.json({ detail: 'pasword_required' }, { status: 401 })
    }

    const res = await mainApi.api.mainApiAccountsUsernamePost(
      {
        new_username: data.username,
        password: data.password,
      },
      {
        headers: { Authorization: accessToken },
      },
    )

    if (!res.ok) {
      response = new NextResponse(JSON.stringify(await res.json()), {
        status: res.status,
      })
    }
  }

  if (data.display_name) {
    const res = await mainApi.api.mainApiAccountsDisplayNamePost(
      {
        new_display_name: data.display_name,
      },
      {
        headers: { Authorization: accessToken },
      },
    )

    if (!res.ok) {
      response = new NextResponse(JSON.stringify(await res.json()), {
        status: res.status,
      })
    }
  }

  if (data.description) {
    const res = await mainApi.api.updateDescriptionApiAccountsDescriptionPost(
      {
        description: data.description,
      },
      {
        headers: { Authorization: accessToken },
      },
    )

    if (!res.ok) {
      response = new NextResponse(JSON.stringify(await res.json()), {
        status: res.status,
      })
    }
  }

  return response
}
