export default async function handler(req: any, res: any) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return res.status(500).json({ message: 'Google OAuth not configured' })
    }

    const code = req.query.code as string
    if (!code) return res.status(400).json({ message: 'Missing code' })

    const host = req.headers['x-forwarded-host'] || req.headers.host
    const proto = (req.headers['x-forwarded-proto'] || 'https') as string
    const origin = `${proto}://${host}`
    const base = process.env.AUTH_ORIGIN || origin
    const redirectUri = `${base}/api/auth/google/callback`

    // Exchange code for tokens
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResp.ok) {
      const t = await tokenResp.text()
      return res.status(400).send(t)
    }
    const tokens = await tokenResp.json()

    // Get user info
    const userResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await userResp.json()

    // Minimal session: return user profile to client (frontend will store)
    // In production, set a signed cookie JWT here and redirect back
    const redirectTo = `/api/auth/google/finish?name=${encodeURIComponent(profile.name || '')}&email=${encodeURIComponent(profile.email || '')}&avatar=${encodeURIComponent(profile.picture || '')}`
    res.writeHead(302, { Location: redirectTo })
    res.end()
  } catch (e) {
    console.error('Google callback error:', e)
    res.status(500).json({ message: 'Auth failed' })
  }
}

