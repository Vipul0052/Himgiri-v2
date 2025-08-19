export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const { email, code } = req.body as { email?: string; code?: string }
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' })
    const store = global as any
    const entry = store.__otpStore?.get(email)
    if (!entry) return res.status(400).json({ message: 'OTP not found' })
    if (Date.now() > entry.exp) return res.status(400).json({ message: 'OTP expired' })
    if (entry.code !== code) return res.status(400).json({ message: 'Invalid OTP' })
    store.__otpStore.delete(email)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('OTP verify error:', e)
    res.status(500).json({ message: 'Verification failed' })
  }
}

