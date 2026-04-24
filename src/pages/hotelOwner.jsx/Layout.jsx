import React from 'react'
import Navbar from '../../component/hotelOwner/Navbar'
import Sidebar from '../../component/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
const Layout = () => {
  return (
    <div className='flex flex-col h-screen'>
        <Navbar />
        <div className='flex flex-1 overflow-hidden'>
            <Sidebar />
            <div className='flex-1 overflow-y-auto p-4 md:p-8'>
                <Outlet/>
            </div>
        </div>
    </div>
  )
}

export default Layout