// Chrome compatibility shim
if (typeof browser === 'undefined') {
    globalThis.browser = chrome;
}

(async function() {
    // Get the current URL
    const currentUrl = window.location.href;

    // Flag to track if we've already redirected (stored in sessionStorage to persist across redirects)
    const redirectKey = 'redirector_checked_' + currentUrl;

    // Check if we've already processed this URL to prevent loops
    if (sessionStorage.getItem(redirectKey)) {
        return;
    }

    try {
        // Get rules from background script
        const response = await browser.runtime.sendMessage({ action: 'getRules' });
        const rules = response.rules || [];

        // Apply redirect rules
        for (const rule of rules) {
            if (!rule.enabled) continue;

            try {
                const regex = new RegExp(rule.pattern, rule.flags || 'gi');
                if (regex.test(currentUrl)) {
                    const newUrl = currentUrl.replace(regex, rule.replacement);

                    if (newUrl !== currentUrl) {
                        // Mark this URL as checked
                        sessionStorage.setItem(redirectKey, 'true');

                        console.log(`Redirecting: ${currentUrl} -> ${newUrl}`);

                        // Use replace to avoid adding to history
                        window.location.replace(newUrl);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error applying redirect rule:', rule, error);
            }
        }
    } catch (error) {
        console.error('Error getting redirect rules:', error);
    }
})();
