'use client'

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

const Pagination = ({
  page,
  maxPages,
  setPage,
}: {
  page: number
  maxPages: number
  setPage: Dispatch<SetStateAction<number>>
}) => {
  const isMobile = useIsMobile()
  const { loc } = useTranslation()

  const pagesToShow = new Set<number>()
  if (!isMobile) {
    pagesToShow.add(0)
    pagesToShow.add(maxPages)
  }
  pagesToShow.add(page)
  if (page > 0) pagesToShow.add(page - 1)
  if (page < maxPages) pagesToShow.add(page + 1)

  const minPage = Math.min(...pagesToShow)
  const maxPage = Math.max(...pagesToShow)
  if (maxPage - minPage + 1 <= 5) {
    for (let p = minPage; p <= maxPage; p++) {
      pagesToShow.add(p)
    }
  }

  const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b)

  const buttons = []
  for (let i = 0; i < sortedPages.length; i++) {
    const pageNum = sortedPages[i]

    if (!isMobile && i > 0 && sortedPages[i - 1] < pageNum - 1) {
      buttons.push(
        <Button
          key={`ellipsis-${pageNum}`}
          variant='outline'
          className='hover:bg-background aspect-square sm:aspect-auto'
        >
          ...
        </Button>,
      )
    }

    buttons.push(
      <Button
        key={`page-${pageNum}`}
        variant={page === pageNum ? 'default' : 'outline'}
        className='cursor-pointer aspect-square sm:aspect-auto'
        onClick={() => setPage(pageNum)}
      >
        {pageNum + 1}
      </Button>,
    )
  }

  return (
    <div className='flex items-center justify-center gap-1'>
      <ButtonGroup>
        <Button
          variant='outline'
          className='cursor-pointer'
          onClick={() => setPage(0)}
        >
          <ChevronsLeft />
          <span className='hidden sm:inline'>{loc('pagination.first')}</span>
        </Button>
        <Button
          disabled={page === 0}
          variant='outline'
          className='disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground cursor-pointer'
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft />
          <span className='hidden sm:inline'>{loc('pagination.prev')}</span>
        </Button>
      </ButtonGroup>
      <ButtonGroup>{buttons}</ButtonGroup>
      <ButtonGroup>
        <Button
          disabled={page === maxPages}
          variant='outline'
          className='disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground cursor-pointer'
          onClick={() => setPage((p) => p + 1)}
        >
          <span className='hidden sm:inline'>{loc('pagination.next')}</span>
          <ChevronRight />
        </Button>
        <Button
          variant='outline'
          className='cursor-pointer'
          onClick={() => setPage(maxPages)}
        >
          <span className='hidden sm:inline'>{loc('pagination.last')}</span>
          <ChevronsRight />
        </Button>
      </ButtonGroup>
    </div>
  )
}

const ComicViewer = () => {
  const { loc } = useTranslation()
  const [options, _] = useOptions()
  const [region, setRegion] = useState(options.default_region)
  const [loading, setLoading] = useState(true)
  const [comics, setComics] = useState<
    {
      title: string
      image_url: string
      from_user_rank: number
      to_user_rank: number
    }[]
  >([])
  const [range, setRange] = useState(6)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const getComics = async () => {
      try {
        setLoading(true)
        const res = await apiClient('/api/information/get_comics', {
          method: 'POST',
          body: JSON.stringify({
            region,
            image_type: 'webp',
          }),
        })

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
                className='w-xs'
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
            <div className='flex items-center justify-center flex-col sm:flex-row gap-2'>
              <Pagination
                page={page}
                setPage={setPage}
                maxPages={Math.max(0, Math.ceil(comics.length / range) - 1)}
              />
              <div className='flex items-center justify-center gap-0 rounded-md shadow-xs shadow-shadow-color'>
                <div className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-l-md text-sm font-medium shrink-0 outline-none bg-background h-9 px-4 py-2 border m-0'>
                  {loc('pagination.items_per_page')}
                </div>
                <Select
                  value={`${range}`}
                  onValueChange={(v) => setRange(parseInt(v))}
                >
                  <SelectTrigger className='bg-background border-border focus-visible:border-border border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:outline-0'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-background'>
                    <SelectItem value='3'>3</SelectItem>
                    <SelectItem value='6'>6</SelectItem>
                    <SelectItem value='9'>9</SelectItem>
                    <SelectItem value='12'>12</SelectItem>
                    <SelectItem value='18'>18</SelectItem>
                    <SelectItem value='24'>24</SelectItem>
                    <SelectItem value='30'>30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default ComicViewer
