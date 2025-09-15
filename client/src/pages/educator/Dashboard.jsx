import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { dummyDashboardData, dummyEducatorData } from '../../assets/assets'
import { assets } from '../../assets/assets'

const Dashboard = () => {
  const { allCourses, currency } = useContext(AppContext)
  const dashboardData = dummyDashboardData

  // Calculate analytics
  const totalCourses = allCourses.length
  const publishedCourses = allCourses.filter(course => course.isPublished).length
  const totalStudents = dashboardData.enrolledStudentsData.length
  const totalRevenue = dashboardData.totalEarnings

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className="bg-white border border-gray-500/30 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`bg-${color}-50 p-3 rounded-lg`}>
            <img src={icon} alt={title} className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <img 
            src={dummyEducatorData.imageUrl} 
            alt="Profile" 
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {dummyEducatorData.name}!</h1>
            <p className="text-gray-500">Here's what's happening with your courses today.</p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`${currency}${totalRevenue.toFixed(2)}`}
          subtitle="This month"
          icon={assets.earning_icon}
          color="green"
        />
        <StatCard
          title="Total Courses"
          value={totalCourses}
          subtitle={`${publishedCourses} published`}
          icon={assets.my_course_icon}
          color="blue"
        />
        <StatCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle="Across all courses"
          icon={assets.person_tick_icon}
          color="purple"
        />
        <StatCard
          title="Average Rating"
          value="4.8"
          subtitle="Based on reviews"
          icon={assets.star}
          color="yellow"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white border border-gray-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Enrollments</h2>
            <img src={assets.person_tick_icon} alt="Students" className="w-5 h-5" />
          </div>
          <div className="space-y-4">
            {dashboardData.enrolledStudentsData.slice(0, 5).map((enrollment, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={enrollment.student.imageUrl} 
                  alt={enrollment.student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{enrollment.student.name}</p>
                  <p className="text-sm text-gray-500">{enrollment.courseTitle}</p>
                </div>
                <div className="text-xs text-gray-400">
                  Today
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-white border border-gray-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Top Performing Courses</h2>
            <img src={assets.my_course_icon} alt="Courses" className="w-5 h-5" />
          </div>
          <div className="space-y-4">
            {allCourses.slice(0, 5).map((course, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={course.courseThumbnail} 
                  alt={course.courseTitle}
                  className="w-12 h-8 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{course.courseTitle}</p>
                  <p className="text-sm text-gray-500">{course.enrolledStudents.length} students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">
                    {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-1">
                    <img src={assets.star} alt="Rating" className="w-3 h-3" />
                    <span className="text-xs text-gray-500">4.8</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-500/30 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <img src={assets.add_icon} alt="Add Course" className="w-6 h-6" />
            <span className="font-medium text-blue-600">Create New Course</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <img src={assets.file_upload_icon} alt="Upload" className="w-6 h-6" />
            <span className="font-medium text-green-600">Upload Materials</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <img src={assets.appointments_icon} alt="Analytics" className="w-6 h-6" />
            <span className="font-medium text-purple-600">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard