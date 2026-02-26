'use client'

import React, { createContext, useContext, useEffect } from 'react'
import useLocalStorage from './useLocalStorage'
import { region } from '@/lib/consts'

export type Options = {
  sbuga_effects: boolean
  default_region: region
  locale: 'en'
}

const defaultOptions: Options = {
  sbuga_effects: true,
  default_region: 'en',
  locale: 'en',
}

const OptionsContext = createContext<
  [Options, React.Dispatch<React.SetStateAction<Options>>] | undefined
>(undefined)

export const OptionsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [options, setOptions] = useLocalStorage<Options>(
    'options',
    defaultOptions,
  )

  useEffect(() => {
    for (const [k, v] of Object.entries(defaultOptions)) {
      if (!(k in options)) setOptions((p) => ({ ...p, [k]: v }))
    }
  }, [options, setOptions])

  return (
    <OptionsContext.Provider value={[options, setOptions]}>
      {children}
    </OptionsContext.Provider>
  )
}

export const useOptions = () => {
  const ctx = useContext(OptionsContext)
  if (!ctx) throw new Error('useOptions must be used within OptionsProvider')
  return ctx
}

export default OptionsContext
