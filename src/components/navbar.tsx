'use client'

import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu'
import { Button } from './ui/button'
import { Menu, Moon, Settings, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Options, useOptions } from '@/context/OptionsContext'
import { Fragment, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Separator } from './ui/separator'
import Image from 'next/image'

const tools = [
  {
    name: 'Why Inappropriate',
    description: 'Why is this text inappropriate?',
    url: '/tools/why_inappropriate',
  },
]

const OptionsMenu = ({
  options,
  setOptions,
}: {
  options: Options
  setOptions: (u: (p: Options) => Options | Options) => void
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
        >
          <Settings className='size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-fit z-125'
        align='center'
      >
        <div className='flex items-center justify-center flex-col w-full'>
          <div className='w-full flex items-center justify-between gap-2 min-w-40'>
            <Label htmlFor='sbuga_effects'>Background Effects</Label>
            <Checkbox
              checked={options.sbuga_effects}
              onCheckedChange={(v) =>
                setOptions((p) => ({ ...p, sbuga_effects: v as boolean }))
              }
              id='sbuga_effects'
              className='border-border'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const [options, setOptions] = useOptions()

  const [menuOpened, setMenuOpened] = useState(false)

  return (
    <>
      <div className='w-full p-2 flex items-center justify-between border-b border-border px-4 relative z-105'>
        <Link
          href='/'
          className='flex gap-3 items-center justify-center px-2'
        >
          <Image
            src='/sbuga.webp'
            width={100}
            height={100}
            alt='Sbuga'
            className='size-7.5'
          />
          <h2 className='font-bold font-header'>Sbuga!</h2>
        </Link>
        <div className='sm:flex items-center justify-center hidden'>
          <NavigationMenu className='w-auto'>
            <NavigationMenuList>
              {/* <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href='/a'>A</Link>
              </NavigationMenuLink>
            </NavigationMenuItem> */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid w-[400px] gap-2'>
                    {tools.map((tool, i) => (
                      <ListItem
                        key={i}
                        title={tool.name}
                        href={tool.url}
                      >
                        {tool.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className='sm:flex items-center justify-center gap-1 hidden'>
          <OptionsMenu
            options={options}
            setOptions={setOptions}
          />
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark')
            }}
          >
            <Sun className='size-4 dark:opacity-0 translate-x-3/4 rotate-90 dark:rotate-0 transition-all' />
            <Moon className='size-4 dark:opacity-100 opacity-0 -translate-x-3/4 dark:-rotate-90 rotate-0 transition-all' />
          </Button>
          <Button
            variant='ghost'
            asChild
          >
            <Link href='/login'>Log In</Link>
          </Button>
        </div>
        <div className='flex sm:hidden'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setMenuOpened((p) => !p)}
          >
            <Menu className='size-4' />
          </Button>
        </div>
        <div
          className={twMerge(
            'absolute top-full left-0 right-0 w-full flex items-center justify-center flex-col gap-3 p-3 bg-background border-t border-b border-border overflow-hidden',
            !menuOpened && 'hidden',
          )}
        >
          <div className='flex w-full items-center justify-center'>
            <h1 className='font-bold w-full text-center uppercase'>Tools</h1>
          </div>
          <div className='flex flex-col gap-1 items-center justify-center w-full'>
            {tools.map((t, i) => (
              <Fragment key={i}>
                <Link
                  href={t.url}
                  onClick={() => setMenuOpened(false)}
                  className='w-full p-2 hover:bg-accent rounded'
                >
                  <h2 className='font-semibold'>{t.name}</h2>
                  <p className='text-sm text-muted-foreground'>
                    {t.description}
                  </p>
                </Link>
                {i !== tools.length - 1 && <Separator />}
              </Fragment>
            ))}
          </div>
          <Separator />
          <div className='flex items-center justify-between w-full'>
            <Button
              variant='ghost'
              asChild
            >
              <Link
                href='/login'
                onClick={() => setMenuOpened(false)}
              >
                Log In
              </Link>
            </Button>
            <div className='flex gap-1 items-center justify-center'>
              <OptionsMenu
                options={options}
                setOptions={setOptions}
              />
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                }}
              >
                <Sun className='size-4 dark:opacity-0 translate-x-3/4 rotate-90 dark:rotate-0 transition-all' />
                <Moon className='size-4 dark:opacity-100 opacity-0 -translate-x-3/4 dark:-rotate-90 rotate-0 transition-all' />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {menuOpened && (
        <div
          className='h-screen w-screen left-0 absolute z-90'
          onClick={() => setMenuOpened(false)}
        />
      )}
    </>
  )
}

const ListItem = ({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) => {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className='flex flex-col gap-1 text-sm'>
            <div className='leading-none font-medium'>{title}</div>
            <div className='text-muted-foreground line-clamp-2'>{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default Navbar
