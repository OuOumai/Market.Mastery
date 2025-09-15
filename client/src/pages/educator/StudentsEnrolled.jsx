import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { dummyStudentEnrolled } from '../../assets/assets'
import { assets } from '../../assets/assets'

const StudentsEnrolled = () => {
  const { allCourses } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  
  const enrollmentData = dummyStudentEnrolled

  // Filter and sort students
  const filteredStudents = enrollmentData.filter(enrollment => {
    const matchesSearch = enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          enrollment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === 'all' || enrollment.courseTitle === selectedCourse
    return matchesSearch && matchesCourse
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.purchaseDate) - new Date(a.purchaseDate)
    } else if (sortBy === 'name') {
      return a.student.name.localeCompare(b.student.name)
    }
    return 0
  })

  // Get unique course titles for filter
  const courseOptions = [...new Set(enrollmentData.map(e => e.courseTitle))]

  const StudentCard = ({ enrollment }) => {
    const enrollmentDate = new Date(enrollment.purchaseDate).toLocaleDateString()
    
    return (
      <div className="bg-white border border-gray-500/30 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start space-x-4">
          <img 
            src={enrollment.student.imageUrl} 
            alt={enrollment.student.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{enrollment.student.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{enrollment.courseTitle}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <img src={assets.time_clock_icon} alt="Enrolled" className="w-3 h-3" />
                    <span>Enrolled {enrollmentDate}</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Course Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-4">
              <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                View Progress
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Students Enrolled</h1>
        <p className="text-gray-500">Monitor student progress and engagement</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <img src={assets.person_tick_icon} alt="Total Students" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-gray-800">{enrollmentData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Students</p>
              <p className="text-xl font-bold text-gray-800">{enrollmentData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 p-2 rounded-lg">
              <img src={assets.blue_tick_icon} alt="Completed" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-800">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <img src={assets.time_left_clock_icon} alt="In Progress" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xl font-bold text-gray-800">{enrollmentData.length - 12}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-500/30 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
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
                placeholder="Search students or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudents.map((enrollment, index) => (
            <StudentCard key={index} enrollment={enrollment} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-500/30 rounded-lg p-12 text-center">
          <img src={assets.person_tick_icon} alt="No students" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No students found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCourse !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Students will appear here once they enroll in your courses'}
          </p>
        </div>
      )}

      {/* Export Actions */}
      <div className="bg-white border border-gray-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Student Data Export</h3>
            <p className="text-sm text-gray-500">Download student enrollment and progress data</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Export CSV
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentsEnrolled