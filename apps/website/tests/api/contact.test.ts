/**
 * Tests for Contact API Route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SendGrid before importing the route
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

// Mock the NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: (body: unknown, init?: ResponseInit) => {
        return {
          ...new Response(JSON.stringify(body), init),
          json: async () => body,
        };
      },
    },
  };
});

describe('Contact API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate required fields', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    const request = new Request('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    const request = new Request('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('email');
    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it('should send email with valid data', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    (sgMail.send as ReturnType<typeof vi.fn>).mockResolvedValue([
      { statusCode: 202 },
      {},
    ]);

    const request = new Request('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message that is long enough.',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sgMail.send).toHaveBeenCalled();
  });

  it('should handle SendGrid errors', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    (sgMail.send as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('SendGrid API error')
    );

    const request = new Request('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message that is long enough.',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
