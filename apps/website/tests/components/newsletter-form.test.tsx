/**
 * Tests for NewsletterForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NewsletterForm } from '@/components/newsletter-form';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('NewsletterForm', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should render the form with email input and submit button', () => {
    render(<NewsletterForm />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('should render with hero variant', () => {
    render(<NewsletterForm variant="hero" />);

    const input = screen.getByPlaceholderText('Enter your email');
    expect(input).toBeInTheDocument();
    // Hero variant has different ID
    expect(input.id).toBe('email-address-hero');
  });

  it('should render with default variant', () => {
    render(<NewsletterForm variant="default" />);

    const input = screen.getByPlaceholderText('Enter your email');
    expect(input).toBeInTheDocument();
    expect(input.id).toBe('email-address-default');
  });

  it('should update email value when user types', () => {
    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(input.value).toBe('test@example.com');
  });

  it('should submit email and show success message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('Enter your email');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'test@example.com' } });

    await act(async () => {
      fireEvent.submit(form!);
    });

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Thanks for subscribing/)).toBeInTheDocument();
    });

    // Verify API was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('should show error message on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Invalid email' }),
    });

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('Enter your email');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'invalid' } });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should call API with the correct payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('Enter your email');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'user@domain.com' } });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'user@domain.com' }),
    });
  });
});
