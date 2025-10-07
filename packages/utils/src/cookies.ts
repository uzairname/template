/**
 * Cookie utility functions for cross-origin authentication
 */

/**
 * Extract the root domain from a URL for cookie sharing across subdomains.
 * Returns a domain string prefixed with a dot for subdomain sharing.
 *
 * @param url - The full URL to extract the domain from (e.g., "https://admin.example.org")
 * @returns The root domain prefixed with a dot (e.g., ".example.org"), or undefined for localhost
 *
 * @example
 * getCookieDomainFromUrl("https://admin.example.org") // ".example.org"
 * getCookieDomainFromUrl("http://localhost:3000") // undefined
 * getCookieDomainFromUrl("https://app.staging.example.com") // ".example.com"
 */
export function getCookieDomainFromUrl(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname

    // Localhost should not set domain (browser handles it correctly)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return undefined
    }

    // Extract the root domain for subdomain sharing
    // e.g., "admin.example.org" -> ".example.org"
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join('.')}`
    }

    // Single-part domain (edge case)
    return hostname
  } catch {
    return undefined
  }
}

/**
 * Extract the root domain from the current browser hostname for cookie sharing across subdomains.
 * This is a browser-only function that uses `window.location.hostname`.
 *
 * @returns The root domain prefixed with a dot (e.g., ".example.org"), or undefined for localhost or SSR
 *
 * @example
 * // When on https://admin.example.org
 * getCookieDomainFromHostname() // ".example.org"
 *
 * // When on http://localhost:3000
 * getCookieDomainFromHostname() // undefined
 */
export function getCookieDomainFromHostname(): string | undefined {
  // Return undefined during SSR
  if (typeof window === 'undefined') {
    return undefined
  }

  return getCookieDomainFromUrl(`https://${window.location.hostname}`)
}

/**
 * Detect if the current environment is production based on the protocol.
 * Uses HTTPS as an indicator of production environment.
 *
 * @returns true if running on HTTPS (production), false otherwise
 *
 * @example
 * // When on https://admin.example.org
 * isProductionEnvironment() // true
 *
 * // When on http://localhost:3000
 * isProductionEnvironment() // false
 */
export function isProductionEnvironment(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:'
}
