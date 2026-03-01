'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/lib/api-client'
import { Check, Edit, Camera, Trash2 } from 'lucide-react'
import Image from 'next/image'
import useTranslation from '@/hooks/use-translation'
import { redirect } from 'next/navigation'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const accountSchema = z.object({
  username: z
    .string()
    .min(4, 'signup.form.min_4')
    .max(19, 'signup.form.max_19')
    .refine((u) => {
      const m = u.match(/[a-z0-9_]+/g)
      return m && m.length === 1 && m[0].length === u.length
    }, 'signup.form.username_validation'),
  display_name: z
    .string()
    .min(2, 'signup.form.min_2')
    .max(29, 'signup.form.max_29'),
  description: z.string().optional(),
})

const Account = () => {
  const { loading, user, deleteAccount, updateAccountDetails, refreshUser } =
    useAuth()
  const { loc } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: user?.username || '',
      display_name: user?.display_name || '',
      description: user?.description || '',
    },
  })

  const [bannerRefresh, setBannerRefresh] = useState(0)
  const [profileRefresh, setProfileRefresh] = useState(0)

  // when user loads or changes, reset form values
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        display_name: user.display_name,
        description: (user as any).description || '',
      })
    }
  }, [user])

  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [message, setMessage] = useState('')

  // upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // for username-change password confirmation
  const [passDialogOpen, setPassDialogOpen] = useState(false)
  const [passInput, setPassInput] = useState('')
  const pendingValues = useRef<Partial<z.infer<typeof accountSchema>> | null>(
    null,
  )

  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    useState(false)
  const [confirmUsernameDelete, setConfirmUsernameDelete] = useState('')

  if (loading) {
    return (
      <Card
        className='p-8'
        variant='main'
      >
        <Spinner className='size-6' />
      </Card>
    )
  }

  if (!user) redirect('/login')

  const handleEditBanner = () => {
    fileInputRef.current?.click()
  }

  const handleEditProfilePicture = () => {
    profileInputRef.current?.click()
  }

  const handleDeleteBanner = async () => {
    setLoadingAction(true)
    try {
      const response = await apiClient('/api/banner_image/delete', {
        method: 'POST',
      })
      if (response.ok) {
        setBannerRefresh(Date.now())
        refreshUser()
      } else {
        console.error('Failed to delete banner image')
      }
    } catch (err) {
      console.error('Error deleting banner image:', err)
    }
    setLoadingAction(false)
  }

  const handleDeleteProfilePicture = async () => {
    setLoadingAction(true)
    try {
      const response = await apiClient('/api/profile_picture/delete', {
        method: 'POST',
      })
      if (response.ok) {
        setProfileRefresh(Date.now())
        refreshUser()
      } else {
        console.error('Failed to delete profile picture')
      }
    } catch (err) {
      console.error('Error deleting profile picture:', err)
    }
    setLoadingAction(false)
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(10)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadProgress(30)
      const response = await apiClient('/api/banner_image/update', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)
      if (response.ok) {
        // update banner key to force refresh, stay in edit mode
        setBannerRefresh(Date.now())
        setUploadProgress(100)
        refreshUser()
      } else {
        console.error('Failed to upload banner image')
      }
      setIsUploading(false)
      setUploadProgress(0)
    } catch (error) {
      console.error('Error uploading banner image:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleProfileFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(10)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadProgress(30)
      const response = await apiClient('/api/profile_picture/update', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)
      if (response.ok) {
        // update profile key to force refresh, stay in edit mode
        setProfileRefresh(Date.now())
        setUploadProgress(100)
        refreshUser()
      } else {
        console.error('Failed to upload profile picture')
      }
      setIsUploading(false)
      setUploadProgress(0)
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const performUpdate = async (
    values: Partial<z.infer<typeof accountSchema>> & { password?: string },
  ) => {
    setLoadingAction(true)
    setMessage('')
    const { success, message } = await updateAccountDetails(values)
    setLoadingAction(false)
    if (success) {
      window.location.reload()
    } else {
      setMessage(`account.update.${message}`)
    }
  }

  const onSubmit = (values: z.infer<typeof accountSchema>) => {
    if (!user) return

    // build object containing only changed values
    const diff: Partial<z.infer<typeof accountSchema>> = {}
    if (values.username && values.username !== user.username) {
      diff.username = values.username
    }
    if (values.display_name && values.display_name !== user.display_name) {
      diff.display_name = values.display_name
    }
    const currentDesc = (user as any).description || ''
    if (
      values.description !== undefined &&
      values.description !== currentDesc
    ) {
      diff.description = values.description
    }

    if (Object.keys(diff).length === 0) {
      // nothing to change
      setIsEditingAccount(false)
      return
    }

    if (diff.username) {
      pendingValues.current = diff
      setPassInput('')
      setPassDialogOpen(true)
    } else {
      performUpdate(diff)
    }
  }

  const handlePasswordConfirm = () => {
    if (!pendingValues.current) return
    performUpdate({ ...pendingValues.current, password: passInput })
    setPassDialogOpen(false)
  }

  return (
    <Card
      className='min-w-md relative group/card'
      variant='main'
    >
      <div className='w-1 h-35' />
      <div className='absolute left-0 right-0 top-0 w-full aspect-10/3 rounded-t-[11px] overflow-hidden bg-accent'>
        <Image
          src={`/api/banner_image/${user.username}?t=${bannerRefresh}`}
          alt=''
          width={1200}
          height={960}
          className='w-full h-full'
          unoptimized
          loading='eager'
        />
        {isEditingAccount && (
          <div className='absolute left-2 top-2 flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='hover:bg-muted cursor-pointer'
              onClick={handleEditBanner}
              disabled={isUploading || loadingAction}
            >
              {loc('account.form.change_banner')}
            </Button>
            {user.banner_hash && (
              <Button
                size='sm'
                variant='destructive'
                className='cursor-pointer'
                onClick={handleDeleteBanner}
                disabled={isUploading || loadingAction}
              >
                {loc('general.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
      <CardHeader className='flex flex-col items-start justify-center gap-4'>
        <div className='absolute left-5 top-25 size-20'>
          <button
            onClick={() =>
              isEditingAccount && !isUploading && handleEditProfilePicture()
            }
            className='group w-full h-full'
            type='button'
            disabled={isUploading}
          >
            <Image
              src={`/api/profile_picture/${user.username}?t=${profileRefresh}`}
              alt=''
              width={80}
              height={80}
              className='rounded-full bg-secondary border-background border-3 w-full h-full'
              unoptimized
              loading='eager'
            />
            {isEditingAccount && (
              <div className='absolute top-0 left-0 cursor-pointer w-full h-full rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <Camera className='size-8 text-white' />
              </div>
            )}
          </button>
          {isEditingAccount && user.profile_hash && (
            <Button
              size='xs'
              variant='destructive'
              className='absolute right-0 top-0 cursor-pointer'
              onClick={handleDeleteProfilePicture}
              disabled={isUploading || loadingAction}
            >
              <Trash2 className='size-4' />
            </Button>
          )}
        </div>
        <div className='flex flex-col items-start justify-center gap-1'>
          {!user.email_verified && (
            <Badge
              className='rounded-sm border-destructive text-destructive'
              variant='outline'
            >
              {loc('account.email_not_verified')}
            </Badge>
          )}
          <CardTitle className='font-header text-lg'>
            {isEditingAccount ? form.watch('display_name') : user.display_name}
          </CardTitle>
          <CardDescription>
            {isEditingAccount ? form.watch('username') : user.username}
          </CardDescription>
        </div>
      </CardHeader>
      <Button
        className='absolute top-2 right-2 cursor-pointer hover:bg-muted transition-all'
        size='sm'
        variant='outline'
        onClick={() => {
          if (isEditingAccount && !isUploading) {
            form.handleSubmit(onSubmit)()
          } else if (!isEditingAccount && !isUploading) {
            setIsEditingAccount(true)
          }
        }}
        disabled={isUploading}
      >
        {isEditingAccount ?
          <>
            {loc('account.form.done')} <Check />
          </>
        : <>
            {loc('account.form.edit')} <Edit />
          </>
        }
      </Button>
      <CardContent>
        {user.description && (
          <p className='text-sm text-muted-foreground not-last:mb-8'>
            {user.description}
          </p>
        )}
        {isEditingAccount && (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='display_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='uppercase text-muted-foreground text-xs'>
                        {loc('account.form.display_name')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage processor={loc as (s: string) => string} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='uppercase text-muted-foreground text-xs'>
                        {loc('account.form.username')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toLowerCase())
                          }
                          maxLength={19}
                        />
                      </FormControl>
                      <FormMessage processor={loc as (s: string) => string} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='uppercase text-muted-foreground text-xs'>
                        {loc('account.form.description')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage processor={loc as (s: string) => string} />
                    </FormItem>
                  )}
                />
                {message && (
                  <p className='w-full text-center text-sm text-destructive mb-2'>
                    {loc(message as any)}
                  </p>
                )}
              </form>
            </Form>
            <h2 className='w-full text-center uppercase text-muted-foreground text-sm my-2'>
              {loc('account.more_options.title')}
            </h2>
            <div className='flex items-start justify-center flex-col gap-2'>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setIsDeleteAccountDialogOpen(true)}
              >
                {loc('account.more_options.delete_account')}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* password confirmation dialog when username changed */}
      <Dialog
        open={passDialogOpen}
        onOpenChange={setPassDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{loc('signup.form.confirm_password')}</DialogTitle>
            <DialogDescription>
              {loc('account.form.confirm_password_description')}
            </DialogDescription>
          </DialogHeader>
          <input
            type='password'
            className='w-full rounded border px-3 py-2'
            placeholder='Password'
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
          />
          <DialogFooter>
            <Button
              asChild
              variant='outline'
            >
              <DialogClose>{loc('general.cancel')}</DialogClose>
            </Button>
            <Button
              variant='default'
              disabled={passInput.length === 0}
              onClick={handlePasswordConfirm}
            >
              {loc('general.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />
      <input
        ref={profileInputRef}
        type='file'
        accept='image/*'
        onChange={handleProfileFileChange}
        className='hidden'
      />

      {loadingAction && (
        <div className='absolute top-0 left-0 bottom-0 right-0 bg-background/50 flex items-center justify-center'>
          <Spinner className='size-15' />
        </div>
      )}

      {/* delete account confirmation dialog */}
      <Dialog
        open={isEditingAccount && isDeleteAccountDialogOpen}
        onOpenChange={setIsDeleteAccountDialogOpen}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {loc('account.more_options.delete_account')}
            </DialogTitle>
            <DialogDescription>
              {loc('account.more_options.delete_account_description', {
                username: {
                  value: user?.username,
                  component: ({ children }) => <strong>{children}</strong>,
                },
              })}
            </DialogDescription>
          </DialogHeader>
          <input
            className='w-full rounded border px-3 py-2'
            placeholder='Username'
            value={confirmUsernameDelete}
            onChange={(e) => setConfirmUsernameDelete(e.target.value)}
          />
          <DialogFooter>
            <Button
              asChild
              variant='outline'
            >
              <DialogClose>{loc('general.cancel')}</DialogClose>
            </Button>
            <Button
              variant='destructive'
              disabled={confirmUsernameDelete !== user?.username}
              onClick={async () => {
                await deleteAccount()
                // redirect to home after deletion
                window.location.href = '/'
              }}
            >
              {loc('account.more_options.delete_account')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* upload progress dialog */}
      <Dialog
        open={isUploading}
        onOpenChange={() => {
          // prevent manual closing
        }}
      >
        <DialogContent
          showCloseButton={false}
          className='w-full max-w-sm'
        >
          <DialogHeader>
            <DialogTitle>{loc('account.form.uploading_image')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Progress
              value={uploadProgress}
              className='w-full'
            />
            <p className='text-center text-sm text-muted-foreground'>
              {uploadProgress}%
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default Account
