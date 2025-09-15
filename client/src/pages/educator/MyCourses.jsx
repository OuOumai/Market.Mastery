import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const MyCourses = () => {
  const { allCourses, currency, calculateRating } = useContext(AppContext)
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter courses based on status
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'published' && course.isPublished) ||
      (filter === 'draft' && !course.isPublished)
    return matchesSearch && matchesFilter
  })

  const CourseManagementCard = ({ course }) => {
    const courseRating = calculateRating(course)
    const enrollmentCount = course.enrolledStudents.length

    return (
      <div className="bg-white border border-gray-500/30 rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative">
          <img 
            src={course.courseThumbnail} 
            alt={course.courseTitle}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.isPublished 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
            {course.discount > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                {course.discount}% OFF
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{course.courseTitle}</h3>
          
          {/* Course Stats */}
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <img src={assets.person_tick_icon} alt="Students" className="w-4 h-4" />
                <span>{enrollmentCount} students</span>
              </span>
              <span className="flex items-center space-x-1">
                <img src={assets.star} alt="Rating" className="w-4 h-4" />
                <span>{courseRating.toFixed(1)}</span>
              </span>
            </div>
            <span className="font-bold text-blue-600">
              {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              Edit Course
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              View
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <img src={assets.dropdown_icon} alt="More" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
          <p className="text-gray-500">Manage and monitor your course content</p>
        </div>
        <button 
          onClick={() => navigate('/educator/add-course')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <img src={assets.add_icon} alt="Add" className="w-5 h-5" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-500/30 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <img 
                src={assets.search_icon} 
                alt="Search" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Courses' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Draft' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <img src={assets.my_course_icon} alt="Total" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-xl font-bold text-gray-800">{allCourses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-xl font-bold text-gray-800">
                {allCourses.filter(c => c.isPublished).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Draft</p>
              <p className="text-xl font-bold text-gray-800">
                {allCourses.filter(c => !c.isPublished).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseManagementCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-500/30 rounded-lg p-12 text-center">
          <img src={assets.upload_area} alt="No courses" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first course'}
          </p>
          <button 
            onClick={() => navigate('/educator/add-course')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Course
          </button>
        </div>
      )}
    </div>
  )
}

export default MyCourses