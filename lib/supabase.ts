import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://irnoyioumxfrtorawjtf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlybm95aW91bXhmcnRvcmF3anRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzczNjAsImV4cCI6MjA3MTExMzM2MH0.29ysDGhiqjpsS4esKXVLY8jLXeFGFkoTjMtVnCaJtlY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface NewsletterSubscription {
  id: string
  email: string
  created_at: string
}