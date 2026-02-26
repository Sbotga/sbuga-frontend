export type Leaves<T> =
  T extends object ?
    {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}`
    }[keyof T]
  : never

const getNestedValue = (obj: any, path: string): string | undefined =>
  path.split('.').reduce((acc, part) => acc && acc[part], obj)

export const createLoc =
  (translations: Record<TranslationKeys, any>) =>
  (
    key: TranslationKeys,
    variables?: Record<string, string | number>,
  ): string => {
    let value = getNestedValue(translations, key)

    if (typeof value !== 'string') {
      console.warn(`Translation key not found or not a string: ${key}`)
      return key
    }

    if (variables)
      Object.entries(variables).forEach(([vKey, vValue]) => {
        value = (value as string).replace(
          new RegExp(`{${vKey}}`, 'g'),
          String(vValue),
        )
      })

    return value
  }

import en from '@/i18n/en.json'
export type TranslationKeys = Leaves<typeof en>
