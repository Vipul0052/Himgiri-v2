import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'

export function useNewsletter() {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const subscribe = async (email: string) => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error')
      return false
    }

    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('newsletter')
        .insert([{ email }])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          showToast('This email is already subscribed!', 'info')
        } else {
          console.error('Newsletter subscription error:', error)
          showToast('Failed to subscribe. Please try again.', 'error')
        }
        return false
      }

      showToast('Successfully subscribed to newsletter!', 'success')
      return true
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      showToast('Failed to subscribe. Please try again.', 'error')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    subscribe,
    isLoading
  }
}