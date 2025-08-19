import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const cookieName = 'himgiri_session'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
    const jwtSecret = process.env.AUTH_SECRET
    if (!supabaseUrl || !serviceRoleKey || !jwtSecret) return res.status(500).json({ message: 'Server not configured' })
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

    const { data, error } = await supabase.from('users').select('id, email, name, password_hash').eq('email', email).maybeSingle()
    if (error || !data) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, data.password_hash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = await new SignJWT({ sub: String(data.id), email: data.email, name: data.name || '' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(jwtSecret))

    res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*7}`)
    res.status(200).json({ ok: true, user: { id: data.id, email: data.email, name: data.name } })
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ message: 'Login failed' })
  }
}

