import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignIn afterSignInUrl="/role-selector" afterSignUpUrl="/role-selector" />
    </div>
  )
}

export default LoginPage