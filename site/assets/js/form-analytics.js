/**
 * form_start / form_error for the contact form and the intake forms.
 * Uses the analytics already on the page (gtag, Zaraz, or dataLayer).
 * Payloads are the form name and, for errors, the error type. No field values.
 */
(function () {
  var started = new WeakSet();
  var VALIDITY = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput'];

  function formName(form) {
    if (!form) return '';
    var named = form.getAttribute('data-ncm-form');
    if (named === 'contact' || named === 'intake') return named;
    if (form.id === 'contact-form') return 'contact';
    var action = form.getAttribute('action') || '';
    if (action.indexOf('/api/contact') !== -1) return 'intake';
    return '';
  }

  function track(name, props) {
    var payload = { event: name };
    if (props && (props.form === 'contact' || props.form === 'intake')) payload.form = props.form;
    if (props && props.error_type) payload.error_type = String(props.error_type).slice(0, 40);
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, payload);
        return;
      }
      if (window.zaraz && typeof window.zaraz.track === 'function') {
        window.zaraz.track(name, payload);
        return;
      }
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(payload);
      }
    } catch (e) { /* analytics must not break the form */ }
  }

  window.ncmTrack = track;

  function validityType(el) {
    var v = el && el.validity;
    if (!v) return 'validation';
    for (var i = 0; i < VALIDITY.length; i++) {
      if (v[VALIDITY[i]]) return VALIDITY[i];
    }
    return 'validation';
  }

  document.addEventListener('focusin', function (e) {
    var el = e.target;
    var form = el && el.form;
    var name = formName(form);
    if (!name || started.has(form)) return;
    var tag = (el.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') return;
    if (el.type === 'hidden' || (el.classList && el.classList.contains('hp'))) return;
    started.add(form);
    track('form_start', { form: name });
  });

  document.addEventListener('invalid', function (e) {
    var form = e.target && e.target.form;
    var name = formName(form);
    if (!name) return;
    track('form_error', { form: name, error_type: validityType(e.target) });
  }, true);

  function serverErrorFromRedirect() {
    var params;
    try { params = new URLSearchParams(location.search); } catch (e) { return; }
    if (params.get('error') === '1') track('form_error', { error_type: 'server' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', serverErrorFromRedirect);
  else serverErrorFromRedirect();
})();
