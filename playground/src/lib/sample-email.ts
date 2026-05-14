export const SAMPLE_EMAIL = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Acme</title>
    <style>
      @media screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .stack { display: block !important; width: 100% !important; }
        .px-mobile { padding-left: 20px !important; padding-right: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f7;">
      <tr>
        <td align="center" style="padding: 24px 12px;">

          <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff;">

            <tr>
              <td align="center" style="background-color:#4f46e5; padding:28px 24px;">
                <img src="https://via.placeholder.com/120x40/ffffff/4f46e5?text=ACME" width="120" height="40" alt="Acme" style="display:block;" />
              </td>
            </tr>

            <tr>
              <td class="px-mobile" align="center" style="padding: 40px 32px 24px 32px;">
                <h1 style="margin:0 0 16px 0; font-family: Arial, Helvetica, sans-serif; font-size: 26px; line-height: 1.3; color:#111827; font-weight: bold;">
                  Welcome to Acme
                </h1>
                <p style="margin: 0 0 28px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color:#4b5563;">
                  Your account is ready. Tap the button below to confirm your email and start building.
                </p>

                <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                  <tr>
                    <td align="center" bgcolor="#4f46e5" style="background-color:#4f46e5; padding: 14px 32px;">
                      <a href="https://example.com/confirm" style="font-family: Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:#ffffff; text-decoration:none; display:inline-block;">
                        Confirm your email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 28px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.6; color:#6b7280;">
                  Or copy this link:
                  <a href="https://example.com/confirm" style="color:#4f46e5;">example.com/confirm</a>
                </p>
              </td>
            </tr>

            <tr>
              <td class="px-mobile" style="padding: 0 32px 32px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="stack" valign="top" width="50%" style="padding-right:12px;">
                      <h3 style="margin:0 0 8px 0; font-family: Arial, Helvetica, sans-serif; font-size:15px; color:#111827;">
                        Cross-client compatible
                      </h3>
                      <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:#6b7280;">
                        Tested across Gmail, Outlook, Apple Mail, and 30+ clients.
                      </p>
                    </td>
                    <td class="stack" valign="top" width="50%" style="padding-left:12px;">
                      <h3 style="margin:0 0 8px 0; font-family: Arial, Helvetica, sans-serif; font-size:15px; color:#111827;">
                        Catch issues early
                      </h3>
                      <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:#6b7280;">
                        Real-time linting flags features that break in older clients.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="background-color:#f9fafb; padding: 24px 32px;">
                <p style="margin:0 0 6px 0; font-family: Arial, Helvetica, sans-serif; font-size:12px; line-height:1.6; color:#6b7280;">
                  &copy; 2026 Acme Inc. &nbsp;·&nbsp; 100 Main St, San Francisco, CA
                </p>
                <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:12px; line-height:1.6; color:#6b7280;">
                  <a href="https://example.com/unsubscribe" style="color:#6b7280;">Unsubscribe</a>
                  &nbsp;·&nbsp;
                  <a href="https://example.com/preferences" style="color:#6b7280;">Email preferences</a>
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`;
