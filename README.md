# Scriptbridge

A Boulingua Chrome extension for becoming familiar with other alphabets while reading English, French or German. Choose Modern Greek, Russian Cyrillic, Ukrainian, or a small Nordic letter set, then adjust the percentage of eligible letters to replace. Everything runs on your device.

Companion project: [Scriptlibrary](https://github.com/boulingua/scriptlibrary), which uses the same transformation engine for online books and downloadable PDFs.

## Install

Open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select this repository's `extension/` directory. Alternatively unpack `dist/scriptbridge-0.1.0.zip` and select the extracted directory. This is a sideloadable extension, not a Chrome Web Store listing.

## Read

Open a normal web page, click the extension, confirm its source language, choose a practice alphabet and percentage, and click **Apply to this page**. Introduce letters gradually with the letter-set selector. Hold **Alt** on the page to peek at the original; release to continue. **Show original** restores the current page. **Always practise on this site** opts that site into future visits; unticking it removes that permission and restores the page.

The percentage samples **eligible letters**, not every letter. At 100%, every eligible letter changes; unsupported or ambiguous letters remain. Sampling is deterministic, so adjusting density does not reshuffle the whole page. The small Nordic set changes fewer letters than Cyrillic or Greek.

## Scope and limitations

These are conservative spelling-context heuristics, not a pronunciation dictionary or a claim that allophones are identical. English vowels are generally excluded; the Nordic set includes only a small /æ/ word list. French silent endings, common digraphs, and German umlaut-to-Cyrillic approximations are excluded. See [MAPPINGS.md](MAPPINGS.md).

Only text nodes change. Forms, editable regions, IME composition, code, SVG/math, attributes and page titles are protected. `data-no-scriptbridge`, `translate="no"`, and `.azbuka-skip` opt a region out. Explicitly marked other languages remain original. Dynamic text is processed in small batches; site changes become the new original. No shadow roots, frames, browser-internal pages, Chrome Web Store pages, or built-in PDF viewer are processed. Text copied while practice is on contains the substituted letters; peek or restore before copying. Screen readers may pronounce mixed scripts poorly: use the original text.

## Privacy

The extension makes no network requests and has no telemetry, remote code, CDN assets, or external fonts. Settings and optional site preferences are stored in `chrome.storage.local`, not sync storage. `activeTab` and `scripting` allow application after a click; optional host access is requested separately for each site. There is no initial all-sites grant. Reading history and page text are not stored.

## Develop

Node 22 or newer, Python 3 for packaging. Run `npm ci`, `npm test`, and `npm run package`. Run `npm run test:browser` for the Chromium integration test. It creates an isolated profile and a temporary extension copy with only its localhost fixture pre-granted; permission-consent UI is not automated. Runtime code has no dependencies; jsdom and Playwright are development-only. The Manifest V3 runtime lives entirely under `extension/`.

The library consumes the same `extension/engine.js`, with an explicit version and SHA-256 lock. Changes to mappings must update tests, then be deliberately synced into the library and its editions rebuilt. Never maintain a separate PDF mapping table.

The supplied Azbuka prototype informed staged introduction, original-text peeking, pristine-source transforms and DOM tests. Its German multi-letter transliteration mode is not enabled here: this project implements sound-oriented **single-letter** practice across four target sets. No byte-parity claim is made for that separate R engine.

Code: MIT. See [LICENSE](LICENSE).

## Clone and verify

```sh
git clone https://github.com/boulingua/scriptbridge.git
cd scriptbridge
npm ci
npm test
npx playwright install chromium
CHROMIUM="$(node -p 'require("@playwright/test").chromium.executablePath()')" npm run test:browser
npm run package
```

The browser test otherwise defaults to `/usr/bin/chromium`. On Linux, Playwright may require system libraries; `npx playwright install --with-deps chromium` installs them. The GitHub Actions workflow runs unit/DOM tests, the Chromium integration test and ZIP packaging on pushes and pull requests. Its downloadable workflow artifact contains the extension ZIP; this does not publish to the Chrome Web Store.

## Controls and troubleshooting

| Control | Meaning |
|---|---|
| Source language | Choose the language of the original page; spelling rules depend on it. |
| Practice alphabet | Greek, Russian Cyrillic, Ukrainian or selected Nordic letters. |
| Letter set | Three cumulative stages introduce more letters; Nordic uses its small fixed set. |
| Percentage | 0–100% of eligible letters, with stable sampling. |
| Apply to this page | Apply settings to the current supported page. |
| Show original / hold Alt | Restore the page / temporarily reveal original text. |
| Always practise on this site | Request optional site access and apply automatically on future visits. |

If nothing changes, check the source language, increase the percentage, and try ordinary prose on an HTTP(S) page. A page may contain few eligible letters, especially with Nordic selected. Reload the extension from `chrome://extensions` after updating its files, then reload the page. Protected browser pages and embedded frames are unsupported. If automatic practice stops, check the extension's site access in Chrome. Disabling automatic practice stops its registered script; if Chrome cannot revoke access, remove the site's permission in the extension settings.

To uninstall, remove Scriptbridge in `chrome://extensions` and reload previously modified tabs. Restoring originals before copying or searching text avoids mixed-script clipboard and search results.

## Project map and maintenance

| Path | Responsibility |
|---|---|
| `extension/engine.js` | Shared deterministic single-letter rules and sampling. |
| `extension/content.js` | DOM traversal, dynamic updates, original restoration and Alt peek. |
| `extension/popup.*` | Controls, saved settings and optional site access. |
| `extension/manifest.json` | Manifest V3 permissions and runtime entry point. |
| `tests/` | Engine, DOM and isolated Chromium checks. |
| `scripts/package.py`, `dist/` | Runtime-only ZIP packaging and installable output. |

Before changing rules, read [MAPPINGS.md](MAPPINGS.md). Add meaningful pronunciation-context regression cases and retain original restoration, protected fields and site-update behavior. After engine changes, explicitly sync and rebuild the companion library; after packaging, refresh its ZIP and digest lock. Both copies must agree before publication.

[CURRENT_STATE.md](CURRENT_STATE.md) records the implementation checkpoint; [HANDOVER.md](HANDOVER.md) describes continuation commands and constraints; [VALIDATION.json](VALIDATION.json) records the initial local validation evidence. Native Chrome permission prompts and everyday use remain manual checks. Phonetic similarity is approximate, and no learning-effectiveness claim is made.
