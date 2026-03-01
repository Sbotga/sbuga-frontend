import { NextResponse } from 'next/server'
import mainApi from '../../Api'
import { LosslessNumber, parse } from 'lossless-json'

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) => {
  const { username } = await params
  const usernameExists = (
    await mainApi.api.mainApiAccountsChecksUsernameUsernameGet(username)
  ).ok

  if (usernameExists) {
    const response =
      await mainApi.api.getAccountApiAccountsUsernameGet(username)
    const text = await response.text()
    const j: {
      user: { profile_hash: string; id: LosslessNumber }
      asset_base_url: string
    } = parse(text) as any
    const { user } = j

    return NextResponse.json({ user })
  }

  return NextResponse.json({ detail: 'no_user' }, { status: 404 })
}
