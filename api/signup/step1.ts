import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

interface Step1Body {
  email: string;
  consent: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  client_ts?: string;
  hcaptchaToken?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const body = req.body as Step1Body;

    // Validation
    if (!body.email || !body.consent) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and consent are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Optional hCaptcha verification
    if (process.env.HCAPTCHA_SECRET_KEY && body.hcaptchaToken) {
      const verifyUrl = 'https://hcaptcha.com/siteverify';
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.HCAPTCHA_SECRET_KEY,
          response: body.hcaptchaToken
        })
      });

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Captcha verification failed'
        });
      }
    }

    // Hash IP using IP_SALT
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ipArray = Array.isArray(ip) ? ip[0] : ip.toString();
    const salt = process.env.IP_SALT || 'default-salt-change-me';
    const ipHash = crypto
      .createHash('sha256')
      .update(ipArray + salt)
      .digest('hex')
      .substring(0, 16);

    // Prepare lead data
    const leadData = {
      email: body.email,
      consent_given: body.consent,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_term: body.utm_term || null,
      utm_content: body.utm_content || null,
      referrer: body.referrer || null,
      client_timestamp: body.client_ts || new Date().toISOString(),
      ip_hash: ipHash,
      created_at: new Date().toISOString()
    };

    // Insert into Supabase using REST API
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(leadData)
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('Supabase error:', errorText);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create lead'
      });
    }

    const [lead] = await supabaseResponse.json();
    const leadId = lead?.id;

    if (!leadId) {
      console.error('No lead ID returned from Supabase');
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create lead'
      });
    }

    // Send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to RAimond</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to RAimond</h1>
              </div>

              <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Your RAimond Starter Pack is Here! 🚀</h2>

                <p>Hi there,</p>

                <p>Thanks for joining RAimond! We're excited to help you level up your trading with AI-powered insights.</p>

                <p><strong>Here's what's in your Starter Pack:</strong></p>

                <ul style="line-height: 2;">
                  <li><strong>Quick Start Guide</strong> – Get up and running in 5 minutes</li>
                  <li><strong>Trading Playbooks</strong> – Proven strategies from pro traders</li>
                  <li><strong>Free Indicator</strong> – Our signature RAi-EDGE indicator</li>
                  <li><strong>Setup Walkthrough</strong> – Connect your platform in 3 steps</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://raimondai.com/starter-pack?id=${leadId}"
                     style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Access Your Starter Pack →
                  </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                  Questions? Just reply to this email – we're here to help!<br>
                  <strong>– The RAimond Team</strong>
                </p>
              </div>
            </body>
          </html>
        `;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'RAimond <welcome@mail.raimondai.com>',
            to: [body.email],
            subject: 'Welcome to RAimond – Your Starter Pack Inside 🚀',
            html: emailHtml
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Resend error:', errorText);
          // Don't fail the request if email fails
        }
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json({
      status: 'ok',
      leadId
    });

  } catch (error: any) {
    console.error('Step 1 error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}
