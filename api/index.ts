export default async function handler(req: any, res: any) {
  return res.status(200).json({
    message: "Himgiri Naturals API",
    version: "1.0.0",
    endpoints: {
      "/api": "This endpoint - shows available APIs",
      "/api/auth": "Authentication endpoints (Google OAuth, email/password, OTP)",
      "/api/payments": "Payment processing (Razorpay)",
      "/api/app": "General app functions (newsletter, email)",
      "/api/test": "Test endpoint for connectivity"
    },
    auth_actions: [
      "?action=signup", "?action=login", "?action=logout",
      "?action=otp.send", "?action=otp.verify", "?action=google.start"
    ],
    payment_actions: [
      "?action=razorpay.order", "?action=razorpay.verify"
    ],
    app_actions: [
      "?action=newsletter.subscribe", "?action=email.welcome"
    ],
    example: "/api/auth?action=google.start"
  })
}