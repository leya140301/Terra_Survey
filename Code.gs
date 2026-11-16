/**
 * Study Terra – Umfrage (Google Apps Script Web-App)
 *
 * Liefert die Umfrage-Website aus (index.html) und speichert jede Antwort
 * als neue Zeile im Tabellenblatt „Antworten“. Das Blatt „Auswertung“ wird
 * nach jeder Antwort automatisch neu berechnet.
 */

/**
 * PASSWORT FÜR DIE AUSWERTUNG – bitte ändern!
 * Die Auswertung öffnet ihr über den Web-App-Link mit ?auswertung am Ende,
 * z. B. https://script.google.com/macros/s/…/exec?auswertung
 * (Diese Datei ist für Teilnehmende nicht sichtbar.)
 */
var ADMIN_PASSWORD = 'HIER-PASSWORT-EINTRAGEN';

var SHEET_RESPONSES = 'Antworten';
var SHEET_SUMMARY = 'Auswertung';

/** Website ausliefern */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Umfrage Study Terra')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Einmal im Editor ausführen: verbindet das Skript mit der Tabelle und fragt die Berechtigungen ab. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Bitte das Skript über die Tabelle öffnen (Erweiterungen → Apps Script).');
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  getSheet_(SHEET_RESPONSES);
  getSheet_(SHEET_SUMMARY);
  Logger.log('Fertig. Tabelle: ' + ss.getUrl());
}

/** Menü in der Tabelle */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Study Terra')
    .addItem('Auswertung aktualisieren', 'updateSummary')
    .addToUi();
}

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  throw new Error('Keine Tabelle verbunden. Bitte zuerst setup() ausführen.');
}

function getSheet_(name) {
  var ss = getSpreadsheet_();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** Verhindert, dass Freitext als Formel interpretiert wird, und begrenzt die Länge. */
function clean_(v) {
  if (typeof v === 'number') return v;
  var s = String(v).slice(0, 5000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** Wird von der Website aufgerufen. */
function submitResponse(payload) {
  if (!payload || !Array.isArray(payload.headers) || typeof payload.answers !== 'object') {
    throw new Error('Ungültige Daten');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet_(SHEET_RESPONSES);
    var lastCol = sh.getLastColumn();
    var headers = lastCol ? sh.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var wanted = ['Zeitstempel', 'Sprache'].concat(payload.headers.slice(0, 200).map(String));
    var changed = false;
    wanted.forEach(function (h) {
      if (headers.indexOf(h) === -1) { headers.push(h); changed = true; }
    });
    if (changed) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    var rec = {};
    Object.keys(payload.answers).forEach(function (k) { rec[k] = payload.answers[k]; });
    rec['Zeitstempel'] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    rec['Sprache'] = payload.lang === 'en' ? 'EN' : 'DE';
    var row = headers.map(function (h) {
      var v = rec[h];
      return v === undefined || v === null ? '' : clean_(v);
    });
    // Als Text speichern, damit z. B. „12–14“ nicht als Datum gelesen wird
    var target = sh.getRange(sh.getLastRow() + 1, 1, 1, row.length);
    target.setNumberFormat('@');
    target.setValues([row.map(String)]);
  } finally {
    lock.releaseLock();
  }
  try { updateSummary(); } catch (e) { console.error(e); }
  return true;
}

/** Zählt alle Auswahl-Antworten und schreibt sie ins Blatt „Auswertung“. */
function updateSummary() {
  var src = getSheet_(SHEET_RESPONSES);
  var out = getSheet_(SHEET_SUMMARY);
  out.clear();
  if (src.getLastRow() < 2) {
    out.getRange(1, 1).setValue('Noch keine Antworten.');
    return;
  }
  var data = src.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);

  var table = [
    ['Study Terra – Auswertung', '', '', ''],
    ['Antworten gesamt', rows.length, '', ''],
    ['Stand', new Date(), '', ''],
    ['', '', '', ''],
    ['Frage', 'Antwort', 'Anzahl', 'Anteil der Personen, die die Frage beantwortet haben']
  ];
  var questionRows = [];

  headers.forEach(function (h, c) {
    if (!h || h === 'Zeitstempel' || /\[Text\]$/.test(h)) return;
    var counts = {}, answered = 0, sum = 0, numeric = true;
    rows.forEach(function (r) {
      var v = r[c];
      if (v === '' || v === null) return;
      answered++;
      String(v).split(' | ').forEach(function (p) {
        p = p.trim();
        if (p) counts[p] = (counts[p] || 0) + 1;
      });
      var n = Number(v);
      if (isNaN(n)) numeric = false; else sum += n;
    });
    if (!answered) return;
    var keys = Object.keys(counts);
    if (numeric) keys.sort(function (a, b) { return Number(a) - Number(b); });
    else keys.sort(function (a, b) { return counts[b] - counts[a]; });
    questionRows.push(table.length);
    keys.forEach(function (k, i) {
      table.push([i === 0 ? h : '', k, counts[k], counts[k] / answered]);
    });
    if (numeric) table.push(['', 'Durchschnitt (1–5)', Math.round(sum / answered * 100) / 100, '']);
    table.push(['', '', '', '']);
  });

  out.getRange(1, 1, table.length, 4).setValues(table);
  out.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  out.getRange(3, 2).setNumberFormat('dd.MM.yyyy HH:mm');
  out.getRange(5, 1, 1, 4).setFontWeight('bold').setBackground('#e1f1e9');
  out.getRange(6, 4, Math.max(1, table.length - 5), 1).setNumberFormat('0%');
  questionRows.forEach(function (r) { out.getRange(r + 1, 1).setFontWeight('bold'); });
  out.setColumnWidth(1, 380);
  out.setColumnWidth(2, 300);
  out.setColumnWidth(4, 200);
  out.getRange(1, 1, table.length, 4).setWrap(true).setVerticalAlignment('top');
  out.setFrozenRows(5);
}

/** Wird von der Auswertungsseite aufgerufen (nur mit Passwort). */
function getResults(password) {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === 'HIER-PASSWORT-EINTRAGEN') throw new Error('not_configured');
  if (String(password) !== ADMIN_PASSWORD) {
    Utilities.sleep(1500); // bremst Rateversuche
    throw new Error('wrong_password');
  }
  var ss = getSpreadsheet_();
  var sh = getSheet_(SHEET_RESPONSES);
  var rows = [];
  if (sh.getLastRow() >= 2) {
    var data = sh.getDataRange().getDisplayValues();
    var headers = data[0];
    rows = data.slice(1).map(function (r) {
      var o = {};
      headers.forEach(function (h, i) { if (h && r[i] !== '') o[h] = r[i]; });
      return o;
    });
  }
  return { rows: rows, sheetUrl: ss.getUrl() };
}
