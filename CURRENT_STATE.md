# Current state — 2026-09-22

Version 0.2.0. Public repository: https://github.com/boulingua/scriptbridge, branch `main`. The installable archive is `dist/scriptbridge-0.2.0.zip`. No Chrome Web Store submission or hosted release has been created. Check GitHub Actions for hosted status of the current commit.

English, French and German sources; Greek, one shared Cyrillic option, Nordic, Polish and Czech targets. Legacy Russian/Ukrainian settings migrate to Cyrillic. Nordic and the sparse Latin sets do not use cumulative consonant stages. The popup includes country/language differences and an English/German disclaimer describing the simplified learning exercise.

Preserved: 0–100% deterministic sampling of eligible letters, Alt peek, original restoration, protected form/editable/code text, dynamic-page handling, optional per-site automatic practice and local-only settings. No runtime network requests or analytics. Sound rules are approximate; 100% does not mean every letter changes.

Local verification: 12 unit/DOM tests passed; Chromium install, popup, injection, protection, Alt peek, dynamic content and opt-in reload/unregister passed. Native permission-consent UI and everyday use in the user’s browser remain manual checks. The ZIP and engine are synced and hash-verified by the companion library, which now contains twelve books and 192 PDFs.

See `MAPPINGS.md` for source-language conditions and alphabet references, `HANDOVER.md` for maintenance, and `VALIDATION.json` for local evidence.
