<p align="center">
  <img src="dork.png" alt="Dorker Logo" width="128" height="128" />
</p>

<h1 align="center">Dorker</h1>

<p align="center">
  <strong>Google Dork Assistant — for everyone, even the forgetful :)</strong>
</p>

<p align="center">
  <a href="https://github.com/garethcheyne/Dorker/releases"><img src="https://img.shields.io/github/v/release/garethcheyne/Dorker?style=flat-square&color=818cf8" alt="Release" /></a>
  <a href="https://github.com/garethcheyne/Dorker/blob/main/LICENSE"><img src="https://img.shields.io/github/license/garethcheyne/Dorker?style=flat-square&color=818cf8" alt="License" /></a>
  <a href="https://github.com/garethcheyne/Dorker"><img src="https://img.shields.io/github/stars/garethcheyne/Dorker?style=flat-square&color=818cf8" alt="Stars" /></a>
</p>

---

## What is Dorker?

**Dorker** is a Chromium browser extension that puts every Google search operator and dork template at your fingertips. Open the side panel on any Google search page and instantly access autocomplete for dork operators, pre-built templates for common recon queries, and a searchable reference — all without leaving your tab.

No more Googling "how to Google".

## Features

- **Side Panel UI** — lives alongside your search, never gets in the way
- **31 Operators** — every Google dork operator with descriptions, examples, and one-click insert
- **14 Templates** — pre-built dork queries for login pages, exposed files, config leaks, admin panels, and more
- **Autocomplete** — type `/` in Google's search box to get instant operator suggestions
- **Template mode** — press `Tab` to browse and insert full dork templates
- **Category filtering** — filter operators by Domain, URL, Content, File, Time, Meta, and Logic
- **Search** — fuzzy search across all operators and templates
- **Dark theme** — polished dark UI built with shadcn/ui components and Radix primitives
- **Zero permissions abuse** — only requests `sidePanel` and `activeTab`

## Installation

### From source

```bash
git clone https://github.com/garethcheyne/Dorker.git
cd Dorker
npm install
npm run build
```

1. Open `chrome://extensions` (or your Chromium browser equivalent)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### Usage

1. Navigate to any Google search page
2. Click the Dorker icon in your toolbar to open the side panel
3. Browse operators and templates, or use the search bar
4. Click any operator to insert it directly into the Google search box
5. Type `/` in the search box for autocomplete, `Tab` for templates

## Tech Stack

| Layer | Tech |
|-------|------|
| UI Framework | React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Build | Vite 8 + CRXJS |
| Language | TypeScript 6 |
| Extension API | Chrome Manifest V3 |

## Project Structure

```
├── manifest.json            # Chrome extension manifest (MV3)
├── dork.png                 # Extension icon / logo
├── src/
│   ├── background/          # Service worker (side panel lifecycle)
│   ├── content/             # Content script (autocomplete dropdown on Google)
│   ├── shared/              # Shared types, dork data, categories
│   └── sidepanel/           # React side panel app
│       ├── App.tsx           # Main application
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   ├── AboutDialog.tsx
│       │   ├── CategoryBadge.tsx
│       │   └── ui/           # shadcn/ui components
│       ├── hooks/
│       └── lib/
```

## Dork Reference

All operators and templates are sourced from and inspired by [sundowndev's Google Dorking cheat sheet](https://gist.github.com/sundowndev/283efaddbcf896ab405488330d1bbc06) — an incredible community resource with 2,500+ stars. Go give it a star!

## Credits

- **Built with** [Claude Opus](https://www.anthropic.com/claude) — wrangled by [Gareth Cheyne](https://www.err403.com)
- **Dork reference** — [sundowndev/GoogleDorking.md](https://gist.github.com/sundowndev/283efaddbcf896ab405488330d1bbc06)
- **UI components** — [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- **Icons** — [Lucide](https://lucide.dev)

## License

Open source under the [MIT License](LICENSE).

---

<p align="center">
  Made with ♥ by <a href="https://www.err403.com">Gareth Cheyne</a>
</p>
