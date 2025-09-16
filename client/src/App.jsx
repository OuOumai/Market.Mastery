import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react'

// Pages Student
import StudentDashboard from './pages/student/StudentDashboard'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollements from './pages/student/MyEnrollements'
import Player from './pages/student/Player'

// Pages Educator  
import EducatorDashboard from './pages/educator/EducatorDashboard'

// Pages Auth
import LoginPage from './pages/auth/Login'
import RoleSelector from './pages/auth/RoleSelector'

// Components
import Loading from './components/student/Loading'
import Navbar from './components/student/Navbar'

// Context
import { AppContext } from './context/AppContext'

const App = () => {
  const { userRole, ROLES } = useContext(AppContext) || {};

  return (
    <div className='text-defult min-h-screen bg-white'>
      <Navbar />
      
      <Routes> 
        <Route path='/login' element={
          <SignedOut>
            <LoginPage />
          </SignedOut>
        } />

        <Route path='/*' element={
          <SignedIn>
            <Routes>
              <Route path='/role-selector' element={<RoleSelector />} />
              <Route path='/student/dashboard' element={<StudentDashboard />} />
              <Route path='/student/courses' element={<CoursesList />} />
              <Route path='/student/course/:courseFolder' element={<CourseDetails />} />
              <Route path='/educator/dashboard' element={<EducatorDashboard />} />
              <Route path='*' element={<Navigate to="/role-selector" replace />} />
            </Routes>
          </SignedIn>
        } />

        <Route path="/" element={
          <SignedOut>
            <Navigate to="/login" replace />
          </SignedOut>
        } />

        <Route path="/" element={
          <SignedIn>
            <RoleSelector />
          </SignedIn>
        }/>
      </Routes>
    </div>
  )
}

export default App