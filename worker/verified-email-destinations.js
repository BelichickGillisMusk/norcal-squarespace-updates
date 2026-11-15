/**
 * Mirrors Cloudflare Email Routing verified destinations for the
 * norcalcarbmobile.com zone (live Worker norcal-squarespace-updates-gillis).
 * The send_email binding can only deliver to addresses on this list.
 *
 * carb@norcalcarbmobile.com is the primary lead inbox (Bryan, 2026-11-09).
 * fsu9913@gmail.com stays verified as the fallback.
 * Do not add sales@ or bgillis99 here.
 */
export const VERIFIED_EMAIL_ROUTING_DESTINATIONS = [
  'carb@norcalcarbmobile.com',
  'fsu9913@gmail.com',
];

export const PRIMARY_FORM_TO = 'carb@norcalcarbmobile.com';
export const FORM_TO_FALLBACK = 'fsu9913@gmail.com';
