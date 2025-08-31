import { useState } from 'react'
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
      const resp = await fetch('/api/app?action=newsletter.subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })

      if (resp.status === 409) {
        showToast('This email is already subscribed!', 'info')
        return false
      }

      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.error('Newsletter subscription error:', text)
        showToast('Failed to subscribe. Please try again.', 'error')
        return false
      }

      // Fire-and-forget welcome email
      fetch('/api/app?action=email.welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => {})

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