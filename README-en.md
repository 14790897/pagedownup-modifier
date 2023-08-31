# Custom Page Scroll Chrome Extension

## Overview

The Custom Page Scroll extension allows users to scroll specific elements on a webpage using keyboard shortcuts. It's a handy tool that enhances your browsing experience by giving you more control over how you navigate web content.

## Features

- Customizable scroll distance for Page Up and Page Down.
- Automatically detects the scrollable element on the page.
- Easy-to-use popup interface for settings.
- Works on all websites.

## Installation

1. Search pagedownup-modifier in https://chrome.google.com/webstore/
2. Install

> **Note**: After installation, you'll need to refresh all open tabs or restart the browser for the extension to work properly.

## Usage

1. Use the keyboard shortcuts to scroll up or down:

   - Scroll Down: `Alt+PageDown`
   - Scroll Up: `Alt+PageUp`

2. To customize the scroll distance, click on the extension icon to open the popup interface. You can set the distance for both Page Up and Page Down.

## Technical Details

The extension is built using:

- Vue 3
- TypeScript
- Tailwind CSS
- Chrome APIs

## Contributing

Feel free to open issues and pull requests!

## License

MIT

## For Developers

### Folders

- `src` - main source.
  - `content-script` - scripts and components to be injected as `content_script`
    - `iframe` content script iframe vue3 app which will be injected into page
  - `background` - scripts for background.
  - `popup` - popup vuejs application root
    - `pages` - popup pages
  - `options` - options vuejs application root
    - `pages` - options pages
  - `pages` - application pages, common to all views (About, Contact, Authentication etc)
  - `components` - auto-imported Vue components that are shared in popup and options page.
  - `assets` - assets used in Vue components
- `dist` - built files, also serve stub entry for Vite on development.

### Development

```bash
pnpm dev
```

Then **load extension in browser with the `dist/` folder**.

### Build

To build the extension, run

```bash
pnpm build
```

And then pack files under `dist`, you can upload `dist.crx` or `dist.xpi` to appropriate extension store.