import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'

const CoursesSection = () => {
  const { courses, loading, error } = useContext(AppContext)
  
  return (
    <div className='py-16 md:px-40 px-8'>
      <h2 className='text-3xl font-medium text-gray-800 '>Learn from the best</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3'>
        Discover our top-rated marketing courses across diverse categories. From digital strategy and branding to social media and consumer psychology, each course is designed to deliver practical results you can apply right away.
      </p>
      
      {/* Responsive layout: Grid on mobile, horizontal on desktop */}
      <div className="mt-8">
        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading courses...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">Failed to load courses: {String(error)}</div>
          ) : courses && courses.length > 0 ? (
            courses.slice(0, 4).map((course, index) => (
              <div key={course.id || index}>
                <CourseCard course={course} />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No courses found.</div>
          )}
        </div>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:block overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading courses...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">Failed to load courses: {String(error)}</div>
            ) : courses && courses.length > 0 ? (
              courses.slice(0, 4).map((course, index) => (
                <div key={course.id || index} className="w-80 flex-shrink-0">
                  <CourseCard course={course} />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No courses found.</div>
            )}
          </div>
        </div>
      </div>

      <Link 
        to={'/course-list'}
        onClick={()=> scrollTo(0,0)}
        className='inline-block mt-8 text-blue-600 border-2 border-blue-600 px-10 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-300 ease-in-out'
      >
        Show All Courses
      </Link>
    </div>
  )
}

export default CoursesSection