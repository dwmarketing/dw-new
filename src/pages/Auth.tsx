
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { FirstAdminSetup } from '@/components/auth/FirstAdminSetup';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const { adminExists, loading: adminLoading, refetchAdminStatus } = useAdminCheck();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Show first admin setup if no admin exists
  if (adminExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <FirstAdminSetup onAdminCreated={refetchAdminStatus} />
      </div>
    );
  }

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
