import type { ReactNode } from 'react'
import Navbar from './navbar'
import Footer from './footer'
import Background from './background'

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='w-full min-h-screen flex flex-col'>
      <Navbar />
      <div className='flex flex-1 items-center justify-center flex-col relative bg-secondary'>
        <Background />
        <div className='z-10 py-5'>{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout
