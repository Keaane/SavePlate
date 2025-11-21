import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grcmegnnsowdzrysnphz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyY21lZ25uc293ZHpyeXNucGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODAzNzUsImV4cCI6MjA3ODQ1NjM3NX0._gDfx4gYwR6qVToDUf2CvpewHhj_MpN3EHpPiEKcj2g'

console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey ? 'Loaded' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)