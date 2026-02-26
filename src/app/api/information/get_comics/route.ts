import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const body = await request.json()

  const response = await mainApi.api.getComicsApiPjskDataComicsGet(body)

  const data = await response.json()

  console.log(response.status)
  return NextResponse.json(data)
}
