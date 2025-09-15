import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, SignOutButton } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const EducatorDashboard = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { courses, loading, userRole, ROLES, fetchCoursesFromBackend, API_BASE_URL } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'create-course', 'edit-course', 'create-quiz', 'view-analytics'
  
  // Course form data
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    category: 'Marketing',
    level: 'Beginner',
    duration: ''
  })

  // Quiz form data
  const [quizForm, setQuizForm] = useState({
    title: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ]
  })

  // Student analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completionRate: 0,
    averageScore: 0,
    courseEnrollments: {},
    recentActivity: []
  })

  // Protect route - redirect if not educator/admin
  useEffect(() => {
    if (userRole && userRole !== ROLES.EDUCATOR && userRole !== ROLES.ADMIN && userRole !== ROLES.SUPER_ADMIN) {
      navigate('/student/dashboard')
    }
  }, [userRole, navigate, ROLES])

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData()
  }, [courses])

  const loadAnalyticsData = () => {
    // Simulate loading analytics from localStorage
    const allUserRoles = JSON.parse(localStorage.getItem('userRoles') || '{}')
    const students = Object.values(allUserRoles).filter(role => role.primaryRole === 'student')
    
    const enrollments = {}
    courses.forEach(course => {
      const enrolled = JSON.parse(localStorage.getItem(`courseEnrollments_${course.id}`) || '[]')
      enrollments[course.id] = enrolled.length
    })

    setAnalyticsData({
      totalStudents: students.length,
      activeStudents: Math.floor(students.length * 0.7),
      completionRate: 65,
      averageScore: 78,
      courseEnrollments: enrollments,
      recentActivity: [
        { type: 'enrollment', student: 'Jean Dupont', course: 'Digital Marketing Basics', time: '2h ago' },
        { type: 'completion', student: 'Marie Martin', course: 'SEO Fundamentals', time: '5h ago' },
        { type: 'quiz', student: 'Pierre Lambert', course: 'Social Media Marketing', score: '85%', time: '1d ago' }
      ]
    })
  }

  // Course management functions
  const openCreateCourse = () => {
    setCourseForm({ name: '', description: '', category: 'Marketing', level: 'Beginner', duration: '' })
    setModalType('create-course')
    setShowModal(true)
  }

  const openEditCourse = (course) => {
    setSelectedCourse(course)
    setCourseForm({
      name: course.name,
      description: course.description || '',
      category: course.category || 'Marketing',
      level: course.level || 'Beginner',
      duration: course.duration || ''
    })
    setModalType('edit-course')
    setShowModal(true)
  }

  const saveCourse = async () => {
    const url = modalType === 'create-course' 
      ? `${API_BASE_URL}/api/courses` 
      : `${API_BASE_URL}/api/courses/${selectedCourse.id}`;
      
    const method = modalType === 'create-course' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save course');
      }

      alert(`Cours ${modalType === 'create-course' ? 'créé' : 'modifié'} avec succès !`);
      setShowModal(false);
      fetchCoursesFromBackend(); // Refresh the course list
    } catch (error) {
      console.error('Error saving course:', error);
      alert(`Erreur: ${error.message}`);
    }
  }

  const deleteCourse = (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      console.log('Deleting course:', courseId)
      alert('Cours supprimé avec succès ! (Simulation)')
      fetchCoursesFromBackend()
    }
  }

  // Quiz management functions
  const openCreateQuiz = (course) => {
    setSelectedCourse(course)
    setQuizForm({
      title: '',
      questions: [{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]
    })
    setModalType('create-quiz')
    setShowModal(true)
  }

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]
    }))
  }

  const updateQuestion = (index, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => j === optionIndex ? value : opt)
        } : q
      )
    }))
  }

  const saveQuiz = () => {
    // Save quiz to localStorage with course association
    const quizData = {
      ...quizForm,
      courseId: selectedCourse.id,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    }
    
    const existingQuizzes = JSON.parse(localStorage.getItem('courseQuizzes') || '{}')
    if (!existingQuizzes[selectedCourse.id]) {
      existingQuizzes[selectedCourse.id] = []
    }
    existingQuizzes[selectedCourse.id].push(quizData)
    localStorage.setItem('courseQuizzes', JSON.stringify(existingQuizzes))
    
    alert('Quiz créé avec succès !')
    setShowModal(false)
  }

  const openAnalytics = (course) => {
    setSelectedCourse(course)
    setModalType('view-analytics')
    setShowModal(true)
  }

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
    { id: 'courses', name: 'Mes Cours', icon: '📚' },
    { id: 'students', name: 'Étudiants', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Market.Mastery</h1>
                <p className="text-sm text-gray-500">Dashboard Éducateur</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Éducateur</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <SignOutButton>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Bienvenue, {user?.firstName}!
              </h2>
              <p className="text-green-100 mb-6">
                Gérez vos cours, créez des quiz et suivez vos étudiants
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={openCreateCourse}
                  className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Créer un cours
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className="border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
                >
                  Voir mes cours
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Cours</p>
                    <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Étudiants</p>
                    <p className="text-2xl font-bold text-gray-800">{analyticsData.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Taux Complétion</p>
                    <p className="text-2xl font-bold text-gray-800">{analyticsData.completionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Score Moyen</p>
                    <p className="text-2xl font-bold text-gray-800">{analyticsData.averageScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Activité Récente</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'enrollment' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'completion' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'enrollment' && '📚'}
                        {activity.type === 'completion' && '✅'}
                        {activity.type === 'quiz' && '🎯'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-semibold">{activity.student}</span> 
                          {activity.type === 'enrollment' && ' s\'est inscrit à '}
                          {activity.type === 'completion' && ' a terminé '}
                          {activity.type === 'quiz' && ' a passé un quiz dans '}
                          <span className="text-blue-600">{activity.course}</span>
                          {activity.score && <span className="text-green-600"> - {activity.score}</span>}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Mes Cours</h2>
              <button 
                onClick={openCreateCourse}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nouveau Cours</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditCourse(course)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {course.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{course.chapters?.length || 0} chapitres</span>
                      <span>{analyticsData.courseEnrollments[course.id] || 0} étudiants</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => openCreateQuiz(course)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Créer Quiz
                      </button>
                      <button
                        onClick={() => openAnalytics(course)}
                        className="bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Analytics
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Gestion des Étudiants</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Liste des Étudiants</h3>
              <p className="text-gray-600 mb-6">
                Fonctionnalité en développement - Vous pourrez bientôt voir tous vos étudiants inscrits, leur progression et leurs résultats.
              </p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics Détaillées</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Analytics Avancées</h3>
              <p className="text-gray-600 mb-6">
                Fonctionnalité en développement - Graphiques détaillés, rapports de performance et statistiques avancées seront disponibles ici.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {modalType === 'create-course' && 'Créer un nouveau cours'}
                  {modalType === 'edit-course' && 'Modifier le cours'}
                  {modalType === 'create-quiz' && `Créer un quiz pour ${selectedCourse?.name}`}
                  {modalType === 'view-analytics' && `Analytics - ${selectedCourse?.name}`}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {(modalType === 'create-course' || modalType === 'edit-course') && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du cours
                    </label>
                    <input
                      type="text"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Introduction au Marketing Digital"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Décrivez le contenu et les objectifs du cours..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Marketing">Marketing</option>
                        <option value="SEO">SEO</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Analytics">Analytics</option>
                        <option value="E-commerce">E-commerce</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau
                      </label>
                      <select
                        value={courseForm.level}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Beginner">Débutant</option>
                        <option value="Intermediate">Intermédiaire</option>
                        <option value="Advanced">Avancé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: 5h 30min"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={saveCourse}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      {modalType === 'create-course' ? 'Créer le cours' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'create-quiz' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du quiz
                    </label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Quiz Chapitre 1"
                    />
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-800">Questions</h4>
                    {quizForm.questions.map((question, qIndex) => (
                      <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question {qIndex + 1}
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Tapez votre question..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder={`Option ${oIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Explication (optionnel)
                          </label>
                          <input
                            type="text"
                            value={question.explanation}
                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Expliquez la bonne réponse..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addQuestion}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                  >
                    + Ajouter une question
                  </button>

                  <div className="flex space-x-4">
                    <button
                      onClick={saveQuiz}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Créer le quiz
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'view-analytics' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Analytics pour ce cours</h3>
                  <p className="text-gray-600 mb-6">
                    Les analytics détaillées pour ce cours seront bientôt disponibles.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.courseEnrollments[selectedCourse?.id] || 0}</p>
                      <p className="text-xs text-gray-500">Inscrits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">75%</p>
                      <p className="text-xs text-gray-500">Complétion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">4.2</p>
                      <p className="text-xs text-gray-500">Note Moy.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">12h</p>
                      <p className="text-xs text-gray-500">Temps Moy.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EducatorDashboard