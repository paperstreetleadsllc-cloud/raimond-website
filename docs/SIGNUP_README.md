# RAimond Signup System – Complete Package

## What's Included

✅ **2-Step Progressive Profiling Modal**
- Step 1: Email + consent (required)
- Step 2: Trading profile enrichment (optional but encouraged)
- Success screen with clear next steps

✅ **Backend API Integration**
- `/api/signup/step1` – Creates user, sends welcome email
- `/api/signup/step2` – Updates profile, applies tags, triggers sequences

✅ **UTM Tracking & Analytics**
- Automatic UTM parameter capture
- Client-side & server-side event logging
- Integration points for GA4, Facebook Pixel, Mixpanel, Segment

✅ **Email Automation Sequences**
- Welcome email (immediate)
- Beginner onboarding (5 emails over 14 days)
- Day trader order flow (4 emails over 10 days)
- Futures + Sierra Chart quickstart (4 emails over 7 days)
- Options traders (4 emails over 12 days)
- Re-engagement (3 emails over 21 days)

✅ **A/B Testing Framework**
- Variant A: Step 1 only
- Variant B: Step 1 + Step 2
- 50/50 traffic split, automatic assignment
- Success metrics & statistical analysis plan

✅ **Spam Protection & Compliance**
- Time-based spam detection (< 3 seconds)
- IP hashing for privacy
- GDPR-compliant consent checkboxes
- Links to Terms and Privacy Policy

✅ **Mobile-First Responsive Design**
- Optimized for 320px–414px viewports
- Touch-friendly tap targets (44x44px min)
- Appropriate keyboard types (email, phone, etc.)
- No zoom-in on input focus

✅ **Comprehensive QA Checklist**
- Desktop browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS, Android)
- Edge cases & error scenarios
- Accessibility (WCAG 2.1 AA)
- Security & compliance
- Performance benchmarks

---

## File Manifest

### Components
```
src/components/signup/
├── SignupModal.tsx           # Main 2-step modal (592 lines)
└── GetStartedButton.tsx      # Reusable CTA button wrapper
```

### API Routes
```
src/app/api/signup/
├── step1/
│   └── route.ts              # Email signup endpoint
└── step2/
    └── route.ts              # Profile enrichment endpoint
```

### Library / Utils
```
src/lib/signup/
├── types.ts                  # TypeScript interfaces
├── utils.ts                  # UTM capture, validation, analytics
└── useSignupModal.ts         # Modal state hook with A/B test logic
```

### Example Landing Page
```
src/app/page.tsx              # Full landing page with CTAs
```

### Documentation
```
docs/
├── SIGNUP_IMPLEMENTATION_GUIDE.md    # Step-by-step setup (400+ lines)
├── EMAIL_AUTOMATION_SEQUENCES.md     # Email strategy (600+ lines)
├── AB_TEST_STRATEGY.md               # A/B testing plan (500+ lines)
├── QA_CHECKLIST_SIGNUP.md            # Testing checklist (700+ lines)
└── SIGNUP_README.md                  # This file
```

---

## Quick Start

### 1. Install & Configure

```bash
# No additional dependencies needed (Next.js only)

# Add to .env.local:
IP_SALT=your-random-salt
RESEND_API_KEY=re_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=xxxxx
```

### 2. Set Up Database

Run the SQL in `SIGNUP_IMPLEMENTATION_GUIDE.md` to create the `users` table.

### 3. Integrate Email Service

Update `src/app/api/signup/step1/route.ts` with your email provider (Resend, SendGrid, etc.).

### 4. Use in Your App

```tsx
import GetStartedButton from '@/components/signup/GetStartedButton';

<GetStartedButton variant="primary">
  Start Free Trial →
</GetStartedButton>
```

Done! The modal will open, capture the signup, send the welcome email, and trigger the appropriate onboarding sequence.

---

## Key Features

### Progressive Profiling
Instead of asking 15 questions upfront, we split it:
1. **Step 1 (required):** Email + consent → Low friction, high completion
2. **Step 2 (optional):** Trading profile → Rich data, better personalization

Users can skip Step 2, but most complete it because:
- Clear value exchange ("personalize your setup")
- Optional fields labeled
- Easy to complete (1–2 minutes)

### Smart Segmentation

Step 2 data generates tags:
```
exp:beginner|intermediate|advanced
style:day|swing|longterm
asset:stocks|options|crypto|forex|futures
tool:tos|tradingview|sierra|ninjatrader|bookmap|other
phone:present|absent
```

