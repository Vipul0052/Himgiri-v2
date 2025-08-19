export default async function handler(req: any, res: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return res.status(500).json({ message: 'GOOGLE_CLIENT_ID is not set' })
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = (req.headers['x-forwarded-proto'] || 'https') as string
  const origin = `${proto}://${host}`
  const base = process.env.AUTH_ORIGIN || origin
  const redirectUri = `${base}/api/auth/google/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  res.writeHead(302, { Location: url })
  res.end()
}

