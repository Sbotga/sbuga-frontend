'use client'

import { useEffect, useState } from 'react'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useTranslation from '@/hooks/use-translation'
import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, 'signup.form.min_3')
      .refine((u) => {
        const m = u.match(/[a-z0-9_]+/g)
        return m && m.length === 1 && m[0].length === u.length
      }, 'signup.form.username_validation'),
    display_name: z.string(),
    password: z
      .string()
      .min(8, 'signup.form.min_8')
      .max(50, 'signup.form.max_50')
      .refine((p) => p.match(/[A-Z]/), 'signup.form.upper')
      .refine((p) => p.match(/[a-z]/), 'signup.form.lower')
      .refine((p) => p.match(/[0-9]/), 'signup.form.num')
      .refine(
        (p) => p.match(/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?`~]/),
        'signup.form.symbol',
      ),
    confirm_password: z.string(),
    turnstile_response: z.string().min(1, 'login.form.captcha'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'signup.form.password_match',
    path: ['confirm_password'],
  })

const SignupPage = () => {
  const { signup, loading: authLoading, user } = useAuth()
  const { loc } = useTranslation()
  const [captchaKey, setCaptchaKey] = useState<string>(() =>
    Date.now().toString(),
  )

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      display_name: '',
      password: '',
      confirm_password: '',
      turnstile_response: '',
    },
  })

  useEffect(() => {
    if (authLoading) return
    if (user) redirect('/')
  }, [authLoading, user])

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    // handle login auth
    // console.log(values)
    // const res = await apiClient('/api/auth/signup', {
    //   body: JSON.stringify({
    //     username: values.username,
    //     display_name: values.display_name,
    //     password: values.password,
    //     turnstile_response: values.turnstile_response,
    //   }),
    //   method: 'POST',
    // })
    // console.log(await res.json())
    setLoading(true)
    setMessage('')
    const { success, message } = await signup({
      username: values.username,
      display_name: values.display_name,
      password: values.password,
      turnstile_response: values.turnstile_response,
    })
    if (success) {
      return redirect('/')
    }
    setLoading(false)
    setMessage(`signup.messages.${message}`)
    // reset captcha token in form and remount Turnstile
    form.setValue('turnstile_response', '')
    setCaptchaKey(Date.now().toString())
    // ...
  }

  return (
    <Card
      className='sm:min-w-md mx-2'
      variant='main'
    >
      <CardHeader>
        <CardTitle className='font-header text-xl'>
          {loc('signup.sign_up')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
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
                      placeholder='sbuga123'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage processor={loc as (s: string) => string} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='display_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    {loc('signup.form.display_name')}
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
              name='confirm_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    {loc('signup.form.confirm_password')}
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
                    {/* <Input
                      placeholder='1x00000000000000000000AA'
                      {...field}
                      value='1x00000000000000000000AA'
                    /> */}
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
              {loc('signup.sign_up')}
            </Button>
          </form>
        </Form>
        <div className='w-full max-w-sm my-6'>
          <div className='relative flex items-center gap-2'>
            <Separator className='flex-1' />
            <span className='shrink-0 px-2 text-muted-foreground text-xs'>
              {loc('signup.have_account')}
            </span>
            <Separator className='flex-1' />
          </div>
        </div>
        <Button
          asChild
          variant='secondary'
          className='w-full'
        >
          <Link href='/login'>{loc('login.log_in')}</Link>
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

export default SignupPage
