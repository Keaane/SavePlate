import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

const initialState = {
  user: null,
  profile: null,
  foodItems: [],
  vendors: [],
  cart: [],
  orders: [],
  loading: true,
  userRole: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        userRole: action.payload?.user_metadata?.role || null
      };
    
    case 'SET_PROFILE':
      return { 
        ...state, 
        profile: action.payload,
        userRole: action.payload?.role || null
      };
    
    case 'SET_FOOD_ITEMS':
      return { ...state, foodItems: action.payload };
    
    case 'SET_VENDORS':
      return { ...state, vendors: action.payload };
    
    case 'ADD_TO_CART':
      const existingCartItem = state.cart.find(item => item.id === action.payload);
      if (existingCartItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item
          )
        };
      } else {
        const foodItem = state.foodItems.find(item => item.id === action.payload);
        if (foodItem) {
          return {
            ...state,
            cart: [...state.cart, { ...foodItem, cartQuantity: 1 }]
          };
        }
        return state;
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auth actions
  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: userData.role,
          full_name: userData.fullName
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Check for active session on app start
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch food items
        const { data: foodData } = await supabase
          .from('food_items')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (foodData) {
          dispatch({ type: 'SET_FOOD_ITEMS', payload: foodData });
        }

        // Fetch vendors
        const { data: vendorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'vendor')
          .order('full_name');
        
        if (vendorData) {
          dispatch({ type: 'SET_VENDORS', payload: vendorData });
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    // Safety timeout - wait up to 15 seconds for auth + data
const timeoutId = setTimeout(() => {
  console.warn('Auth/data load timeout — checking session manually...');
  
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      dispatch({ type: 'SET_USER', payload: session.user });
    
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            dispatch({ type: 'SET_PROFILE', payload: profile });
          }
        });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  });
}, 15000); 

    const getSession = async () => {
  try {
    // 1. First, try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }

    // 2. If no session, try to recover from URL (OAuth callback)
    if (!session) {
      const urlParams = new URLSearchParams(window.location.search);
      const access_token = urlParams.get('access_token');
      if (access_token) {
        // Manually set session from OAuth callback
        await supabase.auth.setSession({ access_token, refresh_token: urlParams.get('refresh_token') || '' });
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          dispatch({ type: 'SET_USER', payload: newSession.user });
          console.log('✅ Recovered session from URL');
        }
      }
    } else {
      // 3. Valid session → set user
      dispatch({ type: 'SET_USER', payload: session.user });
      
      // 4. Fetch profile — with timeout!
      const profileTimeout = setTimeout(() => {
        console.warn('Profile fetch timeout — using minimal profile');
        dispatch({ type: 'SET_PROFILE', payload: { id: session.user.id, role: 'student' } });
      }, 8000);
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        clearTimeout(profileTimeout);
        
        if (profileError) {
          console.error('Profile error:', profileError);
          // Create minimal profile
          dispatch({ 
            type: 'SET_PROFILE', 
            payload: { id: session.user.id, role: 'student' } 
          });
        } else {
          dispatch({ type: 'SET_PROFILE', payload: profile });
          console.log('✅ Profile loaded:', profile.role);
        }
      } catch (err) {
        clearTimeout(profileTimeout);
        console.error('Profile fetch failed:', err);
        dispatch({ type: 'SET_PROFILE', payload: { id: session.user.id, role: 'student' } });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

    // invoke the session loader
    getSession();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const value = {
    // State
    user: state.user,
    profile: state.profile,
    foodItems: state.foodItems,
    vendors: state.vendors,
    cart: state.cart,
    orders: state.orders,
    loading: state.loading,
    userRole: state.userRole,
    
    // Dispatch
    dispatch,
    
    // Auth actions
    auth: {
      signUp,
      signIn,
      signOut
    }
  };

  return (
    <AppContext.Provider value={value}>
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