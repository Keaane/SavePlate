import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    let hasInitialized = false;
    
    const isPublicRoute = (path) => {
      return path === '/' || 
             path === '/auth' || 
             path.startsWith('/vendors/') ||
             path.startsWith('/about') ||
             path.startsWith('/contact');
    };
    
    const fetchAndSetProfile = async (userId, userMetadata = {}) => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            try {
              const role = userMetadata.role || 'student';
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  role,
                  full_name: userMetadata.full_name || userMetadata.email?.split('@')[0] || 'User',
                  verification_status: 'pending'
                })
                .select()
                .single();
              
              if (createError) return null;
              
              if (newProfile && isMounted) {
                dispatch({ type: 'SET_PROFILE', payload: newProfile });
                return newProfile;
              }
            } catch (createErr) {
              return null;
            }
          }
          return null;
        }
        
        if (profile && isMounted) {
          dispatch({ type: 'SET_PROFILE', payload: profile });
          return profile;
        }
        
        return null;
      } catch (err) {
        return null;
      }
    };
    
    const handleRedirect = (profile, currentPath) => {
      if (!profile || !isMounted) return;
      
      if (isPublicRoute(currentPath)) return;
      
      let targetPath;
      if (profile.role === 'vendor') {
        const isVerified = profile.verification_status === 'verified' || 
                          profile.is_verified === true ||
                          (profile.verification_status !== 'pending' && 
                           profile.verification_status !== 'rejected' && 
                           profile.verification_status !== 'suspended' &&
                           profile.verification_status != null &&
                           profile.verification_status !== undefined &&
                           profile.verification_status !== '');
        
        if (isVerified) {
          targetPath = '/vendors';
          if (currentPath === '/vendor-onboarding') {
            navigate('/vendors', { replace: true });
            return;
          }
        } else {
          targetPath = '/vendor-onboarding';
        }
      } else {
        targetPath = '/students';
      }
      
      if (currentPath !== targetPath && 
          currentPath !== '/' && 
          currentPath !== '/vendor-onboarding' && 
          currentPath !== '/auth' &&
          !currentPath.startsWith('/vendors/')) {
        navigate(targetPath, { replace: true });
      }
    };
    
    const initializeSession = async () => {
      if (hasInitialized || !isMounted) return;
      hasInitialized = true;
      
      try {
        const currentPath = window.location.pathname;
        
        if (isPublicRoute(currentPath)) {
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }
        
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 2000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]).catch(() => ({ data: { session: null }, error: null }));
        
        if (!isMounted) return;
        
        if (session && session.user) {
          dispatch({ type: 'SET_USER', payload: session.user });
          
          const profile = await fetchAndSetProfile(
            session.user.id,
            session.user.user_metadata || {}
          );
          
          if (profile) {
            handleRedirect(profile, currentPath);
          }
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        if (timeoutId) clearTimeout(timeoutId);
      } catch (err) {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session && session.user) {
          dispatch({ type: 'SET_USER', payload: session.user });
          
          const profile = await fetchAndSetProfile(
            session.user.id, 
            session.user.user_metadata || {}
          );
          
          if (profile) {
            handleRedirect(profile, window.location.pathname);
          } else if (session.user.user_metadata?.role === 'vendor') {
            navigate('/vendor-onboarding', { replace: true });
          } else {
            navigate('/students', { replace: true });
          }
          
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_PROFILE', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
        if (timeoutId) clearTimeout(timeoutId);
      } else if (event === 'TOKEN_REFRESHED') {
        if (timeoutId) clearTimeout(timeoutId);
      }
    });
    
    initializeSession();
    
    timeoutId = setTimeout(() => {
      if (isMounted) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, 2000);
    
    return () => {
      isMounted = false;
      hasInitialized = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_PROFILE', payload: null });
    navigate('/auth');
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
