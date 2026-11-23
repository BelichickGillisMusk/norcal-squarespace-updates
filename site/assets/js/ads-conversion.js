/*
 * Google Ads conversion events — NorCal CARB Mobile (Ads account 521-027-0247).
 *
 * Loaded on /contact only. The standard Google tag (gtag.js loader + config for
 * AW-18285811780) is inline in the <head> of site/contact.html, per the Ads snippet.
 * This file only sends the two conversion events.
 *
 * ============================ CONFIG — EDIT HERE ============================
 *   AW_ID       -> Google tag / conversion ID (must match the inline tag in contact.html)
 *   PHONE_LABEL -> "Website call click - contact page" (tel:+19168904427 click only)
 *   FORM_LABEL  -> "Contact form submit" (successful /api/contact submit only)
 * If a value is ever reset to a placeholder (AW-XXXXXXXXXX / PHONE_LABEL /
 * FORM_LABEL), that conversion is skipped and nothing is sent.
 * ===========================================================================
 */
(function (w, d) {
  'use strict';

  var NCM_ADS_CONFIG = {
    AW_ID: 'AW-18285811780',
    PHONE_LABEL: '8AfgCJy4lb4dEMSwrY9E',
    FORM_LABEL: '5SH8CJm4lb4dEMSwrY9E'
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
    // Placeholder ID (or visitor opted out via GPC/DNT): no conversion events.
    w.NCM_ADS = { enabled: false, reason: optedOut ? 'opted_out' : 'placeholder', phoneConversion: noop, formConversion: noop };
    return;
  }

  // The inline Google tag in <head> defines dataLayer/gtag and loads gtag.js.
  // Fall back to a dataLayer shim so events still queue if this runs first.
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== 'function') {
    w.gtag = function () { w.dataLayer.push(arguments); };
  }

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
