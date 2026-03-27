# 🚀 Google Sheets Contact Form Setup Guide

This guide will help you connect your website's contact form to a Google Sheet so you can receive inquiries instantly.

## 📋 Prerequisites
- A Google Account (Gmail)
- 5 minutes of your time

---

## Step 1: Create the Google Sheet
1. Go to [sheet.new](https://sheet.new) to create a fresh Google Sheet.
2. Name the spreadsheet (top left): **Chef4U Inquiries**
3. Rename the bottom tab (Sheet1) to: **Leads** (Case sensitive!)
4. In the first row, add these exact headers:
   - **A1:** Timestamp
   - **B1:** Name
   - **C1:** Email
   - **D1:** Phone
   - **E1:** Message

## Step 2: Add the Code
1. In your Google Sheet, click `Extensions` > `Apps Script` from the top menu.
2. Delete any code currently in the editor (`function myFunction()...`).
3. Open the file `js/google-apps-script.js` from your project folder.
4. Copy **ALL** the code from that file.
5. Paste it into the Google Apps Script editor.
6. Click the 💾 (Save) icon.

## Step 3: Deploy the Web App
1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3. Fill in the details:
   - **Description:** Contact Form v1
   - **Execute as:** Me (your email)
   - **Who has access:** **Anyone** (This is crucial! If you choose "Myself", the form won't work for visitors).
4. Click **Deploy**.
5. You might be asked to **Authorize Access**. Click "Review permissions", choose your account, and if you see a warning "Google hasn't verified this app", click **Advanced** > **Go to (Script Name) (unsafe)** > **Allow**. 
   *(Don't worry, it's "unsafe" only because you just wrote it and Google hasn't reviewed it. It's safe.)*

## Step 4: Connect to Website
1. Once deployed, you will see a **Web App URL** (starts with `https://script.google.com/macros/s/...`).
2. **Copy** this URL.
3. Open your project file: `js/script.js`.
4. Find line 126 (approx):
   ```javascript
   const SCRIPT_URL = 'INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
5. Paste your copied URL inside the quotes.
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
   ```
6. Save the file.

## Stop 5: Test It!
1. Open your `index.html` in the browser.
2. Fill out the contact form.
3. Click "Get Quote Now".
4. Check your Google Sheet — the data should appear instantly! 
5. Check your Email — you should receive a notification.

---
**Troubleshooting:**
- **Status 404?** You might have set access to "Myself" instead of "Anyone". Check deployment settings.
- **CORS Error?** Ensure you copied the `exec` URL, not the `dev` URL.
