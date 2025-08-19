import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import crypto from 'crypto'
import { jwtVerify } from 'jose'

declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, { code: string; exp: number }> | undefined
}

const COOKIE_NAME = 'himgiri_session'

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Server not configured')
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

function getMailer() {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || smtpUser
  if (!smtpUser || !smtpPass) throw new Error('Email is not configured')
  const transporter = nodemailer.createTransporter({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } })
  return { transporter, smtpFrom }
}

function ok(res: any, body: any) { res.status(200).json(body) }
function bad(res: any, msg: string) { res.status(400).json({ message: msg }) }
function err(res: any, msg: string, details?: any) { res.status(500).json({ message: msg, details }) }

export default async function handler(req: any, res: any) {
  console.log('Auth API called:', { 
    method: req.method, 
    url: req.url, 
    query: req.query, 
    hasCode: !!req.query?.code,
    hasState: !!req.query?.state 
  })
  
  // Check if this is a Google OAuth callback (has code parameter)
  if (req.query?.code && req.query?.state) {
    console.log('Processing Google OAuth callback')
    // This is a Google OAuth callback, handle it directly
    const { code, state } = req.query
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const authOrigin = process.env.AUTH_ORIGIN
    
    console.log('OAuth config check:', { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret, 
      authOrigin 
    })
    
    if (!clientId || !clientSecret || !authOrigin) {
      console.error('OAuth not configured:', { clientId: !!clientId, clientSecret: !!clientSecret, authOrigin })
      return res.status(500).json({ message: 'Google OAuth not configured' })
    }
    
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: `${authOrigin}/api/auth`
        })
      })
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', await tokenResponse.text())
        return res.status(500).json({ message: 'Failed to exchange code for token' })
      }
      
      const tokenData = await tokenResponse.json()
      
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      
      if (!userResponse.ok) {
        console.error('User info failed:', await userResponse.text())
        return res.status(500).json({ message: 'Failed to get user info' })
      }
      
      const userData = await userResponse.json()
      console.log('Google user data:', userData)
      
      const supabase = getSupabase()
      const { data: existingUser } = await supabase.from('users').select('id, email, name').eq('email', userData.email).maybeSingle()
      
      if (existingUser) {
        console.log('Existing user found, logging in:', existingUser.email)
        const jwtSecret = process.env.AUTH_SECRET
        if (!jwtSecret) return res.status(500).json({ message: 'Server not configured' })
        const token = await new SignJWT({ sub: String(existingUser.id), email: existingUser.email, name: existingUser.name || '' })
          .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(new TextEncoder().encode(jwtSecret))
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
        // Redirect to home page with success message
        return res.redirect(`${authOrigin}/?login=success&provider=google`)
      } else {
        console.log('New user from Google, creating account:', userData.email)
        // Create new user in Supabase with basic fields
        const { data: newUser, error: createError } = await supabase.from('users').insert([{
          email: userData.email,
          name: userData.name || userData.email.split('@')[0]
        }]).select('id, email, name').single()
        
        if (createError) {
          console.error('Failed to create user:', createError)
          console.error('Error details:', JSON.stringify(createError, null, 2))
          return res.status(500).json({ 
            message: 'Failed to create user account', 
            error: createError.message,
            details: createError
          })
        }
        
        console.log('New user created successfully:', newUser)
        const jwtSecret = process.env.AUTH_SECRET
        if (!jwtSecret) return res.status(500).json({ message: 'Server not configured' })
        const token = await new SignJWT({ sub: String(newUser.id), email: newUser.email, name: newUser.name || '' })
          .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(new TextEncoder().encode(jwtSecret))
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
        // Redirect to home page with success message for new user
        return res.redirect(`${authOrigin}/?login=success&provider=google&newuser=true`)
      }
    } catch (error) {
      console.error('Google OAuth error:', error)
      return res.status(500).json({ message: 'OAuth processing failed' })
    }
  }
  
  // If no action provided, show available actions
  const action = (req.query?.action || req.body?.action || '').toString()
  if (!action) {
    return res.status(200).json({ 
      message: "Himgiri Naturals Auth API",
      available_actions: [
        "signup", "login", "logout", 
        "otp.send", "otp.verify", 
        "google.start"
      ],
      usage: "Add ?action=ACTION_NAME to use this endpoint",
      example: "/api/auth?action=google.start"
    })
  }
  
  try {
    switch (action) {
      // Email/Password Auth
      case 'signup': {
        const { name = '', email, password } = req.body || {}
        if (!email || !password) return bad(res, 'Email and password required')
        const supabase = getSupabase()
        const password_hash = await bcrypt.hash(password, 10)
        const { error } = await supabase.from('users').insert([{ email, password_hash, name }])
        if (error) {
          if ((error as any).code === '23505') return res.status(409).json({ message: 'Email already exists' })
          return err(res, 'Signup failed')
        }
        return ok(res, { ok: true })
      }

      case 'login': {
        const { email, password } = req.body || {}
        if (!email || !password) return bad(res, 'Email and password required')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('users').select('id, email, name, password_hash').eq('email', email).maybeSingle()
        if (error || !data) return res.status(401).json({ message: 'Invalid credentials' })
        const okPwd = await bcrypt.compare(password, (data as any).password_hash)
        if (!okPwd) return res.status(401).json({ message: 'Invalid credentials' })
        const jwtSecret = process.env.AUTH_SECRET
        if (!jwtSecret) return err(res, 'Server not configured')
        const token = await new SignJWT({ sub: String(data.id), email: data.email, name: data.name || '' })
          .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(new TextEncoder().encode(jwtSecret))
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
        return ok(res, { ok: true, user: { id: data.id, email: data.email, name: data.name } })
      }

      case 'logout': {
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
        return ok(res, { ok: true })
      }

      // OTP System
      case 'otp.send': {
        const email = req.body?.email as string
        if (!email || !email.includes('@')) return bad(res, 'Valid email required')
        const { transporter, smtpFrom } = getMailer()
        const otp = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
        global.__otpStore = global.__otpStore || new Map<string, { code: string; exp: number }>()
        global.__otpStore.set(email, { code: otp, exp: Date.now() + 5 * 60 * 1000 })
        await transporter.sendMail({ from: smtpFrom, to: email, subject: 'Your Himgiri Naturals OTP', text: `Your OTP is ${otp}. It expires in 5 minutes.` })
        return ok(res, { message: 'OTP sent' })
      }

      case 'otp.verify': {
        const { email, code } = req.body || {}
        if (!email || !code) return bad(res, 'Email and code are required')
        const entry = global.__otpStore?.get(email)
        if (!entry) return bad(res, 'OTP not found')
        if (Date.now() > entry.exp) return bad(res, 'OTP expired')
        if (entry.code !== code) return bad(res, 'Invalid OTP')
        global.__otpStore?.delete(email)
        return ok(res, { ok: true })
      }

      // Google OAuth
      case 'google.start': {
        const clientId = process.env.GOOGLE_CLIENT_ID
        const authOrigin = process.env.AUTH_ORIGIN
        if (!clientId || !authOrigin) return err(res, 'Google OAuth not configured')
        
        // Use a simpler redirect URI that Google can handle
        const redirectUri = `${authOrigin}/api/auth`
        const scope = 'email profile'
        const state = Math.random().toString(36).substring(7)
        
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`
        return res.redirect(url)
      }

      case 'google.finish': {
        // This handles the redirect from React app after OAuth
        const { success, email, name, provider } = req.query || {}
        if (success === 'true') {
          return ok(res, { 
            message: 'Google OAuth successful',
            user: { email, name, provider }
          })
        } else {
          return bad(res, 'Google OAuth failed')
        }
      }

      case 'check-auth': {
        // Check if user is authenticated from cookie
        const cookies = req.headers.cookie || ''
        const sessionCookie = cookies.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
        
        if (!sessionCookie) {
          return res.status(401).json({ message: 'Not authenticated' })
        }
        
        try {
          const token = sessionCookie.split('=')[1]
          const jwtSecret = process.env.AUTH_SECRET
          if (!jwtSecret) return res.status(500).json({ message: 'Server not configured' })
          
          // Verify and decode JWT token
          const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret))
          
          return ok(res, { 
            user: {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              provider: 'google'
            }
          })
        } catch (error) {
          console.error('JWT verification failed:', error)
          return res.status(401).json({ message: 'Invalid token' })
        }
      }

      default:
        return bad(res, 'Unknown action')
    }
  } catch (e: any) {
    console.error('auth api error:', e)
    return err(res, 'Internal error', e?.message || String(e))
  }
}