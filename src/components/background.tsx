'use client'

import { useOptions } from '@/context/OptionsContext'
import { allSbuga } from '@/lib/consts'
import { useEffect, useRef } from 'react'

const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
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
      size: number
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
    if (!options.sbuga_effects) return

    // Preload images on the client only
    sbugaImagesRef.current = allSbuga.map((s) => {
      const i = new Image()
      i.src = `/${s}`
      return i
    })
    const ro = new ResizeObserver(setCanvasSize)

    const mouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      sbugas.current.push({
        pos: {
          x: e.clientX - (rect?.left ?? 0) - 10,
          y: e.clientY - (rect?.top ?? 0) - 10,
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
        size: 20,
      })
    }

    const mouseClick = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      const offset = Math.random() * 2 * Math.PI
      for (let i = 0; i <= 2 * Math.PI; i += (Math.random() * Math.PI) / 2) {
        const speed = Math.random() * 0.35
        sbugas.current.push({
          pos: {
            x: e.clientX - (rect?.left ?? 0) - 10,
            y: e.clientY - (rect?.top ?? 0) - 10,
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
          size: Math.floor(Math.random() * 20) + 10,
        })
      }
    }

    if (canvasRef.current) {
      ro.observe(canvasRef.current.parentElement!)
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

    if (spawnTimer.current >= 100000 / canvasRef.current.width) {
      const distance = Math.random()
      spawnTimer.current = 0
      sbugas.current.push({
        pos: {
          x: Math.random() * canvasRef.current.width,
          y: -25,
        },
        vel: {
          x: Math.random() * 0.02 - 0.01,
          y: distance * 0.15 + 0.1,
        },
        type: Math.floor(
          Math.random() * (sbugaImagesRef.current.length || allSbuga.length),
        ),
        size: distance * 10 + 15,
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
        ctx.drawImage(img, s.pos.x, s.pos.y, s.size, s.size)
      } else {
        ctx.fillStyle = 'red'
        ctx.fillRect(s.pos.x, s.pos.y, s.size, s.size)
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
    options.sbuga_effects && (
      <canvas
        className={'absolute top-0 bottom-0 left-0 right-0 z-0'}
        ref={canvasRef}
        id='canvas'
      ></canvas>
    )
  )
}

export default Background
