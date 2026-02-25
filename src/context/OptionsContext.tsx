'use client'

import React, { createContext, useContext } from 'react'
import useLocalStorage from './useLocalStorage'
import { region } from '@/lib/consts'

export type Options = {
  sbuga_effects: boolean
  default_region: region
}

const OptionsContext = createContext<
  [Options, React.Dispatch<React.SetStateAction<Options>>] | undefined
>(undefined)

export const OptionsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [options, setOptions] = useLocalStorage<Options>('options', {
    sbuga_effects: false,
    default_region: 'en',
  })

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