Use these tags to:
- Trigger personalized email sequences
- Customize in-app onboarding
- Prioritize sales outreach
- Build better product features

### A/B Testing Built-In

Test whether Step 2 improves trial activation:
- **Variant A:** Email only (control)
- **Variant B:** Email + profile (test)

Hypothesis: Higher quality leads from Step 2 → higher trial activation.

---

## Email Sequences Summary

| Sequence | Target | Duration | Emails | Goal |
|----------|--------|----------|--------|------|
| **Welcome** | All users | Immediate | 1 | Deliver Starter Pack |
| **Beginner** | `exp:beginner` | 14 days | 5 | Education → trial activation |
| **Day Trader** | `style:day` | 10 days | 4 | Order flow mastery → feature adoption |
| **Futures + Sierra** | `asset:futures` + `tool:sierra` | 7 days | 4 | Integration setup → first trade |
| **Options Flow** | `asset:options` | 12 days | 4 | UOA tracking → premium upgrade |
| **Re-engagement** | No login 7d | 21 days | 3 | Reactivation → trial start |

---

## Success Metrics (Targets)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Step 1 Completion | 60%+ | Modal opens → Step 1 submit |
| Step 2 Completion | 50%+ | Step 1 → Step 2 complete |
| Email Open Rate | 25%+ | Welcome email |
| Email Click Rate | 8%+ | CTA clicks |
| Trial Activation (D7) | 40%+ | Signups → Trial started |

---

## Security & Compliance

✅ **GDPR Compliant**
- Explicit consent checkboxes
- Links to Terms and Privacy
- IP hashing (not storing raw IPs)
- Data retention policy

✅ **Spam Protection**
- Time-based validation (< 3 seconds = suspicious)
- Email format validation
- Server-side sanitization
- Optional: hCaptcha integration ready

✅ **Secure**
- All data sent over HTTPS
- Passwords NOT stored (email-only flow)
- No sensitive data in URLs
- Server-side IP hashing with salt

---

## What To Customize

### Copy
- Modal headlines and subheadings
- Email subject lines and body copy
- Success screen messaging

### Branding
- Colors (uses CSS variables from `raimond-theme.css`)
- Logo (add to header if desired)
- Typography

### Fields
Add/remove Step 2 fields based on your needs:
- Remove: Portfolio size, monthly volume
- Add: Company name, referral source, etc.

### Email Sequences
Customize sequences in your ESP based on:
- Your onboarding flow
- Product features
- Target audience

---

## Next Steps

1. **Review Implementation Guide** → `SIGNUP_IMPLEMENTATION_GUIDE.md`
2. **Set up database** → Run SQL from guide
3. **Integrate email service** → Resend, SendGrid, etc.
4. **Test locally** → Run through QA checklist
5. **Deploy to staging** → Verify end-to-end
6. **Launch A/B test** → 50/50 split, monitor daily
7. **Analyze results** → Use A/B test strategy doc
8. **Iterate** → Refine based on data

---

## FAQs

**Q: Can I skip the A/B test and just ship one variant?**
A: Yes. If you're confident, ship Variant B (Step 1 + Step 2). The system works standalone without A/B testing.

**Q: What if users don't complete Step 2?**
A: That's fine! They still get the welcome email and general onboarding. Step 2 is for enrichment, not a blocker.

**Q: Can I add more fields to Step 2?**
A: Yes, but keep it under 10 fields total. Each additional field reduces completion rate by ~3–5%.

**Q: Do I need Supabase?**
A: No, use any database (PostgreSQL, MongoDB, MySQL, etc.). The guide shows Supabase as an example.

**Q: Can I use a different email service?**
A: Yes. Resend, SendGrid, Mailgun, AWS SES, etc. are all compatible. Just update the `sendWelcomeEmail` function.

**Q: How do I customize the modal design?**
A: Edit `SignupModal.tsx`. It uses Tailwind + CSS variables from `raimond-theme.css`, so brand colors are already applied.

---

## Support

Questions or issues?
- **Docs:** See `SIGNUP_IMPLEMENTATION_GUIDE.md`
- **QA Issues:** Check `QA_CHECKLIST_SIGNUP.md`
- **Email Strategy:** See `EMAIL_AUTOMATION_SEQUENCES.md`
- **A/B Testing:** See `AB_TEST_STRATEGY.md`

---

**Built for serious traders. Ready to ship.**
