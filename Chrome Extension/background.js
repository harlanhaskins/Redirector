// Chrome compatibility shim
if (typeof browser === 'undefined') {
    globalThis.browser = chrome;
}

// Store for redirect rules
let redirectRules = [];

// Load redirect rules from storage
async function loadRules() {
    try {
        const result = await browser.storage.local.get('redirectRules');
        redirectRules = result.redirectRules || [];
        console.log('Loaded redirect rules:', redirectRules);
    } catch (error) {
        console.error('Error loading rules:', error);
        redirectRules = [];
    }
}

// Apply regex substitution to URL
function applyRedirectRules(url) {
    for (const rule of redirectRules) {
        if (!rule.enabled) continue;

        try {
            const regex = new RegExp(rule.pattern, rule.flags || 'gi');
            if (regex.test(url)) {
                const newUrl = url.replace(regex, rule.replacement);
                if (newUrl !== url) {
                    console.log(`Redirecting: ${url} -> ${newUrl}`);
                    return newUrl;
                }
            }
        } catch (error) {
            console.error('Error applying rule:', rule, error);
        }
    }
    return null;
}

// Track redirected URLs to prevent infinite loops
const redirectedUrls = new Set();

// Track URLs we need to remove from history
const urlsToRemoveFromHistory = new Map(); // Map of tabId -> original URL

// Clean up old entries periodically
setInterval(() => {
    redirectedUrls.clear();
    urlsToRemoveFromHistory.clear();
}, 30000); // Clear every 30 seconds

// Listen for navigation events
browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only handle main frame navigations
    if (details.frameId !== 0) return;

    const url = details.url;

    // Skip if we already redirected this URL recently
    if (redirectedUrls.has(url)) {
        redirectedUrls.delete(url);
        return;
    }

    // Apply redirect rules
    const newUrl = applyRedirectRules(url);

    if (newUrl && newUrl !== url) {
        // Mark as redirected to prevent loops
        redirectedUrls.add(newUrl);

        // Track this URL for history removal
        urlsToRemoveFromHistory.set(details.tabId, url);

        // Perform the redirect
        try {
            await browser.tabs.update(details.tabId, { url: newUrl });
        } catch (error) {
            console.error('Error redirecting:', error);
        }
    }
});

// Listen for when navigation completes to clean up history
browser.webNavigation.onCompleted.addListener(async (details) => {
    // Only handle main frame navigations
    if (details.frameId !== 0) return;

    // Check if this tab had a redirect
    const originalUrl = urlsToRemoveFromHistory.get(details.tabId);
    if (originalUrl) {
        // Remove from tracking
        urlsToRemoveFromHistory.delete(details.tabId);

        // Remove the original URL from browser history
        try {
            await browser.history.deleteUrl({ url: originalUrl });
            console.log(`Removed from history: ${originalUrl}`);
        } catch (error) {
            console.error('Error removing URL from history:', error);
        }
    }
});

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request:", request);

    if (request.action === 'getRules') {
        sendResponse({ rules: redirectRules });
        return true;
    }

    if (request.action === 'saveRules') {
        redirectRules = request.rules;
        browser.storage.local.set({ redirectRules: redirectRules })
            .then(() => {
                console.log('Rules saved:', redirectRules);
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error saving rules:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    return false;
});

// Initialize
loadRules();
