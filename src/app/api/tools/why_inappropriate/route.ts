import { NextResponse } from 'next/server'
import apiRequest from '../../api-request'

export const POST = async (request: Request) => {
  const body = await request.json()
  const response = await apiRequest('/api/tools/why_inappropriate', {
    body,
  })

  const data = await response.json()

  console.log(response.status)
  return NextResponse.json(data)
}
