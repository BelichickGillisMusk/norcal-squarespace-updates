/**
 * On-site SoCal destinations. San Diego paths used to 301 to the sibling
 * site; Orange County used to 301 to /areas#orange-county. Both now land on
 * /socal. Status stays 301 (see worker/index.js fetch handler).
 */
export const SOCAL_REDIRECT_LOCATION = '/socal';

export const SOCAL_PAGE_REDIRECTS = {
  '/clean-truck-check-san-diego': SOCAL_REDIRECT_LOCATION,
  '/clean-truck-check-san-diego/': SOCAL_REDIRECT_LOCATION,
  '/san-diego': SOCAL_REDIRECT_LOCATION,
  '/san-diego/': SOCAL_REDIRECT_LOCATION,
  '/areas/san-diego': SOCAL_REDIRECT_LOCATION,
  '/areas/san-diego/': SOCAL_REDIRECT_LOCATION,
  '/clean-truck-check-orange-county': SOCAL_REDIRECT_LOCATION,
  '/clean-truck-check-orange-county/': SOCAL_REDIRECT_LOCATION,
};

/** Location header value the Worker should send for these paths (301). */
export function socalRedirectLocation(pathname) {
  return (
    SOCAL_PAGE_REDIRECTS[pathname] ||
    SOCAL_PAGE_REDIRECTS[pathname.replace(/\/$/, '')] ||
    null
  );
}
