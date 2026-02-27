'use client'

import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './ui/navigation-menu'
import { Button } from './ui/button'
import { Menu, Moon, Sun, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Label } from './ui/label'
import { Options, useOptions } from '@/context/OptionsContext'
import { Fragment, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Separator } from './ui/separator'
import Image from 'next/image'
import AccountButton from './account-button'
import RegionSelect from './region-select'
import { region } from '@/lib/consts'
import { Switch } from './ui/switch'
import useTranslation from '@/hooks/use-translation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useAuth } from '@/context/AuthContext'

const tools = ['why_inappropriate'] as const
const information = ['comic_viewer'] as const

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
}) => {
  const { user, loading } = useAuth()
  const { loc } = useTranslation()
  return (
    <div className='flex flex-col items-center justify-center w-full h-full gap-2 isolate'>
      <h2 className='uppercase text-muted-foreground text-xs'>
        {loc('components.navbar.options_header')}
      </h2>
      <div className='flex flex-col gap-3 px-4 py-2 w-full'>
        <div className='w-full flex items-center justify-between gap-2'>
          <Label htmlFor='sbuga_effects'>
            {loc('components.navbar.options.bg_effects')}
          </Label>
          <Switch
            checked={options.sbuga_effects}
            onCheckedChange={(v) =>
              setOptions((p) => ({ ...p, sbuga_effects: v as boolean }))
            }
            id='sbuga_effects'
            className='border-border'
          />
        </div>
        <div className='w-full flex items-center justify-between gap-2'>
          <Label>{loc('components.navbar.options.default_region')}</Label>
          <RegionSelect
            size='sm'
            value={options.default_region}
            onValueChange={(newVal) => {
              setOptions((p) => ({ ...p, default_region: newVal as region }))
            }}
          />
        </div>
        <div className='w-full flex items-center justify-between gap-2'>
          <Label>{loc('components.navbar.options.language')}</Label>
          <Select
            value={options.locale}
            onValueChange={(newVal) => {
              setOptions((p) => ({ ...p, locale: newVal as Options['locale'] }))
            }}
          >
            <SelectTrigger
              className='border-border'
              size='sm'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='en'>{loc('languages.en')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-full flex items-center justify-between gap-2'>
          <Label>{loc('components.navbar.options.theme')}</Label>
          <Button
            variant='outline'
            className='cursor-pointer'
            size='icon-sm'
            onClick={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark')
            }}
          >
            <Sun className='size-3.5 dark:opacity-0 translate-x-3/4 rotate-90 dark:rotate-0 transition-all' />
            <Moon className='size-3.5 dark:opacity-100 opacity-0 -translate-x-3/4 dark:-rotate-90 rotate-0 transition-all' />
          </Button>
        </div>
      </div>

      <Separator />

      <div className='flex items-center justify-between w-full'>
        <span />
        <AccountButton
          onClick={() => {
            if (!user && !loading) setMenuOpened(false)
          }}
        />
      </div>
    </div>
  )
}

const Navbar = () => {
  const { loc } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [options, setOptions] = useOptions()

  const [menuOpened, setMenuOpened] = useState(false)
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false)

  return (
    <>
      <div className='sticky top-0 w-full z-20'>
        <div className='w-full h-full relative p-2 grid sm:grid-cols-[1fr_auto_1fr] grid-cols-2 items-center border-b border-border px-4 bg-background'>
          <Link
            href='/'
            className='flex gap-3 items-center justify-center px-2 max-w-fit'
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
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    {loc('tools.title')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className='grid w-[400px] gap-2'>
                      {tools.map((page, i) => (
                        <ListItem
                          key={i}
                          title={loc(`tools.${page}.title`)}
                          href={`/tools/${page}`}
                        >
                          {loc(`tools.${page}.description`)}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    {loc('information.title')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className='grid w-[400px] gap-2'>
                      {information.map((page, i) => (
                        <ListItem
                          key={i}
                          title={loc(`information.${page}.title`)}
                          href={`/information/${page}`}
                        >
                          {loc(`information.${page}.description`)}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className='sm:flex items-center justify-center gap-1 hidden max-w-fit justify-self-end'>
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
          <div className='flex sm:hidden justify-self-end'>
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
              <h2 className='uppercase text-muted-foreground text-xs'>
                {loc('tools.title')}
              </h2>
            </div>
            <div className='flex flex-col gap-1 items-center justify-center w-full'>
              {tools.map((page, i) => (
                <Fragment key={i}>
                  <Link
                    href={`/tools/${page}`}
                    onClick={() => setMobileMenuOpened(false)}
                    className='w-full p-2 hover:bg-accent rounded'
                  >
                    <h2 className='font-semibold'>
                      {loc(`tools.${page}.title`)}
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                      {loc(`tools.${page}.description`)}
                    </p>
                  </Link>
                  {i !== tools.length - 1 && <Separator />}
                </Fragment>
              ))}
            </div>
            <Separator />
            <div className='flex w-full items-center justify-center'>
              <h2 className='uppercase text-muted-foreground text-xs'>
                {loc('information.title')}
              </h2>
            </div>
            <div className='flex flex-col gap-1 items-center justify-center w-full'>
              {information.map((page, i) => (
                <Fragment key={i}>
                  <Link
                    href={`/information/${page}`}
                    onClick={() => setMobileMenuOpened(false)}
                    className='w-full p-2 hover:bg-accent rounded'
                  >
                    <h2 className='font-semibold'>
                      {loc(`information.${page}.title`)}
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                      {loc(`information.${page}.description`)}
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
