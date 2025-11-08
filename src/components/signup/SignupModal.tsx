"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Step1Data, Step2Data, SignupResponse } from '@/lib/signup/types';
import {
  captureUTMParams,
  isLikelySpam,
  isValidEmail,
  formatPhone,
  logAnalyticsEvent,
  generateUserTags
} from '@/lib/signup/utils';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'a' | 'b'; // A/B testing: 'a' = step1 only, 'b' = step1+step2 (default)
}

export default function SignupModal({
  isOpen,
  onClose,
  variant = 'b'
}: SignupModalProps) {
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState('');
  const [formStartTime] = useState(Date.now());

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

  // Step 2 fields
  const [tradingExperience, setTradingExperience] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('');
  const [tradingChallenge, setTradingChallenge] = useState('');
  const [tradingStyle, setTradingStyle] = useState<'day' | 'swing' | 'longterm' | ''>('');
  const [assetClasses, setAssetClasses] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [portfolioSize, setPortfolioSize] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    if (isOpen) {
      logAnalyticsEvent('signup_modal_opened', { variant });
      logAnalyticsEvent('ab_variant', { variant });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, variant]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!agreeToTerms || !agreeToPrivacy) {
      setError('Please agree to Terms and Privacy Policy');
      return;
    }

    if (isLikelySpam(formStartTime)) {
      setError('Please take a moment to review the form');
      return;
    }

    setLoading(true);

    try {
      const utmParams = captureUTMParams();
      const step1Data = {
        email,
        consent: agreeToTerms && agreeToPrivacy,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
        referrer: utmParams.referrer,
        client_ts: new Date().toISOString(),
      };

      const response = await fetch('/api/signup/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step1Data),
      });

      const data = await response.json();

      if (data.status === 'ok' && data.leadId) {
        setLeadId(data.leadId);
        logAnalyticsEvent('signup_step1_completed', {
          email,
          ...utmParams
        });

        if (variant === 'a') {
          setStep('success');
        } else {
          setStep(2);
        }
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
        logAnalyticsEvent('signup_step1_failed', { error: data.message });
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      logAnalyticsEvent('signup_step1_error', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const step2Data = {
        leadId,
        experienceLevel: tradingExperience || undefined,
        challenge: tradingChallenge || undefined,
        style: tradingStyle || undefined,
        assetClasses: assetClasses.length > 0 ? assetClasses : undefined,
        phone: phone || undefined,
        tools: platforms.length > 0 ? platforms : undefined,
        portfolioRange: portfolioSize || undefined,
        monthlyVolume: monthlyVolume || undefined,
        region: region || undefined,
      };

      const response = await fetch('/api/signup/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step2Data),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        logAnalyticsEvent('signup_step2_completed', {
          leadId,
          tags: data.tags
        });
        setStep('success');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
        logAnalyticsEvent('signup_step2_failed', { error: data.message });
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      logAnalyticsEvent('signup_step2_error', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface/95 backdrop-blur rounded-2xl border border-white/10 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Email & Consent */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Get Started with RAimond</h2>
              <p className="text-muted">
                Access institutional-grade trading intelligence. No credit card required.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address <span className="text-rose-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 accent-[var(--accent)]"
                    required
                  />
                  <span className="text-sm text-muted">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-[var(--accent)] hover:underline">
                      Terms of Service
                    </a>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToPrivacy}
                    onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                    className="mt-1 accent-[var(--accent)]"
                    required
                  />
                  <span className="text-sm text-muted">
                    I agree to the{' '}
                    <a href="/privacy" target="_blank" className="text-[var(--accent)] hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-6 py-3 rounded-xl font-semibold bg-[var(--accent)] text-black hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Creating your account...' : 'Continue →'}
            </button>

            <p className="mt-4 text-xs text-center text-muted">
              By signing up, you'll receive a free Starter Pack with playbooks and strategies.
            </p>
          </form>
        )}

        {/* Step 2: Profile enrichment */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Personalize Your RAi Setup</h2>
              <p className="text-muted">
                Help us tailor signals and insights to your trading style. All fields optional.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Trading Experience */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trading experience <span className="text-muted text-xs">(optional)</span>
                </label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTradingExperience(level as any)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        tradingExperience === level
                          ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40'
                          : 'bg-white/5 text-muted hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trading Style */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trading style <span className="text-muted text-xs">(optional)</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'day', label: 'Day Trader' },
                    { value: 'swing', label: 'Swing' },
                    { value: 'longterm', label: 'Long-term' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setTradingStyle(style.value as any)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        tradingStyle === style.value
                          ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40'
                          : 'bg-white/5 text-muted hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Classes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Asset classes <span className="text-muted text-xs">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Stocks', 'Options', 'Crypto', 'Forex', 'Futures'].map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => toggleArrayItem(assetClasses, setAssetClasses, asset.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        assetClasses.includes(asset.toLowerCase())
                          ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40'
                          : 'bg-white/5 text-muted hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Platforms */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current platforms <span className="text-muted text-xs">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'tos', label: 'Thinkorswim' },
                    { value: 'tradingview', label: 'TradingView' },
                    { value: 'sierra', label: 'Sierra Chart' },
                    { value: 'ninjatrader', label: 'NinjaTrader' },
                    { value: 'bookmap', label: 'Bookmap' },
                    { value: 'other', label: 'Other' },
                  ].map((platform) => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => toggleArrayItem(platforms, setPlatforms, platform.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                        platforms.includes(platform.value)
                          ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40'
                          : 'bg-white/5 text-muted hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trading Challenge */}
              <div>
                <label htmlFor="challenge" className="block text-sm font-medium mb-2">
                  Current trading challenge <span className="text-muted text-xs">(optional, 120 chars)</span>
                </label>
                <textarea
                  id="challenge"
                  value={tradingChallenge}
                  onChange={(e) => setTradingChallenge(e.target.value.slice(0, 120))}
                  placeholder="e.g., Struggling with entries on choppy days..."
                  maxLength={120}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition resize-none"
                />
                <div className="text-xs text-muted mt-1 text-right">
                  {tradingChallenge.length}/120
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone number <span className="text-muted text-xs">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                />
                <p className="text-xs text-muted mt-1">
                  Helps us fast-track your setup and send critical alerts.
                </p>
              </div>

              {/* Portfolio Size & Volume - Collapsed for brevity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                    Portfolio size <span className="text-muted text-xs">(optional)</span>
                  </label>
                  <select
                    id="portfolio"
                    value={portfolioSize}
                    onChange={(e) => setPortfolioSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-brand focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                  >
                    <option value="">Select...</option>
                    <option value="under10k">Under $10K</option>
                    <option value="10k-50k">$10K - $50K</option>
                    <option value="50k-250k">$50K - $250K</option>
                    <option value="250k-1m">$250K - $1M</option>
                    <option value="over1m">Over $1M</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="volume" className="block text-sm font-medium mb-2">
                    Monthly trades <span className="text-muted text-xs">(optional)</span>
                  </label>
                  <select
                    id="volume"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-brand focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                  >
                    <option value="">Select...</option>
                    <option value="under10">Under 10</option>
                    <option value="10-50">10 - 50</option>
                    <option value="50-200">50 - 200</option>
                    <option value="200plus">200+</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  logAnalyticsEvent('signup_step2_skipped');
                  setStep('success');
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-[var(--accent)] text-black hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Saving...' : 'Complete Setup →'}
              </button>
            </div>
          </form>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-2">You're in!</h2>
            <p className="text-muted mb-6">
              Check your email for your RAimond Starter Pack with playbooks, setup guides, and a free indicator.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/dashboard';
                }}
                className="w-full px-6 py-3 rounded-xl font-semibold bg-[var(--accent)] text-black hover:opacity-90 transition"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
