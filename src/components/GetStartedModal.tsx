/**
 * GetStartedModal - Entry point for the signup flow
 *
 * This is an alias for SignupModal to match naming conventions.
 * Supports A/B testing via ?variant= query parameter.
 *
 * Usage:
 *   <GetStartedModal isOpen={open} onClose={()=>setOpen(false)} variant="a" />
 *
 * Variants:
 *   'a' = Step 1 only (email + consent)
 *   'b' = Step 1 + Step 2 (full progressive profiling) - default
 */

export { default } from './signup/SignupModal';
export { default as GetStartedModal } from './signup/SignupModal';
