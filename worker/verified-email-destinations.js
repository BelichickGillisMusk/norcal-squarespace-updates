/**
 * Mirrors Cloudflare Email Routing verified destinations for the
 * norcalcarbmobile.com zone (live Worker norcal-squarespace-updates-gillis).
 * The send_email binding can only deliver to addresses on this list.
 *
 * For now: fsu9913@gmail.com only. Do not add sales@ or bgillis99 here.
 * A sales@ switch is a separate change after Ally verifies it.
 */
export const VERIFIED_EMAIL_ROUTING_DESTINATIONS = ['fsu9913@gmail.com'];
