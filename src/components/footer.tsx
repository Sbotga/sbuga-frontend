'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import Image from 'next/image'
import { Dot } from 'lucide-react'
import React from 'react'
import useTranslation from '@/hooks/use-translation'

const links = [
  {
    icon: () => (
      <Image
        src='/discord-icon.png'
        alt='Discord'
        width={30}
        height={30}
        className='dark:invert size-5'
      />
    ),
    name: 'discord',
    href: 'https://discord.gg/Cdjs8c3SRy',
  },
  {
    icon: () => (
      <Image
        src='/github-icon.png'
        alt='Discord'
        width={30}
        height={30}
        className='dark:invert size-5'
      />
    ),
    name: 'github',
    href: 'https://github.com/Sbotga/',
  },
] as const

const Footer = () => {
  const { loc } = useTranslation()

  return (
    <div className='w-full p-4 flex items-center justify-center border-t border-border'>
      {links.map((l, i) => (
        <React.Fragment key={i}>
          <Button
            asChild
            variant='link'
            className='text-muted-foreground'
          >
            <Link href={l.href}>
              <l.icon />
              {loc(`components.footer.${l.name}`)}
            </Link>
          </Button>
          {i !== links.length - 1 && <Dot className='text-foreground' />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default Footer
