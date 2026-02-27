import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const body = await request.json()

  const response = await mainApi.api.getChartApiToolsChartViewerGet(body)

  const data = await response.json()

  return NextResponse.json(data)
}
