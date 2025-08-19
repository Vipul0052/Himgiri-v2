import crypto from 'crypto'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) return res.status(500).json({ message: 'Razorpay not configured' })

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const digest = hmac.digest('hex')
    const valid = digest === razorpay_signature

    if (!valid) return res.status(400).json({ ok: false, message: 'Invalid signature' })
    // Optionally record payment immediately
    try {
      await fetch(`${(process.env.AUTH_ORIGIN||'')}/api/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
      })
    } catch {}
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Razorpay verify error:', e)
    return res.status(500).json({ message: 'Verification failed' })
  }
}

