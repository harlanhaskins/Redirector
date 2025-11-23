# Redirector

Browser extension for URL redirection with regex pattern matching.

Originally developed to redirect hrwiki.org to homestar.wiki.

## Structure

```
src/                    # Canonical source code
Safari Extension/       # Safari Xcode project (symlinks to src/)
Chrome Extension/       # Chrome extension (symlinks to src/)
```

**Edit files in `src/` only.** Changes propagate to both extensions via symlinks.

## Usage

Pattern: `https://old-site\.com(.*)`
Replacement: `https://new-site.com$1`

Use `$1`, `$2`, etc. for capture groups.
