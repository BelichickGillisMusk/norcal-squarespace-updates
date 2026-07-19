/**
 * NorCal CARB Mobile — Cold Outreach Log Setup
 * Recreated from cold_outreach_log_setup_script.gs (PR attachment)
 *
 * WHAT THIS DOES:
 *   - Sets up all sheet tabs in "NorCal Camila Ops" Google Spreadsheet
 *   - Tabs: Send Queue, Cold Sends, Suppression, Form Leads,
 *           GBP Log, GSC Weekly, SAFER Leads, Chat Log
 *   - Adds column headers, data validation, and conditional formatting
 *   - Wires a time-driven trigger for Camila's daily loop (9 AM PT)
 *   - Configures Google Chat webhook URL in Script Properties
 *
 * HOW TO DEPLOY:
 *   1. Open Google Sheets → Extensions → Apps Script
 *   2. Paste this file as a new script (or replace Code.gs)
 *   3. Run setupCamilaOpsSheet() once manually
 *   4. Authorize when prompted (needs spreadsheet scope)
 *   5. Paste GOOGLE_CHAT_WEBHOOK_URL into Script Properties
 *   6. Run installDailyTrigger() to schedule Camila's 9 AM PT loop
 *
 * APPROVED FOR DEPLOYMENT — Bryan must authorize OAuth consent.
 */

// ---------------------------------------------------------------------------
// Sheet schemas
// ---------------------------------------------------------------------------

var SEND_QUEUE_HEADERS = [
  'email', 'company', 'first_name', 'city', 'state',
  'dot_number', 'phone', 'template_id', 'scheduled_send_pt',
  'bryan_approved', 'status', 'mx_ok', 'source', 'notes'
];

var COLD_SENDS_HEADERS = [
  'email', 'company', 'first_name', 'city', 'template_id',
  'status', 'sent_at', 'followup_1_at', 'followup_2_at', 'notes'
];

var SUPPRESSION_HEADERS = [
  'email', 'opted_out_at', 'reason', 'added_by'
];

var FORM_LEADS_HEADERS = [
  'email', 'name', 'phone', 'message', 'status',
  'escalated', 'received_at', 'subject', 'replied_at', 'notes'
];

var GBP_LOG_HEADERS = [
  'date', 'review_id', 'rating', 'reviewer', 'review_text',
  'reply_status', 'reply_text', 'replied_at', 'post_type', 'notes'
];

var GSC_WEEKLY_HEADERS = [
  'week_of', 'query', 'clicks', 'impressions', 'ctr',
  'avg_position', 'url', 'indexing_status', 'notes'
];

var SAFER_LEADS_HEADERS = [
  'dot_number', 'company', 'address', 'city', 'state',
  'phone', 'email_guessed', 'mx_ok', 'power_units',
  'operation_type', 'added_to_queue', 'added_at', 'notes'
];

var CHAT_LOG_HEADERS = [
  'timestamp', 'event', 'message', 'sent_by', 'acknowledged'
];

// ---------------------------------------------------------------------------
// Main setup function
// ---------------------------------------------------------------------------

function setupCamilaOpsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Open the NorCal Camila Ops spreadsheet, then run this script.');
  }

  // Create or clear each tab
  createOrResetSheet(ss, 'Send Queue',   SEND_QUEUE_HEADERS);
  createOrResetSheet(ss, 'Cold Sends',   COLD_SENDS_HEADERS);
  createOrResetSheet(ss, 'Suppression',  SUPPRESSION_HEADERS);
  createOrResetSheet(ss, 'Form Leads',   FORM_LEADS_HEADERS);
  createOrResetSheet(ss, 'GBP Log',      GBP_LOG_HEADERS);
  createOrResetSheet(ss, 'GSC Weekly',   GSC_WEEKLY_HEADERS);
  createOrResetSheet(ss, 'SAFER Leads',  SAFER_LEADS_HEADERS);
  createOrResetSheet(ss, 'Chat Log',     CHAT_LOG_HEADERS);

  // Conditional formatting on Send Queue → bryan_approved column
  formatSendQueue(ss);

  // Approvers tab + dashboard columns (CamilaApprovalDashboard.gs)
  if (typeof setupApprovalDashboard === 'function') {
    setupApprovalDashboard();
  }

  // Store spreadsheet ID for use by other scripts
  var props = PropertiesService.getScriptProperties();
  props.setProperty('CAMILA_SHEET_ID', ss.getId());

  Logger.log('✅ NorCal Camila Ops sheet set up. Tabs: ' +
    ss.getSheets().map(function(s){ return s.getName(); }).join(', '));
  Logger.log('Next: paste GOOGLE_CHAT_WEBHOOK_URL into Script Properties, then run installDailyTrigger()');
}

// ---------------------------------------------------------------------------
// Sheet helper
// ---------------------------------------------------------------------------

function createOrResetSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  // Only write headers if row 1 is blank (don't overwrite existing data)
  var firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell || firstCell !== headers[0]) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#e8f0fe');

    // Freeze header row
    sheet.setFrozenRows(1);
  }

  Logger.log('  Sheet ready: ' + name);
  return sheet;
}

// ---------------------------------------------------------------------------
// Conditional formatting — Send Queue
// ---------------------------------------------------------------------------

function formatSendQueue(ss) {
  var sheet = ss.getSheetByName('Send Queue');
  if (!sheet) return;

  var headers = sheet.getRange(1, 1, 1, SEND_QUEUE_HEADERS.length).getValues()[0];
  var approvedCol = headers.indexOf('bryan_approved') + 1;
  var statusCol   = headers.indexOf('status') + 1;
  var mxCol       = headers.indexOf('mx_ok') + 1;

  // Green highlight when bryan_approved = YES
  if (approvedCol > 0) {
    var approvedRange = sheet.getRange(2, approvedCol, 500, 1);
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('YES')
      .setBackground('#b7e1cd')
      .setRanges([approvedRange])
      .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  }

  // Red highlight when status = bounced or opted_out
  if (statusCol > 0) {
    var statusRange = sheet.getRange(2, statusCol, 500, 1);
    var ruleRed = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=OR(J2="bounced",J2="opted_out")')
      .setBackground('#f4c7c3')
      .setRanges([statusRange])
      .build();
    var rulesNow = sheet.getConditionalFormatRules();
    rulesNow.push(ruleRed);
    sheet.setConditionalFormatRules(rulesNow);
  }

  // Data validation — template_id dropdown (A/B/C/D)
  var templateCol = headers.indexOf('template_id') + 1;
  if (templateCol > 0) {
    var templateRange = sheet.getRange(2, templateCol, 500, 1);
    var validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(['A', 'B', 'C', 'D'], true)
      .setAllowInvalid(false)
      .build();
    templateRange.setDataValidation(validation);
  }

  Logger.log('  Conditional formatting applied to Send Queue.');
}

// ---------------------------------------------------------------------------
// Daily trigger — Camila's 9 AM PT loop
// ---------------------------------------------------------------------------

function installDailyTrigger() {
  // Remove existing triggers for this function to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'camilaDailyLoop') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // 9:00 AM in America/Los_Angeles (Apps Script uses local time of script)
  ScriptApp.newTrigger('camilaDailyLoop')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  Logger.log('✅ Daily trigger installed: camilaDailyLoop at 9 AM.');
}

// ---------------------------------------------------------------------------
// Camila daily loop (triggered at 9 AM PT by Apps Script time trigger)
// ---------------------------------------------------------------------------

function camilaDailyLoop() {
  var today = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd');
  Logger.log('[' + today + '] Camila daily loop start');

  // 1. Count today's sends from Cold Sends tab
  var sendCount = countTodaySends(today);
  Logger.log('  Today sends so far: ' + sendCount);

  if (sendCount >= 30) {
    Logger.log('  Daily cap (30) reached — skipping queue build.');
    logChatEvent('daily_cap_reached', 'Daily cap of 30 reached — no new sends today.');
    return;
  }

  // 2. Check Send Queue for approved rows
  var approvedRows = getApprovedQueueRows();
  Logger.log('  Approved queue rows: ' + approvedRows.length);

  if (approvedRows.length === 0) {
    // No approved rows — notify Bryan that queue is empty
    var remaining = 30 - sendCount;
    notifyBryan(
      '📬 Cold queue empty — action needed',
      'No approved rows in Send Queue for ' + today + '.\n' +
      'Remaining capacity: ' + remaining + ' sends.\n\n' +
      dashboardLinkLine_()
    );
    Logger.log('  No approved rows — Bryan notified via Chat.');
    return;
  }

  // 3. Notify Bryan that batch is ready (only notify once per day)
  var lastNotified = PropertiesService.getScriptProperties().getProperty('last_notified_date');
  if (lastNotified !== today) {
    notifyBryan(
      '📬 Cold batch ready — ' + today,
      approvedRows.length + ' emails approved and queued for ' + today + '.\n' +
      'Staggered sends will go out 8:05 AM–11:28 AM PT (7 min apart).\n\n' +
      dashboardLinkLine_() +
      'To pause: reply "hold camila"'
    );
    PropertiesService.getScriptProperties().setProperty('last_notified_date', today);
    Logger.log('  Bryan notified for batch: ' + today);
  }

  logChatEvent('daily_loop_complete', 'Approved rows: ' + approvedRows.length + ', sends today: ' + sendCount);
}

