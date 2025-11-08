/**
 * Simple analytics tracking stub
 *
 * In production, integrate with:
 * - Google Analytics (gtag)
 * - Mixpanel
 * - Segment
 * - PostHog
 * - etc.
 */

interface TrackingPayload {
  [key: string]: any;
}

/**
 * Track an analytics event
 */
export function track(event: string, payload?: TrackingPayload): void {
  if (typeof window === 'undefined') return;

  // Console log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event, payload);
  }

  // Google Analytics 4
  if ('gtag' in window) {
    (window as any).gtag('event', event, payload);
  }

  // Facebook Pixel
  if ('fbq' in window) {
    (window as any).fbq('track', event, payload);
  }

  // Mixpanel
  if ('mixpanel' in window) {
    (window as any).mixpanel.track(event, payload);
  }

  // Segment
  if ('analytics' in window) {
    (window as any).analytics.track(event, payload);
  }

  // Add your analytics provider here
}

/**
 * Identify a user for analytics
 */
export function identify(userId: string, traits?: TrackingPayload): void {
  if (typeof window === 'undefined') return;

  if (import.meta.env.DEV) {
    console.log('[Analytics] Identify:', userId, traits);
  }

  // Mixpanel
  if ('mixpanel' in window) {
    (window as any).mixpanel.identify(userId);
    if (traits) {
      (window as any).mixpanel.people.set(traits);
    }
  }

  // Segment
  if ('analytics' in window) {
    (window as any).analytics.identify(userId, traits);
  }
}

/**
 * Track a page view
 */
export function page(name?: string, properties?: TrackingPayload): void {
  if (typeof window === 'undefined') return;

  if (import.meta.env.DEV) {
    console.log('[Analytics] Page:', name, properties);
  }

  // Google Analytics 4
  if ('gtag' in window) {
    (window as any).gtag('event', 'page_view', {
      page_title: name,
      ...properties
    });
  }

  // Segment
  if ('analytics' in window) {
    (window as any).analytics.page(name, properties);
  }
}
