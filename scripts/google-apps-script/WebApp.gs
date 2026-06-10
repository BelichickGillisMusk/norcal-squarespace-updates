/**
 * NorCal CARB Mobile — CTC Reminder subscribe + cancel webhook
 * APPROVED FOR DEPLOYMENT — do not edit without Bryan's approval.
 *
 * Deploy: Extensions → Apps Script → Deploy → Web app
 *   Execute as: Me | Who has access: Anyone
 */

var HEADERS = [
  'id', 'email', 'vehicle_label', 'registration_type', 'next_deadline',
  'test_type', 'subscribed_at', 'reminders_enabled', 'cancel_token',
  'sent_90', 'sent_60', 'sent_30'
];

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'cancel') {
    return jsonResponse(handleCancel(e.parameter.token));
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
  if (!body.email || !body.next_deadline) {
    return { ok: false, error: 'email and next_deadline are required' };
  }

  var sheet = getSheet();
  ensureHeaders(sheet);

  var id = Utilities.getUuid();
  var cancelToken = Utilities.getUuid();
  var row = [
    id,
    String(body.email).trim().toLowerCase(),
    body.vehicle_label || 'Your vehicle',
    body.registration_type || 'CA',
    body.next_deadline,
    body.test_type || 'UNKNOWN',
    new Date().toISOString(),
    'TRUE',
    cancelToken,
    '',
    '',
    ''
  ];

  sheet.appendRow(row);
  return { ok: true, id: id, cancel_token: cancelToken };
}

function handleCancel(token) {
  if (!token) {
    return { ok: false, error: 'token required' };
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { ok: false, error: 'no subscribers' };
  }

  var tokenCol = HEADERS.indexOf('cancel_token');
  var enabledCol = HEADERS.indexOf('reminders_enabled');

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(token)) {
      sheet.getRange(i + 1, enabledCol + 1).setValue('FALSE');
      return { ok: true, cancelled: true };
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
