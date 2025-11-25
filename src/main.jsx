import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { testSupabaseConnection } from './utils/testSupabase.js'

// Test Supabase connection on app start
testSupabaseConnection();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)