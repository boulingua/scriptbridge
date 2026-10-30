# Refinement record — 30 October 2026

This is a local engineering candidate on `refine/2026-10-30`. No hosted CI,
published release or production deployment of these changes has been observed.
The suite strategy and integration order live in the organisation repository,
`docs/refinement-2026-10-30.md` and `docs/release-candidate-2026-10-30.md`.

## Findings, implementation and verification

The extension provides optional deterministic script substitutions for reading practice. It does not translate text or establish pronunciation equivalence.

The dependency audit found two high-severity issues in the locked development tree. Updating the affected lockfile entries removed the reported advisories. Clean `npm ci`, `npm test`, package generation and the real Chromium browser test passed. The browser run exercised injection, protected editable fields, temporary original-text display, dynamic content, lossless restoration, saved preferences and reload/unregister. The test now uses Playwright's bundled Chromium rather than a Linux-only executable path. The workflow runs that same entry point.

No runtime transformation or permission expansion was introduced. Native extension-consent UI and store acceptance were not automated or observed. README.md documents local unpacked installation and verification. Before distributing a new package, review its exact contents and perform an interactive consent/install check in the intended browser; publish only an approved version. Shared-engine compatibility with Scriptlibrary remains guarded by digest verification.
