import React, { createContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const { user, isLoaded } = useUser()
  
  // Course data state
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // User role and permissions
  const [userRole, setUserRole] = useState(null)
  const [isRoleLoading, setIsRoleLoading] = useState(true)

  // Role definitions
  const ROLES = {
    STUDENT: 'student',
    EDUCATOR: 'educator',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  }

  const PERMISSIONS = {
    student: ['view_courses', 'enroll_courses'],
    educator: ['view_courses', 'create_courses', 'edit_courses', 'view_analytics', 'manage_students'],
    admin: ['view_courses', 'create_courses', 'edit_courses', 'view_analytics', 'manage_students', 'manage_users'],
    super_admin: ['*'] // All permissions
  }

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:5000'

  // Fetch courses from backend
  const fetchCoursesFromBackend = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/courses`) // This line was correct, but let's ensure it's what you have.
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const backendCourses = await response.json()
      
      if (Array.isArray(backendCourses) && backendCourses.length > 0) {
        // Transform backend data to match frontend expectations
        const transformedCourses = backendCourses.map((course, index) => ({
          id: `course_${index + 1}`, // Generate consistent IDs
          name: course.name, // This now comes from the folder name
          title: course.name,
          description: course.description || `Complete course on ${course.name}`,
          image: '/placeholder-course.jpg', // Default image
          price: 49.99, // Default price
          rating: 4.5, // Default rating
          chapters: course.chapters || [],
          totalLectures: course.chapters?.reduce((total, chapter) => 
            total + (chapter.lectures?.length || 0), 0
          ) || 0,
          duration: course.duration || '10+ hours',
          level: course.level || 'Beginner to Advanced',
          instructor: 'MarketMastery Team', // You can add this to course.json later
          category: course.category || 'Marketing'
        }))
        
        setCourses(transformedCourses)
        console.log('✅ Successfully loaded courses from backend:', transformedCourses)
      } else {
        console.log('⚠️ No courses found in backend, using fallback data')
        setCourses([]) // Set empty array instead of fallback
      }
    } catch (err) {
      console.error('❌ Failed to fetch courses from backend:', err)
      setError(err.message)
      setCourses([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Get course by ID
  const getCourseById = (courseId) => {
    return courses.find(course => course.id === courseId)
  }

  // Get course chapters with lectures
  const getCourseChapters = (courseId) => {
    const course = getCourseById(courseId)
    return course?.chapters || []
  }

  // Get lecture URL for streaming
  const getLectureUrl = (lecture) => {
    if (lecture.url) {
      return `${API_BASE_URL}${lecture.url}`
    }
    return null
  }

  // Role management functions
  const hasRole = (role) => {
    return userRole === role
  }

  const hasPermission = (permission) => {
    if (userRole === ROLES.SUPER_ADMIN) return true
    const userPermissions = PERMISSIONS[userRole] || []
    return userPermissions.includes(permission) || userPermissions.includes('*')
  }

  const assignRole = (userId, roleData, userEmail) => {
    try {
      const existingRoles = JSON.parse(localStorage.getItem('userRoles') || '{}')
      const key = userEmail || userId;
      
      // Store the role data with both keys for backward compatibility
      existingRoles[key] = {
        ...roleData,
        assignedDate: new Date().toISOString(),
        userId,  // Store both userId and email for reference
        userEmail
      }
      
      // If we have both userId and email, store under both keys
      if (userId && userEmail) {
        existingRoles[userId] = existingRoles[userEmail] = existingRoles[key];
      }
      
      localStorage.setItem('userRoles', JSON.stringify(existingRoles))
      
      // Update current user role if it's for the current user
      const currentUserEmail = user?.emailAddresses[0]?.emailAddress;
      if (user && (userId === user.id || userEmail === currentUserEmail)) {
        setUserRole(roleData.primaryRole)
      }
      
      return true
    } catch (error) {
      console.error('Error assigning role:', error)
      throw error
    }
  }

  const requestRoleUpgrade = (targetRole, reason) => {
    if (!user) return false
    
    try {
      const roleRequests = JSON.parse(localStorage.getItem('roleRequests') || '[]')
      const newRequest = {
        userId: user.id,
        userName: user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown',
        userEmail: user.emailAddresses[0]?.emailAddress || '',
        currentRole: userRole,
        targetRole,
        reason,
        status: 'pending',
        requestDate: new Date().toISOString()
      }
      
      roleRequests.push(newRequest)
      localStorage.setItem('roleRequests', JSON.stringify(roleRequests))
      return true
    } catch (error) {
      console.error('Error requesting role upgrade:', error)
      return false
    }
  }

  // Initialize user role
  useEffect(() => {
    console.log('🚀 AppContext role initialization', { isLoaded, user: !!user })
    
    if (isLoaded && user) {
      setIsRoleLoading(true)
      
      try {
        const userRoles = JSON.parse(localStorage.getItem('userRoles') || '{}')
        const userEmail = user.emailAddresses[0]?.emailAddress || ''
        const userKey = userEmail || user.id;
        
        console.log('📋 User roles from localStorage:', userRoles)
        console.log('📧 User email:', userEmail)
        console.log('🔑 User key:', userKey)
        
        // Try to find role by either userId, userEmail, or the combined key
        const userRoleData = userRoles[user.id] || userRoles[userEmail] || userRoles[userKey];
        
        if (userRoleData) {
          console.log('✅ Found existing role:', userRoleData.primaryRole)
          setUserRole(userRoleData.primaryRole)
        } else if (userEmail.includes('admin@')) {
          console.log('👑 Auto-assigning admin role')
          const adminRole = {
            primaryRole: ROLES.ADMIN,
            permissions: PERMISSIONS[ROLES.ADMIN],
            roleStatus: 'active'
          }
          assignRole(user.id, adminRole, userEmail)
          setUserRole(ROLES.ADMIN)
        } else {
          // Only default to student role if no role is found
          console.log('👤 No role found, will be assigned during login')
          // Don't set default role here, let the login flow handle it
        }
      } catch (error) {
        console.error('❌ Error initializing user role:', error)
        // Don't set default role on error, let the login flow handle it
      } finally {
        setIsRoleLoading(false)
      }
    } else if (isLoaded && !user) {
      console.log('👤 No user logged in, clearing role')
      setUserRole(null)
      setIsRoleLoading(false)
    }
  }, [isLoaded, user])

  // Fetch courses on mount
  useEffect(() => {
    fetchCoursesFromBackend()
  }, [])

  const contextValue = {
    // Course data
    courses,
    loading,
    error,
    fetchCoursesFromBackend,
    getCourseById,
    getCourseChapters,
    getLectureUrl,
    API_BASE_URL,
    
    // User management
    user,
    userRole,
    isRoleLoading,
    hasRole,
    hasPermission,
    assignRole,
    requestRoleUpgrade,
    
    // Constants
    ROLES,
    PERMISSIONS
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}