---
name: offline-verification
description: Use this skill when the user asks to "review code", "verify changes", "test performance", "check security", or "submit a PR" in the OffLine repository. It provides the checklist for privacy, performance, and code quality.
---

# OffLine Verification Standards

This skill defines the review and testing criteria for the OffLine project.

## Verification Checklist

### 1. Privacy & Security (Zero-Tolerance)
-   [ ] **No External Requests**: Verify Network tab shows NO calls to external servers during file load/search.
-   [ ] **Local Processing**: Confirm all logic runs in the browser.
-   [ ] **Analytics Free**: Ensure no tracking scripts are introduced.

### 2. Performance & Stability
-   [ ] **Large File Test**: Load a chat log > 300MB.
    -   *Success Criteria*: App does not crash.
-   [ ] **Memory Warning**: detailed memory usage is displayed (Chrome) or N/A (Safari).
-   [ ] **Scrolling**: Verify list virtualization works smoothly with > 100,000 messages.

### 3. User Experience
-   [ ] **Auto-Scroll**: Confirm chat jumps to bottom (newest) on load.
-   [ ] **Safari Compatibility**: Verify UI does not break on Safari (memory API graceful degradation).

### 4. Code Quality
-   [ ] **Type Safety**: No `any` or `@ts-ignore` without documented justification.
-   [ ] **Clean Code**: No `console.log` debugging left in production code.
-   [ ] **Linter**: Ensure no ESLint warnings.

### 5. Documentation
-   [ ] **Changelog**: Confirm `CHANGELOG.md` contains an entry for this change.
-   [ ] **Readme**: Confirm `README.md` is updated if new features were added.

## Review Process

1.  **Self-Check**: Run through the checklist above.
2.  **Simulate Constraints**: Test in "Offline" mode (Airplane mode) to prove offline capability.
