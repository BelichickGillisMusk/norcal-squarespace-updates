/*
 * Google Ads conversion tag — NorCal CARB Mobile (Ads account 521-027-0247).
 *
 * Loaded on /contact only (see <script> tag in site/contact.html).
 *
 * ============================ CONFIG — EDIT HERE ============================
 * Replace the three placeholders below with the real values from Google Ads
 * (Goals > Conversions > the action > Tag setup > "Use Google tag").
 *   AW_ID       -> "AW-123456789"            (the Google tag / conversion ID)
 *   PHONE_LABEL -> label for the tel:+19168904427 click conversion
 *   FORM_LABEL  -> label for the successful /api/contact submit conversion
 * While any value is still a placeholder, nothing is loaded and nothing is sent.
 * ===========================================================================
 */
(function (w, d) {
  'use strict';

  var NCM_ADS_CONFIG = {
    AW_ID: 'AW-XXXXXXXXXX',
    PHONE_LABEL: 'PHONE_LABEL',
    FORM_LABEL: 'FORM_LABEL'
  };
  // ========================= END CONFIG =====================================

  var PHONE_HREF = 'tel:+19168904427';
  var cfg = w.NCM_ADS_CONFIG_OVERRIDE || NCM_ADS_CONFIG; // override hook is for local tests only

  function isReal(v, placeholder) {
    return typeof v === 'string' && v.length > 0 && v !== placeholder && !/X{4,}/.test(v);
  }
  var idReady = isReal(cfg.AW_ID, 'AW-XXXXXXXXXX') && /^AW-\d+$/.test(cfg.AW_ID);
  var phoneReady = idReady && isReal(cfg.PHONE_LABEL, 'PHONE_LABEL');
  var formReady = idReady && isReal(cfg.FORM_LABEL, 'FORM_LABEL');

  // Respect the browser's opt-out signals: Global Privacy Control or Do Not Track.
  var optedOut = false;
  try {
    optedOut = w.navigator.globalPrivacyControl === true ||
      w.navigator.doNotTrack === '1' || w.doNotTrack === '1';
  } catch (e) { optedOut = false; }

  var enabled = idReady && !optedOut;

  function noop() { return false; }

  if (!enabled) {
    // Placeholders still in place (or visitor opted out): no gtag.js, no events.
    w.NCM_ADS = { enabled: false, reason: optedOut ? 'opted_out' : 'placeholder', phoneConversion: noop, formConversion: noop };
    return;
  }

  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  w.gtag = w.gtag || gtag;

  // No ad personalization; conversion measurement only. No user data is ever sent.
  gtag('consent', 'default', {
    ad_storage: 'granted',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  gtag('js', new Date());
  gtag('config', cfg.AW_ID, { allow_enhanced_conversions: false });

  var s = d.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.AW_ID);
  (d.head || d.documentElement).appendChild(s);

  function send(label) {
    // Only send_to — never names, phones, emails, or form contents.
    w.gtag('event', 'conversion', { send_to: cfg.AW_ID + '/' + label });
    return true;
  }

  function phoneConversion() {
    return phoneReady ? send(cfg.PHONE_LABEL) : false;
  }

  var formSent = false;
  function formConversion() {
    if (!formReady || formSent) return false;
    formSent = true;
    return send(cfg.FORM_LABEL);
  }

  // Count clicks on the one approved phone link (header, body, footer — any copy).
  d.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== d) {
      if (t.tagName === 'A' && (t.getAttribute('href') || '') === PHONE_HREF) {
        phoneConversion();
        return;
      }
      t = t.parentNode;
    }
  }, true);

  // No-JS fallback path: the Worker 303s a native form post to /contact?sent=1
  // on success (?error=1 / ?error=send on failure; ?sent=1&h=1 for the honeypot).
  // Count only a clean ?sent=1, once per browser session.
  try {
    var p = new URLSearchParams(w.location.search);
    if (p.get('sent') === '1' && !p.has('h') && !p.has('error')) {
      var key = 'ncm-ads-form-sent';
      if (!w.sessionStorage.getItem(key)) {
        w.sessionStorage.setItem(key, '1');
        formConversion();
      }
    }
  } catch (e) { /* sessionStorage blocked: skip the fallback count */ }

  w.NCM_ADS = { enabled: true, phoneConversion: phoneConversion, formConversion: formConversion };
})(window, document);
