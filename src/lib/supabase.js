import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://grcmegnnsowdzrysnphz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyY21lZ25uc293ZHpyeXNucGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODAzNzUsImV4cCI6MjA3ODQ1NjM3NX0._gDfx4gYwR6qVToDUf2CvpewHhj_MpN3EHpPiEKcj2g'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)