'use client'

import { useOptions } from '@/context/OptionsContext'
import en from '@/i18n/en.json'
import { createLoc } from '@/lib/i18n'

const locales: Record<string, any> = { en }

export const useTranslation = () => {
  const [options, _] = useOptions()

  const locale = options.locale

  const translations = locales[locale]
  const loc = createLoc(translations)

  return { loc }
}

export default useTranslation
