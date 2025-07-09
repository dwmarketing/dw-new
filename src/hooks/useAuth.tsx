
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ user: User; session: Session; } | { user: null; session: null; }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshSession: async () => ({ user: null, session: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('🔍 Checking admin status for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin');
        
      console.log('🔍 Admin check response:', { data, error });
        
      if (error) {
        console.error('❌ Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      const isUserAdmin = data && data.length > 0;
      console.log('✅ Admin status determined:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('❌ Exception checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        throw error;
      }
      console.log('Session refreshed successfully');
      return data;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // If refresh fails, sign out the user
      await signOut();
      throw error;
    }
  };

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check admin status after setting session
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);

          // Set up token refresh timer (refresh 5 minutes before expiry)
          if (session.expires_at) {
            const expiresIn = session.expires_at * 1000 - Date.now();
            const refreshIn = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000); // 5 min before expiry, minimum 1 min
            
            refreshTimer = setTimeout(async () => {
              try {
                await refreshSession();
              } catch (error) {
                console.error('Auto refresh failed:', error);
              }
            }, refreshIn);
          }
        } else {
          setIsAdmin(false);
          if (refreshTimer) {
            clearTimeout(refreshTimer);
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        // If session exists but is expired, try to refresh
        if (session && session.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('Session expired, attempting refresh...');
          try {
            await refreshSession();
          } catch (error) {
            console.error('Initial refresh failed:', error);
            setLoading(false);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            checkAdminStatus(session.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Show welcome message only on successful login from auth page
    if (!error && window.location.pathname === '/auth') {
      setTimeout(() => {
        toast({
          title: "Bem-vindo!",
          description: "Login realizado com sucesso.",
        });
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }, 500);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
