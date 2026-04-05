/**
 * Test Email Fixtures
 *
 * Realistic email templates representing different use cases,
 * each designed to produce a different compatibility score range.
 * These help verify the scoring system produces meaningful,
 * real-world-accurate results.
 */

/**
 * FIXTURE 1: Perfect Table-Based Email
 *
 * Classic table-based email layout using only universally-supported features.
 * Expected: Very high score (95–100%) across all clients.
 *
 * Uses: tables, inline styles, basic CSS (colors, padding, margin, font-size),
 * universal HTML elements (<table>, <td>, <tr>, <a>, <img>).
 * Avoids: flexbox, grid, modern CSS, media queries, border-radius, etc.
 */
export const FIXTURE_PERFECT_TABLE_EMAIL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #4f46e5; padding: 24px;">
              <img src="https://example.com/logo.png" width="120" height="40" alt="Company Logo" style="display: block;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 24px; color: #1a1a2e; font-weight: bold; padding: 0 0 16px 0;">
                    Welcome to Our Service
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #555555; line-height: 24px; padding: 0 0 24px 0;">
                    Thank you for signing up! We are excited to have you on board.
                    This is a simple, clean email that should render perfectly across
                    all email clients.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #4f46e5; padding: 12px 32px;">
                          <a href="https://example.com" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f8f9fa; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 12px; color: #999999; text-align: center;">
                    &copy; 2024 Company Inc. All rights reserved.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #999999; text-align: center; padding: 8px 0 0 0;">
                    <a href="https://example.com/unsubscribe" style="color: #4f46e5; text-decoration: none;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * FIXTURE 2: Modern Marketing Email
 *
 * Uses some modern CSS features alongside table layout.
 * Expected: Good score (80–90%) — a few features won't work everywhere
 * but the email is still very functional.
 *
 * Uses: border-radius, background-image, @media queries, max-width,
 * plus standard table layout as fallback.
 */
