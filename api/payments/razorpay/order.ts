export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) return res.status(500).json({ message: 'Razorpay not configured' })

    const { amount, currency = 'INR', receipt } = req.body as { amount?: number; currency?: string; receipt?: string }
    if (!amount || amount < 1) return res.status(400).json({ message: 'Valid amount is required' })

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const body = {
      amount, // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    }

    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify(body),
    })

    const data = await resp.json()
    if (!resp.ok) {
      return res.status(400).json({ message: 'Failed to create order', details: data })
    }

    return res.status(200).json({ order: data, keyId })
  } catch (e) {
    console.error('Razorpay order error:', e)
    return res.status(500).json({ message: 'Failed to create order' })
  }
}

