/**
 * Lead Flow Smoke Tests
 *
 * These tests verify the basic signup flow functionality.
 * Run with: npm test
 *
 * Note: Install vitest if needed:
 *   npm install -D vitest @testing-library/react @testing-library/user-event jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupModal from '../src/components/signup/SignupModal';

// Mock fetch
global.fetch = vi.fn();

describe('Lead Flow - Step 1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal when open', () => {
    render(
      <SignupModal isOpen={true} onClose={() => {}} variant="b" />
    );

    expect(screen.getByText(/Get Started with RAimond/i)).toBeInTheDocument();
  });

  it('should block submission without email', async () => {
    const user = userEvent.setup();
    render(
      <SignupModal isOpen={true} onClose={() => {}} variant="b" />
    );

    const submitButton = screen.getByRole('button', { name: /continue/i });

    // Try to submit without filling anything
    await user.click(submitButton);

    // Should see validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    // Fetch should not have been called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should block submission without consent checkboxes', async () => {
    const user = userEvent.setup();
    render(
      <SignupModal isOpen={true} onClose={() => {}} variant="b" />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /continue/i });

    // Fill email but don't check consent boxes
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Should see validation error
    await waitFor(() => {
      expect(screen.getByText(/please agree to terms and privacy policy/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should submit Step 1 successfully with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      status: 'ok',
      leadId: 'test-lead-123'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <SignupModal isOpen={true} onClose={() => {}} variant="b" />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms of service/i });
    const privacyCheckbox = screen.getByRole('checkbox', { name: /privacy policy/i });
    const submitButton = screen.getByRole('button', { name: /continue/i });

    // Fill form
    await user.type(emailInput, 'trader@example.com');
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);

    // Submit
    await user.click(submitButton);

    // Should call API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/signup/step1',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('trader@example.com')
        })
      );
    });

    // Should proceed to Step 2 (variant b)
    await waitFor(() => {
      expect(screen.getByText(/personalize your rai setup/i)).toBeInTheDocument();
    });
  });

  it('should show success for variant A after Step 1', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      status: 'ok',
      leadId: 'test-lead-123'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <SignupModal isOpen={true} onClose={() => {}} variant="a" />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms of service/i });
    const privacyCheckbox = screen.getByRole('checkbox', { name: /privacy policy/i });
    const submitButton = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'trader@example.com');
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);
    await user.click(submitButton);

    // Should show success screen (variant A skips Step 2)
    await waitFor(() => {
      expect(screen.getByText(/you're in!/i)).toBeInTheDocument();
    });
  });
});

describe('Lead Flow - Step 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit Step 2 with optional fields', async () => {
    const user = userEvent.setup();

    // Mock Step 1 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', leadId: 'test-lead-123' })
    });

    // Mock Step 2 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', profileId: 'test-profile-456', tags: {} })
    });

    render(
      <SignupModal isOpen={true} onClose={() => {}} variant="b" />
    );

    // Complete Step 1
    const emailInput = screen.getByLabelText(/email address/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /terms of service/i });
    const privacyCheckbox = screen.getByRole('checkbox', { name: /privacy policy/i });
    const submitButton = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'trader@example.com');
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);
    await user.click(submitButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/personalize your rai setup/i)).toBeInTheDocument();
    });

    // Fill Step 2 fields
    const beginnerButton = screen.getByRole('button', { name: /beginner/i });
    await user.click(beginnerButton);

    const completeButton = screen.getByRole('button', { name: /complete setup/i });
    await user.click(completeButton);

    // Should call Step 2 API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/signup/step2',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-lead-123')
        })
      );
    });

    // Should show success
    await waitFor(() => {
      expect(screen.getByText(/you're in!/i)).toBeInTheDocument();
    });
  });
});
