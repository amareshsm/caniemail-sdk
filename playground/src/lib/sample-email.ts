export const SAMPLE_EMAIL = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f7;
        font-family: Arial, Helvetica, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background-color: #4f46e5;
        padding: 24px;
        text-align: center;
      }
      .hero {
        padding: 40px 24px;
        text-align: center;
      }
      .hero h1 {
        font-size: 28px;
        color: #1a1a2e;
        margin: 0 0 16px 0;
      }
      .hero p {
        font-size: 16px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 24px 0;
      }
      .cta-button {
        display: inline-block;
        background-color: #4f46e5;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
      }
      .features {
        padding: 0 24px 40px;
      }
      .feature-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }
      .feature-card {
        flex: 1;
        background-color: #f9fafb;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      }
      .footer {
        background-color: #1a1a2e;
        padding: 24px;
        text-align: center;
      }
      .footer p {
        color: #9ca3af;
        font-size: 12px;
        margin: 0 0 8px 0;
      }
      .footer a {
        color: #818cf8;
        text-decoration: underline;
      }
      @media only screen and (max-width: 600px) {
        .feature-row {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://example.com/logo.png" alt="Acme Inc." width="120" height="40" />
      </div>
      <div class="hero">
        <h1>Welcome to Acme! 🎉</h1>
        <p>
          We're thrilled to have you on board. Acme helps you build,
          test, and ship email templates that look great everywhere.
        </p>
        <a href="https://example.com/start" class="cta-button">Get Started</a>
      </div>
      <div class="features">
        <div class="feature-row">
          <div class="feature-card">
            <h3>Cross-Client Compatible</h3>
            <p>Works in Gmail, Outlook, Apple Mail, and 30+ other clients.</p>
          </div>
          <div class="feature-card">
            <h3>Blazing Fast</h3>
            <p>Check your emails in milliseconds, not minutes.</p>
          </div>
        </div>
      </div>
      <div class="footer">
        <p>&copy; 2026 Acme Inc. All rights reserved.</p>
        <p><a href="https://example.com/unsubscribe">Unsubscribe</a></p>
      </div>
    </div>
  </body>
</html>`;
