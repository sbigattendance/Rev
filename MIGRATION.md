# Bring existing Revive records into v4

Migration is optional for a new empty register. For existing records, run it before accepting any v4 registrations or attendance. It is an administrator-run operation in Apps Script, never in the public portal.

1. Back up the existing Sheet. First test this process using a copy and a separate v4 Apps Script deployment.
2. Pause registration, payments, attendance and other edits on the old portal during the production cutover. The import takes a single snapshot; later changes on the old site will not appear in v4.
3. Complete `setupRevive_` for the v4 project. In Script properties set `LEGACY_API_URL` to the old web app URL configured as `CLOUD_SYNC_URL` in the existing repository's `index.html`.
4. Run `previewLegacyMigration_`. Review aggregate record counts in the execution log. It reads the old API but writes nothing.
5. Set Script property `MIGRATION_APPROVED` to `YES`, then run `importLegacy_`. Authorize the external connection if prompted. It writes only the new `RF_` tabs in a single Sheets batch. Invalid source records stop the import before commit. Original tabs remain untouched.
6. Check member counts, IDs, photos/signatures, attendance, expenses and monthly paid/due balances against the old website. Review `legacyImportSummary` in `RF_Settings`.
7. Imported staff accounts are inactive. Sign in with the new admin PIN, open **Staff access**, use **Reset PIN / activate**, and assign each person a unique 6–12 digit PIN. Old plaintext PINs are never imported.
8. After verification, switch the GitHub website to v4 and disable the old Apps Script deployment. Remove the `LEGACY_API_URL` property. Resume entries only on v4.

## Historical limitations

The old site stored one running payment total per member/month, not an immutable receipt for each installment. Migration therefore creates one **Legacy** collection per monthly total and uses its recorded `lastDate`. If no usable timestamp exists, the first day of the billing month is used and `dateEstimated: true` is recorded in the transaction details. Reports show **Imported collections** separately. Individual historical partial-payment dates, collectors, payment-mode splits and separate admission/training splits cannot be reconstructed from those aggregates.

Original member IDs are retained and new IDs continue above the highest existing number. Legacy users are imported as active because the old schema does not preserve an authoritative archive/readmission linkage. Review old readmissions and archive obsolete memberships before using the v4 dues report. No automatic name matching or invented relationship is applied.

Photo/signature images stay in Sheets as chunks. Legacy non-PNG/JPEG images or invalid dates require correction in the source before import. Empty legacy date of birth/address values remain empty for review; subsequent profile edits require the normal required fields.

The importer refuses a second successful import or an already populated v4 member/transaction/attendance database. For a failed rehearsal, use a fresh test Sheet/project. For large photo-heavy databases, Apps Script runtime and Sheets request limits may require a staged migration; this package does not silently truncate records or split the atomic import. Do not publish exported member data in GitHub.
