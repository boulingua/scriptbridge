# Refinement record — 30 October 2026

This is a local engineering candidate on `refine/2026-10-30`. No hosted CI,
published release or production deployment of these changes has been observed.
The suite strategy and integration order live in the organisation repository,
`docs/refinement-2026-10-30.md` and `docs/release-candidate-2026-10-30.md`.

## Findings, implementation and verification

The extension provides optional deterministic script substitutions for reading practice. It does not translate text or establish pronunciation equivalence.

The dependency audit found two high-severity issues in the locked development tree. Updating the affected lockfile entries removed the reported advisories. Clean `npm ci`, `npm test`, package generation and the real Chromium browser test passed. The browser run exercised injection, protected editable fields, temporary original-text display, dynamic content, lossless restoration, saved preferences and reload/unregister. The test now uses Playwright's bundled Chromium rather than a Linux-only executable path. The workflow runs that same entry point.

No runtime transformation or permission expansion was introduced. Native extension-consent UI and store acceptance were not automated or observed. README.md documents local unpacked installation and verification. Before distributing a new package, review its exact contents and perform an interactive consent/install check in the intended browser; publish only an approved version. Shared-engine compatibility with Scriptlibrary remains guarded by digest verification.

## Re-audit remediation — 31 October 2026

Packaging now reads the version from the runtime manifest and fixes archive
ordering, timestamps and file permissions. Its regression changes source-file
timestamps/permissions and verifies byte-identical output, versioned filename,
runtime contents and exclusion of files outside the extension. CI runs that
Python test and uploads the version-derived artifact. Runtime bytes and the
manifest version remain 0.2.0.

The generated ZIP and Scriptlibrary's distributed ZIP are byte-identical;
SHA-256: `c4ac9545183f623e66fd975849266cc65b9c6b440e873d80a3461de2405cc7c3`.
Every archived entry matches the corresponding runtime or licence file. The
Python packaging test, all 12 engine/DOM tests and the real isolated Chromium
integration test passed again. No permissions were added.

Native Chrome consent/action-popup acceptance remains unobserved. An attempted
supported browser-tool inventory returned no browsers and the explicit error
“The browser access host is unavailable”; the user's browser profile was not
modified. The automated integration test still uses its documented temporary
localhost grant. The exact remaining check is a clean Chrome profile with the
final ZIP: install, real action popup, deny/allow optional site access, reload,
revoke, original restoration and uninstall. Hosted CI and distribution remain
separate, unobserved acceptance steps for this local candidate.
