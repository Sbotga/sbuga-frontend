'use server'

import { LosslessNumber, parse, stringify } from 'lossless-json'
import mainApi from '../Api'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const getUser = async (username: string) => {
  const usernameExists = (
    await mainApi.api.mainApiAccountsChecksUsernameUsernameGet(username)
  ).ok

  if (!usernameExists) return { detail: 'no_user' }

  const response = await mainApi.api.getAccountApiAccountsUsernameGet(username)
  const text = await response.text()
  const json1: {
    user: { profile_hash: string; id: LosslessNumber | string }
    asset_base_url: string
  } = parse(text) as any

  json1.user.id = json1.user.id.toString()
  const s2 = stringify(json1)!
  console.log(s2)
  return JSON.parse(s2)
}

export const deleteBannerImage = async () => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) return redirect('/login')

  const response = await mainApi.api.deleteBannerApiAccountsBannerDelete({
    headers: { Authorization: accessToken },
  })

  return response.ok
}

export const updateBannerImage = async (file: File) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) return redirect('/login')

  const response = await mainApi.api.uploadBannerApiAccountsBannerUploadPost(
    { file },
    { headers: { Authorization: accessToken } },
  )

  return response.ok
}

export const deleteProfilePicture = async () => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) return redirect('/login')

  const response = await mainApi.api.deleteProfileApiAccountsProfileDelete({
    headers: { Authorization: accessToken },
  })

  return response.ok
}

export const updateProfilePicture = async (file: File) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) return redirect('/login')

  const response = await mainApi.api.uploadProfileApiAccountsProfileUploadPost(
    { file },
    { headers: { Authorization: accessToken } },
  )

  return response.ok
}
