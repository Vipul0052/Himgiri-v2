import { createClient } from '@supabase/supabase-js'
import { SignJWT, jwtVerify } from 'jose'
import nodemailer from 'nodemailer'

const ADMIN_COOKIE = 'himgiri_admin_session'

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

function enforceAdminSubdomain(req: any, res: any) {
  // Allow non-production environments to access without subdomain to ease local/preview dev
  if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_ADMIN_NON_SUBDOMAIN === 'true') {
    return true
  }
  try {
    const host = req.headers['host'] as string | undefined
    if (!host) return
    if (!host.startsWith('admin.')) {
      res.status(403).json({ message: 'Admin access only via admin subdomain' })
      return false
    }
  } catch {}
  return true
}

async function getSession(req: any) {
  const token = (req.cookies?.[ADMIN_COOKIE] || extractCookie(req.headers['cookie'], ADMIN_COOKIE)) as string | undefined
  if (!token) return null
  const secret = process.env.ADMIN_AUTH_SECRET || process.env.AUTH_SECRET
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload as any
  } catch {
    return null
  }
}

function extractCookie(header: any, name: string) {
  if (!header || typeof header !== 'string') return undefined
  const parts = header.split(';').map(p => p.trim())
  const kv = parts.find(p => p.startsWith(name + '='))
  return kv ? kv.substring(name.length + 1) : undefined
}

async function requireAdmin(req: any, res: any) {
  const session = await getSession(req)
  if (!session?.sub) return res.status(401).json({ message: 'Unauthorized' })
  const supabase = getSupabase()
  const { data: user } = await supabase.from('users').select('id, email, role').eq('id', session.sub).maybeSingle()
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  ;(req as any).adminUser = user
  return user
}

