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
import { Menu, Moon, Sun, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Label } from './ui/label'
import { Options, useOptions } from '@/context/OptionsContext'
import { Fragment, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
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
import { Permission, useAuth } from '@/context/AuthContext'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'

const navigation = {
  information: [
    'comic_viewer',
    //'stamp_viewer',
    'ranked_leaderboard',
  ],
  tools: ['why_inappropriate', 'chart_search'],
} as const

const management_navigation: Record<
  string,
  { permission: Permission; links: string[] }
> = {
  alias: {
    permission: 'manage_aliases',
    links: [
      'music',
      // 'event',
    ],
  },
}

type Navigation = typeof navigation
type NavKey = keyof Navigation

type LocFn = ReturnType<typeof useTranslation>['loc']
type LocKey = Parameters<LocFn>[0]

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

  const { loading, permissions } = useAuth()

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
                {(Object.keys(navigation) as NavKey[]).map((k) =>
                  renderNavGroup(k),
                )}
                {/* managemt navigation links */}
                {Object.entries(management_navigation)
                  .filter(
                    ([_, v]) => !loading && permissions.includes(v.permission),
                  )
                  .map(([k, v]) => renderManagementNavGroup(k, v))}
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
              'absolute top-full left-0 right-0 w-full bg-background border-t border-b flex items-center justify-center flex-col gap-3 p-3 border-border overflow-hidden',
              !mobileMenuOpened && 'hidden',
            )}
          >
            <Accordion
              defaultValue={[]}
              type='multiple'
              className='w-full flex items-center justify-center flex-col gap-3'
            >
              {(Object.keys(navigation) as NavKey[]).map((k, k_i) => (
                <Fragment key={k}>
                  <AccordionItem
                    value={k}
                    className='w-full'
                  >
                    <AccordionTrigger>
                      <div className='flex w-full items-center justify-center'>
                        <h2 className='uppercase text-muted-foreground text-xs'>
                          {loc(`${k}.title`)}
                        </h2>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='flex flex-col gap-1 items-center justify-center w-full'>
                        {navigation[k].map((page, i) => (
                          <Fragment key={i}>
                            <Link
                              href={`/${k}/${page}`}
                              onClick={() => setMobileMenuOpened(false)}
                              className='w-full p-2 hover:bg-accent rounded'
                            >
                              <h2 className='font-semibold'>
                                {loc(`${k}.${page}.title` as any)}
                              </h2>
                              <p className='text-sm text-muted-foreground'>
                                {loc(`${k}.${page}.description` as any)}
                              </p>
                            </Link>
                          </Fragment>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Fragment>
              ))}
              {Object.entries(management_navigation)
                .filter(
                  ([_, v]) => !loading && permissions.includes(v.permission),
                )
                .map(([k, { links }]) => (
                  <Fragment key={k}>
                    <AccordionItem
                      value={k}
                      className='w-full'
                    >
                      <AccordionTrigger>
                        <div className='flex w-full items-center justify-center'>
                          <h2 className='uppercase text-muted-foreground text-xs'>
                            {loc(`manage.${k}.title` as any)}
                          </h2>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className='flex flex-col gap-1 items-center justify-center w-full'>
                          {links.map((page, i) => (
                            <Fragment key={i}>
                              <Link
                                href={`/manage/${k}/${page}`}
                                onClick={() => setMobileMenuOpened(false)}
                                className='w-full p-2 hover:bg-accent rounded'
                              >
                                <h2 className='font-semibold'>
                                  {loc(`manage.${k}.${page}.title` as any)}
                                </h2>
                                <p className='text-sm text-muted-foreground'>
                                  {loc(
                                    `manage.${k}.${page}.description` as any,
                                  )}
                                </p>
                              </Link>
                            </Fragment>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Fragment>
                ))}
            </Accordion>
            <Separator className='-mt-3' />
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
          className='h-screen w-screen left-0 absolute z-19'
          onClick={() => setMobileMenuOpened(false)}
        />
      )}
    </>
  )
}

function renderNavGroup<K extends NavKey>(k: K) {
  const { loc } = useTranslation()
  return (
    <NavigationMenuItem key={k as string}>
      <NavigationMenuTrigger triggerMode='click'>
        {loc(`${k}.title` as LocKey)}
      </NavigationMenuTrigger>
      <NavigationMenuContent triggerMode='click'>
        <ul className='grid w-[400px] gap-2'>
          {navigation[k].map((page) => (
            <ListItem
              key={String(page)}
              itemTitle={loc(`${k}.${page}.title` as LocKey)}
              href={`/${k}/${page}`}
            >
              {loc(`${k}.${page}.description` as LocKey)}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

function renderManagementNavGroup(
  k: string,
  { links }: { permission: Permission; links: string[] },
) {
  const { loc } = useTranslation()
  return (
    <NavigationMenuItem key={k}>
      <NavigationMenuTrigger triggerMode='click'>
        {loc(`manage.${k}.title` as LocKey)}
      </NavigationMenuTrigger>
      <NavigationMenuContent triggerMode='click'>
        <ul className='grid w-[400px] gap-2'>
          {links.map((page) => (
            <ListItem
              key={page}
              itemTitle={loc(`manage.${k}.${page}.title` as LocKey)}
              href={`/manage/${k}/${page}`}
            >
              {loc(`manage.${k}.${page}.description` as LocKey)}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

const ListItem = ({
  itemTitle,
  children,
  href,
  ...props
}: ComponentPropsWithoutRef<'li'> & { href: string; itemTitle: ReactNode }) => {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className='flex flex-col gap-1 text-sm'>
            <div className='leading-none font-medium'>{itemTitle}</div>
            <div className='text-muted-foreground line-clamp-2'>{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default Navbar
