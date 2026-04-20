/**
 * Google Apps Script for Chef4U Catering Contact Form - ROBUST VERSION
 * 
 * INSTRUCTIONS:
 * 1. Go to your Google Sheet > Extensions > Apps Script.
 * 2. Delete ALL existing code and replace it with this version.
 * 3. Click 'Save' and then 'Deploy' > 'New Deployment'.
 * 4. Choose 'Web App', Execute as 'Me', Access 'Anyone'.
 * 5. Click 'Deploy' and copy the NEW Web App URL.
 */

const RECIPIENT_EMAIL = "chefdhwani99@gmail.com";

function doPost(e) {
    try {
        const lock = LockService.getScriptLock();
        lock.tryLock(10000);

        // Robust sheet selection: try 'Leads' first, then fall back to the first sheet
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName('Leads');
        if (!sheet) {
            sheet = ss.getSheets()[0]; // Fallback to first tab if 'Leads' is missing
        }

        const nextRow = sheet.getLastRow() + 1;

        // Data extraction from standard form parameters or JSON body
        let data = {};
        if (e.postData && e.postData.contents) {
            try {
                data = JSON.parse(e.postData.contents);
            } catch (err) {
                // Not JSON, use parameters instead
                data = e.parameter;
            }
        } else {
            data = e.parameter;
        }

        const timestamp = new Date();
        const newRow = [
            timestamp,
            data.name || "N/A",
            data.email || "N/A",
            data.phone || "N/A",
            data.message || "N/A"
        ];

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        // Send Email Notification
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
