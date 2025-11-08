/**
 * UTM parameter utilities
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Extract UTM parameters from URL
 */
export function getUTMParams(url?: string): UTMParams {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(
    url ? new URL(url).search : window.location.search
  );

  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
  };
}

/**
 * Store UTM parameters in localStorage for session persistence
 */
export function storeUTMParams(params?: UTMParams): void {
  if (typeof window === 'undefined') return;

  const utmParams = params || getUTMParams();

  // Only store if we have at least one UTM parameter
  if (Object.values(utmParams).some(v => v !== undefined)) {
    localStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
}

/**
 * Retrieve stored UTM parameters from localStorage
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('utm_params');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Get UTM parameters, preferring current URL over stored
 */
export function getUTMParamsWithFallback(): UTMParams {
  const currentParams = getUTMParams();
  const storedParams = getStoredUTMParams();

  return {
    utm_source: currentParams.utm_source || storedParams.utm_source,
    utm_medium: currentParams.utm_medium || storedParams.utm_medium,
    utm_campaign: currentParams.utm_campaign || storedParams.utm_campaign,
    utm_term: currentParams.utm_term || storedParams.utm_term,
    utm_content: currentParams.utm_content || storedParams.utm_content,
  };
}

/**
 * Clear stored UTM parameters
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('utm_params');
}

/**
 * Initialize UTM tracking (call this on app load)
 */
export function initUTMTracking(): void {
  if (typeof window === 'undefined') return;

  // Store UTM params from current URL if present
  const params = getUTMParams();
  if (Object.values(params).some(v => v !== undefined)) {
    storeUTMParams(params);
  }
}
