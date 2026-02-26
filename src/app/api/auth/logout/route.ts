import { NextResponse } from 'next/server'

export const POST = async () => {
  const nextResponse = new NextResponse()

  nextResponse.cookies.delete({
    name: 'refresh_token',
    path: '/api/auth/refresh',
  })
  nextResponse.cookies.delete('access_token')

  return nextResponse
}
