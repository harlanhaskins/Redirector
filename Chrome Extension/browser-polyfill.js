// Browser API compatibility shim for Chrome
// This makes 'browser' available as an alias for 'chrome'
if (typeof browser === 'undefined') {
    globalThis.browser = chrome;
}
