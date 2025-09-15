import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Sidebar = () => {
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/educator',
      icon: assets.home_icon
    },
    {
      label: 'Add Course',
      path: '/educator/add-course',
      icon: assets.add_icon
    },
    {
      label: 'My Courses',
      path: '/educator/my-courses',
      icon: assets.my_course_icon
    },
    {
      label: 'Students Enrolled',
      path: '/educator/student-enrolled',
      icon: assets.person_tick_icon
    }
  ]

  return (
    <div className="fixed left-0 top-20 h-full w-64 bg-white border-r border-gray-500/30 shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Educator Dashboard</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/educator'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-5 h-5"
              />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar