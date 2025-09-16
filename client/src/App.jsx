import React, { useContext } from 'react'
import { Routes, Route, useMatch, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

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

// Wrapper pour la page de connexion qui redirige si l'utilisateur est déjà connecté
const LoginRouteWrapper = () => {
  const { user, isLoaded } = useUser();
  const { userRole, isRoleLoading, ROLES } = useContext(AppContext);

  if (!isLoaded || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is signed in and has a role, redirect to the appropriate dashboard.
  if (user && userRole?.primaryRole) {
    if (userRole.primaryRole === ROLES.STUDENT) {
      return <Navigate to="/student/dashboard" replace />;
    } else if (userRole.primaryRole === ROLES.EDUCATOR || userRole.primaryRole === ROLES.ADMIN) {
      return <Navigate to="/educator/dashboard" replace />;
    }
  }

  return <LoginPage />;
};

// Protected Route Component (inline since we can't create separate file)
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null, 
  fallbackPath = '/',
  requireAuth = true 
}) => {
  const { 
    userRole, 
    isRoleLoading, 
    hasRole, 
    hasPermission,
    ROLES 
  } = useContext(AppContext);
  const { user, isLoaded } = useUser();

  // Loading states
  if (!isLoaded || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-500/30 rounded-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this feature.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Request Educator Access Component
const RequestEducatorAccess = () => {
  const { requestRoleUpgrade, userRole, ROLES } = useContext(AppContext);
  const { user } = useUser();
  const [reason, setReason] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      requestRoleUpgrade(ROLES.EDUCATOR, reason);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-500/30 rounded-lg p-8 text-center max-w-md">
          <div className="text-green-500 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">Your educator access request has been submitted for review.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-gray-500/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-blue-500 text-4xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Become an Educator</h1>
            <p className="text-gray-600">Request access to create and manage courses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to become an educator?
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us about your teaching background, expertise, or what courses you'd like to create..."
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Educator Benefits:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create and manage courses</li>
                <li>• Access student analytics</li>
                <li>• Export student data</li>
                <li>• Manage course content</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Submit Request
            </button>

            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = () => {
  const { assignRole, ROLES, PERMISSIONS, hasPermission } = useContext(AppContext);
  const [roleRequests, setRoleRequests] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);

  React.useEffect(() => {
    // Load role requests from localStorage
    const requests = JSON.parse(localStorage.getItem('roleRequests') || '[]');
    setRoleRequests(requests);
  }, []);

  const approveRequest = (requestIndex) => {
    const request = roleRequests[requestIndex];
    try {
      // Assign educator role
      assignRole(request.userId, {
        primaryRole: ROLES.EDUCATOR,
        secondaryRoles: [ROLES.STUDENT],
        permissions: PERMISSIONS[ROLES.EDUCATOR] || [],
        roleAssignedDate: new Date().toISOString(),
        roleStatus: 'active'
      });

      // Update request status
      const updatedRequests = [...roleRequests];
      updatedRequests[requestIndex].status = 'approved';
      setRoleRequests(updatedRequests);
      localStorage.setItem('roleRequests', JSON.stringify(updatedRequests));

      alert('Role request approved successfully!');
    } catch (error) {
      alert('Error approving request: ' + error.message);
    }
  };

  const rejectRequest = (requestIndex) => {
    const updatedRequests = [...roleRequests];
    updatedRequests[requestIndex].status = 'rejected';
    setRoleRequests(updatedRequests);
    localStorage.setItem('roleRequests', JSON.stringify(updatedRequests));
  };

  const quickAssignRole = (userId, userName, targetRole) => {
    try {
      assignRole(userId, {
        primaryRole: targetRole,
        secondaryRoles: targetRole === ROLES.STUDENT ? [] : [ROLES.STUDENT],
        permissions: PERMISSIONS[targetRole] || [],
        roleAssignedDate: new Date().toISOString(),
        roleStatus: 'active'
      });
      alert(`Successfully assigned ${targetRole} role to ${userName}`);
    } catch (error) {
      alert('Error assigning role: ' + error.message);
    }
  };

  const pendingRequests = roleRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>

        {/* Role Requests */}
        <div className="bg-white border border-gray-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Pending Role Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending role requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request, index) => {
                const originalIndex = roleRequests.findIndex(r => 
                  r.userId === request.userId && r.requestDate === request.requestDate
                );
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-800">{request.userName}</h3>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {request.currentRole} → {request.targetRole}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.userEmail}</p>
                        <p className="text-sm text-gray-700">{request.reason}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested: {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => approveRequest(originalIndex)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(originalIndex)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Role Assignment */}
        <div className="bg-white border border-gray-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Role Assignment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Student Role</h3>
              <p className="text-sm text-blue-600 mb-3">Basic course access</p>
              <button 
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                onClick={() => {
                  const userId = prompt('Enter User ID:');
                  const userName = prompt('Enter User Name:');
                  if (userId && userName) quickAssignRole(userId, userName, ROLES.STUDENT);
                }}
              >
                Assign Student
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Educator Role</h3>
              <p className="text-sm text-green-600 mb-3">Create and manage courses</p>
              <button 
                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                onClick={() => {
                  const userId = prompt('Enter User ID:');
                  const userName = prompt('Enter User Name:');
                  if (userId && userName) quickAssignRole(userId, userName, ROLES.EDUCATOR);
                }}
              >
                Assign Educator
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">Admin Role</h3>
              <p className="text-sm text-purple-600 mb-3">Manage users and platform</p>
              <button 
                className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                onClick={() => {
                  const userId = prompt('Enter User ID:');
                  const userName = prompt('Enter User Name:');
                  if (userId && userName) quickAssignRole(userId, userName, ROLES.ADMIN);
                }}
              >
                Assign Admin
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">Super Admin</h3>
              <p className="text-sm text-red-600 mb-3">Full system access</p>
              <button 
                className="w-full bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                onClick={() => {
                  const userId = prompt('Enter User ID:');
                  const userName = prompt('Enter User Name:');
                  if (userId && userName) quickAssignRole(userId, userName, ROLES.SUPER_ADMIN);
                }}
              >
                Assign Super Admin
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Admin Instructions</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• To test roles, sign in and check your Clerk user ID in the console</p>
              <p>• Use the Quick Role Assignment to assign roles to specific user IDs</p>
              <p>• Admin emails (containing 'admin@') are automatically assigned admin role</p>
              <p>• Role assignments are stored in localStorage for demo purposes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')
  const isStudentDashboard = useMatch('/student/dashboard')
  const isLoginPage = useMatch('/login')
  const { ROLES, PERMISSIONS } = useContext(AppContext) || {} 

  return (
    <div className='text-defult min-h-screen bg-white'>
      {!isEducatorRoute && !isStudentDashboard && !isLoginPage && <Navbar />}
      
      <Routes> 
        <Route path='/' element={<Navigate to="/login" replace />}/>
        <Route path='/login' element={<LoginRouteWrapper />}/>
        
        {/* Student Routes */}
        <Route path='/student/dashboard' element={
          <ProtectedRoute requiredRole={ROLES?.STUDENT}>
            <StudentDashboard />
          </ProtectedRoute>
        }/>
        
        {/* Educator Routes */}
        <Route path='/educator/dashboard' element={
          <ProtectedRoute requiredRole={ROLES?.EDUCATOR}>
            <EducatorDashboard />
          </ProtectedRoute>
        }/>
        
        {/* Shared Routes */}
        <Route path='/course-list' element={<CoursesList />}/>
        <Route path='/course-list/:input' element={<CoursesList />}/>
        <Route path='/course/:id' element={<CourseDetails />}/>
        <Route path='/my-enrollements' element={
          <ProtectedRoute requireAuth={true}>
            <MyEnrollements/>
          </ProtectedRoute>
        }/>
        <Route path='/player/:courseId' element={
          <ProtectedRoute requiredPermission="view_courses">
            <Player/>
          </ProtectedRoute>
        }/>
        
        {/* Utility Routes */}
        <Route path='/loading/:path' element={<Loading />}/>
        <Route path='/role' element={<RoleSelector />}/>
        <Route path='/request-educator-access' element={<RequestEducatorAccess />}/>
        
        {/* Admin Routes */}
        <Route path='/admin' element={
          <ProtectedRoute requiredRole={ROLES?.ADMIN}>
            <AdminPanel />
          </ProtectedRoute>
        }/>
      </Routes>
    </div>
  )
}

export default App