export const GOOGLE_SHEETS_SCRIPT = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheetName || 'Sheet1';
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Values needs to be parsed just in case
    var valuesToAppend = data.values;
    if (typeof valuesToAppend === 'string') {
        valuesToAppend = JSON.parse(valuesToAppend);
    }

    sheet.appendRow(valuesToAppend);
    return ContentService.createTextOutput(JSON.stringify({ success: true, row: valuesToAppend })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
