# Verification results

All **15 automated tests passed**. The raw run is in `tests/results.txt`.

## Backend: 12 tests

Executed the actual Apps Script source in a Node sandbox with simulated Sheets, cache, locks, properties and clock. Covered:

- Admission proration and totals, unique phones, confirmation requirement.
- Request replay deduplication, request-status secrets, changed-payload rejection.
- Partial fee payments, overpayment rejection and admission-month boundaries.
- Daily attendance deduplication and restricted public search.
- Revenue retention after archiving and continuing admission-number series.
- Role checks, unique staff PINs and revoked sessions.
- Stock decrement and ledger integrity with an injected atomic commit failure, oversell, changed prices and repeated requests.
- UPI configuration and payment confirmation.
- Six-month readmission boundary, last-attendance rule and month-end clamping.
- Family shared-phone policy and duplicate identity rejection.
- Migration balances, IDs, media, inactive imported staff and exclusion of plaintext credentials.
- Migration validation with no partial records after failure.

## Frontend: 3 tests

- Rendered 26 full-page routes in jsdom using simulated API responses. Checked module navigation, hidden homepage on module screens, admin login guard, absence of dialogs and prohibited browser database use.
- Checked the bridge's channel, origin and response-source validation.
- Parsed every embedded script, checked relative paths and compared the embedded logo bytes with the packaged repository image.

## What these tests do not establish

These are local code and DOM tests, not a live Apps Script deployment or visual browser test. They do not establish real Google authorization, iframe behavior on the deployed account, physical-device camera permissions, bank payment status, native sharing, PDF pagination or iPhone layout. The live acceptance sequence is in START-HERE.md. No production member or financial records were changed while developing this package.

To rerun: install Node.js 20+ and Python 3, then run `npm install`, `npm run build`, `npm test`. jsdom is only a test dependency; hosting does not require npm or Node.js.
