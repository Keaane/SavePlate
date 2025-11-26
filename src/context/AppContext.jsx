import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const AppContext = createContext();

const initialState = {
  user: null,
  profile: null,
  loading: true
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_AUTH_COMPLETE':
      return { 
        ...state, 
        user: action.payload.user, 
        profile: action.payload.profile, 
        loading: false 
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    // Routes that don't require auth
    const isPublicRoute = (path) => {
      return path === '/' || 
             path === '/auth' || 
             path === '/about' ||
             path.startsWith('/vendors/');
    };

    // Routes that authenticated users can access regardless of role
    const isSharedRoute = (path) => {
      return path === '/profile';
    };
    
    const fetchProfile = async (userId) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
          return null;
        }
        
        return profile;
      } catch (err) {
        console.error('Profile fetch exception:', err);
        return null;
      }
    };
    
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (isMounted) dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        if (session?.user) {
          if (isMounted) dispatch({ type: 'SET_USER', payload: session.user });
          
          const profile = await fetchProfile(session.user.id);
          if (profile && isMounted) {
            dispatch({ type: 'SET_PROFILE', payload: profile });
          }
        }
        
        if (isMounted) dispatch({ type: 'SET_LOADING', payload: false });
      } catch (err) {
        console.error('Auth init error:', err);
        if (isMounted) dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
        
        const profile = await fetchProfile(session.user.id);
        if (profile && isMounted) {
          dispatch({ type: 'SET_PROFILE', payload: profile });
          
          // Only redirect if on auth page
          if (location.pathname === '/auth') {
            const targetPath = profile.role === 'vendor' 
              ? (profile.verification_status === 'verified' || profile.is_verified ? '/vendors' : '/vendor-onboarding')
              : '/students';
            navigate(targetPath, { replace: true });
          }
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
        navigate('/auth', { replace: true });
      } else if (event === 'TOKEN_REFRESHED') {
        // Just refresh the session, no redirect needed
        if (session?.user && isMounted) {
          dispatch({ type: 'SET_USER', payload: session.user });
        }
      }
    });
    
    initAuth();
    
    // Safety timeout - ensure loading ends
    const timeout = setTimeout(() => {
      if (isMounted && state.loading) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, 3000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout even if API fails
      dispatch({ type: 'LOGOUT' });
      navigate('/auth', { replace: true });
    }
  };

  return (
    <AppContext.Provider value={{ ...state, dispatch, auth: { signOut } }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
