import { ImageResponse } from 'next/og'
import sharp from 'sharp'

export const contentType = 'image/png'

async function getImageDimensions(url: string) {
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()

    // sharp handles the buffer and extracts metadata
    const metadata = await sharp(Buffer.from(buffer)).metadata()

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format, // e.g., 'jpeg', 'png'
    }
  } catch (error) {
    console.error('Error fetching image dimensions:', error)
    return null
  }
}

export default async function OGImage({
  params,
  // searchParams,
}: PageProps<'/tools/chart_viewer/[region]/[music_id]/[difficulty]'>) {
  const { music_id, region, difficulty } = await params
  // const { mirrored } = await searchParams

  const url = `http://127.0.0.1:3000/tools/chart_viewer/${region}/${music_id}/${difficulty}/image`

  const { width, height } = (await getImageDimensions(url)) ?? {
    width: 0,
    height: 0,
  }

  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: 'black',
        color: 'red',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={url}
        alt={music_id}
      />
    </div>,
    {
      width: width * 1.15,
      height: height * 1.15,
    },
  )
}
