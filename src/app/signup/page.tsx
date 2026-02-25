'use client'

import { useState } from 'react'
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
import { apiClient } from '@/lib/api-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const signupSchema = z
  .object({
    username: z.string().min(3, 'Must be at least 3 charcters'),
    display_name: z.string(),
    password: z.string().min(8, 'Must be at least 8 characters'),
    confirm_password: z.string(),
    turnstile_response: z.string().min(1, 'Please complete the captcha.'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password'],
  })

const SignupPage = () => {
  const [captchaKey, setCaptchaKey] = useState<string>(() =>
    Date.now().toString(),
  )

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

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    // handle login auth
    // console.log(values)
    const res = await apiClient('/api/auth/signup', {
      body: JSON.stringify({
        username: values.username,
        display_name: values.display_name,
        password: values.password,
        turnstile_response: values.turnstile_response,
      }),
      method: 'POST',
    })
    console.log(await res.json())
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
        <CardTitle className='font-header text-xl'>Sign Up</CardTitle>
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
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='sbuga123'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='display_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    Display Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Sbuga_123'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='••••••••'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirm_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='••••••••'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
            >
              Sign Up
            </Button>
          </form>
        </Form>
        <div className='w-full max-w-sm my-6'>
          <div className='relative flex items-center gap-2'>
            <Separator className='flex-1' />
            <span className='shrink-0 px-2 text-muted-foreground text-xs'>
              Already an account?
            </span>
            <Separator className='flex-1' />
          </div>
        </div>
        <Button
          asChild
          variant='secondary'
          className='w-full'
        >
          <Link href='/login'>Log In</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default SignupPage
