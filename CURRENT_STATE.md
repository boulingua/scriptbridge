# Current state — 2026-09-22

Local version 0.1.0. Manifest V3 extension and installable ZIP are implemented. The public repository is `https://github.com/boulingua/scriptbridge`, with `main` as the publication branch. No hosted release or Chrome Web Store submission has been created.

English, French and German source languages; Modern Greek, Russian Cyrillic, Ukrainian and selected Nordic target letters. Adjustable 0–100% sampling of eligible letters; three cumulative letter sets; Alt-peek; original-text restoration; optional automatic operation on an explicitly enabled site. Input, editable text, code, attributes and explicit foreign-language islands are protected. No runtime dependencies or network activity.

Verified locally: engine and DOM tests; real Chromium loading and API integration; automatic injection on reload, unregister, site rewrites, dynamic nodes and lossless restoration. The browser harness pregrants only its localhost fixture in a temporary copy and models the action popup's target-tab query. The native permission-consent dialog is not automated. Tests do not establish phonetic correctness for every word, dialect or name.

The same engine is pinned in `../scriptlibrary/third_party/engine.lock.json`; any engine update requires an explicit sync and edition rebuild. The extension ZIP is also distributed by the library.

See `HANDOVER.md` for commands and continuation constraints.

README expanded for fresh clones, usage, troubleshooting, maintenance and licensing on 2026-09-22. Local checks rerun successfully before publication: extension unit/DOM and Chromium integration tests; library PDF/provenance verification, strict production build, 236 local references and browser parity checks.
