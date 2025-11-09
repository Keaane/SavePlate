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

    // Safety timeout - ensure loading is set to false after 5 seconds max
    const timeoutId = setTimeout(() => {
      console.warn('Loading timeout reached, forcing loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 5000);

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          clearTimeout(timeoutId);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        if (session) {
          dispatch({ type: 'SET_USER', payload: session.user });
          
          // Fetch user profile
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.error('Error fetching profile:', profileError);
            } else if (profile) {
              dispatch({ type: 'SET_PROFILE', payload: profile });
            }

            // Fetch initial data
            await fetchInitialData();
          } catch (error) {
            console.error('Error fetching profile or initial data:', error);
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        // Always set loading to false, even if there's an error
        clearTimeout(timeoutId);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session) {
            dispatch({ type: 'SET_USER', payload: session.user });
            
            // Fetch user profile
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profileError) {
                console.error('Error fetching profile:', profileError);
              } else if (profile) {
                dispatch({ type: 'SET_PROFILE', payload: profile });
              }

              // Fetch data when user signs in
              if (event === 'SIGNED_IN') {
                await fetchInitialData();
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
            }
          } else {
            dispatch({ type: 'SET_USER', payload: null });
            dispatch({ type: 'SET_PROFILE', payload: null });
            dispatch({ type: 'SET_FOOD_ITEMS', payload: [] });
            dispatch({ type: 'SET_VENDORS', payload: [] });
            dispatch({ type: 'SET_ORDERS', payload: [] });
            dispatch({ type: 'CLEAR_CART' });
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
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