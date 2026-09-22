# Scriptbridge

A Boulingua Chrome extension for becoming familiar with other alphabets while reading English, French or German. Choose Modern Greek, Russian Cyrillic, Ukrainian, or a small Nordic letter set, then adjust the percentage of eligible letters to replace. Everything runs on your device.

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
