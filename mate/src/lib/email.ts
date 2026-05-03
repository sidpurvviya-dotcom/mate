import nodemailer from 'nodemailer'
import crypto from 'crypto'

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// ── Build the right transporter ────────────────────────────────────────────
// If SMTP_USER + SMTP_PASS are set → use Gmail (or any real SMTP)
// Otherwise             → create a free Ethereal test account on the fly
// Ethereal: real SMTP, emails are viewable at https://ethereal.email (no sign-up needed)

let _transporter: nodemailer.Transporter | null = null
let _etherealUser = ''
let _etherealPass = ''
let _etherealPreviewBase = 'https://ethereal.email'

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (_transporter) return _transporter

  if (process.env.SMTP_USER && process.env.SMTP_PASS &&
      process.env.SMTP_USER !== 'your-email@gmail.com') {
    // Real SMTP (Gmail, Sendgrid, etc.)
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    console.log('📧 Email: using configured SMTP →', process.env.SMTP_USER)
  } else {
    // Ethereal dev transport — creates a fresh test account automatically
    const testAccount = await nodemailer.createTestAccount()
    _etherealUser = testAccount.user
    _etherealPass = testAccount.pass
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: _etherealUser, pass: _etherealPass },
    })
    console.log('📧 Email: using Ethereal test account →', _etherealUser)
    console.log('📧 Preview emails at: https://ethereal.email/messages')
  }
  return _transporter
}

// ── Send helpers ───────────────────────────────────────────────────────────

export interface EmailResult {
  sent: boolean
  previewUrl?: string  // Ethereal preview link (dev only)
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  otp: string
): Promise<EmailResult> {
  try {
    const transport = await getTransporter()
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'Mate <noreply@mate.com>',
      to,
      subject: `${otp} is your Mate verification code`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px;border-radius:12px;">
          <div style="text-align:center;background:#6366f1;padding:24px;border-radius:12px 12px 0 0;">
            <div style="font-size:40px;">🏠</div>
            <h1 style="color:white;margin:8px 0 0;font-size:24px;font-family:Arial;">Mate</h1>
          </div>
          
          <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
            <p style="font-size:16px;color:#374151;margin-top:0;">Hi ${name},</p>
            <p style="font-size:16px;color:#374151;">Use the following 6-digit code to verify your email address. This code is valid for 10 minutes.</p>
            
            <div style="background:#f3f4f6;padding:24px;text-align:center;border-radius:8px;margin:24px 0;border:1px solid #e5e7eb;">
              <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#4f46e5;font-family:monospace;">${otp}</div>
            </div>
            
            <p style="font-size:14px;color:#6b7280;line-height:1.5;">
              If you didn't create a Mate account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px;">
            <p style="margin:0;">Do not share this code with anyone. Our team will never ask for it.</p>
            <p style="margin:8px 0 0;">© 2026 Mate · Find your perfect roommate</p>
          </div>
        </div>
      `,
      text: `Your Mate verification code is: ${otp}\n\nThis code expires in 10 minutes.\nDo not share this code with anyone.`,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined
    if (previewUrl) {
      console.log('📧 Email preview URL:', previewUrl)
    }

    return { sent: true, previewUrl: typeof previewUrl === 'string' ? previewUrl : undefined }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return { sent: false }
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    const transport = await getTransporter()
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'Mate <noreply@mate.com>',
      to,
      subject: 'Welcome to Mate! 🏠',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px;border-radius:12px;">
          <div style="text-align:center;background:#6366f1;padding:24px;border-radius:12px 12px 0 0;">
            <div style="font-size:40px;">🎉</div>
            <h1 style="color:white;margin:8px 0 0;font-size:24px;">Mate</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#111827;">Welcome aboard, ${name}! 🎉</h2>
            <p style="color:#374151;font-size:15px;line-height:1.7;">
              Your email is verified. Start browsing properties or post your own listing today!
            </p>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/listings"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin-top:20px;">
              Browse Listings →
            </a>
          </div>
        </div>
      `,
    })
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) console.log('📧 Welcome email preview:', previewUrl)
  } catch (error) {
    console.error('Welcome email error:', error)
  }
}
