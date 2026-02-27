import mainApi from '../../Api'

export const POST = async (request: Request) => {
  const body = await request.json()

  return await mainApi.api.getChartApiToolsChartViewerGet(body)
}
