# RAimond Signup Flow - QA Test Checklist

## Overview
This checklist covers end-to-end testing for the 2-step signup modal across desktop, mobile, and edge cases.

**Last updated:** 2025-01-07
**Version:** 1.0

---

## Pre-Testing Setup

- [ ] Clear browser cache and cookies
- [ ] Verify test environment is using latest code
- [ ] Check that database/API endpoints are accessible
- [ ] Ensure analytics/tracking tools are enabled
- [ ] Have test email accounts ready (e.g., yourname+test1@gmail.com)

---

## 🖥️ Desktop Testing (Chrome, Firefox, Safari, Edge)

### Modal Trigger

- [ ] **Get Started button** on hero section opens modal
- [ ] **Sign Up button** in header opens modal
- [ ] **CTA buttons** in features section open modal
- [ ] **Footer CTA** opens modal
- [ ] Modal appears centered on screen
- [ ] Background overlay dims page content
- [ ] Body scroll is disabled when modal is open
- [ ] Close button (X) is visible and clickable
- [ ] Clicking outside modal does NOT close it (intentional for form retention)
- [ ] ESC key does NOT close modal (form data protection)

### Step 1: Email & Consent

#### Layout & UI
- [ ] Modal is responsive and centered
- [ ] Title "Get Started with RAimond" is visible
- [ ] Email input field is properly sized
- [ ] Placeholder text is visible: "trader@example.com"
- [ ] Terms checkbox is visible and clickable
- [ ] Privacy checkbox is visible and clickable
- [ ] Links to Terms and Privacy open in new tab
- [ ] Submit button is styled correctly
- [ ] Loading state shows "Creating your account..."

#### Functionality
- [ ] Email field accepts valid email format
- [ ] Email field shows error for invalid format (e.g., "invalid@")
- [ ] Email field shows error for missing "@"
- [ ] Email field shows error for missing domain
- [ ] Terms checkbox must be checked to submit
- [ ] Privacy checkbox must be checked to submit
- [ ] Error message displays if checkboxes unchecked
- [ ] Submit button is disabled during loading
- [ ] Spam protection: Submitting < 3 seconds shows error
- [ ] UTM parameters are captured from URL query string
- [ ] Referrer is captured from document.referrer
- [ ] Analytics event "signup_modal_opened" fires on open
- [ ] Analytics event "signup_step1_completed" fires on success

#### Error Handling
- [ ] Network error shows user-friendly message
- [ ] Server error (500) shows retry option
- [ ] Duplicate email shows appropriate error
- [ ] Form data persists if submission fails
- [ ] Error messages are readable (contrast, size)

#### Success Flow
- [ ] On success, modal advances to Step 2
- [ ] Step 1 data is not editable after submission
- [ ] User ID is stored in component state
- [ ] No console errors

### Step 2: Profile Enrichment

#### Layout & UI
- [ ] Title "Personalize Your RAi Setup" is visible
- [ ] Subheading explains fields are optional
- [ ] Trading experience buttons are visible (Beginner/Intermediate/Advanced)
- [ ] Trading style buttons are visible (Day/Swing/Long-term)
- [ ] Asset class buttons are multi-select
- [ ] Platform buttons are multi-select
- [ ] Trading challenge textarea has 120 char limit
- [ ] Character counter updates in real-time
- [ ] Phone input field accepts various formats
- [ ] Portfolio size dropdown shows all options
- [ ] Monthly volume dropdown shows all options
- [ ] "Skip for now" button is visible
- [ ] "Complete Setup" button is visible

#### Functionality - Trading Experience
- [ ] Clicking "Beginner" highlights button
- [ ] Clicking "Intermediate" switches selection
- [ ] Clicking "Advanced" switches selection
- [ ] Only one experience level can be selected

#### Functionality - Trading Style
- [ ] Clicking "Day Trader" highlights button
- [ ] Clicking "Swing" switches selection
- [ ] Clicking "Long-term" switches selection
- [ ] Only one style can be selected

#### Functionality - Asset Classes
- [ ] Multiple asset classes can be selected
- [ ] Clicking selected asset deselects it
- [ ] All 5 assets can be selected simultaneously
- [ ] Visual feedback on hover

#### Functionality - Platforms
- [ ] Multiple platforms can be selected
- [ ] Clicking selected platform deselects it
- [ ] All 6 platforms can be selected
- [ ] Visual feedback on hover

#### Functionality - Trading Challenge
- [ ] Textarea accepts text input
- [ ] Character limit enforced at 120
- [ ] Counter displays remaining chars
- [ ] Cannot type beyond limit
- [ ] Line breaks are preserved

#### Functionality - Phone Number
- [ ] Accepts phone number input
- [ ] Hint text explains it's optional
- [ ] Formats phone on submit (strips non-digits)
- [ ] International formats are accepted

#### Functionality - Dropdowns
- [ ] Portfolio size dropdown opens on click
- [ ] All options are selectable
- [ ] Monthly volume dropdown opens on click
- [ ] All options are selectable

#### Submit Flow
- [ ] "Skip for now" logs analytics event "signup_step2_skipped"
- [ ] "Skip for now" advances to success screen
- [ ] "Complete Setup" sends Step 2 data to API
- [ ] Loading state shows "Saving..."
- [ ] Analytics event "signup_step2_completed" fires
- [ ] Tags are generated based on selections
- [ ] Success advances to success screen

#### Error Handling
- [ ] Network error shows message
- [ ] Server error shows message
- [ ] Form data persists on error
- [ ] No console errors

### Success Screen

#### Layout & UI
- [ ] Green checkmark icon is visible
- [ ] Title "You're in!" is displayed
- [ ] Message mentions checking email for Starter Pack
- [ ] "Go to Dashboard" button is visible
- [ ] "Close" button is visible

#### Functionality
- [ ] "Go to Dashboard" redirects to /dashboard
- [ ] "Close" button closes modal
- [ ] Modal can be reopened after closing
- [ ] No errors in console

---

## 📱 Mobile Testing (iOS Safari, Android Chrome)

### Viewport Sizes
- [ ] Test on 320px width (iPhone SE)
- [ ] Test on 375px width (iPhone 12/13)
- [ ] Test on 390px width (iPhone 14 Pro)
- [ ] Test on 414px width (iPhone Plus)
- [ ] Test on 360px width (Android small)
- [ ] Test on 412px width (Android large)

### Modal Behavior
- [ ] Modal is full-width on mobile
- [ ] Modal is scrollable if content exceeds viewport
- [ ] Close button is easily tappable (min 44x44px)
- [ ] All buttons are tappable (min 44x44px)
- [ ] Text is readable without zooming
- [ ] Form inputs trigger appropriate keyboards
- [ ] Email input triggers email keyboard
- [ ] Phone input triggers phone keyboard
- [ ] No horizontal scrolling
- [ ] Zoom is disabled on form inputs (no 16px font bug)

### Step 1 Mobile
- [ ] Email input is full-width
- [ ] Checkboxes are easy to tap
- [ ] Links to Terms/Privacy are tappable
- [ ] Submit button is full-width
- [ ] Error messages are visible
- [ ] Loading state is clear

### Step 2 Mobile
- [ ] All buttons stack properly
- [ ] Multi-select buttons wrap correctly
- [ ] Textarea is full-width
- [ ] Dropdowns open natively
- [ ] "Skip" and "Complete" buttons stack vertically
- [ ] No layout shift during interactions

### Touch Interactions
- [ ] Buttons respond to touch (no double-tap)
- [ ] Hover states don't get "stuck" on tap
- [ ] Scroll is smooth
- [ ] No accidental triggers

---

## 🧪 Edge Cases & Error Scenarios

### Email Validation
- [ ] Empty email shows error
- [ ] Email with spaces shows error
- [ ] Email without "@" shows error
- [ ] Email without domain shows error
- [ ] Email with special chars is accepted (valid)
- [ ] Very long email (254 chars) is accepted
- [ ] Email with "+" alias is accepted (yourname+test@gmail.com)

### Consent Checkboxes
- [ ] Submitting with only Terms checked shows error
- [ ] Submitting with only Privacy checked shows error
- [ ] Submitting with neither checked shows error
- [ ] Checkboxes can be unchecked after checking

### Spam Protection
- [ ] Form submitted in < 3 seconds shows warning
- [ ] Form submitted after 3+ seconds proceeds normally
- [ ] Timer resets if modal is reopened

### Network Issues
- [ ] Slow 3G: Modal remains responsive
- [ ] Offline: Shows network error message
- [ ] Timeout: Shows timeout error message
- [ ] Retry after network error works

### API Failures
- [ ] 400 Bad Request: Shows user-friendly error
- [ ] 401 Unauthorized: Redirects to login (if applicable)
- [ ] 500 Server Error: Shows retry option
- [ ] 503 Service Unavailable: Shows maintenance message

### Race Conditions
- [ ] Double-clicking submit doesn't create duplicate accounts
- [ ] API calls are debounced
- [ ] Form is disabled during submission

### Browser Back Button
- [ ] Back button doesn't break modal state
- [ ] Step 2 → Back → Re-opens at Step 2 (not Step 1)
- [ ] Form data is preserved

### Session Storage / State
- [ ] User ID persists between Step 1 and Step 2
- [ ] Form data persists if user refreshes page (optional)
- [ ] Modal state resets on close

---

## 🔒 Security & Compliance

### Data Protection
- [ ] Passwords are NOT stored (email-only flow)
- [ ] IP address is hashed server-side
- [ ] UTM params are sanitized
- [ ] No sensitive data in URL query params
- [ ] HTTPS is enforced
- [ ] No data logged to browser console (prod)

### GDPR / Privacy
- [ ] Consent checkboxes are required
- [ ] Links to Terms and Privacy are functional
- [ ] User can opt-out (unsubscribe link in emails)
- [ ] Data retention policy is documented

### XSS / Injection
- [ ] Email input sanitized server-side
- [ ] Trading challenge textarea sanitized
- [ ] Phone number sanitized
- [ ] No script injection possible
- [ ] No SQL injection possible (use parameterized queries)

---

## 📊 Analytics & Tracking

### Events Fired
- [ ] `signup_modal_opened` fires on modal open
- [ ] `signup_step1_completed` fires on Step 1 success
- [ ] `signup_step1_failed` fires on Step 1 error
- [ ] `signup_step2_completed` fires on Step 2 success
- [ ] `signup_step2_failed` fires on Step 2 error
- [ ] `signup_step2_skipped` fires when skipping Step 2

### Event Properties
- [ ] Email (hashed or anonymized)
- [ ] UTM params (source, medium, campaign, term, content)
- [ ] Referrer URL
- [ ] Timestamp
- [ ] User ID (after Step 1)
- [ ] Trading experience (Step 2)
- [ ] Trading style (Step 2)
- [ ] Asset classes (Step 2)
- [ ] Platforms (Step 2)
- [ ] Has phone (boolean)
- [ ] A/B test variant

### Third-Party Integrations
- [ ] Google Analytics 4 events fire
- [ ] Facebook Pixel events fire (if configured)
- [ ] Mixpanel/Segment events fire (if configured)
- [ ] No console errors from analytics scripts

---

## 🎨 Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] Tab key navigates through all form fields in logical order
- [ ] Enter key submits form
- [ ] Spacebar toggles checkboxes
- [ ] Arrow keys navigate dropdowns
- [ ] Escape key does NOT close modal (form protection)
- [ ] Focus indicators are visible

### Screen Readers
- [ ] Form labels are associated with inputs (aria-label)
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] Required fields are indicated (aria-required)

### Color Contrast
- [ ] Text meets 4.5:1 contrast ratio (body text)
- [ ] UI elements meet 3:1 contrast ratio
- [ ] Error messages are readable
- [ ] Placeholder text is readable

### Visual Indicators
- [ ] Focus states are visible (not just color)
- [ ] Error states are not just red (icons too)
- [ ] Required fields have visual indicator (* or label)

---

## 🌐 Browser & Device Matrix

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome (1 version back)
- [ ] Firefox (1 version back)

### Mobile Browsers
- [ ] iOS Safari (latest)
- [ ] iOS Safari (1 version back)
- [ ] Chrome for Android (latest)
- [ ] Samsung Internet
- [ ] Firefox for Android

### Operating Systems
- [ ] Windows 11
- [ ] Windows 10
- [ ] macOS Sonoma
- [ ] macOS Ventura
- [ ] iOS 17
- [ ] iOS 16
- [ ] Android 13
- [ ] Android 12

---

## ⚡ Performance

### Load Time
- [ ] Modal renders in < 1 second
- [ ] No layout shift on open
- [ ] Images are optimized (if any)
- [ ] Fonts load quickly (FOUT avoided)

### API Response Time
- [ ] Step 1 API responds in < 2 seconds
- [ ] Step 2 API responds in < 2 seconds
- [ ] No blocking UI during API calls
- [ ] Loading indicators show immediately

### Bundle Size
- [ ] Modal component is code-split (lazy loaded)
- [ ] Total JS bundle < 50KB (gzipped)
- [ ] No unnecessary dependencies

---

## 🧹 Post-Launch Monitoring

### Week 1
- [ ] Monitor error logs for failures
- [ ] Check email delivery rate (> 95%)
- [ ] Verify welcome emails are sent
- [ ] Check Starter Pack download link works
- [ ] Monitor signup completion rate (target: > 60%)

### Ongoing
- [ ] Track Step 1 → Step 2 conversion (target: > 70%)
- [ ] Track Step 2 → Trial activation (target: > 40%)
- [ ] Monitor email open rates (target: > 25%)
- [ ] A/B test variants and iterate

---

## ✅ Sign-Off

**Tested by:** _________________
**Date:** _________________
**Environment:** _________________
**Build version:** _________________

**Critical bugs found:** _________________
**Non-critical bugs found:** _________________
**Ready for production:** ☐ Yes  ☐ No

---

## 📝 Notes & Issues

Use this section to document any issues found during testing:

| Issue # | Description | Severity | Status | Notes |
|---------|-------------|----------|--------|-------|
| 001 | Example: Email validation fails on .co.uk domains | Medium | Open | Need to update regex |
| 002 |  |  |  |  |
| 003 |  |  |  |  |

---

**End of QA Checklist**
