import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useUser, SignedIn, SignedOut } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const navigate = useNavigate()
  const { user, isLoaded, isSignedIn } = useUser()
  const { assignRole, ROLES, userRole } = useContext(AppContext)

  const handleRoleSelection = (role) => {
    if (isSignedIn) {
      // If user is already signed in (maybe from another tab), assign the role immediately
      assignRoleAndRedirect(role);
    } else {
      // If not signed in, show sign in with the selected role
      setSelectedRole(role);
      setShowSignIn(true);
    }
  }

  const assignRoleAndRedirect = async (role) => {
    if (!user) return;
    
    try {
      const roleData = {
        primaryRole: role,
        secondaryRoles: [],
        permissions: role === ROLES.STUDENT ? 
          ['view_courses', 'enroll_courses'] : 
          ['view_courses', 'create_courses', 'edit_courses', 'view_analytics', 'manage_students'],
        roleAssignedDate: new Date().toISOString(),
        roleStatus: 'active'
      };
      
      const userEmail = user.emailAddresses[0]?.emailAddress;
      
      // Assign the role
      assignRole(user.id, roleData, userEmail);
      
      // Force immediate redirect based on the assigned role
      setTimeout(() => {
        if (role === ROLES.STUDENT) {
          navigate('/student/dashboard', { replace: true });
        } else if (role === ROLES.EDUCATOR || role === ROLES.ADMIN) {
          navigate('/educator/dashboard', { replace: true });
        }
      }, 100); // Small delay to ensure role is saved
    } catch (error) {
      console.error('Error during role assignment:', error);
    }
  };

  const handleSignInSuccess = () => {
    if (selectedRole) {
      assignRoleAndRedirect(selectedRole);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showSignIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">M</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Mastery</h1>
            <p className="text-gray-600">
              Connexion en tant que {selectedRole === ROLES.STUDENT ? 'Étudiant' : 'Éducateur'}
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <SignedOut>
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 p-6",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "w-full justify-center",
                    formButtonPrimary: "w-full bg-blue-600 hover:bg-blue-700",
                  }
                }}
                afterSignInUrl="#"
              />
            </SignedOut>
            
            <SignedIn>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Connexion réussie !</h2>
                <p className="text-gray-600 mb-6">Configuration de votre rôle en cours...</p>
                <button 
                  onClick={handleSignInSuccess}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Continuer
                </button>
              </div>
            </SignedIn>
            
            {/* Retour */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setShowSignIn(false);
                  setSelectedRole(null);
                }}
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
              >
                ← Changer de rôle
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Market Mastery</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Accueil
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Choisissez votre
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> rôle</span>
        </h1>
        <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
          Accédez à la plateforme selon vos besoins : apprenez en tant qu'étudiant ou enseignez en tant qu'éducateur.
        </p>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Student Card */}
          <div 
            onClick={() => handleRoleSelection(ROLES.STUDENT)}
            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Étudiant</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Explorez nos cours de marketing digital, regardez des vidéos, téléchargez des ressources et passez des quiz.
            </p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Accès à tous les cours</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Quiz interactifs</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Suivi de progression</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Continuer comme Étudiant
            </button>
          </div>

          {/* Educator Card */}
          <div 
            onClick={() => handleRoleSelection(ROLES.EDUCATOR)}
            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-2 border-transparent hover:border-purple-200"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Éducateur</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Créez et gérez vos cours, ajoutez du contenu, créez des quiz et suivez vos étudiants.
            </p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Création de cours</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Gestion des quiz</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Analytics étudiants</span>
              </div>
            </div>
            
            <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
              Continuer comme Éducateur
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white/50 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Première fois sur Market Mastery ?</h3>
          <p className="text-gray-600 leading-relaxed">
            Notre plateforme vous permet d'apprendre ou d'enseigner le marketing digital. 
            Choisissez votre rôle pour accéder aux fonctionnalités appropriées.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage