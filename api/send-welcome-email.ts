import nodemailer from 'nodemailer'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body as { email?: string }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' })
    }

    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ message: 'Email is not configured' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2d5a27; margin: 0;">🌿 Himgiri Naturals</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #2d5a27; margin-bottom: 20px;">Welcome to Himgiri Naturals 🌿</h2>
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Thanks for subscribing to our newsletter! You'll now get updates, offers, and stories straight to your inbox.
          </p>
          <p style="color: #555; line-height: 1.6;">
            Stay tuned for exclusive deals on premium Himalayan nuts, dried fruits, and health tips from nature's finest!
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
          <p>© 2025 Himgiri Naturals. All rights reserved.</p>
          <p>You can unsubscribe anytime by replying to this email.</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Welcome to Himgiri Naturals! 🌿',
      html,
    })

    return res.status(200).json({ message: 'Welcome email sent' })
  } catch (err) {
    console.error('Welcome email error:', err)
    return res.status(500).json({ message: 'Failed to send email' })
  }
}

