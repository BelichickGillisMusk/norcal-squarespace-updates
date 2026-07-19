/**
 * NorCal Ops — Approval Dashboard (Web App)
 *
 * Bryan and other approvers open one URL to review pending cold emails
 * (Send Queue) and GBP posts. Approve or remove rows — no raw sheet editing.
 *
 * DEPLOY (one-time, Bryan):
 *   1. Open NorCal Camila Ops → Extensions → Apps Script
 *   2. Add this file + CamilaApprovalDashboard.html (same project as cold-outreach-log-setup.gs)
 *   3. Run setupApprovalDashboard() once
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me (bryan@)
 *        Who has access: Anyone with Google account
 *   5. Copy URL → Script property APPROVAL_DASHBOARD_URL
 *
 * APPROVED FOR DEPLOYMENT
 */

var DASHBOARD_VERSION = '1.0.0';

var QUEUE_CONFIG = [
  {
    id: 'cold_send',
    sheetName: 'Send Queue',
    title: 'Cold email queue',
    pendingStatus: 'pending',
    approveColumn: 'bryan_approved',
    statusColumn: 'status',
    displayColumns: ['company', 'email', 'first_name', 'city', 'template_id', 'mx_ok', 'scheduled_send_pt', 'notes']
  },
  {
    id: 'gbp_post',
    sheetName: 'GBP Posts',
    title: 'GBP local posts',
    pendingStatus: 'draft',
    approveColumn: 'bryan_approved',
    statusColumn: 'status',
    displayColumns: ['publish_date', 'post_title', 'post_body', 'cta_url', 'notes']
  }
];

function setupApprovalDashboard() {
  var ss = getSpreadsheet_();
  createApproversTab_(ss);
  ensureQueueColumns_(ss);
  Logger.log('✅ Approval dashboard ready. Deploy Web App and set APPROVAL_DASHBOARD_URL.');
}

function doGet(e) {
  var page = e && e.parameter && e.parameter.page;
  if (page === 'api' && e.parameter.action === 'health') {
    return jsonOut_({ ok: true, version: DASHBOARD_VERSION });
  }
  return HtmlService.createHtmlOutputFromFile('CamilaApprovalDashboard')
    .setTitle('NorCal Ops — Approvals')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------------------------------------------------------------------------
// Called from HTML (google.script.run)
// ---------------------------------------------------------------------------

function getDashboardBootstrap() {
  var user = Session.getActiveUser().getEmail();
  if (!user) {
    return { ok: false, error: 'Sign in with your Google account to use this dashboard.' };
  }
  if (!isApprover_(user)) {
    return {
      ok: false,
      error: 'Your account is not on the approvers list. Ask Bryan to add you on the Approvers tab.',
      email: user
    };
  }
  var url = PropertiesService.getScriptProperties().getProperty('APPROVAL_DASHBOARD_URL') || '';
  return {
    ok: true,
    version: DASHBOARD_VERSION,
    user: user,
    dashboardUrl: url,
    queues: QUEUE_CONFIG.map(function (q) {
      return { id: q.id, title: q.title };
    })
  };
}

function listPendingItems(queueId) {
  var user = requireApprover_();
  var cfg = getQueueConfig_(queueId);
  if (!cfg) return { ok: false, error: 'Unknown queue' };

  var sheet = getSpreadsheet_().getSheetByName(cfg.sheetName);
  if (!sheet) return { ok: false, error: 'Sheet not found: ' + cfg.sheetName };

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return { ok: true, items: [], queue: cfg.id };

  var headers = normalizeHeaders_(data[0]);
  var approveIdx = headers.indexOf(cfg.approveColumn);
  var statusIdx = headers.indexOf(cfg.statusColumn);
  if (approveIdx < 0 || statusIdx < 0) {
    return { ok: false, error: 'Missing columns on ' + cfg.sheetName };
  }

  var items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (isRowEmpty_(row)) continue;

    var approved = String(row[approveIdx] || '').toUpperCase();
    var status = String(row[statusIdx] || '').toLowerCase();
    if (approved === 'YES') continue;
    if (status === 'removed' || status === 'scheduled' || status === 'sent' || status === 'published') {
      continue;
    }
    if (status && status !== cfg.pendingStatus && cfg.id === 'cold_send' && status !== 'pending') {
      continue;
    }
    if (cfg.id === 'gbp_post' && status && status !== 'draft') continue;

    var item = {
      rowIndex: i + 1,
      queueId: cfg.id,
      summary: buildSummary_(cfg, headers, row)
    };
    cfg.displayColumns.forEach(function (col) {
      var idx = headers.indexOf(col);
      if (idx >= 0) item[col] = row[idx];
    });
    items.push(item);
  }

  logApprovalAction_('list_pending', user, cfg.id, items.length + ' items');
  return { ok: true, queue: cfg.id, items: items };
}

