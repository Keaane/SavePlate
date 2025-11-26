// src/context/AppContext.jsx
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
    
    // Check if current path is a public route (doesn't require auth)
    const isPublicRoute = (path) => {
      return path === '/' || 
             path === '/auth' || 
             path.startsWith('/vendors/') || // Vendor detail pages are public
             path.startsWith('/about') ||
             path.startsWith('/contact');
    };
    
    // Helper function to fetch and set profile
    const fetchAndSetProfile = async (userId, userMetadata = {}) => {
      try {
        console.log('AppContext: Fetching profile for user:', userId);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('AppContext: Profile fetch error:', profileError);
          
          // If profile doesn't exist, create it
          if (profileError.code === 'PGRST116') {
            try {
              const role = userMetadata.role || 'student';
              console.log('AppContext: Creating new profile with role:', role);
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
              
              if (createError) {
                console.error('AppContext: Profile creation error:', createError);
                return null;
              }
              
              if (newProfile && isMounted) {
                dispatch({ type: 'SET_PROFILE', payload: newProfile });
                return newProfile;
              }
            } catch (createErr) {
              console.error('AppContext: Profile creation failed:', createErr);
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
        console.error('AppContext: Error in fetchAndSetProfile:', err);
        return null;
      }
    };
    
    // Helper function to handle redirects based on profile
    const handleRedirect = (profile, currentPath) => {
      if (!profile || !isMounted) return;
      
      // Don't redirect if on a public route
      if (isPublicRoute(currentPath)) {
        console.log('AppContext: On public route, skipping redirect');
        return;
      }
      
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
        
        console.log('AppContext - Vendor verification check:', {
          verification_status: profile.verification_status,
          is_verified: profile.is_verified,
          isVerified: isVerified,
          currentPath
        });
        
        if (isVerified) {
          targetPath = '/vendors';
          if (currentPath === '/vendor-onboarding') {
            console.log('AppContext: Verified vendor on onboarding, redirecting to /vendors');
            navigate('/vendors', { replace: true });
            return;
          }
        } else {
          targetPath = '/vendor-onboarding';
        }
      } else {
        targetPath = '/students';
      }
      
      // Redirect if needed (only for non-public routes)
      if (currentPath !== targetPath && 
          currentPath !== '/' && 
          currentPath !== '/vendor-onboarding' && 
          currentPath !== '/auth' &&
          !currentPath.startsWith('/vendors/')) {
        console.log('AppContext: Redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
      }
    };
    
    // Check for existing session immediately (don't wait for INITIAL_SESSION event)
    const initializeSession = async () => {
      if (hasInitialized || !isMounted) return;
      hasInitialized = true;
      
      try {
        const currentPath = window.location.pathname;
        console.log('AppContext: Checking for existing session on path:', currentPath);
        
        // If on a public route, clear loading immediately
        if (isPublicRoute(currentPath)) {
          console.log('AppContext: Public route detected, clearing loading');
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }
        
        // Try to get session with timeout
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
          console.log('AppContext: Existing session found, loading profile');
          dispatch({ type: 'SET_USER', payload: session.user });
          
          const profile = await fetchAndSetProfile(
            session.user.id,
            session.user.user_metadata || {}
          );
          
          if (profile) {
            handleRedirect(profile, currentPath);
          }
        } else {
          console.log('AppContext: No existing session');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        if (timeoutId) clearTimeout(timeoutId);
      } catch (err) {
        console.error('AppContext: Session initialization error:', err);
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    // ✅ Set up auth state listener - this is the primary way to detect auth state
    console.log('AppContext: Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AppContext: Auth state changed:', event, session ? 'with session' : 'no session');
      
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
            // New vendor - redirect to onboarding
            navigate('/vendor-onboarding', { replace: true });
          } else {
            navigate('/students', { replace: true });
          }
          
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
        } else {
          // No session
          console.log('AppContext: No session found');
          dispatch({ type: 'SET_LOADING', payload: false });
          if (timeoutId) clearTimeout(timeoutId);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AppContext: User signed out');
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_PROFILE', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
        if (timeoutId) clearTimeout(timeoutId);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('AppContext: Token refreshed');
        if (timeoutId) clearTimeout(timeoutId);
      }
    });
    
    // Initialize session immediately
    initializeSession();
    
    // Safety timeout - ensure loading is set to false after 2 seconds max (reduced from 5)
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('AppContext initialization timeout - forcing loading to false');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, 2000);
    
    // Cleanup function - combines both cleanup functions
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
