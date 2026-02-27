'use client'

import Pagination from '@/components/pagination'
import RegionSelect from '@/components/region-select'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useOptions } from '@/context/OptionsContext'
import { useIsMobile } from '@/hooks/use-mobile'
import useTranslation from '@/hooks/use-translation'
import { apiClient } from '@/lib/api-client'
import { region } from '@/lib/consts'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import Image from 'next/image'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

interface comic {
  title: string
  image_url: string
  from_user_rank: number
  to_user_rank: number
}

const ComicViewer = () => {
  const { loc } = useTranslation()
  const [options, _] = useOptions()
  const [region, setRegion] = useState(options.default_region)
  const [loading, setLoading] = useState(true)
  const [comics, setComics] = useState<comic[]>([])
  const [range, setRange] = useState(6)
  const [page, setPage] = useState(0)

  const [selectedComic, setSelectedComic] = useState<comic | null>(null)

  useEffect(() => {
    const getComics = async () => {
      try {
        setLoading(true)
        const res = await apiClient(
          '/api/information/get_comics',
          {
            method: 'POST',
            body: JSON.stringify({
              region,
              image_type: 'webp',
            }),
          },
          { unprotected: true },
        )

        if (res.ok) {
          const { comics: allComics } = await res.json()
          setComics(allComics)
        }
      } finally {
        setLoading(false)
      }
    }

    getComics()
  }, [region])

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 content-center'>
        {loading ?
          <Card
            className='p-6 col-span-1 md:col-span-2 lg:col-span-3'
            variant='main'
          >
            <Spinner className='size-8' />
          </Card>
        : <>
            <Card
              className='col-span-1 md:col-span-2 lg:col-span-3 mb-2'
              variant='main'
            >
              <CardHeader className='flex items-center justify-center'>
                <div className='flex-1'>
                  <CardTitle className='font-header text-lg'>
                    {loc('information.comic_viewer.title')}
                  </CardTitle>
                  <CardDescription>
                    {loc('information.comic_viewer.description')}
                  </CardDescription>
                </div>
                <div className='flex flex-col items-end justify-center gap-1'>
                  <Label className='uppercase text-muted-foreground text-xs'>
                    {loc('regions.title')}
                  </Label>
                  <RegionSelect
                    value={region}
                    onValueChange={(v) => setRegion(v as region)}
                  />
                </div>
              </CardHeader>
            </Card>
            {comics
              .slice(page * range, Math.min((page + 1) * range, comics.length))
              .map((comic, i) => (
                <Card
                  key={i}
                  variant='main'
                  className='w-xs hover:scale-101 transition-all'
                  onClick={() => setSelectedComic(comic)}
                >
                  <CardHeader>
                    <CardTitle>{comic.title}</CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col items-center justify-center'>
                    <Image
                      src={comic.image_url}
                      alt={comic.title}
                      loading='eager'
                      width={808}
                      height={600}
                      className='w-full'
                    />
                  </CardContent>
                </Card>
              ))}
            <div className='flex items-center justify-center mt-2 col-span-1 md:col-span-2 lg:col-span-3 flex-col gap-2'>
              <p className='text-sm text-muted-foreground'>
                Showing {page * range + 1}{' '}
                {Math.min((page + 1) * range, comics.length) !==
                  page * range + 1 &&
                  `to ${Math.min((page + 1) * range, comics.length)}`}{' '}
                of {comics.length}
              </p>

              <Pagination
                page={page}
                setPage={setPage}
                maxPages={Math.max(0, Math.ceil(comics.length / range) - 1)}
                range={range}
                setRange={setRange}
                itemCountList={[3, 6, 9, 12, 18, 24, 30]}
              />
            </div>
          </>
        }
      </div>
      {/* {selectedComic && (
        <div className='fixed left-0 right-0 bottom-0 top-0 bg-foreground/20 flex items-center justify-center'>
          hi
        </div>
      )} */}
      <Dialog
        open={selectedComic !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedComic(null)
        }}
      >
        {selectedComic && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedComic.title}</DialogTitle>
              <DialogDescription>
                {loc('information.comic_viewer.rank_available', {
                  from_rank: selectedComic.from_user_rank,
                  to_rank: selectedComic.to_user_rank,
                })}
              </DialogDescription>
            </DialogHeader>
            <Image
              src={selectedComic.image_url}
              alt={selectedComic.title}
              loading='eager'
              width={808}
              height={600}
              className='w-full'
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

export default ComicViewer
