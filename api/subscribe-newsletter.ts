import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body as { email?: string }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ message: 'Server not configured' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { error } = await supabase
      .from('"Newsletter"')
      .insert([{ email, created_at: new Date().toISOString() }])

    if (error) {
      const code = (error as any).code
      const msg = String((error as any).message || '')
      const hint = (error as any).hint
      console.error('Supabase insert error:', { code, msg, hint })
      if (code === '23505' || msg.toLowerCase().includes('duplicate')) {
        return res.status(409).json({ message: 'This email is already subscribed' })
      }
      return res.status(500).json({ message: 'Failed to subscribe', details: msg, hint })
    }

    return res.status(200).json({ message: 'Subscribed successfully' })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ message: 'Failed to subscribe' })
  }
}