function approveItem(queueId, rowIndex) {
  var user = requireApprover_();
  return mutateRow_(queueId, rowIndex, user, 'approve');
}

function removeItem(queueId, rowIndex) {
  var user = requireApprover_();
  return mutateRow_(queueId, rowIndex, user, 'remove');
}

function approveAllPending(queueId) {
  var user = requireApprover_();
  var listed = listPendingItems(queueId);
  if (!listed.ok) return listed;
  var count = 0;
  listed.items.forEach(function (item) {
    var res = mutateRow_(queueId, item.rowIndex, user, 'approve');
    if (res.ok) count++;
  });
  notifyChat_(
    '✅ Batch approved — ' + queueId,
    user + ' approved ' + count + ' item(s) in ' + queueId + ' via Ops dashboard.'
  );
  return { ok: true, approved: count };
}

// ---------------------------------------------------------------------------
// Row mutations
// ---------------------------------------------------------------------------

function mutateRow_(queueId, rowIndex, user, action) {
  var cfg = getQueueConfig_(queueId);
  if (!cfg) return { ok: false, error: 'Unknown queue' };
  if (!rowIndex || rowIndex < 2) return { ok: false, error: 'Invalid row' };

  var sheet = getSpreadsheet_().getSheetByName(cfg.sheetName);
  var headers = normalizeHeaders_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var approveIdx = headers.indexOf(cfg.approveColumn) + 1;
  var statusIdx = headers.indexOf(cfg.statusColumn) + 1;
  var approvedByIdx = headers.indexOf('approved_by') + 1;
  var approvedAtIdx = headers.indexOf('approved_at') + 1;

  if (action === 'approve') {
    sheet.getRange(rowIndex, approveIdx).setValue('YES');
    if (approvedByIdx > 0) sheet.getRange(rowIndex, approvedByIdx).setValue(user);
    if (approvedAtIdx > 0) {
      sheet.getRange(rowIndex, approvedAtIdx).setValue(new Date().toISOString());
    }
    logApprovalAction_('approve', user, cfg.id, 'row ' + rowIndex);
    notifyChat_('✅ Approved', user + ' approved ' + cfg.sheetName + ' row ' + rowIndex);
    return { ok: true, action: 'approve', rowIndex: rowIndex };
  }

  if (action === 'remove') {
    if (statusIdx > 0) sheet.getRange(rowIndex, statusIdx).setValue('removed');
    if (approveIdx > 0) sheet.getRange(rowIndex, approveIdx).setValue('NO');
    if (approvedByIdx > 0) sheet.getRange(rowIndex, approvedByIdx).setValue(user);
    if (approvedAtIdx > 0) {
      sheet.getRange(rowIndex, approvedAtIdx).setValue(new Date().toISOString());
    }
    logApprovalAction_('remove', user, cfg.id, 'row ' + rowIndex);
    return { ok: true, action: 'remove', rowIndex: rowIndex };
  }

  return { ok: false, error: 'Unknown action' };
}

// ---------------------------------------------------------------------------
// Approvers tab
// ---------------------------------------------------------------------------

