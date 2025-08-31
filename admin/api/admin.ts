import { createClient } from '@supabase/supabase-js'
import { SignJWT, jwtVerify } from 'jose'
import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'

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
    'orders.list','orders.update-status','orders.generate-invoice',
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

      case 'ping':
        return ok(res, { ok: true, method: req.method })

      case 'test-email': {
        try {
          const { transporter, smtpFrom } = getMailer()
          console.log('Testing SMTP connection...')
          await transporter.verify()
          console.log('SMTP connection verified')
          return ok(res, { ok: true, message: 'SMTP connection successful', from: smtpFrom })
        } catch (e) {
          console.error('SMTP test failed:', e)
          return err(res, 'SMTP connection failed', e.message)
        }
      }

      // Products
      case 'products.list': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const { data: base, error } = await supabase.from('products').select('id, name, in_stock, updated_at').order('updated_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch products')
        const ids = (base || []).map((p: any) => p.id)
        let inventory: any[] = []
        let meta: any[] = []
        try {
          const { data: inv } = await supabase.from('inventory').select('product_id, stock')
          inventory = inv || []
        } catch {}
        try {
          const { data: m } = await supabase.from('product_meta').select('product_id, price, image, category, description')
          meta = m || []
        } catch {}
        const inventoryMap = new Map(inventory.map((r: any) => [r.product_id, r.stock]))
        const metaMap = new Map(meta.map((r: any) => [r.product_id, r]))
        const merged = (base || []).map((p: any) => ({
          ...p,
          stock: inventoryMap.get(p.id) ?? null,
          meta: metaMap.get(p.id) || null,
        }))
        return ok(res, { products: merged })
      }
      case 'products.create': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { name, in_stock = true, meta } = req.body || {}
        if (!name) return bad(res, 'Name required')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('products').insert([{ name, in_stock }]).select('id, name, in_stock, updated_at').single()
        if (error) return err(res, 'Failed to create product')
        // Optionally create meta row
        try {
          if (meta && data?.id) {
            await supabase.from('product_meta').upsert([{ product_id: data.id, ...meta }], { onConflict: 'product_id' })
          }
        } catch {}
        return ok(res, { product: data })
      }
      case 'products.update': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { id, name, in_stock, meta } = req.body || {}
        if (!id) return bad(res, 'Product ID required')
        const supabase = getSupabase()
        const payload: any = {}
        if (name !== undefined) payload.name = name
        if (in_stock !== undefined) payload.in_stock = in_stock
        const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('id, name, in_stock, updated_at').single()
        if (error) return err(res, 'Failed to update product')
        // Optionally update meta
        try {
          if (meta) {
            await supabase.from('product_meta').upsert([{ product_id: id, ...meta }], { onConflict: 'product_id' })
          }
        } catch {}
        return ok(res, { product: data })
      }
      case 'products.set-meta': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { product_id, price, image, category, description } = req.body || {}
        if (!product_id) return bad(res, 'product_id required')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('product_meta').upsert([{ product_id, price, image, category, description }], { onConflict: 'product_id' }).select('*').single()
        if (error) return err(res, 'Failed to set product meta')
        return ok(res, { meta: data })
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
        
        // Handle stock restoration for cancelled orders
        if (status === 'cancelled') {
          try {
            console.log('Order cancelled, restoring stock...');
            const { data: order } = await supabase.from('orders').select('items').eq('id', id)
            
            if (order?.items && Array.isArray(order.items)) {
              for (const item of order.items) {
                const productId = parseInt(item.id)
                if (!productId || !item.quantity) continue
                
                // Get current stock
                const { data: currentStock } = await supabase
                  .from('inventory')
                  .select('stock')
                  .eq('product_id', productId)
                  .single()
                
                if (currentStock && typeof currentStock.stock === 'number') {
                  const newStock = currentStock.stock + item.quantity
                  console.log(`Restoring stock for product ${productId}: ${currentStock.stock} → ${newStock}`)
                  
                  // Update inventory
                  await supabase
                    .from('inventory')
                    .update({ stock: newStock })
                    .eq('product_id', productId)
                  
                  // Update product in_stock status
                  await supabase
                    .from('products')
                    .update({ in_stock: newStock > 0 })
                    .eq('id', productId)
                }
              }
              console.log('Stock restoration completed for cancelled order')
            }
          } catch (stockError) {
            console.error('Failed to restore stock for cancelled order:', stockError)
          }
        }
        
        // Send email notification to the customer
        try {
          const { data: order } = await supabase.from('orders').select('email, name, status, tracking_number').eq('id', id).single()
          console.log('Order data prepared for email notification')
          if (order?.email) {
            console.log('Sending email notification to customer')
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
            console.log('Email template prepared')
            const result = await transporter.sendMail({ from: smtpFrom, to: order.email, subject: `Order Status Update - ${statusTitle}`, html })
            console.log('Email sent successfully')
          } else {
            console.log('No email found for order')
          }
        } catch (e) {
          console.error('order status email failed:', e)
          console.error('Email error details:', e.message, e.stack)
        }
        return ok(res, { ok: true })
      }

      case 'orders.generate-invoice': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { order_id } = req.body || {}
        if (!order_id) return bad(res, 'Order ID required')
        
        console.log('🔍 Generating invoice for order ID:', order_id, 'Type:', typeof order_id);
        
        const supabase = getSupabase()
        
        // First try to find the order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', order_id)
          .single()
        
        console.log('📋 Order lookup result:', { 
          found: !!order, 
          error: orderError?.message
        });
        
        if (orderError || !order) {
          console.error('❌ Order lookup failed:', orderError)
          return err(res, `Order not found: ${orderError?.message || 'Unknown error'}`)
        }
        
        // Check if order has items field (might be stored directly in orders table)
        let items = []
        if (order.items && Array.isArray(order.items)) {
          items = order.items
          console.log('✅ Found items in order.items')
        } else {
          // Try to get items from order_items table if it exists
          try {
            const { data: orderItems, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order_id)
            
            if (!itemsError && orderItems) {
              items = orderItems
              console.log('✅ Found items in order_items table')
            } else {
              console.log('⚠️ No order_items table or no items found, using order data')
              // If no items table, create a basic item from order data
              items = [{
                name: order.product_name || 'Product',
                price: order.amount || 0,
                quantity: 1,
                id: order.id
              }]
            }
          } catch (e) {
            console.log('⚠️ order_items table doesn\'t exist, using order data')
            // Create basic item from order data
            items = [{
              name: order.product_name || 'Product',
              price: order.amount || 0,
              quantity: 1,
              id: order.id
            }]
          }
        }
        
        // Combine order and items
        const orderWithItems = { ...order, items }
        
        console.log('✅ Final order data prepared for invoice generation');
        
        try {
          // Set response headers for PDF download
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="invoice-${order_id}.pdf"`);
          
          // Create PDF document
          const doc = new PDFDocument({ margin: 50 });
          
          // Pipe PDF to response
          doc.pipe(res);
          
          // Generate invoice sections
          generateHeader(doc);
          generateInvoiceInfo(doc, orderWithItems, order_id);
          generateCustomerInfo(doc, orderWithItems);
          generateItemsTable(doc, orderWithItems);
          generateFooter(doc);
          
          // Finalize PDF
          doc.end();
          
        } catch (error) {
          console.error('❌ PDF generation failed:', error);
          return err(res, 'Failed to generate PDF invoice');
        }
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
        
        console.log('Setting inventory for product:', product_id, 'stock:', stock)
        
        const supabase = getSupabase()
        
        // First update inventory
        const { data, error } = await supabase
          .from('inventory')
          .upsert([{ product_id, stock, low_stock_threshold, sku }], { onConflict: 'product_id' })
          .select('*')
          .single()
          
        if (error) {
          console.error('Inventory update failed:', error)
          return err(res, 'Failed to update inventory')
        }
        
        // Then update products.in_stock based on stock value
        try {
          const newInStock = Number(stock) > 0
          console.log('Updating product in_stock to:', newInStock)
          
          const { error: productError } = await supabase
            .from('products')
            .update({ in_stock: newInStock })
            .eq('id', product_id)
            
          if (productError) {
            console.error('Product update failed:', productError)
          } else {
            console.log('Product in_stock updated successfully')
          }
        } catch (e) {
          console.error('Error updating product in_stock:', e)
        }
        
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

      // Categories
      case 'categories.list': {
        await requireAdmin(req, res)
        const supabase = getSupabase()
        const { data, error } = await supabase.from('categories').select('*').order('sort', { ascending: true })
        if (error) return err(res, 'Failed to fetch categories')
        return ok(res, { categories: data })
      }
      case 'categories.create': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { name, description, image, sort = 0 } = req.body || {}
        if (!name) return bad(res, 'Name required')
        const supabase = getSupabase()
        const { data, error } = await supabase.from('categories').insert([{ name, description, image, sort }]).select('*').single()
        if (error) return err(res, 'Failed to create category')
        return ok(res, { category: data })
      }
      case 'categories.update': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { id, name, description, image, sort } = req.body || {}
        if (!id) return bad(res, 'Category ID required')
        const payload: any = {}
        if (name !== undefined) payload.name = name
        if (description !== undefined) payload.description = description
        if (image !== undefined) payload.image = image
        if (sort !== undefined) payload.sort = sort
        const supabase = getSupabase()
        const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select('*').single()
        if (error) return err(res, 'Failed to update category')
        return ok(res, { category: data })
      }
      case 'categories.delete': {
        const admin = await requireAdmin(req, res); if (!admin) return
        const { id } = req.body || {}
        if (!id) return bad(res, 'Category ID required')
        const supabase = getSupabase()
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) return err(res, 'Failed to delete category')
        return ok(res, { ok: true })
      }

      default:
        return bad(res, 'Unknown action')
    }
  } catch (e: any) {
    console.error('admin api error:', e)
    return err(res, 'Internal error', e?.message || String(e))
  }
}

  // Helper functions for PDF generation
  function generateHeader(doc: any) {
    // Add light cream background for header
    doc
      .rect(50, 50, 500, 80)
      .fill('#FEFCFA')
      .stroke('#3D2914');
    
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#D4AF37')
      .text('Himgiri Naturals', 50, 70)
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#8B7355')
      .text('Premium Himalayan Dry Fruits & Nuts', 50, 95)
      .text('Ghaziabad, India', 50, 110)
      .text('Phone: +91 766806782', 50, 125)
      .text('Email: shop@himgirinaturals.com', 50, 140)
      
      // Invoice title on the right
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#3D2914')
      .text('INVOICE', 400, 70, { align: 'right' })
      
      // Add a line separator
      .moveTo(50, 150)
      .lineTo(550, 150)
      .strokeColor('#3D2914')
      .stroke();
  }

  function generateInvoiceInfo(doc: any, order: any, orderId: number) {
    const startY = 170;
    
    // Left column - Invoice details
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#3D2914')
      .text('Invoice Details', 50, startY)
      .font('Helvetica')
      .fillColor('#8B7355')
      .text(`Invoice Number: INV-${orderId.toString().padStart(6, '0')}`, 50, startY + 20)
      .text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 50, startY + 35)
      .text(`Order ID: #${orderId}`, 50, startY + 50)
      .text(`Order Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 50, startY + 65);
    
    // Right column - Payment info
    doc
      .font('Helvetica-Bold')
      .fillColor('#3D2914')
      .text('Payment Information', 350, startY)
      .font('Helvetica')
      .fillColor('#8B7355')
      .text(`Payment Method: ${(order.payment_method || 'Online Payment').toUpperCase()}`, 350, startY + 20)
      .text(`Payment Status: ${order.status.toUpperCase()}`, 350, startY + 35);
  }

  function generateCustomerInfo(doc: any, order: any) {
    const startY = 260;
    
    // Bill To section
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, startY)
      .font('Helvetica')
      .text(order.name || 'Customer', 50, startY + 20)
      .text(order.email, 50, startY + 35)
      .text(`Phone: ${order.shipping?.phone || 'N/A'}`, 50, startY + 50);
    
    // Ship To section
    if (order.shipping) {
      doc
        .font('Helvetica-Bold')
        .text('Ship To:', 350, startY)
        .font('Helvetica')
        .text(order.shipping.fullName || order.shipping.full_name || order.name, 350, startY + 20)
        .text(order.shipping.address, 350, startY + 35)
        .text(`${order.shipping.city}, ${order.shipping.state} ${order.shipping.pincode}`, 350, startY + 50);
    }
  }

  function generateItemsTable(doc: any, order: any) {
    const startY = 360;
    const tableTop = startY;
    
    // Table header with brown theme colors
    doc
      .fontSize(12)
      .font('Helvetica-Bold');
    
    // Draw table header background with dark brown
    doc
      .rect(50, tableTop, 500, 25)
      .fill('#3D2914')
      .stroke('#3D2914');
    
    // Header text in white
    doc
      .fillColor('white')
      .text('Product', 60, tableTop + 8)
      .text('Price', 250, tableTop + 8)
      .text('Qty', 350, tableTop + 8)
      .text('Total', 450, tableTop + 8);
    
    // Table rows
    let currentY = tableTop + 25;
    let subtotal = 0;
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any, index: number) => {
        const rowY = currentY + (index * 25);
        
        // Use actual item prices and quantities for correct calculation
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        const itemTotal = itemPrice * itemQuantity;
        subtotal += itemTotal;
        
        // Alternate row background with light cream
        if (index % 2 === 1) {
          doc
            .rect(50, rowY, 500, 25)
            .fill('#FEFCFA')
            .stroke('#3D2914');
        }
        
        doc
          .fillColor('black')
          .font('Helvetica')
          .text(item.name, 60, rowY + 8)
          .text(`₹${itemPrice.toFixed(2)}`, 250, rowY + 8)
          .text(itemQuantity.toString(), 350, rowY + 8)
          .text(`₹${itemTotal.toFixed(2)}`, 450, rowY + 8);
      });
    } else {
      // If no items array, show the order as a single item
      const rowY = currentY;
      subtotal = order.amount;
      doc
        .fillColor('black')
        .font('Helvetica')
        .text('Product', 60, rowY + 8)
        .text(`₹${order.amount.toFixed(2)}`, 250, rowY + 8)
        .text('1', 350, rowY + 8)
        .text(`₹${order.amount.toFixed(2)}`, 450, rowY + 8);
    }
    
    // Calculate totals section position
    const totalsY = currentY + ((order.items?.length || 0) * 25) + 20;
    
    // Show subtotal and total amount
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('black')
      .text('Subtotal:', 350, totalsY)
      .text(`₹${subtotal.toFixed(2)}`, 450, totalsY)
      
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#3D2914')
      .text('Total Amount:', 350, totalsY + 25)
      .text(`₹${order.amount.toFixed(2)}`, 450, totalsY + 25);
    
    // Draw a line above total with dark brown
    doc
      .moveTo(350, totalsY + 20)
      .lineTo(520, totalsY + 20)
      .strokeColor('#3D2914')
      .stroke();
  }

  function generateFooter(doc: any) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#3D2914')
      .text('Thank you for choosing Himgiri Naturals!', 50, 650)
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#8B7355')
      .text('For any queries, contact us at shop@himgirinaturals.com', 50, 670)
      .text('© 2025 Himgiri Naturals. All rights reserved.', 50, 690);
  }