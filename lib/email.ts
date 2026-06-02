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

const ROLE_DESCRIPTIONS: Record<string, string> = {
  MANAGER:    "Manage crops, livestock, finances, spray records, and team members across the farm.",
  AGRONOMIST: "Access crop management, field data, spray records, soil reports, and AI advisory tools.",
  FARMHAND:   "View and manage day-to-day crop and livestock tasks across the farm.",
  READ_ONLY:  "Read-only access to financial reports and farm data shared with you.",
};

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
  const roleDesc = ROLE_DESCRIPTIONS[role] ?? "Access the farm management tools relevant to your role.";
  const firstName = toName.split(" ")[0] ?? toName;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>You're invited to ${orgName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 1px 4px rgba(0,0,0,0.08),0 4px 16px rgba(0,0,0,0.06);">

          <!-- ── Header ────────────────────────────────────────────── -->
          <tr>
            <td style="background:#0D3320;padding:28px 36px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width:34px;height:34px;background:#1A7A3A;border-radius:8px;
                             text-align:center;vertical-align:middle;font-size:13px;
                             font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                    AF
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <p style="margin:0;color:#ffffff;font-size:15px;font-weight:700;line-height:1;">
                      AIAG Farming
                    </p>
                    <p style="margin:2px 0 0;color:rgba(255,255,255,0.45);font-size:11px;line-height:1;">
                      Farm Management Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Green accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#1A7A3A 0%,#4ADE80 100%);"></td>
          </tr>

          <!-- ── Body ──────────────────────────────────────────────── -->
          <tr>
            <td style="padding:36px 36px 0;">

              <!-- Greeting -->
              <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;line-height:1.25;">
                Hi ${firstName}, you're invited!
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.65;">
                <strong style="color:#374151;">${inviterName}</strong> has invited you to join
                <strong style="color:#374151;">${orgName}</strong> on AIAG Farming.
                Click the button below to accept your invitation and set up your account.
              </p>

              <!-- Role card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;
                            margin-bottom:28px;overflow:hidden;">
                <tr>
                  <td style="padding:4px 20px 0;">
                    <p style="margin:0;font-size:10px;font-weight:700;
                               text-transform:uppercase;letter-spacing:0.08em;color:#15803D;">
                      Your Role
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 20px 16px;">
                    <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#14532D;">
                      ${roleLabel}
                    </p>
                    <p style="margin:0;font-size:13px;color:#4B7C5F;line-height:1.55;">
                      ${roleDesc}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}"
                       style="display:inline-block;background:#1A7A3A;color:#ffffff;
                              text-decoration:none;padding:13px 36px;border-radius:8px;
                              font-size:15px;font-weight:600;letter-spacing:0.01em;
                              line-height:1;">
                      Accept Invitation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Details grid -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="border-top:1px solid #E5E7EB;padding-top:20px;margin-bottom:8px;">
                <tr>
                  <td style="padding-bottom:10px;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:16px;vertical-align:top;padding-top:1px;">
                          <span style="display:inline-block;width:6px;height:6px;
                                       border-radius:50%;background:#1A7A3A;margin-top:5px;"></span>
                        </td>
                        <td>
                          <p style="margin:0;font-size:13px;color:#6B7280;">
                            <span style="font-weight:600;color:#374151;">Organization:</span>
                            &nbsp;${orgName}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:16px;vertical-align:top;padding-top:1px;">
                          <span style="display:inline-block;width:6px;height:6px;
                                       border-radius:50%;background:#1A7A3A;margin-top:5px;"></span>
                        </td>
                        <td>
                          <p style="margin:0;font-size:13px;color:#6B7280;">
                            <span style="font-weight:600;color:#374151;">Invited by:</span>
                            &nbsp;${inviterName}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:16px;vertical-align:top;padding-top:1px;">
                          <span style="display:inline-block;width:6px;height:6px;
                                       border-radius:50%;background:#F59E0B;margin-top:5px;"></span>
                        </td>
                        <td>
                          <p style="margin:0;font-size:13px;color:#6B7280;">
                            <span style="font-weight:600;color:#374151;">Expires:</span>
                            &nbsp;7 days from receipt
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ────────────────────────────────────────────── -->
          <tr>
            <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;
                       padding:20px 36px;margin-top:20px;">
              <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;line-height:1.6;">
                If you weren't expecting this invitation, you can safely ignore this email —
                no account will be created without your action.
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${inviteUrl}"
                   style="color:#1A7A3A;word-break:break-all;text-decoration:none;">
                  ${inviteUrl}
                </a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Below-card note -->
        <p style="margin:20px 0 0;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.5;">
          &copy; ${new Date().getFullYear()} AIAG Farming &middot; Automated notification
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? `"AIAG Farming" <${process.env.SMTP_USER}>`,
    to,
    subject: `${inviterName} invited you to join ${orgName} on AIAG Farming`,
    html,
  });
}
