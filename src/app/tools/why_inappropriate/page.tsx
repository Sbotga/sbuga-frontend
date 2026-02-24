'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { regions } from '@/lib/consts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const formSchema = z.object({
  text: z.string(),
  region: z.string().refine((s) => regions.includes(s)),
})

const WhyInappropriatePage = () => {
  const [loading, setLoading] = useState(false)
  const [indexes, setIndexes] = useState<
    {
      start: number
      end: number
    }[]
  >([])
  const [baseText, setBaseText] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    setBaseText('')

    try {
      const req = await fetch('/api/tools/why_inappropriate', {
        body: JSON.stringify(values),
        method: 'POST',
      })

      const json = await req.json()
      setIndexes(json.indexes)
      setBaseText(values.text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='sm:min-w-md'>
      <CardHeader>
        <CardTitle className='font-header text-lg'>Why Inappropriate</CardTitle>
        <CardDescription>Why is this text inappropriate?</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='text'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    Insert text
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='abc123...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='region'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    Region
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={(newVal) =>
                        form.setValue('region', newVal)
                      }
                    >
                      <SelectTrigger className='border-border'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en'>EN</SelectItem>
                        <SelectItem value='jp'>JP</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
            >
              Check
            </Button>
          </form>
        </Form>
        {(loading || baseText.length > 0) && <Separator />}
        {loading && (
          <div className='w-full flex items-center justify-center p-2'>
            <Spinner />
          </div>
        )}
        {!loading && baseText.length > 0 && (
          <>
            <div>
              <p>
                {indexes.map(({ start, end }, i) => (
                  <Fragment key={i}>
                    {baseText.substring(indexes[i - 1]?.end || 0, start)}
                    <span className='bg-destructive text-destructive-foreground'>
                      {baseText.substring(start, end)}
                    </span>
                  </Fragment>
                ))}
                {baseText.substring(
                  indexes[indexes.length - 1]?.end || indexes.length - 1,
                )}
              </p>
            </div>
            {indexes.length === 0 && (
              <p className='w-full text-center uppercase text-green-700 dark:text-green-300 text-sm'>
                ALL GOOD!
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default WhyInappropriatePage
