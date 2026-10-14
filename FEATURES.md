# Reference integration map

Reference reviewed: https://sbigattendance.github.io/Gym/

| Area | v4 behavior |
| --- | --- |
| Brand and homepage | Exact repository logo; white, charcoal and orange theme; fixed header/footer; all five modules |
| Navigation | Same-tab full app pages with Back and hash routes, no module popups |
| Admissions | Three steps; Individual/Family; Regular/PT; contacts, DOB/age/address; camera or image upload for portrait/signature; rules acceptance |
| Fee quote | Monthly rates and date promotions; ₹850/₹800/₹1500 initial defaults; first-month 30-day proration when fewer than 15 days remain |
| Admission number | Assigned on server under a lock; archived IDs not reused |
| Readmission | Existing membership lookup, six-calendar-month rule, linked new membership; configurable absence/admission basis |
| Attendance | Exact ID/phone public lookup, staff name lookup, dated logs, one record per member per day |
| Member workspace | Search, FY fee calendar, attendance counts, edits, receipt history, admission record |
| Fees | Cash/UPI, partial payments, remaining balance, collector PIN, confirmed receipts |
| Documents | Admission record with bilingual rules/signatures; receipts; PDF, print and device share; prepared WhatsApp welcome |
| Staff access | Server-checked role/PIN, add, reset, revoke and change PIN |
| Admin | Expenses, FY/month reports, receipts, dues, partial balances, admissions, cash surplus/deficit, MoM/YoY, CSV export |
| Tariffs | Twelve monthly rates per April–March FY; dated promotions; newest overlapping promotion wins |
| Settings | Studio details, UPI address, readmission basis |
| Supplement store | Live products/prices/stock; admin inventory; staff checkout; atomic stock decrement and sale receipt |
| Database | Google Sheets `RF_` tabs; confirmed responses; request replay protection; audit records |
| Old records | Administrator-run migration, original sheets retained, aggregate-payment limitations documented |

## Deliberate changes from the reference

- The reference's browser database and unconfirmed background sync are replaced by server reads and confirmed writes.
- Archive replaces hard member deletion, retaining the financial ledger.
- Photo and signature use camera/upload, not a drawing pad. Camera output is not horizontally mirrored.
- The printed six-month absence rule and the old code were inconsistent. The default now follows absence, with an explicit admin setting for admission-date basis.
- All collecting staff/admin PINs must have at least six digits; there is no built-in default production PIN.
- The supplement catalog starts empty. Enter the studio's actual items, prices and quantities under Store inventory.

## Limits to deployment claims

This package was built and checked locally. It has not been uploaded to your GitHub account or deployed in your Google account. The authenticated production bridge, camera permissions, native UPI handling and PDF appearance still require the live-device acceptance checks in START-HERE.md. There is no promise of unlimited spreadsheet scale or automatic bank confirmation.
