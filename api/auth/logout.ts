const cookieName = 'himgiri_session'

export default async function handler(req: any, res: any) {
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
  res.status(200).json({ ok: true })
}

