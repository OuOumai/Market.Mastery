import React from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-200 py-4 bg-white">
      <div className="navbar-container flex items-center justify-between w-full">
        <Link to="/" className="navbar-logo">
          <img onClick={() => navigate('/')} src={assets.favicon} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />
        </Link>
        
        <div className="navbar-menu flex items-center gap-5">
          <SignedIn>
            {/* Menu pour utilisateurs connectés */}
            <Link to="/student/courses" className="navbar-item hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <UserButton afterSignOutUrl="/login" />
          </SignedIn>
          
          <SignedOut>
            {/* Menu pour utilisateurs non connectés */}
            <SignInButton mode="modal">
              <button className="sign-in-btn bg-blue-600 text-white px-5 py-2 rounded-full">Sign In</button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
