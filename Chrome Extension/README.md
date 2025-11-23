# URL Redirector - Chrome Extension

A custom URL redirector extension with regex pattern matching support.

## Features

- Intercept page loads before they reach the server
- Apply regex pattern matching and substitution
- Automatically clean up browser history
- Live validation of regex patterns in the UI
- Test patterns with example URLs before saving

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `Chrome Extension` directory
5. The extension is now installed!

## Usage

1. Click the extension icon in the Chrome toolbar
2. Add a new redirect rule:
   - **Pattern**: Regex pattern to match URLs (e.g., `https://old-site\.com(.*)`)
   - **Replacement**: Replacement string with capture groups (e.g., `https://new-site.com$1`)
   - **Flags**: Regex flags (default: `gi`)
3. Test your pattern with a sample URL to see the result
4. Click "Add Rule" to save
5. Enable/disable rules using the checkbox
6. Delete rules you no longer need

## Examples

### Redirect domain while preserving path
- **Pattern**: `https://old-domain\.com(.*)`
- **Replacement**: `https://new-domain.com$1`
- **Result**: `https://old-domain.com/page` → `https://new-domain.com/page`

### Change subdomain
- **Pattern**: `https://www\.example\.com(.*)`
- **Replacement**: `https://app.example.com$1`

### Mirror slow/abandoned sites
- **Pattern**: `https://slow-site\.org(.*)`
- **Replacement**: `https://mirror.fast-cdn.com$1`

## Technical Details

- Uses `webNavigation.onBeforeNavigate` to intercept URLs before they load
- Automatically removes redirected URLs from browser history
- Prevents infinite redirect loops
- Stores rules in `chrome.storage.local`

## Shared Code

This Chrome extension shares the same JavaScript, HTML, and CSS files with the Safari version via symlinks, making it easy to maintain both versions simultaneously.
