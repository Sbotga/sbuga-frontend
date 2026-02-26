'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'
import useTranslation from '@/hooks/use-translation'
import { Spinner } from '@/components/ui/spinner'

const loginSchema = z.object({
  username: z.string().min(1, 'login.form.required'),
  password: z.string().min(1, 'login.form.required'),
  turnstile_response: z.string().min(1, 'login.form.complete_captcha'),
})

const LoginPage = () => {
  const { loc } = useTranslation()

  const { user, login, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [captchaKey, setCaptchaKey] = useState<string>(() =>
    Date.now().toString(),
  )

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      turnstile_response: '',
    },
  })

  useEffect(() => {
    if (authLoading) return
    if (user) redirect('/')
  }, [authLoading, user])

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    // handle login auth
    // console.log(values)
    // const res = await apiClient('/api/auth/login', {
    //   body: JSON.stringify({
    //     username: values.username,
    //     password: values.password,
    //     turnstile_response: values.turnstile_response,
    //   }),
    //   method: 'POST',
    // })
    // console.log(await res.json())
    // reset captcha token in form and remount Turnstile

    setLoading(true)
    setMessage('')
    const { success, message } = await login({
      username: values.username,
      password: values.password,
      turnstile_response: values.turnstile_response,
    })
    if (success) {
      return redirect('/')
    }
    setLoading(false)
    setMessage(`login.messages.${message}`)

    form.setValue('turnstile_response', '')
    setCaptchaKey(Date.now().toString())
    // ...
  }

  return (
    <Card
      className='sm:min-w-md mx-2 relative overflow-hidden'
      variant='main'
    >
      <CardHeader>
        <CardTitle className='font-header text-xl'>
          {loc('login.log_in')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    {loc('login.form.username')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Sbuga_123'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage processor={loc as (s: string) => string} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    {loc('login.form.password')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='••••••••'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage processor={loc as (s: string) => string} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='turnstile_response'
              render={() => (
                <FormItem>
                  <FormControl>
                    {/* <FormItem>
                      <FormControl>
                        <Input
                          placeholder='1x00000000000000000000AA'
                          {...field}
                          value='1x00000000000000000000AA'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem> */}
                    <Turnstile
                      key={captchaKey}
                      // 1x00000000000000000000AA
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
                      onSuccess={(token) =>
                        form.setValue('turnstile_response', token)
                      }
                      onExpire={() => form.setValue('turnstile_response', '')}
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
            <Button
              type='submit'
              className='w-full'
            >
              {loc('login.log_in')}
            </Button>
          </form>
        </Form>
        <div className='w-full max-w-sm my-6'>
          <div className='relative flex items-center gap-2'>
            <Separator className='flex-1' />
            <span className='shrink-0 px-2 text-muted-foreground text-xs'>
              {loc('login.no_account')}
            </span>
            <Separator className='flex-1' />
          </div>
        </div>
        <Button
          asChild
          variant='secondary'
          className='w-full'
        >
          <Link href='/signup'>{loc('signup.sign_up')}</Link>
        </Button>
      </CardContent>
      {loading && (
        <div className='absolute top-0 left-0 bottom-0 right-0 bg-background/50 flex items-center justify-center'>
          <Spinner className='size-15' />
        </div>
      )}
    </Card>
  )
}

export default LoginPage
