export default async function handler(req: any, res: any) {
  return res.status(200).json({ 
    ok: true, 
    message: "API is working",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}// Fresh deploy trigger
