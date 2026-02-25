import Link from 'next/link'
import { Button } from './ui/button'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { LogOutIcon } from 'lucide-react'

const AccountButton = ({
  onClick,
}: {
  onClick?: React.ComponentProps<'button'>['onClick']
}) => {
  const { user, loading, logout } = useAuth()

  return (
    <div className='flex items-center justify-center'>
      <Button
        variant='ghost'
        asChild
        onClick={onClick}
      >
        {loading ?
          <div>Loading...</div>
        : user === null ?
          <Link href='/login'>Log In</Link>
        : <Link
            href='/'
            className='flex gap-2 items-center justify-center max-w-md wrap-break-word pl-2'
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
          variant='ghost'
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
    </div>
  )
}

export default AccountButton
