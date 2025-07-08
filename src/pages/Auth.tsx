
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  // Show first admin setup if no admin exists
  if (adminExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <FirstAdminSetup onAdminCreated={refetchAdminStatus} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/29f409d4-c2a9-4ea6-bca2-cd311948bf55.png" 
            alt="Logo da Empresa" 
            className="h-32 w-auto mx-auto mb-6 transition-transform hover:scale-105" 
          />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo ao Sistema
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta para começar'}
          </p>
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
