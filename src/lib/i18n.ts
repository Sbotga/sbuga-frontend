import React, { ReactNode } from 'react'

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
    variables?: Record<
      string,
      | string
      | number
      | {
          value: string | number
          component: ({
            children,
          }: {
            children: ReactNode
          }) => React.JSX.Element
        }
    >,
  ): ReactNode => {
    let value = getNestedValue(translations, key)

    if (typeof value !== 'string') {
      console.warn(`Translation key not found or not a string: ${key}`)
      return key
    }

    if (!variables) {
      return value
    }

    // Split the string into parts based on variable placeholders
    const parts: ReactNode[] = []
    let remainingValue = value
    let keyIndex = 0

    const variablePattern = /{(\w+)}/g
    let match: RegExpExecArray | null

    while ((match = variablePattern.exec(value)) !== null) {
      const [placeholder, varKey] = match
      const matchIndex = match.index

      // Add text before the placeholder
      if (
        matchIndex > 0 &&
        remainingValue.startsWith(value.substring(0, matchIndex))
      ) {
        parts.push(value.substring(keyIndex, matchIndex))
      }

      // Add the variable with or without styles
      const vValue = variables[varKey]
      if (vValue !== undefined) {
        if (typeof vValue === 'object' && vValue.component) {
          parts.push(vValue.component({ children: String(vValue.value) }))
        } else {
          const simpleValue = typeof vValue === 'object' ? vValue.value : vValue
          parts.push(String(simpleValue))
        }
      } else {
        parts.push(placeholder)
      }

      keyIndex = matchIndex + placeholder.length
    }

    // Add remaining text after the last placeholder
    if (keyIndex < value.length) {
      parts.push(value.substring(keyIndex))
    }

    // If there's only one part and it's a string, return it as-is
    if (parts.length === 1 && typeof parts[0] === 'string') {
      return parts[0]
    }

    // Return as React fragment
    return React.createElement(React.Fragment, null, ...parts)
  }

import en from '@/i18n/en.json'
export type TranslationKeys = Leaves<typeof en>
