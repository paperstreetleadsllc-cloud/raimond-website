"use client";

import React from 'react';
import { useSignupModal } from '@/lib/signup/useSignupModal';
import SignupModal from './SignupModal';

interface GetStartedButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'link';
}

/**
 * Reusable Get Started button that opens the signup modal
 * Use this anywhere you need a signup CTA
 */
export default function GetStartedButton({
  className = '',
  children = 'Get Started',
  variant = 'primary'
}: GetStartedButtonProps) {
  const { isOpen, variant: abVariant, openModal, closeModal } = useSignupModal();

  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all';

  const variantStyles = {
    primary: 'px-6 py-3 rounded-xl bg-[var(--accent)] text-black hover:opacity-90',
    secondary: 'px-6 py-3 rounded-xl border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10',
    link: 'text-[var(--accent)] hover:underline',
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        {children}
      </button>

      <SignupModal
        isOpen={isOpen}
        onClose={closeModal}
        variant={abVariant}
      />
    </>
  );
}
