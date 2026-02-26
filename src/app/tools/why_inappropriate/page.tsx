'use client'

import RegionSelect from '@/components/region-select'
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
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useOptions } from '@/context/OptionsContext'
import useTranslation from '@/hooks/use-translation'
import { region, regions } from '@/lib/consts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const formSchema = z.object({
  text: z.string().max(1024, 'tools.why_inappropriate.form.max_length'),
  region: z.literal(regions).refine((s) => regions.includes(s)),
})

const WhyInappropriatePage = () => {
  const { loc } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [indexes, setIndexes] = useState<
    {
      start: number
      end: number
    }[]
  >([])
  const [baseText, setBaseText] = useState('')
  const [error, setError] = useState('')

  const [options, _] = useOptions()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      region: options.default_region,
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
      if ('indexes' in json) {
        setIndexes(json.indexes)
      } else {
        setIndexes([])
        setError(JSON.stringify(json))
      }
      setBaseText(values.text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      className='min-w-sm sm:w-md md:w-lg wrap-break-word'
      variant='main'
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <CardHeader className='flex items-center justify-center'>
            <div className='flex-1'>
              <CardTitle className='font-header text-lg'>
                {loc('tools.why_inappropriate.title')}
              </CardTitle>
              <CardDescription>
                {loc('tools.why_inappropriate.description')}
              </CardDescription>
            </div>
            <FormField
              control={form.control}
              name='region'
              render={({ field }) => (
                <FormItem className='flex flex-col items-end justify-center'>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    {loc('regions.title')}
                  </FormLabel>
                  <FormControl>
                    <RegionSelect
                      {...field}
                      onValueChange={(newVal: region) =>
                        form.setValue('region', newVal)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='text'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='uppercase text-muted-foreground text-xs'>
                    {loc('tools.why_inappropriate.form.insert_text')}
                    {field.value.length > 0 && ` (${field.value.length}/1024)`}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='abc123...'
                      {...field}
                      className='border-border min-h-30'
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
              {loc('tools.why_inappropriate.check')}
            </Button>
            {(loading || baseText.length > 0) && <Separator />}
            {loading && (
              <div className='w-full flex items-center justify-center p-2'>
                <Spinner />
              </div>
            )}
            {!loading && baseText.length > 0 && (
              <>
                <div>
                  <p className='whitespace-pre-wrap'>
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
                {indexes.length === 0 ?
                  <p className='w-full text-center uppercase text-green-700 dark:text-green-300 text-sm'>
                    {loc('tools.why_inappropriate.results.all_good')}
                  </p>
                : <p className='w-full text-center uppercase text-destructive text-sm'>
                    {loc(
                      indexes.length > 1 ?
                        'tools.why_inappropriate.results.issue_plural'
                      : 'tools.why_inappropriate.results.issue_single',
                      { issues: indexes.length },
                    )}
                  </p>
                }
                {error}
              </>
            )}
          </CardContent>
        </form>
      </Form>
    </Card>
  )
}

export default WhyInappropriatePage
