/**
 * Contact form API endpoint.
 * Receives form submissions and sends email via SendGrid.
 */

import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'support@agentotp.com';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'support@agentotp.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

/**
 * Validates the contact form data.
 */
function validateFormData(data: unknown): ContactFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid form data');
  }

  const { name, email, company, subject, message } = data as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new Error('Name is required and must be at least 2 characters');
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    throw new Error('A valid email address is required');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    throw new Error('Subject is required and must be at least 3 characters');
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    throw new Error('Message is required and must be at least 10 characters');
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: company && typeof company === 'string' ? company.trim() : undefined,
    subject: subject.trim(),
    message: message.trim(),
  };
}

/**
 * Validates email format.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 503 }
      );
    }

    // Parse and validate form data
    const body = await request.json();
    const formData = validateFormData(body);

    // Prepare email content
    const emailContent = `
New contact form submission from Agent OTP website:

Name: ${formData.name}
Email: ${formData.email}
${formData.company ? `Company: ${formData.company}\n` : ''}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from Agent OTP Contact Form
    `.trim();

    // Send email via SendGrid
    await sgMail.send({
      to: CONTACT_TO_EMAIL,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'Agent OTP Contact Form',
      },
      replyTo: formData.email,
      subject: `[Contact] ${formData.subject}`,
      text: emailContent,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">
                <a href="mailto:${formData.email}">${formData.email}</a>
              </td>
            </tr>
            ${formData.company ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.company}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.subject}</td>
            </tr>
          </table>
          <h3 style="color: #333; margin-top: 20px;">Message:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.message}</div>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Sent from Agent OTP Contact Form</p>
        </div>
      `,
    });

    // Send auto-reply to the user
    await sgMail.send({
      to: formData.email,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'Agent OTP',
      },
      subject: 'We received your message - Agent OTP',
      text: `
Hi ${formData.name},

Thank you for contacting Agent OTP. We've received your message and will get back to you as soon as possible, typically within 24-48 hours.

Your message:
---
Subject: ${formData.subject}

${formData.message}
---

Best regards,
The Agent OTP Team

https://agentotp.com
      `.trim(),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for contacting us!</h2>
          <p>Hi ${formData.name},</p>
          <p>We've received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your message:</strong>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
          <p>Best regards,<br>The Agent OTP Team</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            <a href="https://agentotp.com">agentotp.com</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof Error) {
      // Validation errors
      if (error.message.includes('required') || error.message.includes('valid')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