export default async function handler(req: any, res: any) {
  if (!enforceAdminSubdomain(req, res)) return

  const action = (req.query?.action || req.body?.action || '').toString()
  if (!action) return ok(res, { message: 'Admin API', actions: [
    'login','logout','session',
    'products.list','products.create','products.update','products.delete',
    'orders.list','orders.update-status',
    'users.list','users.set-role',
    'inventory.list','inventory.set',
    'analytics.overview'
  ] })

  try {
    switch (action) {
      case 'login': {
        const { email, password } = req.body || {}
        if (!email || !password) return bad(res, 'Email and password required')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('users').select('id, email, name, role, password_hash').eq('email', email).maybeSingle()
        if (error || !data || data.role !== 'admin') return res.status(401).json({ message: 'Invalid credentials' })
        const bcrypt = await import('bcryptjs')
        const okPwd = await bcrypt.compare(password, (data as any).password_hash)
        if (!okPwd) return res.status(401).json({ message: 'Invalid credentials' })
        const secret = process.env.ADMIN_AUTH_SECRET || process.env.AUTH_SECRET
        if (!secret) return err(res, 'Server not configured')
        const token = await new SignJWT({ sub: String(data.id), email: data.email, role: 'admin' })
          .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('12h').sign(new TextEncoder().encode(secret))
        res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 12}`)
        return ok(res, { ok: true })
      }

      case 'logout': {
        res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
        return ok(res, { ok: true })
      }

      case 'session': {
        const session = await getSession(req)
        if (!session) return ok(res, { admin: false })
        const supabase = getSupabase()
        const { data: user } = await supabase.from('users').select('id, role, email').eq('id', session.sub).maybeSingle()
        return ok(res, { admin: user?.role === 'admin' })
      }

      // Products
      case 'products.list': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const { data, error } = await supabase.from('products').select('id, name, in_stock, updated_at').order('updated_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch products')
        return ok(res, { products: data })
      }
      case 'products.create': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { name, in_stock = true } = req.body || {}
        if (!name) return bad(res, 'Name required')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('products').insert([{ name, in_stock }]).select('id, name, in_stock, updated_at').single()
        if (error) return err(res, 'Failed to create product')
        return ok(res, { product: data })
      }
      case 'products.update': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { id, name, in_stock } = req.body || {}
        if (!id) return bad(res, 'Product ID required')
        const supabase = getSupabase()
        const payload: any = {}
        if (name !== undefined) payload.name = name
        if (in_stock !== undefined) payload.in_stock = in_stock
        const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('id, name, in_stock, updated_at').single()
        if (error) return err(res, 'Failed to update product')
        return ok(res, { product: data })
      }
      case 'products.delete': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { id } = req.body || {}
        if (!id) return bad(res, 'Product ID required')
        const supabase = getSupabase()
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) return err(res, 'Failed to delete product')
        return ok(res, { ok: true })
      }

      // Orders
      case 'orders.list': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch orders')
        return ok(res, { orders: data })
      }
      case 'orders.update-status': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { id, status, tracking_number, shipping_updates } = req.body || {}
        if (!id || !status) return bad(res, 'Order ID and status required')
        const supabase = getSupabase()
        const updateData: any = { status, updated_at: new Date().toISOString() }
        if (tracking_number) updateData.tracking_number = tracking_number
        if (shipping_updates) updateData.shipping_updates = shipping_updates
        const { error } = await supabase.from('orders').update(updateData).eq('id', id)
        if (error) return err(res, 'Failed to update order')
        // Send email notification to the customer
        try {
          const { data: order } = await supabase.from('orders').select('email, name, status, tracking_number').eq('id', id).single()
          if (order?.email) {
            const { transporter, smtpFrom } = getMailer()
            const statusTitle = String(status).toUpperCase()
            const tracking = tracking_number || (order as any).tracking_number
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                  <h2 style="color: #2d5a27; margin-bottom: 20px;">Order Status Update: ${statusTitle}</h2>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">Hello ${order.name || 'Customer'},</p>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Your order status has been updated to <strong style="color: #2d5a27;">${statusTitle}</strong>.</p>
                  ${tracking ? `<p style="color: #555; line-height: 1.6; margin-bottom: 20px;"><strong>Tracking Number:</strong> ${tracking}</p>` : ''}
                  <p style="color: #555; line-height: 1.6;">Thank you for choosing Himgiri Naturals!</p>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                  <p>© 2025 Himgiri Naturals. All rights reserved.</p>
                </div>
              </div>`
            await transporter.sendMail({ from: smtpFrom, to: order.email, subject: `Order Status Update - ${statusTitle}`, html })
          }
        } catch (e) {
          console.error('order status email failed:', e)
        }
        return ok(res, { ok: true })
      }

      // Users
      case 'users.list': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const { data, error } = await supabase.from('users').select('id, email, name, role, created_at').order('created_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch users')
        return ok(res, { users: data })
      }
      case 'users.set-role': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { user_id, role } = req.body || {}
        if (!user_id || !['user','admin'].includes(role)) return bad(res, 'Invalid role')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('users').update({ role }).eq('id', user_id).select('id, email, role').single()
        if (error) return err(res, 'Failed to set role')
        return ok(res, { user: data })
      }

      // Inventory
      case 'inventory.list': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const { data, error } = await supabase.from('inventory').select('*').order('updated_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch inventory')
        return ok(res, { inventory: data })
      }
      case 'inventory.set': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { product_id, stock, low_stock_threshold, sku } = req.body || {}
        if (!product_id || stock === undefined) return bad(res, 'product_id and stock required')
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('inventory')
          .upsert([{ product_id, stock, low_stock_threshold, sku }], { onConflict: 'product_id' })
          .select('*')
          .single()
        if (error) return err(res, 'Failed to update inventory')
        return ok(res, { item: data })
      }

      // Analytics
      case 'analytics.overview': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const since = req.query?.since || req.body?.since // optional ISO date
        let query = supabase.from('orders').select('amount, status, created_at')
        if (since) query = query.gte('created_at', since as string)
        const { data, error } = await query
        if (error) return err(res, 'Failed to compute analytics')
        const totalRevenue = (data || []).filter(o => o.status !== 'cancelled').reduce((s: number, o: any) => s + Number(o.amount || 0), 0)
        const totalOrders = (data || []).length
        return ok(res, { totalRevenue, totalOrders })
      }

      default:
        return bad(res, 'Unknown action')
    }
  } catch (e: any) {
    console.error('admin api error:', e)
    return err(res, 'Internal error', e?.message || String(e))
  }
}