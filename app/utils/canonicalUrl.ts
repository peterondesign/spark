/**
 * Generate a canonical URL for a given path
 * This is a server-side utility that works with Next.js metadata
 */

export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc';
  // Ensure path starts with a slash and remove any trailing slashes
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Helper function to create metadata.alternates.canonical value
 */
export function canonical(path: string = ''): { canonical: string } {
  return {
    canonical: getCanonicalUrl(path)
  };
}