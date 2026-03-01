import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        'outline-easy':
          'border-lime-500 text-lime-800 bg-lime-200 dark:text-lime-200 dark:bg-lime-800',
        'outline-normal':
          'border-cyan-500 text-cyan-800 bg-cyan-200 dark:text-cyan-200 dark:bg-cyan-800',
        'outline-hard':
          'border-amber-500 text-amber-800 bg-amber-200 dark:text-amber-200 dark:bg-amber-800',
        'outline-expert':
          'border-rose-500 text-rose-800 bg-rose-200 dark:text-rose-200 dark:bg-rose-800',
        'outline-master':
          'border-purple-500 text-purple-800 bg-purple-200 dark:text-purple-200 dark:bg-purple-800',
        'outline-append':
          'border-none text-indigo-800 bg-linear-135 from-indigo-200 to-fuchsia-200 dark:text-indigo-200 dark:from-indigo-800 dark:to-fuchsia-800',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return variant === 'outline-append' ?
      <div className='p-px rounded-md bg-linear-135 from-indigo-500 to-fuchsia-500  flex items-center justify-center'>
        <Comp
          data-slot='badge'
          data-variant={variant}
          className={cn(
            badgeVariants({ variant }),
            className,
            'm-0 rounded-[5px] h-full',
          )}
          {...props}
        >
          <span className='bg-linear-135 from-indigo-700 to-fuchsia-700 dark:from-indigo-200 dark:to-fuchsia-200 text-transparent bg-clip-text'>
            {props.children}
          </span>
        </Comp>
      </div>
    : <Comp
        data-slot='badge'
        data-variant={variant}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
}

export { Badge, badgeVariants }
