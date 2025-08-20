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
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } })
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
        
        // Send login welcome message for Google OAuth login
        try {
          console.log('Attempting to send Google OAuth login welcome email to:', existingUser.email)
          const { transporter, smtpFrom } = getMailer()
          console.log('Mailer configured successfully for Google OAuth, smtpFrom:', smtpFrom)
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #2d5a27; margin-bottom: 20px;">Welcome Back! 🌿</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${existingUser.name || existingUser.email.split('@')[0]},</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">🎉 Great to see you again!</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">You've successfully logged into your Himgiri Naturals account via Google.</p>
                <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Ready to shop for premium Himalayan dry fruits and nuts!</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Thank you for choosing Himgiri Naturals!</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
              </div>
            </div>`
          
          console.log('Sending Google OAuth login email with transporter...')
          await transporter.sendMail({
            from: smtpFrom,
            to: existingUser.email,
            subject: 'Welcome Back - Himgiri Naturals 🌿',
            html
          })
          
          console.log('Google OAuth login welcome email sent successfully to:', existingUser.email)
        } catch (emailError) {
          console.error('Google OAuth login welcome email failed:', emailError)
          // Don't fail the login if welcome email fails
        }
        
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
        
        // Send welcome message for new Google OAuth user
        try {
          console.log('Attempting to send new Google OAuth user welcome email to:', newUser.email)
          const { transporter, smtpFrom } = getMailer()
          console.log('Mailer configured successfully for new Google OAuth user, smtpFrom:', smtpFrom)
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #2d5a27; margin-bottom: 20px;">Welcome to Himgiri Naturals! 🌿</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${newUser.name || newUser.email.split('@')[0]},</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">🎉 Welcome to the Himgiri Naturals family!</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Your account has been successfully created and you're now logged in via Google.</p>
                <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Ready to explore premium Himalayan dry fruits and nuts!</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Thank you for choosing Himgiri Naturals!</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
              </div>
            </div>`
          
          console.log('Sending new Google OAuth user welcome email with transporter...')
          await transporter.sendMail({
            from: smtpFrom,
            to: newUser.email,
            subject: 'Welcome to Himgiri Naturals! 🌿',
            html
          })
          
          console.log('New Google OAuth user welcome email sent successfully to:', newUser.email)
        } catch (emailError) {
          console.error('New Google OAuth user welcome email failed:', emailError)
          // Don't fail the login if welcome email fails
        }
        
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
        
        // Check if user already exists
        const supabase = getSupabase()
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
        if (existingUser) {
          return res.status(409).json({ message: 'Email already exists. Please login instead.' })
        }
        
        // Generate verification code
        const verificationCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
        const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        
        // Hash password and create user with verification status
        const password_hash = await bcrypt.hash(password, 10)
        const { data: newUser, error: createError } = await supabase.from('users').insert([{ 
          email, 
          password_hash, 
          name,
          email_verified: false,
          verification_code: verificationCode,
          verification_expires: verificationExpiry.toISOString()
        }]).select('id, email, name').single()
        
        if (createError) {
          console.error('User creation error:', createError)
          return err(res, 'Failed to create account')
        }
        
        // Send verification email
        try {
          const { transporter, smtpFrom } = getMailer()
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #2d5a27; margin-bottom: 20px;">Verify Your Email Address</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${name},</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Thank you for signing up with Himgiri Naturals! Please use the verification code below to complete your registration:</p>
                <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
                  ${verificationCode}
                </div>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">This code will expire in 10 minutes.</p>
                <p style="color: #555; line-height: 1.6;">If you didn't create this account, please ignore this email.</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
              </div>
            </div>`
          
          await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject: 'Verify Your Email - Himgiri Naturals',
            html
          })
          
          return ok(res, { 
            message: 'Account created! Please check your email for verification code.',
            requiresVerification: true,
            userId: newUser.id
          })
        } catch (emailError) {
          console.error('Verification email failed:', emailError)
          // Delete the user if email fails
          await supabase.from('users').delete().eq('id', newUser.id)
          return err(res, 'Account creation failed - email service error')
        }
      }

      case 'verify-email': {
        const { userId, code } = req.body || {}
        if (!userId || !code) return bad(res, 'User ID and verification code required')
        
        const supabase = getSupabase()
        const { data: user, error: fetchError } = await supabase.from('users')
          .select('id, email, name, verification_code, verification_expires')
          .eq('id', userId)
          .maybeSingle()
        
        if (fetchError || !user) return err(res, 'User not found')
        
        // Check if code matches and hasn't expired
        if (user.verification_code !== code) {
          return res.status(400).json({ message: 'Invalid verification code' })
        }
        
        if (new Date(user.verification_expires) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired' })
        }
        
        // Mark email as verified and clear verification data
        const { error: updateError } = await supabase.from('users')
          .update({ 
            email_verified: true, 
            verification_code: null, 
            verification_expires: null 
          })
          .eq('id', userId)
        
        if (updateError) return err(res, 'Failed to verify email')
        
        // Send welcome email after successful verification
        try {
          const { transporter, smtpFrom } = getMailer()
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #2d5a27; margin-bottom: 20px;">Welcome to Himgiri Naturals! 🌿</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${user.name || user.email.split('@')[0]},</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">🎉 Your email has been verified successfully!</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">You can now login to your account and start shopping for premium Himalayan dry fruits and nuts.</p>
                <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Your account is now active!</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Thank you for choosing Himgiri Naturals!</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
              </div>
            </div>`
          
          await transporter.sendMail({
            from: smtpFrom,
            to: user.email,
            subject: 'Welcome to Himgiri Naturals! 🎉',
            html
          })
          
          console.log('Welcome email sent successfully to:', user.email)
        } catch (emailError) {
          console.error('Welcome email failed:', emailError)
          // Don't fail the verification if welcome email fails
        }
        
        return ok(res, { message: 'Email verified successfully! You can now login.' })
      }

      case 'login': {
        const { email, password } = req.body || {}
        if (!email || !password) return bad(res, 'Email and password required')
        
        const supabase = getSupabase()
        const { data, error } = await supabase.from('users')
          .select('id, email, name, password_hash, email_verified')
          .eq('email', email)
          .maybeSingle()
        
        if (error || !data) {
          return res.status(401).json({ message: 'Invalid email or password' })
        }
        
        // Check if email is verified
        if (!data.email_verified) {
          return res.status(403).json({ 
            message: 'Please verify your email before logging in. Check your inbox for the verification code.',
            requiresVerification: true,
            userId: data.id
          })
        }
        
        // Verify password
        const okPwd = await bcrypt.compare(password, (data as any).password_hash)
        if (!okPwd) {
          return res.status(401).json({ message: 'Invalid email or password' })
        }
        
        // Create JWT token
        const jwtSecret = process.env.AUTH_SECRET
        if (!jwtSecret) return err(res, 'Server not configured')
        
        const token = await new SignJWT({ 
          sub: String(data.id), 
          email: data.email, 
          name: data.name || '' 
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(new TextEncoder().encode(jwtSecret))
        
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
        
        // Send login welcome message for every session
        try {
          console.log('Attempting to send login welcome email to:', data.email)
          const { transporter, smtpFrom } = getMailer()
          console.log('Mailer configured successfully, smtpFrom:', smtpFrom)
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #2d5a27; margin-bottom: 20px;">Welcome Back! 🌿</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${data.name || data.email.split('@')[0]},</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">🎉 Great to see you again!</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">You've successfully logged into your Himgiri Naturals account.</p>
                <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Ready to shop for premium Himalayan dry fruits and nuts!</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Thank you for choosing Himgiri Naturals!</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
              </div>
            </div>`
          
          console.log('Sending email with transporter...')
          await transporter.sendMail({
            from: smtpFrom,
            to: data.email,
            subject: 'Welcome Back - Himgiri Naturals 🌿',
            html
          })
          
          console.log('Login welcome email sent successfully to:', data.email)
        } catch (emailError) {
          console.error('Login welcome email failed:', emailError)
          // Don't fail the login if welcome email fails
        }
        
        return ok(res, { 
          ok: true, 
          user: { id: data.id, email: data.email, name: data.name } 
        })
      }

      case 'logout': {
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
        return ok(res, { ok: true })
      }

      case 'logout-email': {
        const { email, name } = req.body || {}
        if (!email) return bad(res, 'Email required')
        
        console.log('Logout email requested for:', { email, name })
        
        try {
          console.log('Attempting to send logout email to:', email)
          const { transporter, smtpFrom } = getMailer()
          console.log('Mailer configured successfully for logout, smtpFrom:', smtpFrom)
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #2d5a27; margin-bottom: 20px;">See You Soon! 👋</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${name || email.split('@')[0]},</p>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">You've successfully logged out of your Himgiri Naturals account.</p>
                <div style="background-color: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Thank you for visiting us today!</p>
                </div>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">We hope you enjoyed your shopping experience.</p>
                <p style="color: #555; line-height: 1.6;">Come back soon for more premium Himalayan dry fruits and nuts!</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
              </div>
            </div>`
          
          console.log('Sending logout email with transporter...')
          await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject: 'Goodbye - Himgiri Naturals 👋',
            html
          })
          
          console.log('Logout email sent successfully to:', email)
          return ok(res, { ok: true })
        } catch (emailError) {
          console.error('Logout email failed:', emailError)
          return err(res, 'Failed to send logout email')
        }
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
        try {
          const cookies = req.headers.cookie || '';
          const sessionCookie = cookies.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
          
          if (!sessionCookie) {
            return res.status(401).json({ message: 'No session found' });
          }
          
          const token = sessionCookie.split('=')[1];
          const jwtSecret = process.env.AUTH_SECRET;
          
          if (!jwtSecret) {
            return res.status(500).json({ message: 'Server not configured' });
          }
          
          // Verify JWT token
          const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
          
          if (!payload.sub) {
            return res.status(401).json({ message: 'Invalid token' });
          }
          
          // Get user data from Supabase
          const supabase = getSupabase();
          const { data: user, error } = await supabase.from('users')
            .select('id, email, name')
            .eq('id', payload.sub)
            .maybeSingle();
          
          if (error || !user) {
            return res.status(401).json({ message: 'User not found' });
          }
          
          return ok(res, { 
            user: { 
              id: user.id, 
              email: user.email, 
              name: user.name 
            } 
          });
        } catch (error) {
          console.error('Auth check error:', error);
          return res.status(401).json({ message: 'Authentication failed' });
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