export default async function handler(req: any, res: any) {
  try {
    res.status(200).json({ ok: true, method: req.method })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}

