import crypto from 'crypto'

function ok(res: any, body: any) { res.status(200).json(body) }
function bad(res: any, msg: string) { res.status(400).json({ message: msg }) }
function err(res: any, msg: string, details?: any) { res.status(500).json({ message: msg, details }) }

export default async function handler(req: any, res: any) {
  const action = (req.query?.action || req.body?.action || '').toString()
  if (!action) return bad(res, 'Missing action')
  
  try {
    switch (action) {
      case 'razorpay.order': {
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        if (!keyId || !keySecret) return err(res, 'Razorpay not configured')
        
        const { amount, currency = 'INR', receipt } = req.body || {}
        if (!amount || amount < 1) return bad(res, 'Valid amount is required')
        
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const body = {
          amount,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          payment_capture: 1
        }
        
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify(body)
        })
        
        const data = await response.json()
        if (!response.ok) return bad(res, 'Failed to create order')
        
        return ok(res, { order: data, keyId })
      }

      case 'razorpay.verify': {
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        if (!keySecret) return err(res, 'Razorpay not configured')
        
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return bad(res, 'Missing required fields')
        }
        
        const hmac = crypto.createHmac('sha256', keySecret)
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const digest = hmac.digest('hex')
        
        if (digest !== razorpay_signature) {
          return bad(res, 'Invalid signature')
        }
        
        return ok(res, { ok: true })
      }

      default:
        return bad(res, 'Unknown action')
    }
  } catch (e: any) {
    console.error('payments api error:', e)
    return err(res, 'Internal error', e?.message || String(e))
  }
}