// ---------------------------------------------------------------------------
// Send Queue helpers
// ---------------------------------------------------------------------------

function getApprovedQueueRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Send Queue');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(function(h) { return String(h).toLowerCase().replace(/ /g, '_'); });
  var approvedIdx = headers.indexOf('bryan_approved');
  var statusIdx   = headers.indexOf('status');
  var mxIdx       = headers.indexOf('mx_ok');

  var approved = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (
      String(row[approvedIdx]).toUpperCase() === 'YES' &&
      String(row[statusIdx]).toLowerCase() === 'pending' &&
      String(row[mxIdx]).toUpperCase() === 'TRUE'
    ) {
      approved.push({ rowIndex: i + 1, data: row, headers: headers });
    }
  }
  return approved;
}

function countTodaySends(today) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Cold Sends');
  if (!sheet) return 0;

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return 0;

  var headers = data[0].map(function(h) { return String(h).toLowerCase(); });
  var sentAtIdx = headers.indexOf('sent_at');
  if (sentAtIdx < 0) return 0;

  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var sentAt = String(data[i][sentAtIdx]);
    if (sentAt && sentAt.startsWith(today)) count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Google Chat notification
// ---------------------------------------------------------------------------

function dashboardLinkLine_() {
  var url = PropertiesService.getScriptProperties().getProperty('APPROVAL_DASHBOARD_URL');
  if (url) {
    return 'Approve or remove in the Ops dashboard:\n' + url + '\n\n';
  }
  return 'Approve in Send Queue (bryan_approved = YES) or deploy the Ops dashboard — docs/approval-dashboard.md\n\n';
}

function notifyBryan(title, message) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty('GOOGLE_CHAT_WEBHOOK_URL');
  if (!webhookUrl) {
    Logger.log('  GOOGLE_CHAT_WEBHOOK_URL not set — skipping Chat notification.');
    return;
  }

  var payload = {
    cards: [{
      header: {
        title: title,
        subtitle: 'Camila · NorCal CARB Mobile'
      },
      sections: [{
        widgets: [{
          textParagraph: { text: message }
        }]
      }]
    }]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(webhookUrl, options);
  if (response.getResponseCode() !== 200) {
    Logger.log('  Chat webhook error: ' + response.getContentText());
  } else {
    Logger.log('  Chat notification sent: ' + title);
  }
}

function logChatEvent(event, message) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Chat Log');
  if (!sheet) return;

  var ts = new Date().toISOString();
  sheet.appendRow([ts, event, message, 'Camila', '']);
}

// ---------------------------------------------------------------------------
// Opt-out handler — call from doGet when someone replies "remove"
// ---------------------------------------------------------------------------

function handleOptOut(email, reason) {
  if (!email) return { ok: false, error: 'email required' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var suppSheet = ss.getSheetByName('Suppression');
  if (!suppSheet) return { ok: false, error: 'Suppression sheet not found' };

  // Check if already suppressed
  var data = suppSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
      return { ok: true, already_suppressed: true };
    }
  }

  suppSheet.appendRow([
    email.toLowerCase(),
    new Date().toISOString(),
    reason || 'replied_remove',
    'Camila'
  ]);

  // Also mark status=opted_out in Cold Sends
  var coldSheet = ss.getSheetByName('Cold Sends');
  if (coldSheet) {
    var coldData = coldSheet.getDataRange().getValues();
    var coldHeaders = coldData[0].map(function(h) { return String(h).toLowerCase(); });
    var emailIdx  = coldHeaders.indexOf('email');
    var statusIdx = coldHeaders.indexOf('status');
    for (var j = 1; j < coldData.length; j++) {
      if (String(coldData[j][emailIdx]).toLowerCase() === email.toLowerCase()) {
        coldSheet.getRange(j + 1, statusIdx + 1).setValue('opted_out');
      }
    }
  }

  Logger.log('Opt-out recorded: ' + email);
  return { ok: true, opted_out: true };
}
