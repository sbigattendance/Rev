# Revive Fitness Studio v4: hosting package

This is a complete source and hosting package, not a patch. The homepage opens immediately. Live records require the new Apps Script deployment below. The original website's API is not compatible with v4.

## 1. Set up Google Sheets (one time)

1. Make a backup copy of your existing Google Sheet. Keep it private.
2. Create a **new Apps Script project** at https://script.google.com. Do not replace the old deployment yet if importing old data.
3. Add the files from `google-apps-script`: `Code.gs`, `Domain.gs`, `Migration.gs`, and an HTML file named **Bridge** containing `Bridge.html`.
4. In Project Settings, enable **Show appsscript.json manifest file**. Replace its contents with the included `appsscript.json`. This enables the Advanced Google Sheets service. If using a custom Google Cloud project, also enable the Google Sheets API there.
5. In Project Settings → Script properties, add:

   | Property | Value |
   | --- | --- |
   | `SPREADSHEET_ID` | The text between `/d/` and `/edit` in your sheet URL |
   | `INITIAL_ADMIN_PIN` | Your new unique 6–12 digit admin PIN |
   | `ALLOWED_ORIGINS` | `https://sbigattendance.github.io` |

   Do not put PINs, Google credentials, or private sheet exports in GitHub. A custom domain needs its exact HTTPS origin here too, comma separated. Do not include `/Gym/` in an origin.
6. Select `setupRevive_` in the editor and click **Run**. Authorize access to your sheet. It creates `RF_` tabs and your admin account. It does not erase old tabs. The initial PIN property is removed automatically after setup.
7. If preserving old records, complete **MIGRATION.md** now, before accepting new v4 entries.
8. Deploy → New deployment → Web app. **Execute as: Me. Who has access: Anyone.** Deploy and copy the URL ending `/exec`. If your Workspace administrator blocks anonymous web apps, that account cannot host this public kiosk backend with the current design.

## 2. Connect and upload the website

1. Open `config.js` and paste the new deployment URL:

   ```js
   window.REVIVE_CONFIG = {
     SHEETS_API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
     LOGO_URL: './logo.png?v=4'
   };
   ```

2. In the GitHub Pages publishing folder for your portal, upload/replace these items **together**:

   - `index.html`
   - `config.js`
   - `logo.png`
   - `signature.png`
   - the complete `vendor` folder

   Place `index.html` directly in the publishing folder, not inside an extra nested `revive-v4` folder. Existing obsolete `app.js` or CSS files are no longer loaded by this version. The source, tests, and backend files do not need to be published.
3. GitHub repository → Settings → Pages → Deploy from a branch → select the branch and folder containing `index.html`.
4. Open the Pages URL, for example `https://sbigattendance.github.io/Gym/`. The footer must show **v4**. Reload if an earlier version remains cached.
5. Sign in under **Admin Login** using the new PIN. Set the studio UPI ID, verify the studio address/phone and tariff rates, add/reset staff access, then add supplement products and stock.

The logo is the exact `logo.png` from the reference repository, with the same image embedded as a fallback. All portal module routes stay in the same tab. GitHub project paths such as `/Gym/` work because assets are relative and routes use URL hashes.

## 3. Verify the live connection before opening to members

The package has passed the local checks described in `TEST-RESULTS.md`. Your deployed Google account and GitHub origin still need this live acceptance check:

1. On a test copy of the Sheet/deployment, confirm the homepage shows **Live**.
2. Register a test member with photo/signature and confirmed cash receipt. Verify its member, media, charges and transaction rows in the `RF_` tabs.
3. Mark attendance twice. Verify only one attendance row for that member/date.
4. Collect a partial fee for an eligible unpaid month. Verify the remaining balance and separate receipt.
5. Add two units of a supplement, record a sale, and verify the stock decreases in both the Sheet and a refreshed second device.
6. Test staff login and denied access to admin reports. Revoke the staff account and confirm its next request is rejected.
7. Download/print a receipt and admission record; test camera, PDF sharing and UPI opening on your actual iPhone/Android browser.
8. Disconnect the network and confirm the portal shows an error rather than a successful save.

Use a test copy for these checks. To launch with existing records, use the migrated production Sheet with no test transactions mixed into its ledger. Archive test members if needed; archiving deliberately retains their financial history.

## Data and payments

- Business records are read from and written to Google Sheets. No localStorage, sessionStorage, IndexedDB or offline database is used.
- Unsaved form contents and the login token exist only in tab memory. Refreshing signs out and discards unfinished drafts. Server sessions expire after two hours.
- Saves are confirmed by Apps Script. On an uncertain timeout, keep the form open and retry the **same details**; its request identifier prevents duplicate posting. After closing a tab during an uncertain save, staff should search the live ledger before creating a new entry.
- Data reloads when entering a module or pressing its refresh button. The visible store refreshes every 30 seconds. This is live sheet access with polling, not instant push notifications between devices.
- UPI QR codes initiate payment. Staff must verify actual credit in the bank/UPI account before confirming. There is no bank webhook or automatic settlement verification.
- Receipts and reports are management records, not GST tax invoices. Supplement checkout is a staff-recorded counter sale, with no delivery/order fulfillment or payment gateway.
- Attendance is a public kiosk using an exact member ID/phone. It does not verify identity with an OTP. Use it under studio supervision.
- Edit records through the portal. Changing `RF_` headers or typing directly into ledger cells can break integrity. Export reports for review and back up the Sheet regularly.

## Updating the app

Frontend changes: edit `src` files, run `python3 build.py`, then upload the rebuilt `index.html` and any changed assets. Backend changes: update Apps Script files, then Manage deployments → Edit → **New version** → Deploy. Keep the same deployment URL when possible. Do not retain a separate active legacy endpoint that publicly exposes member data after migration.

Official setup references: https://developers.google.com/apps-script/guides/web • https://developers.google.com/apps-script/guides/services/advanced • https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
