# RAimond Signup Flow - Manual QA Checklist

Use this checklist to manually test the signup flow before going live.

## Pre-requisites

- [ ] `.env.local` is configured with all required keys
- [ ] Supabase tables `leads` and `lead_profiles` are created
- [ ] Resend domain `mail.raimondai.com` is verified
- [ ] Dev server is running (`npm run dev`)

---

## Desktop Testing (Chrome, Safari, Firefox)

### Step 1 - Email & Consent

- [ ] **Modal opens** from "Get Started" CTA
- [ ] **Focus trap works** (Tab cycles through modal elements only)
- [ ] **ESC key closes** the modal
- [ ] **Click outside** closes the modal
- [ ] **Email validation** blocks invalid emails (`test`, `test@`, `test@example`)
- [ ] **Email required** - shows error if empty
- [ ] **Consent required** - shows error if unchecked
- [ ] **Spam protection** - blocks submission if submitted < 3 seconds after open
- [ ] **UTM capture** - verify UTMs appear in lead record (test with `?utm_source=test&utm_medium=cpc`)
- [ ] **Network success** - submits to `/api/signup/step1` successfully
- [ ] **Welcome email sent** - check inbox for Starter Pack email
- [ ] **Variant A** - shows success screen after Step 1 (test with `?variant=a`)
- [ ] **Variant B** - proceeds to Step 2 (default behavior)

### Step 2 - Progressive Profiling

- [ ] **All fields optional** - can submit with no selections
- [ ] **Experience buttons** work (beginner/intermediate/advanced)
- [ ] **Trading style buttons** work (day/swing/long-term)
- [ ] **Asset classes** multi-select works (stocks, options, crypto, forex, futures)
- [ ] **Platforms** multi-select works (Thinkorswim, TradingView, Sierra, etc.)
- [ ] **Challenge textarea** character limit (120 chars max)
- [ ] **Phone input** accepts various formats
- [ ] **Portfolio size dropdown** works
- [ ] **Monthly volume dropdown** works
- [ ] **Skip button** works - shows success without saving profile
- [ ] **Complete button** submits to `/api/signup/step2`
- [ ] **Success screen** appears after Step 2
- [ ] **Tags generated** correctly (check in Supabase `lead_profiles.tags`)

### Success Screen

- [ ] **Success message** displays correctly
- [ ] **"Go to Dashboard" button** navigates to `/dashboard`
- [ ] **Close button** closes modal
- [ ] **No console errors** in browser DevTools

---

## Mobile Testing (iOS Safari, Chrome Android)

- [ ] **Modal responsive** on mobile (320px, 375px, 414px widths)
- [ ] **Inputs not zoomed** on focus (font-size >= 16px)
- [ ] **Scroll works** inside modal if content overflows
- [ ] **Checkboxes tappable** (large enough touch target)
- [ ] **Buttons tappable** (44px min height)
- [ ] **No horizontal scroll** at any breakpoint

---

## Browser Compatibility

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)

---

## Database Verification (Supabase)

### After Step 1:

- [ ] Check `leads` table for new row
- [ ] Verify `email` matches submitted value
- [ ] Verify `consent_given` is `true`
- [ ] Verify `utm_source`, `utm_medium`, etc. are populated (if provided)
- [ ] Verify `ip_hash` is present (16-char hex string)
- [ ] Verify `created_at` timestamp is accurate

### After Step 2:

- [ ] Check `lead_profiles` table for new row
- [ ] Verify `lead_id` matches the lead from Step 1
- [ ] Verify `experience_level`, `trading_style`, etc. match selections
- [ ] Verify `phone` is in E.164 format (e.g., `+14155551234`)
- [ ] Verify `tags` JSONB has correct keys (e.g., `{"exp:intermediate": true, "style:day": true}`)
- [ ] Verify `asset_classes` and `tools` arrays are populated

---

## Email Verification (Resend)

- [ ] Welcome email arrives within 30 seconds
- [ ] Email displays correctly (no broken HTML)
- [ ] "Access Your Starter Pack" link works
- [ ] Email from name is "RAimond"
- [ ] Email from address is `welcome@mail.raimondai.com`
- [ ] Unsubscribe link is present (if configured in Resend)

---

## Error Handling

- [ ] **Network error** - simulate by blocking `/api/signup/step1` in DevTools Network tab
- [ ] **Duplicate email** - try submitting same email twice (should handle gracefully)
- [ ] **Invalid Supabase key** - temporarily break `SUPABASE_SERVICE_KEY` in `.env.local`
- [ ] **Invalid Resend key** - temporarily break `RESEND_API_KEY` in `.env.local`
- [ ] **No console errors** except expected ones (e.g., failed network requests)

---

## Performance

- [ ] **Modal opens instantly** (< 100ms)
- [ ] **Step 1 submission** completes in < 2 seconds
- [ ] **Step 2 submission** completes in < 2 seconds
- [ ] **No UI jank** or layout shifts

---

## Analytics

- [ ] `signup_modal_opened` event fires when modal opens
- [ ] `ab_variant` event fires with variant (`a` or `b`)
- [ ] `signup_step1_completed` event fires after Step 1 success
- [ ] `signup_step2_completed` event fires after Step 2 success
- [ ] `signup_step1_failed` event fires on Step 1 error
- [ ] `signup_step2_failed` event fires on Step 2 error

---

## A/B Testing

- [ ] **Variant A** (`?variant=a`) - Step 1 only, shows success after
- [ ] **Variant B** (default or `?variant=b`) - Step 1 + Step 2, shows success after Step 2
- [ ] Variant is tracked in analytics

---

## Final Checks

- [ ] No PII logged to console (emails, phones, etc.)
- [ ] No API keys exposed in client-side code
- [ ] `.env.local` not committed to git
- [ ] All CTAs on site open the modal (no broken links)
- [ ] Staging deploy works correctly
- [ ] Production deploy works correctly

---

## Sign-off

- [ ] **QA Engineer:** _____________________ Date: _______
- [ ] **Product Owner:** _____________________ Date: _______
- [ ] **Developer:** _____________________ Date: _______

---

## Notes

Add any issues found during testing:

```
- Issue 1:
- Issue 2:
- Issue 3:
```
