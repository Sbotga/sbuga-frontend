'use client'

import NextImage from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useOptions } from '@/context/OptionsContext'

const allSbuga = [
  'sbuga_cute.png',
  'sbuga_green.png',
  'sbuga_orange.png',
  'sbuga_pat.gif',
  'sbuga_purple.png',
  'sbuga_red.png',
  'sbuga_spin.gif',
  'sbuga_yellow.png',
  'sbuga.png',
  'zuba.png',
]

const getRandomSbuga = () => {
  return allSbuga[Math.floor(Math.random() * allSbuga.length)]
}

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const raf = useRef(0)
  const lastTime = useRef(0)
  const spawnTimer = useRef(0)

  const sbugaImagesRef = useRef<HTMLImageElement[]>([])

  const [options] = useOptions()

  const sbugas = useRef(
    [] as {
      pos: { x: number; y: number }
      vel: { x: number; y: number }
      spawnTimestamp?: number
      despawnTimestamp?: number
      type: number
    }[],
  )

  const setCanvasSize = () => {
    cancelAnimationFrame(raf.current)
    if (!canvasRef.current) return
    canvasRef.current.width = canvasRef.current.parentElement?.clientWidth ?? 0
    canvasRef.current.height =
      canvasRef.current.parentElement?.clientHeight ?? 0

    raf.current = requestAnimationFrame(draw)
  }

  useEffect(() => {
    setImageUrl(`/${getRandomSbuga()}`)
  }, [])

  useEffect(() => {
    if (!options.sbuga_effects) return

    // Preload images on the client only
    sbugaImagesRef.current = allSbuga.map((s) => {
      const i = new Image()
      i.src = `/${s}`
      return i
    })
    const ro = new ResizeObserver(setCanvasSize)

    const mouseMove = (e: MouseEvent) => {
      sbugas.current.push({
        pos: {
          x: e.x - (canvasRef.current?.parentElement?.offsetLeft ?? 0) - 10,
          y: e.y - (canvasRef.current?.parentElement?.offsetTop ?? 0) - 10,
        },
        vel: {
          x: 0,
          y: 0,
        },
        spawnTimestamp: lastTime.current,
        despawnTimestamp: lastTime.current + 250,
        type: Math.floor(
          Math.random() * (sbugaImagesRef.current.length || allSbuga.length),
        ),
      })
    }

    const mouseClick = (e: MouseEvent) => {
      const offset = Math.random() * 2 * Math.PI
      for (let i = 0; i <= 2 * Math.PI; i += (Math.random() * Math.PI) / 3) {
        const speed = Math.random() * 0.5
        sbugas.current.push({
          pos: {
            x: e.x - (canvasRef.current?.parentElement?.offsetLeft ?? 0) - 10,
            y: e.y - (canvasRef.current?.parentElement?.offsetTop ?? 0) - 10,
          },
          vel: {
            x: Math.cos(i + offset) * speed,
            y: Math.sin(i + offset) * speed,
          },
          spawnTimestamp: lastTime.current,
          despawnTimestamp: lastTime.current + 250,
          type: Math.floor(
            Math.random() * (sbugaImagesRef.current.length || allSbuga.length),
          ),
        })
      }
    }

    if (canvasRef.current) {
      ro.observe(canvasRef.current)
      window.addEventListener('mousemove', mouseMove)
      window.addEventListener('mousedown', mouseClick)
    }

    window.addEventListener('resize', setCanvasSize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mousedown', mouseClick)
    }
  }, [options.sbuga_effects, setCanvasSize])

  const draw = (timeStamp: number) => {
    if (!canvasRef.current) return

    const dt = timeStamp - lastTime.current
    lastTime.current = timeStamp
    spawnTimer.current += dt

    if (spawnTimer.current >= 150) {
      spawnTimer.current = 0
      sbugas.current.push({
        pos: {
          x: Math.random() * canvasRef.current.width,
          y: -25,
        },
        vel: {
          x: Math.random() * 0.02 - 0.01,
          y: Math.random() * 0.15 + 0.1,
        },
        type: Math.floor(
          Math.random() * (sbugaImagesRef.current.length || allSbuga.length),
        ),
      })
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    for (let i = sbugas.current.length - 1; i >= 0; i--) {
      ctx.globalAlpha = 0.5
      const s = sbugas.current[i]
      s.pos.y += dt * s.vel.y
      s.pos.x += dt * s.vel.x

      if (
        s.pos.y >= canvasRef.current.height ||
        (s.despawnTimestamp && timeStamp >= s.despawnTimestamp)
      ) {
        sbugas.current.splice(i, 1)
        continue
      }

      if (s.despawnTimestamp && s.spawnTimestamp) {
        ctx.globalAlpha =
          (0.5 * (timeStamp - s.despawnTimestamp)) /
          (s.spawnTimestamp - s.despawnTimestamp)
      }

      // ctx.fillStyle = 'red'
      // ctx.fillRect(s.pos.x, s.pos.y, 20, 20)
      const img = sbugaImagesRef.current[s.type]
      if (img) {
        ctx.drawImage(img, s.pos.x, s.pos.y, 20, 20)
      } else {
        ctx.fillStyle = 'red'
        ctx.fillRect(s.pos.x, s.pos.y, 20, 20)
      }
    }

    raf.current = requestAnimationFrame(draw)
  }

  useEffect(() => {
    if (!options.sbuga_effects) {
      cancelAnimationFrame(raf.current)
      return
    }

    raf.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf.current)
  }, [options.sbuga_effects, draw])

  return (
    <div className='w-full h-full bg-secondary flex items-center justify-center flex-col gap-6 relative'>
      {options.sbuga_effects && (
        <canvas
          className={'absolute inset-0 z-0'}
          ref={canvasRef}
          id='canvas'
        />
      )}
      <h1 className='font-header text-4xl z-1'>Sbuga</h1>
      {imageUrl && (
        <NextImage
          src={imageUrl}
          alt='Sbuga'
          width={96}
          height={96}
          className='size-50 z-1'
          loading='eager'
          onClick={() => setImageUrl(`/${getRandomSbuga()}`)}
        />
      )}
    </div>
  )
}

export default Home
