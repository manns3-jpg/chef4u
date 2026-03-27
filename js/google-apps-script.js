/**
 * Google Apps Script for Chef4U Catering Contact Form
 * 
 * INSTRUCTIONS:
 * 1. Go to https://sheets.google.com and create a new Sheet named "Chef4U Inquiries".
 * 2. Name the first tab/sheet: 'Leads'.
 * 3. In 'Leads', add headers in Row 1: Timestamp, Name, Email, Phone, Message.
 * 4. Go to Extensions > Apps Script.
 * 5. Delete any existing code and paste this entire code.
 * 6. Update the RECIPIENT_EMAIL constant below.
 * 7. Click 'Deploy' > 'New deployment'.
 * 8. Select type: 'Web app'.
 * 9. Description: 'Contact Form v1'.
 * 10. Execute as: 'Me'.
 * 11. Who has access: 'Anyone' (IMPORTANT!).
 * 12. Click 'Deploy'.
 * 13. Copy the 'Web App URL' (ends in /exec).
 * 14. Paste this URL into your website's js/script.js file variable GOOGLE_SCRIPT_URL.
 */

const RECIPIENT_EMAIL = "chefdhwani99@gmail.com"; // Updated to client email from footer

function doPost(e) {
    try {
        const lock = LockService.getScriptLock();
        lock.tryLock(10000);

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
        if (!sheet) {
            return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": "Leads sheet not found" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        const nextRow = sheet.getLastRow() + 1;

        // Parse the post data
        const data = JSON.parse(e.postData.contents);

        const newRow = [];
        const timestamp = new Date();

        // Add data in specific order matching headers
        newRow.push(timestamp); // Column A: Timestamp
        newRow.push(data.name); // Column B: Name
        newRow.push(data.email); // Column C: Email
        newRow.push(data.phone); // Column D: Phone
        newRow.push(data.message); // Column E: Message

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        // Send Email Notification
        sendEmailNotification(data);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        LockService.getScriptLock().releaseLock();
    }
}

function sendEmailNotification(data) {
    const subject = `New Catering Inquiry from ${data.name} - Chef4U`;
    const body = `
    You have received a new catering inquiry!
    
    Name: ${data.name}
    Email: ${data.email}
    Phone: ${data.phone}
    
    Message:
    ${data.message}
    
    -----------------------------------
    This email was sent automatically from your Chef4U website contact form.
  `;

    MailApp.sendEmail({
        to: RECIPIENT_EMAIL,
        subject: subject,
        body: body,
        replyTo: data.email // Allows you to directly reply to the customer
    });
}
