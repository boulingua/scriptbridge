# Handover

Read `README.md`, `MAPPINGS.md` and `CURRENT_STATE.md` first. The public repository is `https://github.com/boulingua/scriptbridge`; publish reviewed commits to `origin/main`.

## Validate and package

```sh
npm ci
npm test
npm run test:browser
npm run package
```

Browser checks use `/usr/bin/chromium`, or `CHROMIUM` if set. They use a disposable profile and extension copy, never the user's browser profile. Runtime code is under `extension/`; install that directory through Chrome's Load unpacked control. The ZIP contains exactly the runtime plus its MIT licence.

## Boundaries

- Transform from stored original text; never repeatedly transform mixed-script output.
- Preserve site-authored updates when restoring. Do not modify HTML structure, URLs, attributes, form values or editable text.
- Keep settings local and site access optional. No telemetry, network calls or blanket host grant.
- Percentages describe eligible letters. Mapping heuristics are approximate; the Nordic set is intentionally sparse.
- The supplied Azbuka R engine is a different, German transliteration model. Its digraph and umlaut rules have not been represented as sound-equivalent single-letter rules.
- New mappings need source-language context, reference evidence and regression cases. Keep Greek and shared Cyrillic sound rules distinct. Explain national Cyrillic differences in the introduction; do not silently borrow conflicting national letters into the shared subset.

## Updating the library

After changing `extension/engine.js`, run the sibling library's `scripts/sync_engine.py`, rebuild its books, and verify all reader/PDF combinations. After packaging, copy the ZIP into the library's `static/downloads/`. The library's code is independently installable; normal builds never reach into this checkout.

Remaining external checks: native permission-consent UI and ordinary browsing in the user's Chrome profile. No store submission is planned. Git commits use the effective configured user identity.

Version 0.2.0 adds Polish/Czech and consolidates Cyrillic. Stored Russian/Ukrainian settings migrate to Cyrillic, including popup defaults and site preferences. Nordic and sparse Latin sets bypass cumulative consonant stages. Alphabet notes and the English/German disclaimer are included in the popup.
