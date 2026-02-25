import { regions } from '@/lib/consts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Select as SelectPrimitive } from 'radix-ui'
import { twMerge } from 'tailwind-merge'

const RegionSelect = ({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
  className?: string
  size?: 'sm' | 'default'
}) => {
  return (
    <Select {...{ ...props, className: undefined }}>
      <SelectTrigger
        className={twMerge('border-border', props.className)}
        size={props.size ?? 'default'}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {regions.map((r, i) => (
          <SelectItem
            key={i}
            value={r}
          >
            {r.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default RegionSelect
