/**
 * NorCal CARB Mobile — subscribe, cancel reminders, unsubscribe marketing
 * APPROVED FOR DEPLOYMENT — do not edit without Bryan's approval.
 */

var HEADERS = [
  'id', 'email', 'first_name', 'audience_type', 'source', 'vehicle_label',
  'registration_type', 'next_deadline', 'test_type', 'subscribed_at',
  'reminders_enabled', 'marketing_opt_in', 'welcome_sent', 'cancel_token',
  'sent_90', 'sent_60', 'sent_30', 'last_blast_campaign'
];

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'cancel') {
    return jsonResponse(handleCancelReminders(e.parameter.token));
  }
  if (action === 'unsubscribe') {
    return jsonResponse(handleUnsubscribe(e.parameter.token));
  }
  return jsonResponse({ ok: false, error: 'Unknown action' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    return jsonResponse(handleSubscribe(body));
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function handleSubscribe(body) {
  if (!body.email) {
    return { ok: false, error: 'email is required' };
  }

  var audienceType = (body.audience_type || 'NEW_LEAD').toUpperCase();
  var wantsReminders = body.reminders_enabled !== false && body.next_deadline;

  if (wantsReminders && !body.next_deadline) {
    return { ok: false, error: 'next_deadline required for deadline reminders' };
  }

  var sheet = getSheet();
  ensureHeaders(sheet);

  var id = Utilities.getUuid();
  var cancelToken = Utilities.getUuid();
  var row = [
    id,
    String(body.email).trim().toLowerCase(),
    body.first_name || '',
    audienceType,
    body.source || 'tool_calculator',
    body.vehicle_label || 'Your vehicle',
    body.registration_type || 'CA',
    body.next_deadline || '',
    body.test_type || 'UNKNOWN',
    new Date().toISOString(),
    wantsReminders ? 'TRUE' : 'FALSE',
    body.marketing_opt_in !== false ? 'TRUE' : 'FALSE',
    '',
    cancelToken,
    '',
    '',
    '',
    ''
  ];

  sheet.appendRow(row);
  return { ok: true, id: id, cancel_token: cancelToken };
}

function handleCancelReminders(token) {
  return setFlagByToken(token, 'reminders_enabled', 'FALSE', 'cancelled_reminders');
}

function handleUnsubscribe(token) {
  var result = setFlagByToken(token, 'marketing_opt_in', 'FALSE', 'unsubscribed');
  if (result.ok) {
    setFlagByToken(token, 'reminders_enabled', 'FALSE', 'unsubscribed');
  }
  return result;
}

function setFlagByToken(token, column, value, okKey) {
  if (!token) {
    return { ok: false, error: 'token required' };
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { ok: false, error: 'no subscribers' };
  }

  var tokenCol = HEADERS.indexOf('cancel_token');
  var targetCol = HEADERS.indexOf(column);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(token)) {
      sheet.getRange(i + 1, targetCol + 1).setValue(value);
      var out = { ok: true };
      out[okKey] = true;
      return out;
    }
  }

  return { ok: false, error: 'token not found' };
}

function getSheet() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty('SPREADSHEET_ID');
  var sheetName = props.getProperty('SHEET_NAME') || 'Subscribers';

  if (!spreadsheetId) {
    throw new Error('Set SPREADSHEET_ID in Script properties');
  }

  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow[0] !== 'id') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
