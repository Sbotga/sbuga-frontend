import type { ReactNode } from 'react'
import Navbar from './navbar'
import Footer from './footer'

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='w-full h-screen flex flex-col'>
      <Navbar />
      <div className='flex flex-1 items-center justify-center flex-col'>
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout
