
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <img 
            src="/lovable-uploads/29f409d4-c2a9-4ea6-bca2-cd311948bf55.png" 
            alt="Logo da Empresa" 
            className="h-64 w-auto mx-auto mb-2" 
          />
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
