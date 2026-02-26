import Link from 'next/link'
import { Button } from './ui/button'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { LogOutIcon } from 'lucide-react'
import { ButtonGroup } from './ui/button-group'
import useTranslation from '@/hooks/use-translation'

const AccountButton = ({
  onClick,
}: {
  onClick?: React.ComponentProps<'button'>['onClick']
}) => {
  const { user, loading, logout } = useAuth()
  const { loc } = useTranslation()

  return (
    <div className='flex items-center justify-center'>
      <ButtonGroup>
        <Button
          variant='outline'
          asChild
          onClick={onClick}
        >
          {loading ?
            <div>{loc('general.loading')}</div>
          : user === null ?
            <Link href='/login'>{loc('login.log_in')}</Link>
          : <Link
              href='/'
              className='flex gap-2 items-center justify-center max-w-md wrap-break-word pl-3'
            >
              <Image
                src={`/api/profile_picture/${user.username}`}
                alt=''
                width={20}
                height={20}
                className='rounded-full bg-secondary'
              />
              {user.display_name}
            </Link>
          }
        </Button>
        {!loading && user && (
          <Button
            variant='outline'
            size='icon'
            className='cursor-pointer'
            onClick={(e) => {
              logout()
              if (onClick) onClick(e)
            }}
          >
            <LogOutIcon />
          </Button>
        )}
      </ButtonGroup>
    </div>
  )
}

export default AccountButton
