export default async function handler(req: any, res: any) {
  const { name = '', email = '', avatar = '' } = req.query
  // Redirect back to app with hash to let client store session
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = (req.headers['x-forwarded-proto'] || 'https') as string
  const origin = `${proto}://${host}`
  const payload = encodeURIComponent(JSON.stringify({ name, email, avatar }))
  res.writeHead(302, { Location: `${origin}/#login-success=${payload}` })
  res.end()
}

