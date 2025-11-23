# Shared Extension Source Code

This directory contains the **canonical source code** for the URL Redirector extension.

## Files

- `background.js` - Background script that handles URL interception and redirection
- `popup.html` - Extension popup UI
- `popup.js` - Popup UI logic and rule management
- `popup.css` - Popup styling with dark mode support
- `content.js` - Content script (not currently used but available for future features)
- `images/` - Extension icons

## Usage

This code is shared between multiple browser extensions:

### Safari Extension
- Located in: `Safari Extension/Shared (Extension)/Resources/`
- Uses **symlinks** to reference these files
- Platform: Safari on macOS and iOS

### Chrome Extension
- Located in: `Chrome Extension/`
- Uses **symlinks** for shared code (popup.js, popup.css, images)
- Has platform-specific wrappers (background.js, content.js, popup.html) that include browser API compatibility shim
- Platform: Chrome, Edge, and other Chromium-based browsers

## Making Changes

**Always edit files in this directory** - changes will automatically propagate to all browser extensions via symlinks.

### Browser-Specific Code

If you need to add browser-specific functionality:
- **Safari**: Edit the Safari Extension files directly (they symlink here)
- **Chrome**: Edit the wrapper files in `Chrome Extension/` (they include the `browser` polyfill before importing shared code)

## API Compatibility

The code uses the standard WebExtensions API with the `browser` namespace:
- Safari: Natively supports `browser.*`
- Chrome: Uses a polyfill to alias `chrome.*` to `browser.*`
