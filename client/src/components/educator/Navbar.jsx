import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { assets } from '../../assets/assets'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-500/30 py-4 bg-cyan-100/70 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <img 
          onClick={() => navigate('/')} 
          src={assets.favicon} 
          alt="Logo" 
          className="w-28 lg:w-32 cursor-pointer" 
        />
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-800">Educator Portal</h1>
          <p className="text-sm text-gray-500">Manage your courses and students</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Back to Student View */}
        <button
          onClick={() => navigate('/')}
          className="hidden sm:flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <img src={assets.arrow_icon} alt="Back" className="w-4 h-4 rotate-180" />
          <span>Back to Courses</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{user.firstName || 'Educator'}</p>
              <p className="text-xs text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
          )}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Navbar