/* Vin Diesel — site chat. Loaded on first open so the page request stays light. */
(function () {
  var PHONE = '(916) 890-4427';
  var GREETING = "Hey, I'm Vin Diesel with NorCal CARB Mobile. Looking to get a truck tested?";
  var launcher = document.getElementById('vin-diesel-launcher');
  var root = document.querySelector('[data-vin-diesel-root]');
  if (!root) {
    root = document.createElement('div');
    root.setAttribute('data-vin-diesel-root', '');
    root.className = 'vin-diesel-root';
    document.body.appendChild(root);
  }
  if (document.getElementById('vin-diesel-style')) {
    /* style already injected */
  } else {
    var style = document.createElement('style');
    style.id = 'vin-diesel-style';
    style.textContent = [
    '.vin-diesel-root{box-sizing:border-box;font-family:system-ui,sans-serif}',
    '.vin-diesel-root *,.vin-diesel-root *::before,.vin-diesel-root *::after{box-sizing:border-box}',
    '.vin-diesel-launcher{position:fixed;z-index:2147483000;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-inline-size:calc(100% - 24px);min-block-size:48px;margin:0;padding:0.7rem 0.95rem;border:0;border-radius:999px;background:#012241;color:#fff;box-shadow:0 8px 24px rgba(1,34,65,.28);font:600 0.95rem/1.2 system-ui,sans-serif;cursor:pointer}',
    '.vin-diesel-launcher:focus-visible{outline:3px solid #4ab94e;outline-offset:2px}',
    '.vin-diesel-panel{position:fixed;z-index:2147483000;inset-inline:12px;bottom:calc(72px + env(safe-area-inset-bottom));display:flex;flex-direction:column;max-block-size:min(70dvh,34rem);background:#fff;color:#012241;border:1px solid #d5dde6;border-radius:16px;box-shadow:0 16px 40px rgba(1,34,65,.24);overflow:hidden}',
    '@media (min-width:720px){.vin-diesel-panel{inset-inline:auto 16px;inline-size:min(24rem,calc(100% - 32px))}}',
    '.vin-diesel-head{display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding:0.75rem 0.85rem;background:#012241;color:#fff}',
    '.vin-diesel-title{margin:0;font-size:1rem;font-weight:700}',
    '.vin-diesel-sub{margin:0;color:#c9d7c9;font-size:0.78rem;font-weight:500}',
    '.vin-diesel-close{min-inline-size:44px;min-block-size:44px;border:0;border-radius:8px;background:transparent;color:#fff;font-size:1.4rem;cursor:pointer}',
    '.vin-diesel-close:focus-visible,.vin-diesel-send:focus-visible,.vin-diesel-input:focus-visible{outline:3px solid #4ab94e;outline-offset:1px}',
    '.vin-diesel-log{flex:1 1 auto;overflow:auto;padding:0.85rem;display:flex;flex-direction:column;gap:0.5rem;background:#f4f7f5}',
    '.vin-diesel-msg{max-inline-size:92%;margin:0;padding:0.6rem 0.75rem;border-radius:12px;white-space:pre-wrap}',
    '.vin-diesel-msg-bot{background:#fff;border:1px solid #e1e7ee;align-self:flex-start}',
    '.vin-diesel-msg-user{background:#012241;color:#fff;align-self:flex-end}',
    '.vin-diesel-form{display:flex;gap:0.45rem;padding:0.65rem;border-top:3px solid #4ab94e;background:#fff}',
    '.vin-diesel-input{flex:1 1 auto;min-inline-size:0;min-block-size:44px;max-block-size:6.5rem;resize:none;padding:0.55rem 0.7rem;border:1px solid #c5d0dc;border-radius:10px;font:1rem/1.35 system-ui,sans-serif;color:#012241}',
    '.vin-diesel-send{flex:0 0 auto;min-inline-size:4.5rem;min-block-size:44px;border:0;border-radius:10px;background:#4ab94e;color:#012241;font:700 0.95rem/1 system-ui,sans-serif;cursor:pointer}',
    '.vin-diesel-send:disabled{opacity:.6;cursor:default}',
    '@media (prefers-reduced-motion: reduce){.vin-diesel-panel,.vin-diesel-launcher{transition:none}}'
  ].join('');
    document.head.appendChild(style);
  }

  if (!launcher) {
    launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.id = 'vin-diesel-launcher';
    launcher.className = 'vin-diesel-launcher';
    launcher.textContent = 'Chat with Vin Diesel';
    launcher.setAttribute('aria-label', 'Chat with Vin Diesel');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'vin-diesel-panel');
    root.appendChild(launcher);
    launcher.addEventListener('click', function () {
      if (window.__vinDieselToggle) window.__vinDieselToggle();
    });
  }
  if (!root.isConnected) document.body.appendChild(root);

  var panel = null;
  var log = null;
  var input = null;
  var send = null;
  var messages = [];
  var busy = false;
  var conversationId = '';

  function storageId() {
    try {
      var key = 'vin-diesel-conversation';
      var id = sessionStorage.getItem(key);
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
        sessionStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return conversationId || (conversationId = String(Date.now()));
    }
  }

  function add(role, text) {
    var item = document.createElement('p');
    item.className = 'vin-diesel-msg ' + (role === 'user' ? 'vin-diesel-msg-user' : 'vin-diesel-msg-bot');
    item.textContent = text;
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  }

  function mount() {
    if (panel) return;
    panel = document.createElement('section');
    panel.id = 'vin-diesel-panel';
    panel.className = 'vin-diesel-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Chat with Vin Diesel');
    panel.innerHTML = '<div class="vin-diesel-head"><div><p class="vin-diesel-title">Vin Diesel</p><p class="vin-diesel-sub">AI booking assistant</p></div><button type="button" class="vin-diesel-close" aria-label="Close chat">&times;</button></div><div class="vin-diesel-log" role="log" aria-live="polite"></div><form class="vin-diesel-form"><label class="visually-hidden" for="vin-diesel-input" style="position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip:rect(0 0 0 0)">Message</label><textarea id="vin-diesel-input" class="vin-diesel-input" maxlength="1200" rows="1" placeholder="Message Vin Diesel"></textarea><button type="submit" class="vin-diesel-send">Send</button></form>';
    root.appendChild(panel);
    log = panel.querySelector('.vin-diesel-log');
    input = panel.querySelector('.vin-diesel-input');
    send = panel.querySelector('.vin-diesel-send');
    panel.querySelector('.vin-diesel-close').addEventListener('click', close);
    panel.querySelector('form').addEventListener('submit', onSubmit);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        panel.querySelector('form').requestSubmit();
      }
    });
    add('assistant', GREETING);
    messages.push({ role: 'assistant', content: GREETING });
  }

  function open() {
    mount();
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function close() {
    if (!panel) return;
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    add('user', text);
    messages.push({ role: 'user', content: text });
    busy = true;
    send.disabled = true;
    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-16),
          conversation_id: storageId(),
          page: location.pathname
        })
      });
      var data = await res.json().catch(function () { return {}; });
      var reply = data.reply || data.error || ('Text us at ' + PHONE + '.');
      add('assistant', reply);
      if (data.ok) messages.push({ role: 'assistant', content: reply });
    } catch (e) {
      add('assistant', 'Chat is busy right now. Text us at ' + PHONE + '.');
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  }

  window.__vinDieselToggle = function () {
    if (panel && !panel.hidden) close();
    else open();
  };

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panel && !panel.hidden) close();
  });
})();
