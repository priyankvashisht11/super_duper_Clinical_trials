// Email service — closes the gap flagged in docs/tech_debt.md:
// "Password reset and email verification tokens exist in the DB but no email is ever sent."
//
// Provider-agnostic by design: uses generic SMTP via nodemailer, which every real provider
// (SendGrid, SES, Mailgun, Postmark, Gmail) exposes, rather than locking in to one vendor SDK.
//
// DEV FALLBACK: if SMTP_HOST is not set, emails are logged to the console instead of sent —
// so registration/password-reset flows keep working locally without any mail server, and the
// link can just be copied out of the terminal.

import nodemailer, { type Transporter } from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporter: Transporter | null = null;
let transporterInitialized = false;

function getTransporter(): Transporter | null {
  if (transporterInitialized) return transporter;
  transporterInitialized = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
    secure: SMTP_PORT === '465',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || 'NexTrial <no-reply@nextrial.local>';
  const t = getTransporter();

  if (!t) {
    // Dev fallback — no SMTP configured. Don't fail the request; log so the flow is still usable.
    console.log('━━━ [email.service] SMTP_HOST not set — logging email instead of sending ━━━');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return;
  }

  try {
    await t.sendMail({ from, to, subject, html, text });
  } catch (err) {
    // Don't let email delivery failure break auth flows (e.g. registration should still
    // succeed even if the verification email bounces) — log loudly instead.
    console.error('[email.service] Failed to send email:', err);
  }
}

export function sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify your NexTrial account',
    text: `Hi ${firstName},\n\nPlease verify your email by visiting:\n${url}\n\nThis link expires in 24 hours.\n\n— NexTrial`,
    html: `<p>Hi ${firstName},</p><p>Please verify your email by clicking the link below:</p><p><a href="${url}">${url}</a></p><p>This link expires in 24 hours.</p><p>— NexTrial</p>`,
  });
}

export function sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset your NexTrial password',
    text: `Hi ${firstName},\n\nWe received a request to reset your password. Visit this link to choose a new one:\n${url}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.\n\n— NexTrial`,
    html: `<p>Hi ${firstName},</p><p>We received a request to reset your password. Click the link below to choose a new one:</p><p><a href="${url}">${url}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p><p>— NexTrial</p>`,
  });
}
