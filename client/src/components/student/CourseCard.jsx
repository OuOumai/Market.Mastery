import React from 'react'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({ course }) => {
  const navigate = useNavigate()

  const handleCourseClick = () => {
    navigate(`/course/${course.id}`)
  }

  // Calculate course stats from backend data
  const totalLectures = course.chapters?.reduce((total, chapter) => {
    return total + (chapter.lectures?.length || 0)
  }, 0) || 0

  const hasVideos = course.chapters?.some(chapter => 
    chapter.lectures?.some(lecture => lecture.type === 'video')
  ) || false

  const hasPDFs = course.chapters?.some(chapter => 
    chapter.lectures?.some(lecture => lecture.type === 'pdf')
  ) || false

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCourseClick}
    >
      {/* Course Image */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        {course.image && course.image !== '/placeholder-course.jpg' ? (
          <img 
            src={course.image} 
            alt={course.title || course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="font-medium">{course.name}</p>
            </div>
          </div>
        )}
        
        {/* Course Level Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
            {course.level || 'All Levels'}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        {/* Course Title */}
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {course.title || course.name}
        </h3>

        {/* Course Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description || `Complete course covering ${course.name} with practical examples and hands-on exercises.`}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {totalLectures} lectures
            </span>
            
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {course.duration || '5+ hours'}
            </span>
          </div>

          {/* Content Type Indicators */}
          <div className="flex items-center space-x-1">
            {hasVideos && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                Video
              </span>
            )}
            {hasPDFs && (
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                PDF
              </span>
            )}
          </div>
        </div>

        {/* Course Footer */}
        <div className="flex items-center justify-between">
          {/* Instructor */}
          <div className="text-sm text-gray-600">
            By {course.instructor || 'MarketMastery'}
          </div>

          {/* Rating */}
          <div className="flex items-center">
            <div className="flex items-center mr-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(course.rating || 4.5) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CourseCard