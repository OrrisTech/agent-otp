'use client';

import * as React from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface NewsletterFormProps {
  variant?: 'default' | 'hero';
}

export function NewsletterForm({ variant = 'default' }: NewsletterFormProps) {
  const [status, setStatus] = React.useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to subscribe'
      );
    }
  }

  const isHero = variant === 'hero';

  if (status === 'success') {
    return (
      <div
        className={`flex items-center justify-center gap-2 ${
          isHero ? 'text-primary-foreground' : 'text-green-600'
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="text-sm font-medium">
          Thanks for subscribing! Check your email.
        </span>
      </div>
    );
  }

  return (
    <div className={isHero ? '' : 'mt-6 max-w-md mx-auto'}>
      <form onSubmit={handleSubmit} className="flex gap-x-4">
        <label htmlFor={`email-address-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-address-${variant}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          className={`min-w-0 flex-auto rounded-lg px-3.5 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHero
              ? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50'
              : 'border border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring'
          }`}
          placeholder="Enter your email"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`flex-none rounded-lg px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHero
              ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:outline-primary-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary'
          }`}
        >
          {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && errorMessage && (
        <p
          className={`mt-2 text-sm text-center ${
            isHero ? 'text-red-200' : 'text-destructive'
          }`}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
