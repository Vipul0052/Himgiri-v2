import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import crypto from 'crypto'
import PDFDocument from 'pdfkit'
import { ok, bad, err } from './utils'

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

async function sendOrderStatusEmail(email: string, name: string, status: string, trackingNumber?: string) {
  try {
    const { transporter, smtpFrom } = getMailer()
    const statusEmojis: { [key: string]: string } = {
      'pending': '⏳',
      'processing': '🔧',
      'shipped': '📦',
      'delivered': '✅',
      'cancelled': '❌'
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2 style="color: #2d5a27; margin-bottom: 20px;">${statusEmojis[status] || '📋'} Order Status Update</h2>
          <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">Hello ${name},</p>
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Your order status has been updated to: <strong style="color: #2d5a27;">${status.toUpperCase()}</strong></p>
          ${trackingNumber ? `<p style="color: #555; line-height: 1.6; margin-bottom: 20px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          <p style="color: #555; line-height: 1.6;">Thank you for choosing Himgiri Naturals!</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
          <p>© 2025 Himgiri Naturals. All rights reserved.</p>
        </div>
      </div>`
    
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: `Order Status Update - ${status.toUpperCase()}`,
      html
    })
  } catch (error) {
    console.error('Failed to send order status email:', error)
  }
}

function ok(res: any, body: any) { res.status(200).json(body) }
function bad(res: any, msg: string) { res.status(400).json({ message: msg }) }
function err(res: any, msg: string, details?: any) { res.status(500).json({ message: msg, details }) }

  // Helper function to generate PDF invoice
  async function generateOrderInvoice(order: any, orderId: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        
        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)
        
        // Generate invoice sections
        generateHeader(doc);
        generateInvoiceInfo(doc, order, orderId);
        generateCustomerInfo(doc, order);
        generateItemsTable(doc, order);
        generateFooter(doc);
        
        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error)
      }
    })
  }

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
      .text(order.name || order.email.split('@')[0], 50, startY + 20)
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

  // Helper function to send order status emails

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
        const { email, amount, items, name } = payload
        if (!email || !amount || !Array.isArray(items)) return bad(res, 'Invalid payload')
        
        console.log('Creating order with payload:', JSON.stringify(payload, null, 2))
        const { data, error } = await supabase.from('orders').insert([payload]).select()
        
        if (error) {
          console.error('Order creation error:', error)
          return err(res, 'Failed to record order', error.message)
        }
        
        console.log('Order created successfully:', data)
        
        // Reduce stock for all ordered items
        try {
          console.log('Reducing stock for order items:', items)
          for (const item of items) {
            const productId = parseInt(item.id)
            if (!productId || !item.quantity) continue
            
            // Get current stock
            const { data: currentStock } = await supabase
              .from('inventory')
              .select('stock')
              .eq('product_id', productId)
              .single()
            
            if (currentStock && typeof currentStock.stock === 'number') {
              const newStock = Math.max(0, currentStock.stock - item.quantity)
              console.log(`Reducing stock for product ${productId}: ${currentStock.stock} → ${newStock}`)
              
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
          console.log('Stock reduction completed successfully')
        } catch (stockError) {
          console.error('Failed to reduce stock:', stockError)
          // Don't fail the order if stock reduction fails
        }
        
        // Send order confirmation email
        try {
          const { transporter, smtpFrom } = getMailer()
          
          // Get order details for email
          const orderId = data[0]?.id || 'N/A'
          const paymentMethod = payload.payment_method || 'Online Payment'
          const shipping = payload.shipping || {}
          
          // Generate PDF invoice
          let pdfAttachment = null
          try {
            const pdfBuffer = await generateOrderInvoice(data[0], orderId)
            pdfAttachment = {
              filename: `invoice-${orderId}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
            console.log('PDF invoice generated successfully for order:', orderId)
          } catch (pdfError) {
            console.error('PDF generation failed for order:', orderId, pdfError)
            // Continue without PDF if generation fails
          }
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
                <p style="color: #666; margin: 5px 0;">Premium Himalayan Dry Fruits & Nuts</p>
              </div>
              
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #2d5a27; margin: 0;">🎉 Order Confirmed!</h2>
                  <p style="color: #666; margin: 10px 0;">Thank you for your order</p>
                </div>
                
                <!-- Order Summary -->
                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d5a27;">
                  <h3 style="color: #2d5a27; margin-bottom: 15px;">📋 Order Summary</h3>
                  <p style="color: #555; line-height: 1.6; margin: 0;">
                    <strong>Order ID:</strong> #${orderId}<br>
                    <strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
                    <strong>Total Amount:</strong> ₹${amount.toFixed(2)}<br>
                    <strong>Items:</strong> ${items.length} product${items.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                <!-- Order Items -->
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                  <h3 style="color: #2d5a27; margin-bottom: 15px;">🛍️ Your Order Items</h3>
                  ${items.map((item: any) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                      <div>
                        <strong style="color: #333;">${item.name}</strong><br>
                        <span style="color: #666; font-size: 14px;">Qty: ${item.quantity}</span>
                      </div>
                      <div style="text-align: right;">
                        <span style="color: #2d5a27; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</span><br>
                        <span style="color: #666; font-size: 14px;">₹${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                  `).join('')}
                  <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #2d5a27;">
                    <div style="font-size: 18px; color: #2d5a27; font-weight: bold;">
                      Total: ₹${amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <!-- Payment Method -->
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                  <h3 style="color: #2d5a27; margin-bottom: 15px;">💳 Payment Information</h3>
                  <p style="color: #555; line-height: 1.6; margin: 0;">
                    <strong>Payment Method:</strong> ${paymentMethod}<br>
                    ${paymentMethod.toLowerCase().includes('cod') ? 
                      '<span style="color: #e74c3c; font-weight: bold;">💰 Cash on Delivery - Pay when you receive your order</span>' : 
                      '<span style="color: #27ae60; font-weight: bold;">✅ Payment completed online</span>'
                    }
                  </p>
                </div>
                
                <!-- Shipping Address -->
                ${shipping.address ? `
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                  <h3 style="color: #2d5a27; margin-bottom: 15px;">📍 Shipping Address</h3>
                  <p style="color: #555; line-height: 1.6; margin: 0;">
                    <strong>${name || email.split('@')[0]}</strong><br>
                    ${shipping.address}<br>
                    ${shipping.city ? `${shipping.city}, ` : ''}${shipping.state ? `${shipping.state} ` : ''}${shipping.pincode ? `${shipping.pincode}` : ''}<br>
                    ${shipping.phone ? `Phone: ${shipping.phone}` : ''}
                  </p>
                </div>
                ` : ''}
                
                <!-- PDF Invoice Notice -->
                <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <h3 style="color: #856404; margin-bottom: 15px;">📄 Invoice Attached</h3>
                  <p style="color: #856404; line-height: 1.6; margin: 0;">
                    Your detailed invoice has been attached to this email. It includes itemized pricing, GST breakdown, and all order details.
                  </p>
                </div>
                
                <!-- Next Steps -->
                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d5a27;">
                  <h3 style="color: #2d5a27; margin-bottom: 15px;">📋 What Happens Next?</h3>
                  <ol style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>We'll start processing your order right away</li>
                    <li>You'll receive updates on your order status</li>
                    <li>Your order will be carefully packed and shipped</li>
                    <li>You'll receive tracking information when available</li>
                  </ol>
                </div>
                
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                  <strong>Thank you for choosing Himgiri Naturals!</strong><br>
                  We're committed to bringing you the finest quality products.
                </p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 Himgiri Naturals. All rights reserved.</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>`
          
          const emailOptions: any = {
            from: smtpFrom,
            to: email,
            subject: `Order Confirmed - #${orderId} - Himgiri Naturals 🎉`,
            html
          }
          
          // Attach PDF if generated successfully
          if (pdfAttachment) {
            emailOptions.attachments = [pdfAttachment]
          }
          
          await transporter.sendMail(emailOptions)
          
          console.log('Order confirmation email sent successfully to:', email, pdfAttachment ? 'with PDF invoice' : 'without PDF invoice')
        } catch (emailError) {
          console.error('Order confirmation email failed:', emailError)
          // Don't fail the order creation if email fails
        }
        
        return ok(res, { ok: true, order: data })
      }

      // User Dashboard & Order Management
      case 'user.orders': {
        const supabase = getSupabase()
        const { user_id, email } = req.query || {}
        if (!user_id && !email) return bad(res, 'User ID or email required')
        
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (user_id) query = query.eq('user_id', user_id)
        if (email) query = query.eq('email', email)
        
        const { data, error } = await query
        if (error) return err(res, 'Failed to fetch orders')
        return ok(res, { orders: data })
      }

      /* merged into extended 'user.profile' and 'user.update-profile' below */

      // Order Tracking & Status Updates
      case 'order.update-status': {
        const supabase = getSupabase()
        const { order_id, status, tracking_number, shipping_updates } = req.body || {}
        if (!order_id || !status) return bad(res, 'Order ID and status required')
        
        const updateData: any = { status, updated_at: new Date().toISOString() }
        if (tracking_number) updateData.tracking_number = tracking_number
        if (shipping_updates) updateData.shipping_updates = shipping_updates
        
        const { error } = await supabase.from('orders').update(updateData).eq('id', order_id)
        if (error) return err(res, 'Failed to update order status')
        
        // Send email notification if status changed
        try {
          const { data: order } = await supabase.from('orders').select('email, name, status').eq('id', order_id).single()
          if (order) {
            await sendOrderStatusEmail(order.email, order.name, status, tracking_number)
          }
        } catch (e) {
          console.log('Email notification failed:', e)
        }
        
        return ok(res, { ok: true })
      }

      // Wishlist Management
      case 'wishlist.add': {
        const supabase = getSupabase()
        const { user_id, product_id, product_data } = req.body || {}
        if (!user_id || !product_id) return bad(res, 'User ID and product ID required')
        
        const { error } = await supabase.from('wishlist').upsert([{
          user_id,
          product_id,
          product_data,
          created_at: new Date().toISOString()
        }])
        
        if (error) return err(res, 'Failed to add to wishlist')
        return ok(res, { ok: true })
      }

      case 'wishlist.remove': {
        const supabase = getSupabase()
        const { user_id, product_id } = req.body || {}
        if (!user_id || !product_id) return bad(res, 'User ID and product ID required')
        
        const { error } = await supabase.from('wishlist').delete().eq('user_id', user_id).eq('product_id', product_id)
        if (error) return err(res, 'Failed to remove from wishlist')
        return ok(res, { ok: true })
      }

      case 'wishlist.get': {
        const supabase = getSupabase()
        const { user_id } = req.query || {}
        if (!user_id) return bad(res, 'User ID required')
        
        const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', user_id).order('created_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch wishlist')
        return ok(res, { wishlist: data })
      }

      // Product Reviews
      case 'review.add': {
        const supabase = getSupabase()
        const { user_id, product_id, rating, comment, user_name } = req.body || {}
        if (!user_id || !product_id || !rating) return bad(res, 'User ID, product ID, and rating required')
        
        const { error } = await supabase.from('reviews').insert([{
          user_id,
          product_id,
          rating,
          comment,
          user_name,
          created_at: new Date().toISOString()
        }])
        
        if (error) return err(res, 'Failed to add review')
        return ok(res, { ok: true })
      }

      case 'review.get': {
        const supabase = getSupabase()
        const { product_id } = req.query || {}
        if (!product_id) return bad(res, 'Product ID required')
        
        const { data, error } = await supabase.from('reviews').select('*').eq('product_id', product_id).order('created_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch reviews')
        return ok(res, { reviews: data })
      }

      case 'review.user': {
        const supabase = getSupabase()
        const { user_id } = req.query || {}
        if (!user_id) return bad(res, 'User ID required')
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, product_id, rating, comment, images, helpful_votes, created_at,
            products!inner(name as product_name, image as product_image)
          `)
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Failed to fetch user reviews:', error)
          return err(res, 'Failed to fetch reviews')
        }
        
        return ok(res, { reviews: data })
      }

      // User Profile Management
      case 'user.profile': {
        const { user_id } = req.query || {}
        if (!user_id) return bad(res, 'User ID required')
        
        console.log('Fetching profile for user:', user_id)
        
        const supabase = getSupabase()
        
        // Get user profile
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, name, email, phone, communication_preferences')
          .eq('id', user_id)
          .single()
        
        if (userError) {
          console.error('Failed to fetch user profile:', userError)
          return err(res, 'Failed to fetch user profile')
        }
        
        // Get user addresses
        const { data: addresses, error: addressesError } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user_id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
        
        if (addressesError) {
          console.error('Failed to fetch user addresses:', addressesError)
          // Don't fail completely if addresses fail
        }
        
        const profile = {
          ...user,
          addresses: addresses || []
        }
        
        console.log('Profile data:', profile)
        
        return ok(res, { profile })
      }

      case 'user.update-profile': {
        try {
          const { user_id, name, phone, communication_preferences } = req.body || {}
          if (!user_id) return bad(res, 'User ID required')
          
          console.log('Updating profile for user:', user_id)
          console.log('Update data:', { name, phone, communication_preferences })
          console.log('Request body:', req.body)
          
          const supabase = getSupabase()
          const updateData: any = {}
          if (name !== undefined) updateData.name = name
          if (phone !== undefined) updateData.phone = phone
          if (communication_preferences !== undefined) updateData.communication_preferences = communication_preferences
          
          console.log('Final update payload:', updateData)
          
          if (Object.keys(updateData).length === 0) {
            console.log('No fields to update')
            return bad(res, 'No fields to update')
          }
          
          const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user_id)
            .select()
            .single()
          
          if (error) {
            console.error('Supabase error updating user profile:', error)
            return err(res, 'Failed to update profile', error)
          }
          
          console.log('Profile updated successfully:', data)
          return ok(res, { profile: data })
        } catch (error) {
          console.error('Unexpected error in profile update:', error)
          return err(res, 'Unexpected error updating profile', error)
        }
      }

      case 'user.add-address': {
        try {
          const { user_id, type, full_name, phone, address, city, state, pincode, is_default } = req.body || {}
          if (!user_id || !full_name || !phone || !address || !city || !state || !pincode) {
            console.error('Missing required fields:', { user_id, full_name, phone, address, city, state, pincode })
            return bad(res, 'All address fields are required')
          }
          
          console.log('Adding address for user:', user_id)
          console.log('Address data:', { type, full_name, phone, address, city, state, pincode, is_default })
          console.log('Request body:', req.body)
          
          const supabase = getSupabase()
          
          // If this is the first address or marked as default, set it as default
          if (is_default) {
            console.log('Setting as default address, removing default from others')
            // Remove default from other addresses
            const { error: defaultError } = await supabase
              .from('user_addresses')
              .update({ is_default: false })
              .eq('user_id', user_id)
            
            if (defaultError) {
              console.error('Failed to remove default from other addresses:', defaultError)
            }
          }
          
          const addressPayload = {
            user_id,
            type,
            full_name,
            phone,
          address,
            city,
            state,
            pincode,
            is_default: is_default || false
          }
          
          console.log('Inserting address with payload:', addressPayload)
          
          const { data, error } = await supabase
            .from('user_addresses')
            .insert([addressPayload])
            .select()
            .single()
          
          if (error) {
            console.error('Supabase error adding address:', error)
            return err(res, 'Failed to add address', error)
          }
          
          console.log('Address added successfully:', data)
          return ok(res, { address: data })
        } catch (error) {
          console.error('Unexpected error adding address:', error)
          return err(res, 'Unexpected error adding address', error)
        }
      }

      case 'user.update-address': {
        const supabase = getSupabase()
        const { address_id, user_id, type, full_name, phone, address, city, state, pincode, is_default } = req.body || {}
        if (!address_id || !user_id) return bad(res, 'Address ID and User ID required')
        
        const updateData: any = {}
        if (type !== undefined) updateData.type = type
        if (full_name !== undefined) updateData.full_name = full_name
        if (phone !== undefined) updateData.phone = phone
        if (address !== undefined) updateData.address = address
        if (city !== undefined) updateData.city = city
        if (state !== undefined) updateData.state = state
        if (pincode !== undefined) updateData.pincode = pincode
        if (is_default !== undefined) updateData.is_default = is_default
        
        // If setting as default, remove default from other addresses
        if (is_default) {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', user_id)
            .neq('id', address_id)
        }
        
        const { data, error } = await supabase
          .from('user_addresses')
          .update(updateData)
          .eq('id', address_id)
          .eq('user_id', user_id)
          .select()
          .single()
        
        if (error) {
          console.error('Failed to update address:', error)
          return err(res, 'Failed to update address')
        }
        
        return ok(res, { address: data })
      }

      case 'user.delete-address': {
        const supabase = getSupabase()
        const { address_id, user_id } = req.body || {}
        if (!address_id || !user_id) return bad(res, 'Address ID and User ID required')
        
        const { error } = await supabase
          .from('user_addresses')
          .delete()
          .eq('id', address_id)
          .eq('user_id', user_id)
        
        if (error) {
          console.error('Failed to delete address:', error)
          return err(res, 'Failed to delete address')
        }
        
        return ok(res, { success: true })
      }

      // Public products
      case 'products.list': {
        const supabase = getSupabase()
        const { data: base, error } = await supabase
          .from('products')
          .select('id, name, in_stock, updated_at')
          .order('updated_at', { ascending: false })
        if (error) return err(res, 'Failed to fetch products')
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
        const normalizeImage = (url?: string | null) => {
          if (!url) return null
          let u = String(url).trim()
          if (!u) return null
          if (u.startsWith('//')) u = 'https:' + u
          return u
        }
        const derive = (m: any) => {
          const derived: any = {}
          const badges: string[] = []
          const desc = String(m?.description || '')
          const tagWords = ['Premium','Organic','Best Seller','Popular','Rare']
          for (const w of tagWords) if (desc.includes(w) && !badges.includes(w)) badges.push(w)
          const offMatch = desc.match(/(\d+)%\s*OFF/i)
          if (offMatch) badges.push(`${offMatch[1]}% OFF`)
          const priceArrows = desc.match(/₹\s*(\d+[\d\.]*)\s*→\s*₹\s*(\d+[\d\.]*)/)
          if (priceArrows) {
            const orig = parseFloat(priceArrows[1])
            const now = parseFloat(priceArrows[2])
            if (!Number.isNaN(orig)) derived.original_price = orig
            if (!Number.isNaN(now)) derived.price = m?.price ?? now
          }
          derived.badges = badges.length ? badges : null
          return derived
        }
        const merged = (base || []).map((p: any) => {
          const m = metaMap.get(p.id)
          const d = derive(m)
          return {
            id: p.id,
            name: p.name,
            in_stock: p.in_stock,
            stock: inventoryMap.get(p.id) ?? null,
            price: (m?.price ?? d.price) ?? null,
            original_price: d.original_price ?? null,
            image: normalizeImage(m?.image) ?? null,
            category: m?.category ?? null,
            description: m?.description ?? null,
            badges: d.badges,
          }
        })
        try { res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300') } catch {}
        return ok(res, { products: merged })
      }

      case 'categories.list': {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description, image, sort')
          .order('sort', { ascending: true })
        if (error) return err(res, 'Failed to fetch categories')
        try { res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600') } catch {}
        return ok(res, { categories: data || [] })
      }

      case 'ping':
        return ok(res, { ok: true, method: req.method })

      case 'debug.info': {
        try {
          const supabase = getSupabase()
          // Test connection
          const { data, error } = await supabase.from('users').select('count').limit(1)
          
          return ok(res, {
            message: 'Debug info',
            timestamp: new Date().toISOString(),
            env: {
              hasSupabaseUrl: !!process.env.SUPABASE_URL,
              hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
              hasSmtpUser: !!process.env.SMTP_USER,
              hasSmtpPass: !!process.env.SMTP_PASS
            },
            supabase: {
              connected: !error,
              error: error ? error.message : null
            }
          })
        } catch (error) {
          return err(res, 'Debug endpoint failed', error)
        }
      }

      default:
        return bad(res, 'Unknown action')
    }
  } catch (e: any) {
    console.error('app api error:', e)
    return err(res, 'Internal error', e?.message || String(e))
  }
}

