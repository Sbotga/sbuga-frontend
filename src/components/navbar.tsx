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
import { Menu, Moon, Settings, Sun, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Options, useOptions } from '@/context/OptionsContext'
import { Fragment, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Separator } from './ui/separator'
import Image from 'next/image'
import AccountButton from './account-button'
import { Select } from './ui/select'
import RegionSelect from './region-select'
import { region } from '@/lib/consts'

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
  theme,
  setTheme,
  setMenuOpened,
}: {
  options: Options
  setOptions: (u: (p: Options) => Options | Options) => void
  theme: string
  setTheme: (theme: string) => void
  setMenuOpened: (o: boolean) => void
}) => (
  <div className='flex flex-col items-center justify-center w-full h-full gap-2 isolate'>
    <h2 className='uppercase text-muted-foreground text-xs'>Options</h2>
    <div className='flex flex-col gap-3 px-4 py-2 w-full'>
      <div className='w-full flex items-center justify-between gap-2'>
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
      <div className='w-full flex items-center justify-between gap-2'>
        <Label>Default Region</Label>
        <RegionSelect
          size='sm'
          value={options.default_region}
          onValueChange={(newVal) => {
            setOptions((p) => ({ ...p, default_region: newVal as region }))
          }}
        />
      </div>
    </div>

    <Separator />

    <div className='flex items-center justify-between w-full'>
      <AccountButton
        onClick={() => {
          setMenuOpened(false)
        }}
      />
      <Button
        variant='ghost'
        className='cursor-pointer'
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
)

const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const [options, setOptions] = useOptions()

  const [menuOpened, setMenuOpened] = useState(false)
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false)

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
          {/* <OptionsMenuOld
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
          </Button> */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setMenuOpened((p) => !p)}
          >
            {menuOpened ?
              <XIcon className='size-4' />
            : <Menu className='size-4' />}
          </Button>
        </div>
        {menuOpened && (
          <div className='hiddem sm:flex absolute top-full min-w-xs p-3 bg-background right-0 m-3 border border-border rounded z-200'>
            <OptionsMenu
              options={options}
              setOptions={setOptions}
              theme={theme || 'system'}
              setTheme={setTheme}
              setMenuOpened={setMenuOpened}
            />
          </div>
        )}
        <div className='flex sm:hidden'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setMobileMenuOpened((p) => !p)}
          >
            <Menu className='size-4' />
          </Button>
        </div>
        <div
          className={twMerge(
            'absolute top-full left-0 right-0 w-full flex items-center justify-center flex-col gap-3 p-3 bg-background border-t border-b border-border overflow-hidden',
            !mobileMenuOpened && 'hidden',
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
                  onClick={() => setMobileMenuOpened(false)}
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
          <OptionsMenu
            options={options}
            setOptions={setOptions}
            theme={theme || 'system'}
            setTheme={setTheme}
            setMenuOpened={setMobileMenuOpened}
          />
        </div>
      </div>
      {mobileMenuOpened && (
        <div
          className='h-screen w-screen left-0 absolute z-90'
          onClick={() => setMobileMenuOpened(false)}
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
