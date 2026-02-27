import { useIsMobile } from '@/hooks/use-mobile'
import useTranslation from '@/hooks/use-translation'
import { Dispatch, SetStateAction } from 'react'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const Pagination = ({
  page,
  maxPages,
  setPage,
  range,
  setRange,
  itemCountList,
}: {
  page: number
  maxPages: number
  setPage: Dispatch<SetStateAction<number>>
  range: number
  setRange: Dispatch<SetStateAction<number>>
  itemCountList: number[]
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
    <div className='flex items-center justify-center flex-col sm:flex-row gap-2'>
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
      <div className='flex items-center justify-center gap-0 rounded-md shadow-xs shadow-shadow-color'>
        <div className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-l-md text-sm font-medium shrink-0 outline-none bg-background h-9 px-4 py-2 border m-0'>
          {loc('pagination.items_per_page')}
        </div>
        <Select
          value={`${range}`}
          onValueChange={(v) => {
            setPage(0)
            setRange(parseInt(v))
          }}
        >
          <SelectTrigger className='bg-background border-border focus-visible:border-border border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:outline-0'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-background'>
            {itemCountList.map((x, i) => (
              <SelectItem
                value={`${x}`}
                key={i}
              >
                {x}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default Pagination
