let rules = [];

// Load rules from background script
async function loadRules() {
    try {
        const response = await browser.runtime.sendMessage({ action: 'getRules' });
        rules = response.rules || [];
        renderRules();
    } catch (error) {
        console.error('Error loading rules:', error);
    }
}

// Save rules to background script
async function saveRules() {
    try {
        const response = await browser.runtime.sendMessage({
            action: 'saveRules',
            rules: rules
        });
        if (response.success) {
            console.log('Rules saved successfully');
        }
    } catch (error) {
        console.error('Error saving rules:', error);
    }
}

// Render the rules list
function renderRules() {
    const rulesList = document.getElementById('rulesList');
    const noRules = document.getElementById('noRules');

    if (rules.length === 0) {
        rulesList.classList.remove('has-rules');
        noRules.classList.remove('hidden');
        return;
    }

    noRules.classList.add('hidden');
    rulesList.classList.add('has-rules');
    rulesList.innerHTML = '';

    rules.forEach((rule, index) => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-item';

        ruleItem.innerHTML = `
            <div class="rule-header">
                <div class="rule-toggle">
                    <input type="checkbox" id="rule-${index}" ${rule.enabled ? 'checked' : ''}>
                    <label for="rule-${index}">Rule ${index + 1}</label>
                </div>
                <div class="rule-actions">
                    <button class="delete" data-index="${index}">Delete</button>
                </div>
            </div>
            <div class="rule-details">
                <div><strong>Pattern:</strong> ${escapeHtml(rule.pattern)}</div>
                <div><strong>Replacement:</strong> ${escapeHtml(rule.replacement)}</div>
                <div><strong>Flags:</strong> ${escapeHtml(rule.flags || 'gi')}</div>
            </div>
        `;

        rulesList.appendChild(ruleItem);

        // Add event listener for toggle
        const checkbox = ruleItem.querySelector(`#rule-${index}`);
        checkbox.addEventListener('change', (e) => {
            rules[index].enabled = e.target.checked;
            saveRules();
        });

        // Add event listener for delete
        const deleteBtn = ruleItem.querySelector('.delete');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this rule?')) {
                rules.splice(index, 1);
                saveRules();
                renderRules();
            }
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add new rule
function addRule() {
    const pattern = document.getElementById('newPattern').value.trim();
    const replacement = document.getElementById('newReplacement').value.trim();
    const flags = document.getElementById('newFlags').value.trim();

    if (!pattern) {
        alert('Please enter a pattern');
        return;
    }

    if (!replacement) {
        alert('Please enter a replacement');
        return;
    }

    // Validate regex
    try {
        new RegExp(pattern, flags || 'gi');
    } catch (error) {
        alert('Invalid regex pattern: ' + error.message);
        return;
    }

    rules.push({
        pattern: pattern,
        replacement: replacement,
        flags: flags || 'gi',
        enabled: true
    });

    saveRules();
    renderRules();

    // Clear form
    document.getElementById('newPattern').value = '';
    document.getElementById('newReplacement').value = '';
    document.getElementById('newFlags').value = 'gi';
    document.getElementById('testUrl').value = '';

    // Clear validation states
    document.getElementById('newPattern').classList.remove('valid', 'invalid');
    document.getElementById('newFlags').classList.remove('valid', 'invalid');
    document.getElementById('patternError').classList.remove('show');
    document.getElementById('patternSuccess').classList.remove('show');
    document.getElementById('flagsError').classList.remove('show');
    document.getElementById('testResult').classList.remove('show');
}

// Validate regex pattern and flags
function validatePattern() {
    const pattern = document.getElementById('newPattern').value.trim();
    const flags = document.getElementById('newFlags').value.trim();
    const patternInput = document.getElementById('newPattern');
    const patternError = document.getElementById('patternError');
    const patternSuccess = document.getElementById('patternSuccess');

    if (!pattern) {
        patternInput.classList.remove('valid', 'invalid');
        patternError.classList.remove('show');
        patternSuccess.classList.remove('show');
        return null;
    }

    try {
        const regex = new RegExp(pattern, flags || 'gi');
        patternInput.classList.remove('invalid');
        patternInput.classList.add('valid');
        patternError.classList.remove('show');

        // Show capture groups info if present
        const captureGroups = pattern.match(/\([^)]+\)/g);
        if (captureGroups) {
            patternSuccess.textContent = `✓ Valid regex with ${captureGroups.length} capture group(s)`;
        } else {
            patternSuccess.textContent = '✓ Valid regex';
        }
        patternSuccess.classList.add('show');

        return regex;
    } catch (error) {
        patternInput.classList.remove('valid');
        patternInput.classList.add('invalid');
        patternError.textContent = `✗ ${error.message}`;
        patternError.classList.add('show');
        patternSuccess.classList.remove('show');
        return null;
    }
}

// Validate flags
function validateFlags() {
    const flags = document.getElementById('newFlags').value.trim();
    const flagsInput = document.getElementById('newFlags');
    const flagsError = document.getElementById('flagsError');

    if (!flags) {
        flagsInput.classList.remove('valid', 'invalid');
        flagsError.classList.remove('show');
        return true;
    }

    // Check for valid regex flags
    const validFlags = /^[gimsuy]*$/;
    if (validFlags.test(flags)) {
        flagsInput.classList.remove('invalid');
        flagsInput.classList.add('valid');
        flagsError.classList.remove('show');
        return true;
    } else {
        flagsInput.classList.remove('valid');
        flagsInput.classList.add('invalid');
        flagsError.textContent = '✗ Invalid flags. Valid: g, i, m, s, u, y';
        flagsError.classList.add('show');
        return false;
    }
}

// Test the regex replacement on a test URL
function testReplacement() {
    const pattern = document.getElementById('newPattern').value.trim();
    const replacement = document.getElementById('newReplacement').value.trim();
    const flags = document.getElementById('newFlags').value.trim();
    const testUrl = document.getElementById('testUrl').value.trim();
    const testResult = document.getElementById('testResult');

    if (!testUrl || !pattern) {
        testResult.classList.remove('show');
        return;
    }

    try {
        const regex = new RegExp(pattern, flags || 'gi');

        if (regex.test(testUrl)) {
            // Reset regex lastIndex for reuse
            regex.lastIndex = 0;
            const newUrl = testUrl.replace(regex, replacement);

            if (newUrl !== testUrl) {
                testResult.className = 'test-result show match';
                testResult.innerHTML = `<strong>✓ Match found!</strong><br>Result: <code>${escapeHtml(newUrl)}</code>`;
            } else {
                testResult.className = 'test-result show match';
                testResult.innerHTML = '<strong>✓ Pattern matches but no changes</strong>';
            }
        } else {
            testResult.className = 'test-result show no-match';
            testResult.textContent = '⚠ Pattern does not match this URL';
        }
    } catch (error) {
        testResult.classList.remove('show');
    }
}

// Combined validation and test
function validateAndTest() {
    validatePattern();
    validateFlags();
    testReplacement();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRules();

    // Add rule button
    document.getElementById('addRuleBtn').addEventListener('click', addRule);

    // Live validation
    document.getElementById('newPattern').addEventListener('input', validateAndTest);
    document.getElementById('newReplacement').addEventListener('input', validateAndTest);
    document.getElementById('newFlags').addEventListener('input', validateAndTest);
    document.getElementById('testUrl').addEventListener('input', testReplacement);

    // Allow Enter key to add rule
    document.getElementById('newPattern').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRule();
    });
    document.getElementById('newReplacement').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRule();
    });
    document.getElementById('newFlags').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRule();
    });
    document.getElementById('testUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRule();
    });
});
