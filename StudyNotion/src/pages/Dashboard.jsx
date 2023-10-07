import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'

import Sidebar from "../components/core/Dashboard/Sidebar"

const Dashboard = () => {

    const { loading: profileLoading } = useSelector((state) => state.profile)
    const { loading: authLoading } = useSelector((state) => state.auth)
  
    if (profileLoading || authLoading) {
        return (
          <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
            <div className="spinner"></div>
          </div>
        )
      }

  return (
    <div>
    <div className="md:hidden text-white font-medium flex items-center justify-center my-8">Please Switch to PC to view this page :-</div>
    <div className="hidden md:block">
    <div className="relative flex min-h-[calc(100vh-3.5rem)]" >
        <Sidebar/>
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
        <div className="mx-auto w-11/12 max-w-[1000px] py-10">
          <Outlet/>
        </div>
      </div>
    </div>
    </div>
    </div>    
  )
}

export default Dashboard
