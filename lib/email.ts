import { Resend } from "resend"

let client: Resend | undefined


function getResend() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set")
    }
    client = new Resend(process.env.RESEND_API_KEY)
  }
  return client
}

const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev"

type SendEmailArgs = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const { error } = await getResend().emails.send({ from, to, subject, html })

  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`)
  }
}


export function emailLayout({
  heading,
  body,
  action,
}: {
  heading: string
  body: string
  action?: { label: string; url: string }
}) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
      <h1 style="font-size:20px;font-weight:600;margin:0 0 16px">${heading}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#444">${body}</p>
      ${
        action
          ? `<a href="${action.url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:10px 18px;border-radius:8px">${action.label}</a>
             <p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#777">Or paste this link into your browser:<br /><span style="word-break:break-all">${action.url}</span></p>`
          : ""
      }
    </div>
  `
}
