import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
    if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ message: 'Server not configured' })
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

    const {
      user_id,
      email,
      name,
      amount,
      currency = 'INR',
      provider = 'razorpay',
      razorpay_order_id = null,
      razorpay_payment_id = null,
      razorpay_signature = null,
      items = [],
      shipping = {},
      status = 'pending'
    } = req.body || {}

    if (!email || !amount || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid payload' })
    }

    const payload = {
      user_id,
      email,
      name,
      amount,
      currency,
      provider,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shipping,
      status
    }

    const { error } = await supabase.from('orders').insert([payload])
    if (error) {
      console.error('Supabase orders insert error:', error)
      return res.status(500).json({ message: 'Failed to record order' })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Orders create error:', e)
    return res.status(500).json({ message: 'Failed to record order' })
  }
}

