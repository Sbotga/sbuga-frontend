import { NextResponse } from 'next/server'
import mainApi from '../../Api'
import * as fs from 'fs/promises'
import path from 'path'

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
    const j = await response.json()
    console.log(j)
    const { user, asset_base_url } = j
    const { banner_hash, id } = user

    // If there's a profile hash try fetching the remote image first.
    if (banner_hash) {
      const url = `${asset_base_url}/${id}/banner/${banner_hash}`
      try {
        const remote = await fetch(url)
        if (remote.ok) {
          const b = await remote.blob()
          const res = new NextResponse(b)
          res.headers.set('content-type', 'image/png')
          return res
        }
      } catch (e) {
        // fall back to local file below
      }
    }
  }

  // No profile hash or remote fetch failed -> serve local default from public/
  const filePath = path.join(
    process.cwd(),
    'src/app/api/banner_image',
    'default.png',
  )
  const buf = await fs.readFile(filePath)
  const res = new NextResponse(buf)
  res.headers.set('content-type', 'image/png')
  return res
}
