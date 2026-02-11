# Aivorys Search Extensions

Privacy-first browser extensions and PWA for [Aivorys Search](https://search.aivorysdev.com) -- a private, ethical search engine powered by SearXNG. No tracking, no logs, no profiling.

## Supported Platforms

**Desktop Browsers:**
- Google Chrome (Manifest V3)
- Mozilla Firefox (Manifest V2)
- Brave Browser (uses Chrome extension)
- Microsoft Edge (uses Chrome extension)

**Mobile:**
- Firefox for Android (Manifest V2)
- Progressive Web App (all mobile browsers)

**Languages:** English, Spanish (Latin America), Portuguese (Brazil)

## Project Structure

```
Aivorys-search-extensions/
├── extensions/
│   ├── chrome/          # Chrome, Brave, Edge (Manifest V3)
│   ├── firefox/         # Firefox Desktop (Manifest V2)
│   └── firefox-android/ # Firefox for Android (Manifest V2)
├── shared/              # Shared modules (API client, settings, i18n, theme)
├── pwa/                 # Progressive Web App
├── scripts/             # Build and packaging scripts
├── dist/                # Build output (git-ignored)
└── package.json
```

## Quick Start

### Development - Load Unpacked Extension

**Chrome / Brave / Edge:**
1. Open `chrome://extensions/` (or `brave://extensions/` / `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extensions/chrome/` directory

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `extensions/firefox/manifest.json`

**Firefox Android:**
1. Follow [Mozilla's instructions for testing on Android](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/)
2. Load from `extensions/firefox-android/`

### PWA
Serve the `pwa/` directory from any web server, or deploy to `search.aivorysdev.com`:
```bash
cd pwa && python3 -m http.server 8080
```

## Building for Production

### Prerequisites
- `zip` command available
- PNG icons in each `extensions/*/icons/` directory (see Icons section)

### Package All Extensions
```bash
./scripts/package-all.sh
```

Output in `dist/`:
- `aivorys-search-chrome-v1.0.0.zip` -- Chrome Web Store
- `aivorys-search-brave-v1.0.0.zip` -- Brave (same as Chrome)
- `aivorys-search-edge-v1.0.0.zip` -- Edge Add-ons (same as Chrome)
- `aivorys-search-firefox-v1.0.0.xpi` -- Firefox Add-ons (AMO)
- `aivorys-search-firefox-android-v1.0.0.xpi` -- Firefox Android
- `aivorys-search-pwa-v1.0.0.zip` -- PWA deployment

## Icons

The extensions require PNG icons at these sizes: 16x16, 32x32, 48x48, 128x128.
The PWA additionally needs 192x192 and 512x512.

SVG source files are in `extensions/chrome/icons/`. Convert to PNG using:
```bash
./scripts/generate-icons.sh
```

Or manually create PNG icons and place them in each `extensions/*/icons/` and `pwa/icons/` directory.

## Configuration

Users can configure via the extension options page:

| Setting | Default | Description |
|---------|---------|-------------|
| Backend URL | `https://search.aivorysdev.com` | SearXNG instance URL |
| Language | English | Search language (en, es, pt-BR) |
| Safe Search | Moderate | Off, Moderate, or Strict |
| Theme | System | Light, Dark, or System auto-detect |
| Open in new tab | Off | Redirect searches to full SearXNG page |
| Default category | General | general, images, videos, news, etc. |

### Self-Hosting

If you run your own SearXNG instance, change the Backend URL in settings to point to it. The extension works with any standard SearXNG deployment.

## Features

- **Default search engine** -- Sets Aivorys as your browser's default search provider
- **Omnibox integration** -- Type `ai <query>` in the address bar for quick searches
- **Autocomplete** -- Search suggestions as you type
- **In-popup results** -- View results directly in the extension popup
- **Tracking parameter removal** -- Strips UTM, fbclid, gclid, and other tracking params from links
- **Keyboard shortcut** -- Press `/` on search.aivorysdev.com to focus the search box
- **Dark mode** -- Automatic or manual light/dark theme
- **Internationalized** -- Full UI translation for English, Spanish, and Portuguese
- **Zero telemetry** -- The extension itself collects no data whatsoever

## Store Submission

### Chrome Web Store
1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Upload `dist/aivorys-search-chrome-v1.0.0.zip`
3. Fill in listing details, screenshots, and privacy policy

### Firefox Add-ons (AMO)
1. Create an account at [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Upload `dist/aivorys-search-firefox-v1.0.0.xpi`
3. For Android support, also upload `dist/aivorys-search-firefox-android-v1.0.0.xpi`

### Microsoft Edge Add-ons
1. Register at [Edge Add-ons Developer Dashboard](https://partner.microsoft.com/dashboard/microsoftedge/)
2. Upload `dist/aivorys-search-edge-v1.0.0.zip`

## Privacy

This project follows Aivorys LLC's privacy-first philosophy:

- **No analytics or telemetry** in the extension code
- **No search history** stored on servers
- **No user profiling** -- searches are not linked to identities
- **Tracking parameter stripping** -- removes tracking params from clicked links
- **Open source** -- full code available for audit

## License

MIT License - Copyright (c) 2025 David Arrants / Aivorys LLC

See [LICENSE](LICENSE) for details.
