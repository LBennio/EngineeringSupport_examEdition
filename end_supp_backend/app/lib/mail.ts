import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_URL!);
const fromEmail = 'onboarding@resend.dev';

export async function sendWelcomeEmail(email: string) {
    try {
        await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Welcome to Engineering Support!',
            html: WELCOME_EMAIL,
        });
    } catch (error) {
        console.error("Error: ", error);

        throw error;
    }
}

export async function sendResetEmail(email: string, link: string) {
    await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Reset Password token',
        html: RESET_PASSWORD_EMAIL(link),
    });
}

// yes. it's ChatGPT generated.
const WELCOME_EMAIL = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Welcome to Engineering Support</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body style="margin:0; padding:0; background-color:#f6f9fc; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="padding:24px 32px; background:#0f172a; color:#ffffff;">
                <h1 style="margin:0; font-size:22px; font-weight:600;">
                  Engineering Support
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px; font-size:16px; color:#111827;">
                  Welcome 👋
                </p>

                <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
                  Thanks for signing up for <strong>Engineering Support</strong>.
                  Your account has been successfully created, and you can now
                  access all available features.
                </p>

                <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#374151;">
                  If you need help, have questions, or want to explore best practices,
                  we’re here to support you.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td>
                      <a
                        href="https://yourdomain.com/dashboard"
                        style="
                          display:inline-block;
                          padding:12px 20px;
                          background:#2563eb;
                          color:#ffffff;
                          text-decoration:none;
                          font-size:14px;
                          font-weight:600;
                          border-radius:6px;
                        "
                      >
                        Go to Dashboard
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:32px 0 0; font-size:14px; color:#6b7280;">
                  If you didn’t create this account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px; background:#f9fafb; font-size:12px; color:#6b7280;">
                <p style="margin:0;">
                  © ${new Date().getFullYear()} Engineering Support. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const RESET_PASSWORD_EMAIL = (resetLink: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Reset Your Password</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body style="margin:0; padding:0; background-color:#f6f9fc; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <tr>
              <td style="padding:24px 32px; background:#0f172a; color:#ffffff;">
                <h1 style="margin:0; font-size:22px; font-weight:600;">
                  Engineering Support
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px; font-size:16px; color:#111827;">
                  Reset your password
                </p>

                <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
                  We received a request to reset the password for your <strong>Engineering Support</strong> account.
                </p>

                <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#374151;">
                  Click the button below to proceed. <strong>This link expires in 15 minutes.</strong>
                </p>

                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td>
                      <a
                        href="${resetLink}"
                        style="
                          display:inline-block;
                          padding:12px 20px;
                          background:#2563eb;
                          color:#ffffff;
                          text-decoration:none;
                          font-size:14px;
                          font-weight:600;
                          border-radius:6px;
                        "
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:32px 0 0; font-size:14px; color:#6b7280;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
                
                <p style="margin:16px 0 0; font-size:12px; color:#9ca3af;">
                  Button not working? Copy and paste this link into your browser:<br/>
                  <a href="${resetLink}" style="color:#2563eb; text-decoration:underline; word-break:break-all;">${resetLink}</a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px; background:#f9fafb; font-size:12px; color:#6b7280;">
                <p style="margin:0;">
                  © ${new Date().getFullYear()} Engineering Support. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};
