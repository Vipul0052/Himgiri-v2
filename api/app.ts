import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import crypto from 'crypto'

declare global { // simple in-memory OTP store (ephemeral)
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
  const action = (req.query?.action || req.body?.action || '').toString()
  if (!action) return bad(res, 'Missing action')
  try {
    switch (action) {
      // Newsletter
      case 'newsletter.subscribe': {
        const email = req.body?.email as string
        if (!email || !email.includes('@')) return bad(res, 'Valid email is required')
        const supabase = getSupabase()
        const { error } = await supabase.from('Newsletter').insert([{ email, created_at: new Date().toISOString() }])
        if (error) {
          const code = (error as any).code; const msg = String((error as any).message || '')
          if (code === '23505' || msg.toLowerCase().includes('duplicate')) return res.status(409).json({ message: 'This email is already subscribed' })
          return err(res, 'Failed to subscribe', msg)
        }
        return ok(res, { message: 'Subscribed successfully' })
      }

      case 'email.welcome': {
        const email = req.body?.email as string
        if (!email || !email.includes('@')) return bad(res, 'Valid email is required')
        const { transporter, smtpFrom } = getMailer()
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1></div>
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #2d5a27; margin-bottom: 20px;">Welcome to Himgiri Naturals 🌿</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Thanks for subscribing to our newsletter! You'll now get updates, offers, and stories straight to your inbox.</p>
              <p style="color: #555; line-height: 1.6;">Stay tuned for exclusive deals on premium Himalayan nuts, dried fruits, and health tips from nature's finest!</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;"><p>© 2025 Himgiri Naturals. All rights reserved.</p><p>You can unsubscribe anytime by replying to this email.</p></div>
          </div>`
        await transporter.sendMail({ from: smtpFrom, to: email, subject: 'Welcome to Himgiri Naturals! 🌿', html })
        return ok(res, { message: 'Welcome email sent' })
      }

      // Auth: signup/login/logout
      case 'auth.signup': {
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

      case 'auth.login': {
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

      case 'auth.logout': {
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
        return ok(res, { ok: true })
      }

      // OTP send/verify (email)
      case 'auth.otp.send': {
        const email = req.body?.email as string
        if (!email || !email.includes('@')) return bad(res, 'Valid email required')
        const { transporter, smtpFrom } = getMailer()
        const otp = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
        global.__otpStore = global.__otpStore || new Map<string, { code: string; exp: number }>()
        global.__otpStore.set(email, { code: otp, exp: Date.now() + 5 * 60 * 1000 })
        await transporter.sendMail({ from: smtpFrom, to: email, subject: 'Your Himgiri Naturals OTP', text: `Your OTP is ${otp}. It expires in 5 minutes.` })
        return ok(res, { message: 'OTP sent' })
      }

      case 'auth.otp.verify': {
        const { email, code } = req.body || {}
        if (!email || !code) return bad(res, 'Email and code are required')
        const entry = global.__otpStore?.get(email)
        if (!entry) return bad(res, 'OTP not found')
        if (Date.now() > entry.exp) return bad(res, 'OTP expired')
        if (entry.code !== code) return bad(res, 'Invalid OTP')
        global.__otpStore?.delete(email)
        return ok(res, { ok: true })
      }

      // Razorpay
      case 'rzp.order': {
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        if (!keyId || !keySecret) return err(res, 'Razorpay not configured')
        const { amount, currency = 'INR', receipt } = req.body || {}
        if (!amount || amount < 1) return bad(res, 'Valid amount is required')
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const body = { amount, currency, receipt: receipt || `rcpt_${Date.now()}`, payment_capture: 1 }
        const r = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` }, body: JSON.stringify(body) })
        const data = await r.json()
        if (!r.ok) return bad(res, 'Failed to create order')
        return ok(res, { order: data, keyId })
      }

      case 'rzp.verify': {
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        if (!keySecret) return err(res, 'Razorpay not configured')
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return bad(res, 'Missing fields')
        const hmac = crypto.createHmac('sha256', keySecret)
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const digest = hmac.digest('hex')
        if (digest !== razorpay_signature) return bad(res, 'Invalid signature')
        // Save order if payload contains details
        try {
          const supabase = getSupabase()
          const { user_id, email, name, amount, currency = 'INR', items = [], shipping = {}, status = 'paid' } = req.body || {}
          if (email && amount) {
            await supabase.from('orders').insert([{ user_id, email, name, amount, currency, provider: 'razorpay', razorpay_order_id, razorpay_payment_id, razorpay_signature, items, shipping, status }])
          }
        } catch {}
        return ok(res, { ok: true })
      }

      // Orders create (manual)
      case 'orders.create': {
        const supabase = getSupabase()
        const payload = req.body || {}
        const { email, amount, items } = payload
        if (!email || !amount || !Array.isArray(items)) return bad(res, 'Invalid payload')
        
        console.log('Creating order with payload:', JSON.stringify(payload, null, 2))
        const { data, error } = await supabase.from('orders').insert([payload]).select()
        
        if (error) {
          console.error('Order creation error:', error)
          return err(res, 'Failed to record order', error.message)
        }
        
        console.log('Order created successfully:', data)
        return ok(res, { ok: true, order: data })
      }

      case 'ping':
        return ok(res, { ok: true, method: req.method })

      default:
        return bad(res, 'Unknown action')
    }
  } catch (e: any) {
    console.error('app api error:', e)
    return err(res, 'Internal error', e?.message || String(e))
  }
}

