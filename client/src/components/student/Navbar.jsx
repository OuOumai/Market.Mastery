import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const {
    // Legacy support
    isEducator, setIsEducator, checkEducatorStatus,
    // New role system
    userRole, availableRoles, hasRole, switchRole, ROLES,
    isRoleLoading
  } = useContext(AppContext)
  const location = useLocation();
  const isCourseListPage = location.pathname.includes('/course-list');
  const { openSignIn } = useClerk();
  const { user, isSignedIn } = useUser();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Role switcher component
  const RoleSwitcher = () => {
    if (!availableRoles || availableRoles.length <= 1) return null;

    return (
      <div className="relative">
        <button
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <span className="text-sm font-medium">
            {userRole?.primaryRole === ROLES?.STUDENT ? 'Student' : 
             userRole?.primaryRole === ROLES?.EDUCATOR ? 'Educator' :
             userRole?.primaryRole === ROLES?.ADMIN ? 'Admin' : 'User'}
          </span>
          <img src={assets.down_arrow_icon} alt="Switch" className="w-3 h-3" />
        </button>

        {showRoleDropdown && (
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[150px] z-50">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  switchRole(role);
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  userRole?.primaryRole === role ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {role === ROLES?.STUDENT ? 'Switch to Student' :
                 role === ROLES?.EDUCATOR ? 'Switch to Educator' :
                 role === ROLES?.ADMIN ? 'Switch to Admin' : `Switch to ${role}`}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'
      }`}
    >
      <img onClick={()=>navigate('/')} src={assets.favicon} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />

      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className='flex items-center gap-5'>
          {user && (
            <>
              {/* Role-based navigation */}
              {hasRole && hasRole(ROLES?.EDUCATOR) ? (
                <button 
                  onClick={() => navigate('/educator')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Educator Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/request-educator-access')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Admin
                </button>
              )}
              <Link to="/my-enrollements" className="hover:text-blue-600 transition-colors">My Enrollments</Link>
              
              {/* Role Switcher */}
              <RoleSwitcher />
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()} className="bg-blue-600 text-white px-5 py-2 rounded-full">
            Create Account
          </button>
        )}
      </div>

      {/*For Phone Screens */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          {user && (
            <>
              {/* Mobile role-based navigation */}
              {hasRole && hasRole(ROLES?.EDUCATOR) ? (
                <button 
                  onClick={() => navigate('/educator')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/request-educator-access')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Admin
                </button>
              )}
              <Link to="/my-enrollements" className="hover:text-blue-600 transition-colors">Courses</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="User" className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
