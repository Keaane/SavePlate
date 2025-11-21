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
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          dispatch({ type: 'SET_USER', payload: session.user });
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            dispatch({ type: 'SET_PROFILE', payload: profile });
            // ✅ CRITICAL FIX: Set loading to false AFTER profile is loaded
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Only redirect if not already on the correct page
            const currentPath = window.location.pathname;
            const targetPath = profile.role === 'vendor' ? '/vendors' : '/students';
            if (currentPath !== targetPath && currentPath !== '/') {
              navigate(targetPath, { replace: true });
            }
          } else {
            // Create minimal profile
            const role = session.user.user_metadata?.role || 'student';
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                role,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                verification_status: 'pending'
              })
              .select()
              .single();
            
            dispatch({ type: 'SET_PROFILE', payload: newProfile });
            // ✅ CRITICAL FIX: Set loading to false AFTER profile creation
            dispatch({ type: 'SET_LOADING', payload: false });
            
            navigate(role === 'vendor' ? '/vendors' : '/students', { replace: true });
          }
        } else {
          // ✅ No session - set loading to false
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Init error:', error);
        // ✅ On error - set loading to false
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    init();

    // ✅ BONUS: Add auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        dispatch({ type: 'SET_USER', payload: session.user });
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        dispatch({ type: 'SET_PROFILE', payload: profile });
        dispatch({ type: 'SET_LOADING', payload: false });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_PROFILE', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => subscription?.unsubscribe();
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