function createApproversTab_(ss) {
  var name = 'Approvers';
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  var headers = ['email', 'name', 'role', 'active'];
  var first = sheet.getRange(1, 1).getValue();
  if (first !== headers[0]) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e8f0fe');
    sheet.setFrozenRows(1);
    sheet.appendRow(['bryan@norcalcarbmobile.com', 'Bryan Gillis', 'owner', 'YES']);
    sheet.appendRow(['bgillis99@gmail.com', 'Bryan Gillis', 'owner', 'YES']);
  }
}

function isApprover_(email) {
  if (!email) return false;
  var normalized = String(email).toLowerCase().trim();
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName('Approvers');
  if (!sheet) {
    return (
      normalized === 'bryan@norcalcarbmobile.com' ||
      normalized === 'bgillis99@gmail.com'
    );
  }
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase().trim() === normalized && String(data[i][3]).toUpperCase() === 'YES') {
      return true;
    }
  }
  return false;
}

function requireApprover_() {
  var user = Session.getActiveUser().getEmail();
  if (!user || !isApprover_(user)) {
    throw new Error('Not authorized. Ask Bryan to add your email on the Approvers tab.');
  }
  return user;
}

// ---------------------------------------------------------------------------
// Sheet helpers
// ---------------------------------------------------------------------------

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('CAMILA_SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('Open NorCal Camila Ops sheet or set CAMILA_SHEET_ID in Script Properties.');
}

function ensureQueueColumns_(ss) {
  addColumnsIfMissing_(ss.getSheetByName('Send Queue'), ['approved_by', 'approved_at']);
  var gbp = ss.getSheetByName('GBP Posts');
  if (gbp) {
    addColumnsIfMissing_(gbp, ['status', 'bryan_approved', 'approved_by', 'approved_at']);
  }
}

function addColumnsIfMissing_(sheet, colNames) {
  if (!sheet) return;
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var existing = headers.map(function (h) {
    return String(h).toLowerCase().replace(/ /g, '_');
  });
  colNames.forEach(function (col) {
    if (existing.indexOf(col) < 0) {
      var newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(col).setFontWeight('bold').setBackground('#e8f0fe');
    }
  });
}

function normalizeHeaders_(row) {
  return row.map(function (h) {
    return String(h).toLowerCase().replace(/ /g, '_');
  });
}

function isRowEmpty_(row) {
  for (var i = 0; i < row.length; i++) {
    if (row[i] !== '' && row[i] !== null) return false;
  }
  return true;
}

function buildSummary_(cfg, headers, row) {
  if (cfg.id === 'gbp_post') {
    var titleIdx = headers.indexOf('post_title');
    var dateIdx = headers.indexOf('publish_date');
    return (row[dateIdx] || '') + ' — ' + (row[titleIdx] || 'GBP post');
  }
  var companyIdx = headers.indexOf('company');
  var emailIdx = headers.indexOf('email');
  return (row[companyIdx] || 'Lead') + ' <' + (row[emailIdx] || '') + '>';
}

function getQueueConfig_(queueId) {
  for (var i = 0; i < QUEUE_CONFIG.length; i++) {
    if (QUEUE_CONFIG[i].id === queueId) return QUEUE_CONFIG[i];
  }
  return null;
}

function logApprovalAction_(action, user, queueId, detail) {
  try {
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName('Chat Log');
    if (!sheet) return;
    sheet.appendRow([new Date().toISOString(), 'dashboard_' + action, queueId + ': ' + detail, user, '']);
  } catch (e) {
    Logger.log('logApprovalAction_: ' + e);
  }
}

function notifyChat_(title, message) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty('GOOGLE_CHAT_WEBHOOK_URL');
  if (!webhookUrl) return;
  var payload = {
    cards: [
      {
        header: { title: title, subtitle: 'NorCal Ops Dashboard' },
        sections: [{ widgets: [{ textParagraph: { text: message } }] }]
      }
    ]
  };
  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
