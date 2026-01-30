/**
 * Newsletter subscription API endpoint.
 * Stores email in Supabase and sends confirmation via SendGrid.
 */

import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { createClient } from '@supabase/supabase-js';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'support@agentotp.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Validates email format.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Store in Supabase if configured
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed!' },
          { status: 200 }
        );
      }

      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          subscribed_at: new Date().toISOString(),
          source: 'website',
        });

      if (insertError) {
        console.error('Failed to store subscriber:', insertError);
        // Continue even if storage fails - we still want to send the welcome email
      }
    }

    // Send welcome email via SendGrid
    if (SENDGRID_API_KEY) {
      await sgMail.send({
        to: email,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: 'Agent OTP',
        },
        subject: 'Welcome to the Agent OTP Newsletter!',
        text: `
Welcome to the Agent OTP Newsletter!

Thank you for subscribing! You'll receive updates about:
- New features and releases
- Best practices for AI agent security
- Tips and tutorials
- Industry news and insights

We typically send 1-2 emails per month, and you can unsubscribe at any time.

Stay secure,
The Agent OTP Team

https://agentotp.com
        `.trim(),
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to the Agent OTP Newsletter!</h1>
            <p>Thank you for subscribing! You'll receive updates about:</p>
            <ul>
              <li>New features and releases</li>
              <li>Best practices for AI agent security</li>
              <li>Tips and tutorials</li>
              <li>Industry news and insights</li>
            </ul>
            <p>We typically send 1-2 emails per month, and you can unsubscribe at any time.</p>
            <p>Stay secure,<br>The Agent OTP Team</p>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              <a href="https://agentotp.com">agentotp.com</a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
