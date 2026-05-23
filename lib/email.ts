import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendInviteEmail({
  to,
  toName,
  orgName,
  role,
  inviterName,
  token,
}: {
  to: string;
  toName: string;
  orgName: string;
  role: string;
  inviterName: string;
  token: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? `"AIAG Farming" <${process.env.SMTP_USER}>`,
    to,
    subject: `${inviterName} invited you to join ${orgName} on AIAG Farming`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <div style="margin-bottom:24px;">
      <span style="background:#1A7A3A;color:#fff;font-weight:700;font-size:18px;padding:8px 16px;border-radius:8px;">AIAG Farming</span>
    </div>
    <h2 style="color:#1f2937;margin:0 0 8px;">You've been invited!</h2>
    <p style="color:#6b7280;margin:0 0 24px;">
      <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> as a <strong>${roleLabel}</strong>.
    </p>
    <a href="${inviteUrl}" style="display:inline-block;background:#1A7A3A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Accept Invitation
    </a>
    <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">
      This invite link expires in 7 days. If you did not expect this invitation, you can ignore this email.
    </p>
    <p style="color:#d1d5db;font-size:11px;margin:8px 0 0;">
      Or copy this link: ${inviteUrl}
    </p>
  </div>
</body>
</html>`,
  });
}