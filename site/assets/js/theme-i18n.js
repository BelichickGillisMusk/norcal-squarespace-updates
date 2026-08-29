/**
 * /contact chrome: Dark/Light + EN|ES.
 * No existing i18n/theme pattern in this repo — data-theme tokens + data-i18n map.
 */
(function () {
  var THEME_KEY = 'ncm-theme';
  var LANG_KEY = 'ncm-lang';

  var strings = {
    en: {
      skip: 'Skip to content',
      nav_home: 'Home',
      nav_services: 'Services',
      nav_pricing: 'Pricing',
      nav_areas: 'Areas',
      nav_faq: 'FAQ',
      nav_blog: 'Blog',
      nav_contact: 'Contact',
      nav_menu: 'Menu',
      call_btn: 'Call (916) 890-4427',
      book_online: 'Book online',
      theme_dark: 'Dark',
      theme_light: 'Light',
      theme_label: 'Color mode',
      lang_label: 'Language',
      tagline: 'Mobile Smoke & OBD Testing',
      serving: 'Now Serving San Diego County & the Central Valley',
      nap_name: 'NorCal CARB Mobile · Mobile Clean Truck Check',
      reviews_line: '5.0 · 33 Google reviews',
      reviews_read: 'Read our Google reviews',
      cred_alt: 'NorCal CARB Mobile — Clean Truck Check credentialed tester',
      h1: 'We come to you. Clean Truck Check.',
      lede: 'Mobile Clean Truck Check for trucks and motorhomes. Oakland, Hayward, Peninsula, Napa, and Wine Country. 7 days a week.',
      sent: 'Thanks — your request is in. We will reply shortly. Need it today? Call (916) 890-4427.',
      error: 'We could not send that request. Please call (916) 890-4427.',
      sending: 'Sending…',
      prices_how: 'How much',
      tile_obd: 'OBD',
      tile_obd_sub: '/ vehicle',
      tile_obd_copy: 'On-board diagnostic Clean Truck Check for 2013+ diesel trucks.',
      tile_ovi: 'Mobile OVI',
      tile_ovi_sub: '/ vehicle',
      tile_ovi_copy: 'Smoke opacity test when OBD does not apply — older units and many motorhomes.',
      tile_mh: 'Motorhome',
      tile_mh_copy: 'RV / motorhome testing at your location. Motorhome is its own appointment.',
      call_to_book: 'Call to book',
      request_cb: 'Request a callback',
      map_alt: 'Coverage map framed to the Bay Area, Peninsula, Oakland, Hayward, Napa, and Wine Country',
      chips_label: 'Ads corridor',
      form_title: 'Request a test',
      label_name: 'Name',
      label_phone: 'Phone',
      label_location: 'Truck or motorhome city/yard',
      loc_ph: 'e.g. Oakland yard, Hayward, Peninsula, Napa',
      label_service: 'What do you need?',
      opt_obd: 'OBD test ($75)',
      opt_ovi: 'Mobile OVI / smoke test ($199)',
      opt_mh_obd: 'Motorhome OBD ($99)',
      opt_mh_ovi: 'Motorhome OVI / smoke ($229)',
      opt_fleet: 'Multiple trucks / fleet',
      opt_unsure: 'Not sure — help me pick',
      label_email: 'Email (optional)',
      label_details: 'Details (optional)',
      details_ph: 'How many trucks or motorhomes, and when you need us',
      terms_html: 'I agree to the <a href="/testing-terms" target="_blank" rel="noopener">Testing Terms &amp; Customer Rights</a>.',
      send: 'Send request',
      hours: '7 days a week — we come to your yard',
      email_label: 'Email',
      phone_label: 'Call or text',
      area_label: 'Service corridor',
      area_copy: 'Oakland · Hayward · Peninsula · Napa · Wine Country',
      foot_blurb: 'Mobile Clean Truck Check testing (OBD and OVI). We come to you.',
      foot_contact: 'Contact',
      foot_policies: 'Policies',
      terms_short: 'Testing Terms & Customer Rights',
      foot_prices: 'OBD $75 · Mobile OVI $199 · Motorhome $99/$229',
      mobile_book: 'Book'
    },
    es: {
      skip: 'Saltar al contenido',
      nav_home: 'Inicio',
      nav_services: 'Servicios',
      nav_pricing: 'Precios',
      nav_areas: 'Zonas',
      nav_faq: 'Preguntas',
      nav_blog: 'Blog',
      nav_contact: 'Contacto',
      nav_menu: 'Menú',
      call_btn: 'Llamar (916) 890-4427',
      book_online: 'Reservar en línea',
      theme_dark: 'Oscuro',
      theme_light: 'Claro',
      theme_label: 'Modo de color',
      lang_label: 'Idioma',
      tagline: 'Pruebas de humo y OBD móviles',
      serving: 'Ahora sirviendo al Condado de San Diego y el Valle Central',
      nap_name: 'NorCal CARB Mobile · Mobile Clean Truck Check',
      reviews_line: '5.0 · 33 reseñas de Google',
      reviews_read: 'Lea nuestras reseñas de Google',
      cred_alt: 'NorCal CARB Mobile — Clean Truck Check credentialed tester',
      h1: 'Vamos a usted. Clean Truck Check.',
      lede: 'Clean Truck Check móvil para camiones y casas rodantes. Oakland, Hayward, Peninsula, Napa y Wine Country. Los 7 días de la semana.',
      sent: 'Gracias — recibimos su solicitud. Responderemos pronto. ¿Lo necesita hoy? Llame al (916) 890-4427.',
      error: 'No pudimos enviar esa solicitud. Llame al (916) 890-4427.',
      sending: 'Enviando…',
      prices_how: 'Cuánto cuesta',
      tile_obd: 'OBD',
      tile_obd_sub: '/ vehículo',
      tile_obd_copy: 'Clean Truck Check de diagnóstico a bordo para camiones diésel 2013+.',
      tile_ovi: 'OVI móvil',
      tile_ovi_sub: '/ vehículo',
      tile_ovi_copy: 'Prueba de opacidad de humo cuando no aplica OBD — unidades más antiguas y muchas casas rodantes.',
      tile_mh: 'Casa rodante',
      tile_mh_copy: 'Pruebas de RV / casa rodante en su ubicación. La casa rodante es su propia cita.',
      call_to_book: 'Llamar para reservar',
      request_cb: 'Pedir una llamada',
      map_alt: 'Mapa de cobertura encuadrado en Bay Area, Peninsula, Oakland, Hayward, Napa y Wine Country',
      chips_label: 'Corredor',
      form_title: 'Solicitar una prueba',
      label_name: 'Nombre',
      label_phone: 'Teléfono',
      label_location: 'Ciudad o patio del camión o casa rodante',
      loc_ph: 'p. ej. patio en Oakland, Hayward, Peninsula, Napa',
      label_service: '¿Qué necesita?',
      opt_obd: 'Prueba OBD ($75)',
      opt_ovi: 'OVI móvil / humo ($199)',
      opt_mh_obd: 'Casa rodante OBD ($99)',
      opt_mh_ovi: 'Casa rodante OVI / humo ($229)',
      opt_fleet: 'Varios camiones / flota',
      opt_unsure: 'No estoy seguro — ayúdenme a elegir',
      label_email: 'Correo (opcional)',
      label_details: 'Detalles (opcional)',
      details_ph: 'Cuántos camiones o casas rodantes, y cuándo nos necesita',
      terms_html: 'Acepto los <a href="/testing-terms" target="_blank" rel="noopener">Términos de prueba y derechos del cliente</a>.',
      send: 'Enviar solicitud',
      hours: 'Los 7 días de la semana — vamos a su patio',
      email_label: 'Correo',
      phone_label: 'Llame o envíe un mensaje',
      area_label: 'Corredor de servicio',
      area_copy: 'Oakland · Hayward · Peninsula · Napa · Wine Country',
      foot_blurb: 'Pruebas móviles Clean Truck Check (OBD y OVI). Vamos a usted.',
      foot_contact: 'Contacto',
      foot_policies: 'Políticas',
      terms_short: 'Términos de prueba y derechos del cliente',
      foot_prices: 'OBD $75 · OVI móvil $199 · Casa rodante $99/$229',
      mobile_book: 'Reservar'
    }
  };

  function bootTheme() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }

  function bootLang() {
    var saved;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { saved = null; }
    var lang = saved === 'es' ? 'es' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    return lang;
  }

  function applyI18n(lang) {
    var dict = strings[lang] || strings.en;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key || !dict[key]) return;
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key && dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (key && dict[key]) el.setAttribute('aria-label', dict[key]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      if (key && dict[key]) el.setAttribute('alt', dict[key]);
    });
    syncToggles(lang, document.documentElement.getAttribute('data-theme') || 'dark');
  }

  function syncToggles(lang, theme) {
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      var on = btn.getAttribute('data-set-lang') === lang;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('is-active', on);
    });
    document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
      var on = btn.getAttribute('data-set-theme') === theme;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('is-active', on);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    syncToggles(document.documentElement.getAttribute('data-lang') || 'en', theme);
  }

  function setLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    applyI18n(lang);
  }

  var theme = bootTheme();
  var lang = bootLang();

  document.addEventListener('DOMContentLoaded', function () {
    applyI18n(lang);
    document.addEventListener('click', function (e) {
      var langBtn = e.target.closest('[data-set-lang]');
      if (langBtn) {
        e.preventDefault();
        setLang(langBtn.getAttribute('data-set-lang'));
        return;
      }
      var themeBtn = e.target.closest('[data-set-theme]');
      if (themeBtn) {
        e.preventDefault();
        setTheme(themeBtn.getAttribute('data-set-theme'));
      }
    });
  });

  window.NCM_UI = {
    strings: strings,
    setTheme: setTheme,
    setLang: setLang,
    theme: function () { return document.documentElement.getAttribute('data-theme'); },
    lang: function () { return document.documentElement.getAttribute('data-lang'); }
  };
})();
