/**
 * Tests for Subscribe API Route
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

describe('Subscribe API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate email is required', async () => {
    const { POST } = await import('@/app/api/subscribe/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    const request = new Request('http://localhost:3001/api/subscribe', {
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
    const { POST } = await import('@/app/api/subscribe/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    const request = new Request('http://localhost:3001/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('email');
    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it('should subscribe with valid email', async () => {
    const { POST } = await import('@/app/api/subscribe/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    (sgMail.send as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { statusCode: 202 },
      {},
    ]);

    const request = new Request('http://localhost:3001/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'subscriber@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sgMail.send).toHaveBeenCalled();
  });

  it('should handle SendGrid errors gracefully', async () => {
    const { POST } = await import('@/app/api/subscribe/route');
    const sgMail = (await import('@sendgrid/mail')).default;

    (sgMail.send as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('SendGrid error')
    );

    const request = new Request('http://localhost:3001/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'subscriber@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
