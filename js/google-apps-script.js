/**
 * Google Apps Script for Chef4U Catering Contact Form - ROBUST VERSION V2
 * 
 * INSTRUCTIONS:
 * 1. Go to your Google Sheet > Extensions > Apps Script.
 * 2. Delete ALL existing code and replace it with this version.
 * 3. Click 'Save' and then 'Deploy' > 'New Deployment'.
 * 4. Choose 'Web App', Execute as 'Me', Access 'Anyone'.
 * 5. Click 'Deploy' and copy the NEW Web App URL.
 */

const RECIPIENT_EMAIL = "chefdhwani99@gmail.com";
const SHEET_ID = "14XTUwvSHgdhCGqTFKKzmDXr5jpbLHs3OrCacjO7qsau"; // Your exact Sheet ID

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    // Precise sheet selection using ID
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];

    const nextRow = sheet.getLastRow() + 1;
    
    // Read data from Form Parameters (Robust for no-cors mode)
    let data = e.parameter;

    const timestamp = new Date();
    const newRow = [
      timestamp,
      data.name || "N/A",
      data.email || "N/A",
      data.phone || "N/A",
      data.message || "N/A"
    ];

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    sendEmailNotification(data);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    LockService.getScriptLock().releaseLock();
  }
}

function sendEmailNotification(data) {
  const subject = `New Catering Inquiry from ${data.name || "Customer"} - Chef4U`;
  const body = `
    You have received a new catering inquiry!
    
    Name: ${data.name || "N/A"}
    Email: ${data.email || "N/A"}
    Phone: ${data.phone || "N/A"}
    
    Message:
    ${data.message || "No message provided."}
    
    -----------------------------------
    This email was sent automatically from your Chef4U website contact form.
  `;

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    subject: subject,
    body: body,
    replyTo: data.email || null
  });
}
