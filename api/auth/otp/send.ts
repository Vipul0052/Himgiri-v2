import nodemailer from 'nodemailer'

function generateOtp(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const { email } = req.body as { email?: string }
    if (!email || !email.includes('@')) return res.status(400).json({ message: 'Valid email required' })

    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser
    if (!smtpUser || !smtpPass) return res.status(500).json({ message: 'Email not configured' })

    const otp = generateOtp(6)
    const ttlMs = 5 * 60 * 1000
    const store = global as any
    store.__otpStore = store.__otpStore || new Map<string, { code: string; exp: number }>()
    store.__otpStore.set(email, { code: otp, exp: Date.now() + ttlMs })

    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } })
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Your Himgiri Naturals OTP',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    })

    res.status(200).json({ message: 'OTP sent' })
  } catch (e) {
    console.error('OTP send error:', e)
    res.status(500).json({ message: 'Failed to send OTP' })
  }
}