export const FIXTURE_MODERN_MARKETING_EMAIL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .hero-text { font-size: 22px !important; }
      .mobile-hidden { display: none !important; }
    }
    .button:hover {
      background-color: #3730a3 !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 600px;">
          <!-- Hero Section with background image -->
          <tr>
            <td style="background-image: url('https://example.com/hero-bg.jpg'); background-size: cover; background-position: center; padding: 48px 24px; text-align: center;">
              <h1 class="hero-text" style="font-size: 28px; color: #ffffff; margin: 0 0 12px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                Summer Sale is Here! ☀️
              </h1>
              <p style="font-size: 16px; color: #ffffff; margin: 0 0 24px 0; opacity: 0.9;">
                Get up to 50% off on all products
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td class="button" style="background-color: #4f46e5; border-radius: 8px; padding: 14px 36px;">
                    <a href="https://example.com/sale" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      Shop Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Product Grid -->
          <tr>
            <td style="padding: 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 20px; color: #1a1a2e; font-weight: bold; padding: 0 0 20px 0; text-align: center;">
                    Featured Products
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 8px; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <tr>
                              <td>
                                <img src="https://example.com/product1.jpg" width="100%" alt="Product 1" style="display: block;" />
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px;">
                                <p style="font-size: 14px; color: #1a1a2e; font-weight: bold; margin: 0 0 4px 0;">Classic T-Shirt</p>
                                <p style="font-size: 14px; color: #666666; margin: 0;">
                                  <span style="text-decoration: line-through;">$39.99</span>
                                  <strong style="color: #dc2626;"> $19.99</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="50%" style="padding: 8px; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <tr>
                              <td>
                                <img src="https://example.com/product2.jpg" width="100%" alt="Product 2" style="display: block;" />
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px;">
                                <p style="font-size: 14px; color: #1a1a2e; font-weight: bold; margin: 0 0 4px 0;">Denim Jacket</p>
                                <p style="font-size: 14px; color: #666666; margin: 0;">
                                  <span style="text-decoration: line-through;">$89.99</span>
                                  <strong style="color: #dc2626;"> $49.99</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #f8f9fa; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="font-size: 12px; color: #999999; margin: 0 0 8px 0;">
                &copy; 2024 Fashion Co. | <a href="#" style="color: #4f46e5; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * FIXTURE 3: Heavy Modern CSS Email (Flexbox + Grid)
 *
 * Uses modern layout techniques that will break in many email clients.
 * Expected: Moderate score (60–75%) — layout will break in Outlook, etc.
 *
 * Uses: display:flex, gap, border-radius, box-shadow, custom properties,
 * calc(), gradients, transitions. These look great in Apple Mail & Gmail
 * but will fail in Outlook/Windows.
 */
export const FIXTURE_MODERN_CSS_EMAIL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      --primary: #4f46e5;
      --secondary: #7c3aed;
      --bg: #f8fafc;
      --text: #1e293b;
      --muted: #94a3b8;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --text: #f1f5f9;
      }
    }

    @media only screen and (max-width: 480px) {
      .card-grid { flex-direction: column !important; }
      .card { width: 100% !important; }
    }

    .cta-button {
      transition: background-color 0.2s ease;
    }

    .cta-button:hover {
      background-color: var(--secondary);
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: var(--bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 16px; padding: 40px 24px; text-align: center; margin: 0 0 24px 0;">
      <h1 style="font-size: 28px; color: #ffffff; margin: 0 0 8px 0;">Your Weekly Digest 📬</h1>
      <p style="font-size: 14px; color: rgba(255,255,255,0.85); margin: 0;">Here's what happened this week</p>
    </div>

    <!-- Stats using flexbox -->
    <div class="card-grid" style="display: flex; gap: 16px; margin: 0 0 24px 0;">
      <div class="card" style="flex: 1; background-color: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
        <p style="font-size: 32px; color: var(--primary); font-weight: bold; margin: 0;">1,234</p>
        <p style="font-size: 14px; color: var(--muted); margin: 4px 0 0 0;">Total Views</p>
      </div>
      <div class="card" style="flex: 1; background-color: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
        <p style="font-size: 32px; color: var(--primary); font-weight: bold; margin: 0;">56</p>
        <p style="font-size: 14px; color: var(--muted); margin: 4px 0 0 0;">New Followers</p>
      </div>
      <div class="card" style="flex: 1; background-color: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
        <p style="font-size: 32px; color: var(--primary); font-weight: bold; margin: 0;">89%</p>
        <p style="font-size: 14px; color: var(--muted); margin: 4px 0 0 0;">Open Rate</p>
      </div>
    </div>

    <!-- Content -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 0 0 24px 0;">
      <h2 style="font-size: 20px; color: var(--text); margin: 0 0 16px 0;">Top Article</h2>
      <p style="font-size: 14px; color: var(--muted); line-height: 1.6; margin: 0 0 16px 0;">
        Discover how modern email design techniques can improve engagement
        while maintaining broad compatibility.
      </p>
      <a href="https://example.com/article" class="cta-button" style="display: inline-block; background-color: var(--primary); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold;">
        Read More →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 16px 0;">
      <p style="font-size: 12px; color: var(--muted); margin: 0;">
        You're receiving this because you subscribed to our digest.
        <a href="#" style="color: var(--primary); text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

/**
 * FIXTURE 4: Broken Layout Email
 *
 * Heavily reliant on CSS Grid, flexbox, and modern features with no
 * table fallback. Will break badly in most email clients.
 * Expected: Poor score (40–60%)
 *
 * Uses: CSS Grid, flexbox, custom properties, calc(), clamp(),
 * filter, transform, complex selectors, ::before/::after pseudo-elements.
 */
export const FIXTURE_BROKEN_LAYOUT_EMAIL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #0a0a0a;
      color: #ffffff;
    }

    .wrapper {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      max-width: 600px;
      margin: 0 auto;
      padding: clamp(16px, 4vw, 40px);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
    }

    .logo {
      filter: brightness(1.2);
      transform: scale(1.05);
    }

    .hero {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      aspect-ratio: 16/9;
    }

    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
      z-index: 1;
    }

    .hero-content {
      position: absolute;
      bottom: 24px;
      left: 24px;
      z-index: 2;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      background-color: rgba(79, 70, 229, 0.2);
      color: #818cf8;
    }

    .price {
      font-size: clamp(20px, 4vw, 32px);
      font-weight: bold;
    }

    .footer {
      text-align: center;
      padding: 24px 0;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
    }

    .footer a {
      color: #818cf8;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (prefers-color-scheme: light) {
      body { background-color: #ffffff; color: #0a0a0a; }
      .card { background: rgba(0,0,0,0.02); border-color: rgba(0,0,0,0.08); }
    }

    @media (max-width: 480px) {
      .grid-3 { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 8px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://example.com/logo.svg" width="100" height="32" alt="Logo" class="logo" />
      <div class="badge">✨ New Collection</div>
    </div>

    <div class="hero">
      <img src="https://example.com/hero.jpg" style="width: 100%; height: 100%; object-fit: cover;" alt="Hero" />
      <div class="hero-content">
        <h1 style="font-size: clamp(24px, 5vw, 36px); margin: 0 0 8px 0;">Spring Collection 2024</h1>
        <p style="font-size: 14px; opacity: 0.8;">Discover what's new this season</p>
      </div>
    </div>

    <div class="grid-3">
      <div class="card">
        <img src="https://example.com/p1.jpg" style="width: 100%; border-radius: 12px; margin: 0 0 12px 0;" alt="Product" />
        <p style="font-size: 14px; font-weight: bold; margin: 0 0 4px 0;">Minimalist Watch</p>
        <p class="price">$149</p>
      </div>
      <div class="card">
        <img src="https://example.com/p2.jpg" style="width: 100%; border-radius: 12px; margin: 0 0 12px 0;" alt="Product" />
        <p style="font-size: 14px; font-weight: bold; margin: 0 0 4px 0;">Leather Wallet</p>
        <p class="price">$79</p>
      </div>
      <div class="card">
        <img src="https://example.com/p3.jpg" style="width: 100%; border-radius: 12px; margin: 0 0 12px 0;" alt="Product" />
        <p style="font-size: 14px; font-weight: bold; margin: 0 0 4px 0;">Canvas Backpack</p>
        <p class="price">$199</p>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2024 Brand Co. | <a href="#">Unsubscribe</a> | <a href="#">Privacy</a></p>
    </div>
  </div>
</body>
</html>`;

/**
 * FIXTURE 5: Plain Text-ish Email (Minimal HTML)
 *
 * Very simple email with minimal HTML structure.
 * Expected: Very high score (95–100%) — almost nothing to fail.
 */
export const FIXTURE_MINIMAL_EMAIL = `<!doctype html>
<html>
<body style="margin: 0; padding: 20px; font-size: 14px; color: #333333; background-color: #ffffff;">
  <p style="margin: 0 0 16px 0;">Hi there,</p>
  <p style="margin: 0 0 16px 0;">
    Just a quick note to let you know your order #12345 has been shipped.
    You can track it <a href="https://example.com/track" style="color: #4f46e5;">here</a>.
  </p>
  <p style="margin: 0 0 16px 0;">Thanks,<br />The Team</p>
  <p style="margin: 0; font-size: 12px; color: #999999;">
    <a href="https://example.com/unsubscribe" style="color: #999999;">Unsubscribe</a>
  </p>
</body>
</html>`;

/**
 * FIXTURE 6: Interactive Email (Forms, Video, AMP-like)
 *
 * Uses interactive elements rarely supported in email.
 * Expected: Low score (40–60%) — most interactive features fail.
 */
export const FIXTURE_INTERACTIVE_EMAIL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
    }

    .rating-star:checked + label {
      color: #f59e0b;
    }

    .accordion-toggle:checked ~ .accordion-content {
      display: block;
    }

    .accordion-content {
      display: none;
    }

    input[type="text"]:focus {
      border-color: #4f46e5;
      outline: none;
      box-shadow: 0 0 0 3px rgba(79,70,229,0.2);
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #4f46e5; border-radius: 8px 8px 0 0;">
              <h1 style="font-size: 24px; color: #ffffff; margin: 0;">We'd Love Your Feedback!</h1>
            </td>
          </tr>

          <!-- Video Embed -->
          <tr>
            <td style="padding: 24px;">
              <video width="100%" controls style="border-radius: 8px; max-width: 552px;">
                <source src="https://example.com/feedback-intro.mp4" type="video/mp4" />
                Your email client does not support video.
              </video>
            </td>
          </tr>

          <!-- Rating Form -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <form action="https://example.com/feedback" method="POST">
                <p style="font-size: 16px; color: #333; margin: 0 0 12px 0;">How was your experience?</p>

                <input type="radio" name="rating" value="5" id="star5" class="rating-star" style="display: none;" />
                <label for="star5" style="font-size: 24px; cursor: pointer;">⭐</label>
                <input type="radio" name="rating" value="4" id="star4" class="rating-star" style="display: none;" />
                <label for="star4" style="font-size: 24px; cursor: pointer;">⭐</label>
                <input type="radio" name="rating" value="3" id="star3" class="rating-star" style="display: none;" />
                <label for="star3" style="font-size: 24px; cursor: pointer;">⭐</label>

                <p style="font-size: 14px; color: #666; margin: 16px 0 8px 0;">Tell us more:</p>
                <textarea rows="4" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 14px; resize: vertical;">
                </textarea>

                <p style="font-size: 14px; color: #666; margin: 16px 0 8px 0;">Your email:</p>
                <input type="text" placeholder="you@example.com" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 14px;" />

                <table cellpadding="0" cellspacing="0" style="margin: 20px 0 0 0;">
                  <tr>
                    <td>
                      <input type="submit" value="Submit Feedback" style="background-color: #4f46e5; color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer;" />
                    </td>
                  </tr>
                </table>
              </form>
            </td>
          </tr>

          <!-- FAQ Accordion -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="font-size: 18px; color: #333; margin: 0 0 16px 0;">Frequently Asked Questions</h2>

              <div>
                <input type="checkbox" id="faq1" class="accordion-toggle" style="display: none;" />
                <label for="faq1" style="font-size: 14px; font-weight: bold; cursor: pointer; display: block; padding: 12px; background-color: #f8f9fa; border-radius: 8px; margin: 0 0 8px 0;">
                  How do I return an item?
                </label>
                <div class="accordion-content" style="padding: 0 12px 12px;">
                  <p style="font-size: 14px; color: #666; margin: 0;">Visit our returns page within 30 days of purchase.</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                &copy; 2024 FeedbackCo. |
                <a href="#" style="color: #4f46e5; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * FIXTURE 7: Dark Mode Responsive Email
 *
 * Uses prefers-color-scheme media queries and responsive design.
 * Expected: Good score (80–90%) — dark mode is well supported but not universal.
 */
export const FIXTURE_DARK_MODE_EMAIL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <style>
    :root {
      color-scheme: light dark;
    }

    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1a1a2e !important; }
      .content-card { background-color: #16213e !important; }
      .text-primary { color: #e2e8f0 !important; }
      .text-secondary { color: #94a3b8 !important; }
      .divider { border-color: #334155 !important; }
    }

    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 12px !important; }
      .content-card { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" class="email-body" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 24px;">
        <table class="container" width="600" cellpadding="0" cellspacing="0">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 24px 0;">
              <img src="https://example.com/logo.png" width="140" height="40" alt="DarkMode Co" style="display: block;" />
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td class="content-card" style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <h1 class="text-primary" style="font-size: 22px; color: #1e293b; margin: 0 0 12px 0;">
                Your Monthly Report is Ready 📊
              </h1>
              <p class="text-secondary" style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
                Here's a summary of your account activity for the past month.
                We've noticed some great improvements in your metrics!
              </p>
              <hr class="divider" style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <!-- Stats Row -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align: center; padding: 12px 0;">
                    <p class="text-primary" style="font-size: 24px; color: #1e293b; font-weight: bold; margin: 0;">2,847</p>
                    <p class="text-secondary" style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Page Views</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 12px 0;">
                    <p class="text-primary" style="font-size: 24px; color: #1e293b; font-weight: bold; margin: 0;">142</p>
                    <p class="text-secondary" style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Signups</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 12px 0;">
                    <p class="text-primary" style="font-size: 24px; color: #1e293b; font-weight: bold; margin: 0;">94%</p>
                    <p class="text-secondary" style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Satisfaction</p>
                  </td>
                </tr>
              </table>
              <hr class="divider" style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #4f46e5; border-radius: 8px; padding: 12px 28px;">
                    <a href="https://example.com/report" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">
                      View Full Report
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p class="text-secondary" style="font-size: 12px; color: #94a3b8; margin: 0;">
                &copy; 2024 DarkMode Co. |
                <a href="#" style="color: #4f46e5; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
