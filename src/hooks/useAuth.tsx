
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkAdminRole: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('=== FETCH PROFILE: Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      console.log('=== FETCH PROFILE: Query result:', { data, error });

      if (error) {
        console.error('=== FETCH PROFILE: Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('=== FETCH PROFILE: No profile found for user:', userId);
        return null;
      }

      console.log('=== FETCH PROFILE: Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('=== FETCH PROFILE: Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('Initial session:', initialSession?.user?.email || 'No session');
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Fetch profile if user exists
          if (initialSession?.user) {
            console.log('=== INITIAL SESSION: Fetching profile for existing session user:', initialSession.user.id);
            const userProfile = await fetchUserProfile(initialSession.user.id);
            if (mounted) {
              console.log('=== INITIAL SESSION: Setting profile:', userProfile);
              setProfile(userProfile);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user signs in OR when we detect initial session
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          console.log('=== AUTH EVENT: Fetching profile for event:', event, 'user:', session.user.id);
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            console.log('=== AUTH EVENT: Setting profile:', userProfile);
            setProfile(userProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  const checkAdminRole = () => {
    // Check admin role from profile
    console.log('checkAdminRole called - profile:', profile);
    return profile?.role === 'admin';
  };

  console.log('Auth state:', { 
    user: user?.email || 'undefined', 
    loading, 
    profile: profile ? { email: profile.email, role: profile.role } : 'undefined',
    isAdmin: checkAdminRole()
  });

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signOut,
      checkAdminRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
