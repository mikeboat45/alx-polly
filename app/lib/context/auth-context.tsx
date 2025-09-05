'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Authentication Context
 * 
 * This context provides authentication state and functions throughout the application.
 * It manages user session data, loading states, and authentication methods.
 * 
 * Context values:
 * - session: The current Supabase session object or null if not authenticated
 * - user: The current authenticated user object or null if not authenticated
 * - signOut: Function to log out the current user
 * - loading: Boolean indicating if the authentication state is being loaded
 */
const AuthContext = createContext<{ 
  session: Session | null;
  user: User | null;
  signOut: () => void;
  loading: boolean;
}>({ 
  session: null, 
  user: null,
  signOut: () => {},
  loading: true,
});

/**
 * Authentication Provider Component
 * 
 * This component wraps the application to provide authentication context.
 * It initializes the Supabase client, manages authentication state, and
 * sets up listeners for auth state changes.
 * 
 * @param children - React components to be wrapped with the auth context
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a memoized Supabase client instance
  const supabase = useMemo(() => createClient(), []);
  
  // State for authentication data
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Flag to prevent state updates if component unmounts
    let mounted = true;
    
    // Function to fetch initial user data
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      if (mounted) {
        // Update state with user data or null if not authenticated
        setUser(data.user ?? null);
        setSession(null);
        setLoading(false);
        console.log('AuthContext: Initial user loaded', data.user);
      }
    };

    // Fetch initial user data
    getUser();

    // Set up listener for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Do not set loading to false here, only after initial load
      console.log('AuthContext: Auth state changed', _event, session, session?.user);
    });

    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Signs out the current user
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  console.log('AuthContext: user', user);
  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the authentication context
 * 
 * This hook provides easy access to the authentication context values
 * throughout the application. It includes the current user, session,
 * loading state, and authentication functions.
 * 
 * @returns The authentication context object
 */
export const useAuth = () => useContext(AuthContext);
