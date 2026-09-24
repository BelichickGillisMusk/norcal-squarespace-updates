/**
 * CARB VIN compliance gadget — drop on any Clean Truck Check lander.
 *
 * Mount:
 *   <aside id="carb-vin-gadget"
 *     data-city="Roseville"
 *     data-phone="916-890-4427"
 *     data-book="#contact"
 *     data-api="" ></aside>
 *   <script src="/assets/carb-vin-gadget.js" defer></script>
 *
 * data-api empty → tries same-origin /api/compliance then public VIN Ops API.
 * Never invents COMPLIANT / NON-COMPLIANT. Never I/O/Q in VINs. Check digit enforced.
 */
(function () {
  "use strict";

  var DEFAULT_API_FALLBACKS = [
    "/api/compliance",
    "https://cleantruckcheckvin-app.pages.dev/api/compliance",
  ];

  var VIN_TRANS = {
    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5,
    P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };
  var VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeVin(raw) {
    return String(raw || "")
      .toUpperCase()
      .replace(/[IOQ]/g, "")
      .replace(/[^A-HJ-NPR-Z0-9]/g, "")
      .slice(0, 17);
  }

  function expectedCheckDigit(vin) {
    if (vin.length !== 17) return null;
    var total = 0;
    for (var i = 0; i < 17; i++) {
      var n = VIN_TRANS[vin[i]];
      if (n === undefined) return null;
      total += n * VIN_WEIGHTS[i];
    }
    var rem = total % 11;
    return rem === 10 ? "X" : String(rem);
  }

  function vinIssues(vin) {
    var issues = [];
    if (!vin) {
      issues.push("Enter a VIN.");
      return issues;
    }
    if (vin.length < 17) issues.push("Need 17 characters (you have " + vin.length + ").");
    if (vin.length === 17) {
      var exp = expectedCheckDigit(vin);
      if (exp && vin[8] !== exp) {
        issues.push(
          'Position 9 check digit is wrong (got "' + vin[8] + '", should be "' + exp + '").'
        );
      }
    }
    return issues;
  }

  function injectStyles() {
    if (document.getElementById("carb-vin-gadget-css")) return;
    var css = document.createElement("style");
    css.id = "carb-vin-gadget-css";
    css.textContent = [
      ".cvg{--cvg-orange:#4ab94e;--cvg-orange-dk:#3d9b2f;--cvg-black:#012241;--cvg-text:#012241;--cvg-muted:#3F3C38;--cvg-cream:#f4f7fa;--cvg-border:#d5dee6;--cvg-white:#fff;font-family:Inter,system-ui,sans-serif;color:var(--cvg-text);background:var(--cvg-white);border:2px solid var(--cvg-border);border-radius:12px;padding:1.1rem 1.15rem;margin:1rem 0;max-width:100%;box-sizing:border-box}",
      ".cvg *,.cvg *::before,.cvg *::after{box-sizing:border-box}",
      ".cvg-kicker{font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--cvg-orange);margin:0 0 0.35rem}",
      ".cvg h2,.cvg-title{font-family:Montserrat,Inter,system-ui,sans-serif;font-size:1.05rem;font-weight:700;color:var(--cvg-black);margin:0 0 0.4rem;line-height:1.25}",
      ".cvg-lead{font-size:0.88rem;color:var(--cvg-muted);line-height:1.55;margin:0 0 0.65rem}",
      ".cvg-rules{margin:0 0 0.85rem;padding:0.65rem 0.75rem 0.65rem 1.2rem;background:var(--cvg-cream);border:1px solid var(--cvg-border);border-radius:8px;font-size:0.8rem;color:var(--cvg-text);line-height:1.5}",
      ".cvg-rules li{margin:0.2rem 0}",
      ".cvg-row{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:stretch}",
      ".cvg-row input[type=text]{flex:1 1 180px;min-width:0;border:1.5px solid var(--cvg-border);border-radius:8px;padding:0.75rem 0.9rem;font-size:1rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.06em;text-transform:uppercase;color:var(--cvg-text);background:var(--cvg-cream)}",
      ".cvg-row input[type=text]:focus{outline:none;border-color:var(--cvg-orange);box-shadow:0 0 0 3px rgba(253,90,30,0.15)}",
      ".cvg-row button{flex:0 0 auto;border:none;border-radius:8px;padding:0.75rem 1.1rem;font-weight:700;font-size:0.88rem;background:var(--cvg-orange);color:var(--cvg-white);cursor:pointer;min-height:48px;font-family:Montserrat,Inter,system-ui,sans-serif}",
      ".cvg-row button:hover{background:var(--cvg-orange-dk)}",
      ".cvg-row button:disabled{opacity:0.55;cursor:wait}",
      ".cvg-counter{margin-top:0.45rem;font-size:0.8rem;font-weight:600;color:var(--cvg-muted);font-family:ui-monospace,Menlo,monospace}",
      ".cvg-counter.ok{color:#157347}",
      ".cvg-counter.bad{color:#b42318}",
      ".cvg-error{display:none;margin-top:0.55rem;font-size:0.84rem;font-weight:600;color:#b42318}",
      ".cvg-error.show{display:block}",
      ".cvg-result{display:none;margin-top:0.9rem}",
      ".cvg-result.show{display:block}",
      ".cvg-verdict{font-family:Montserrat,Inter,system-ui,sans-serif;font-weight:800;font-size:clamp(1.25rem,4vw,1.7rem);letter-spacing:0.04em;text-align:center;padding:0.85rem 1rem;border-radius:8px;margin-bottom:0.75rem;line-height:1.2}",
      ".cvg-verdict.ok{background:#d1e7dd;color:#0f5132;border:2px solid #198754}",
      ".cvg-verdict.bad{background:#f8d7da;color:#842029;border:2px solid #dc3545}",
      ".cvg-verdict.unk{background:#fff3cd;color:#664d03;border:2px solid #ffc107}",
      ".cvg-detail{font-size:0.86rem;color:var(--cvg-text);line-height:1.55;margin-bottom:0.65rem}",
      ".cvg-meta{font-size:0.8rem;color:var(--cvg-muted);margin-bottom:0.75rem;line-height:1.45}",
      ".cvg-actions{display:flex;flex-wrap:wrap;gap:0.5rem}",
      ".cvg-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0.55rem 0.9rem;border-radius:8px;font-weight:700;font-size:0.84rem;text-decoration:none}",
      ".cvg-btn-book{background:var(--cvg-orange);color:var(--cvg-white)!important}",
      ".cvg-btn-call{background:var(--cvg-black);color:var(--cvg-white)!important}",
      ".cvg-note{font-size:0.75rem;color:var(--cvg-muted);margin-top:0.75rem;line-height:1.45}",
      ".cvg-note a{color:var(--cvg-orange);font-weight:600}",
      ".cvg-seo{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
    ].join("");
    document.head.appendChild(css);
  }

  function apiList(el) {
    var custom = (el.getAttribute("data-api") || "").trim();
    if (custom) return [custom].concat(DEFAULT_API_FALLBACKS);
    return DEFAULT_API_FALLBACKS.slice();
  }

  async function fetchCompliance(apis, vin) {
    var lastErr = null;
    for (var i = 0; i < apis.length; i++) {
      var base = apis[i];
      try {
        var res = await fetch(base + (base.indexOf("?") >= 0 ? "&" : "?") + "vin=" + encodeURIComponent(vin), {
          headers: { Accept: "application/json" },
        });
        var text = await res.text();
        var data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          lastErr = new Error("Non-JSON from " + base);
          continue;
        }
        if (res.ok && data && data.ok !== false && (data.verdict || data.status)) {
          return data;
        }
        if (data && data.error) {
          lastErr = new Error(data.error);
          // validation errors are final
          if (res.status === 400) throw lastErr;
          continue;
        }
        lastErr = new Error("Lookup failed (" + res.status + ")");
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("VIN lookup unavailable. Call 916-890-4427.");
  }

  function mount(el) {
    if (!el || el.getAttribute("data-cvg-ready") === "1") return;
    el.setAttribute("data-cvg-ready", "1");
    injectStyles();

    var city = el.getAttribute("data-city") || "California";
    var phone = el.getAttribute("data-phone") || "916-890-4427";
    var book = el.getAttribute("data-book") || "#contact";
    var phoneHref = "tel:" + phone.replace(/[^\d+]/g, "");
    var apis = apiList(el);
    var uid = "cvg-" + Math.random().toString(36).slice(2, 9);

    el.classList.add("cvg");
    el.setAttribute("aria-label", "Clean Truck Check VIN compliance lookup for " + city);
    el.innerHTML =
      '<p class="cvg-kicker">Free tool · Clean Truck Check</p>' +
      '<h2 class="cvg-title">VIN compliance lookup — ' + escapeHtml(city) + " mobile CARB testing</h2>" +
      '<p class="cvg-lead">Check your diesel truck’s <strong>CARB Clean Truck Check / HD I/M</strong> status by VIN. ' +
      "We validate the VIN on this page, then pull live <strong>COMPLIANT</strong> or <strong>NON-COMPLIANT</strong> from CARB — no popup, no leaving " +
      escapeHtml(city) + ".</p>" +
      '<ul class="cvg-rules">' +
      "<li><strong>Never</strong> use <strong>I</strong>, <strong>O</strong>, or <strong>Q</strong> (look like 1 and 0).</li>" +
      "<li>Only <strong>A–H, J–N, P, R–Z</strong> and digits <strong>0–9</strong>.</li>" +
      "<li>Exactly <strong>17</strong> characters. Position <strong>9</strong> is the check digit (0–9 or X).</li>" +
      "</ul>" +
      '<div class="cvg-row">' +
      '<input type="text" id="' + uid + '-in" maxlength="17" autocomplete="off" spellcheck="false" ' +
      'placeholder="17-CHAR VIN" aria-label="17-character vehicle VIN" inputmode="text" />' +
      '<button type="button" id="' + uid + '-btn">Check status</button>' +
      "</div>" +
      '<div class="cvg-counter" id="' + uid + '-ctr">0 / 17 · check digit (pos 9): —</div>' +
      '<div class="cvg-error" id="' + uid + '-err" role="alert"></div>' +
      '<div class="cvg-result" id="' + uid + '-out" role="status" aria-live="polite"></div>' +
      '<p class="cvg-note">Not affiliated with CARB. Status is never invented. Mobile OBD $75 · OVI $199 · ' +
      '<a href="' + phoneHref + '">' + escapeHtml(phone) + "</a>. " +
      'Official portal: <a href="https://cleantruckcheck.arb.ca.gov" rel="noopener" target="_blank">cleantruckcheck.arb.ca.gov</a></p>' +
      // Crawlable SEO block (visible content already has keywords; this adds structured FAQ text)
      '<div class="cvg-seo">' +
      "<p>Clean Truck Check VIN lookup for " + escapeHtml(city) + " fleets. HD I/M compliance, OBD and OVI smoke opacity testing, mobile diesel emissions tester IF530523.</p>" +
      "</div>";

    // JSON-LD once per page
    if (!document.getElementById("carb-vin-gadget-ld")) {
      var ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "carb-vin-gadget-ld";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Clean Truck Check VIN Compliance Lookup",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Free on-page VIN tool for California Clean Truck Check / HD I/M status. Validates VIN format (no I/O/Q, check digit) and reports CARB COMPLIANT or NON-COMPLIANT without inventing results. Mobile testing " +
          phone +
          ".",
        provider: {
          "@type": "AutomotiveBusiness",
          name: "NorCal CARB Mobile LLC",
          telephone: "+1-916-890-4427",
          areaServed: city + ", CA",
        },
      });
      document.head.appendChild(ld);
    }

    var input = document.getElementById(uid + "-in");
    var btn = document.getElementById(uid + "-btn");
    var err = document.getElementById(uid + "-err");
    var out = document.getElementById(uid + "-out");
    var ctr = document.getElementById(uid + "-ctr");

    function updateCounter() {
      var v = normalizeVin(input.value);
      var pos9 = v.length >= 9 ? v[8] : "—";
      var exp = v.length === 17 ? expectedCheckDigit(v) : null;
      var msg = v.length + " / 17 · check digit (pos 9): " + pos9;
      ctr.classList.remove("ok", "bad");
      if (v.length === 17 && exp) {
        if (v[8] === exp) {
          msg += " · valid format ✓";
          ctr.classList.add("ok");
        } else {
          msg += " · expected " + exp + " ✗";
          ctr.classList.add("bad");
        }
      }
      ctr.textContent = msg;
    }

    input.addEventListener("input", function () {
      if (/[IOQioq]/.test(input.value)) {
        err.textContent = "I, O, and Q are never in a VIN — removed.";
        err.classList.add("show");
      } else if (err.textContent.indexOf("I, O, and Q") === 0) {
        err.classList.remove("show");
        err.textContent = "";
      }
      input.value = normalizeVin(input.value);
      updateCounter();
    });
    updateCounter();

    function render(data, vin) {
      var verdict = data.verdict || (
        /non/i.test(data.status || "") ? "NON_COMPLIANT" :
        /compliant/i.test(data.status || "") && !/non/i.test(data.status || "") ? "COMPLIANT" :
        "NO_RECORD"
      );
      var cls = "unk";
      var big = "NO RECORD AT CARB";
      var hint = "No compliance row on file yet — book mobile testing in " + city + " and we come to your yard.";
      if (verdict === "COMPLIANT") {
        cls = "ok";
        big = "COMPLIANT";
        hint = "CARB shows COMPLIANT. Need a retest or CTC help in " + city + "? Book below.";
      } else if (verdict === "NON_COMPLIANT") {
        cls = "bad";
        big = "NON-COMPLIANT";
        hint = "CARB shows NON-COMPLIANT. Book mobile OBD $75 / OVI $199 — we come to your yard.";
      }

      out.innerHTML =
        '<div class="cvg-verdict ' + cls + '">' + escapeHtml(big) + "</div>" +
        '<div class="cvg-detail"><strong style="font-family:ui-monospace,monospace;letter-spacing:0.05em">' +
        escapeHtml(vin) + "</strong><br>" + escapeHtml(data.details || "") + "</div>" +
        '<p class="cvg-meta">' + escapeHtml(hint) + "</p>" +
        '<div class="cvg-actions">' +
        '<a class="cvg-btn-book" href="' + escapeHtml(book) + '">Continue → book mobile test</a>' +
        '<a class="cvg-btn-call" href="' + phoneHref + '">Call ' + escapeHtml(phone) + "</a>" +
        "</div>";
      out.classList.add("show");
      out.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    async function run() {
      var vin = normalizeVin(input.value);
      input.value = vin;
      updateCounter();
      err.classList.remove("show");
      err.textContent = "";
      out.classList.remove("show");
      out.innerHTML = "";

      var issues = vinIssues(vin);
      if (issues.length) {
        err.textContent = issues[0];
        err.classList.add("show");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Checking CARB…";
      out.innerHTML = '<p class="cvg-meta">Looking up live status at CARB…</p>';
      out.classList.add("show");

      try {
        var data = await fetchCompliance(apis, vin);
        render(data, data.vin || vin);
      } catch (e) {
        out.classList.remove("show");
        out.innerHTML = "";
        err.textContent = (e && e.message) || "Lookup failed.";
        err.classList.add("show");
      } finally {
        btn.disabled = false;
        btn.textContent = "Check status";
      }
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      run();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        run();
      }
    });
  }

  function boot() {
    var nodes = document.querySelectorAll("#carb-vin-gadget, [data-carb-vin-gadget]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
