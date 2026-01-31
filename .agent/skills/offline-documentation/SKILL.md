---
name: offline-documentation
description: Use this skill when the user asks to "update documentation", "write changelog", or "update readme". It defines the standard formats for CHANGELOG.md and README.md in the OffLine repository.
---

# OffLine Documentation Standards

This skill defines how to maintain project documentation.

## 1. CHANGELOG.md

We follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

### Rules
-   **Header**: Always use `## [Unreleased]` for new changes.
-   **Categories**: Group changes under:
    -   `### Added` for new features.
    -   `### Changed` for changes in existing functionality.
    -   `### Deprecated` for soon-to-be removed features.
    -   `### Removed` for now removed features.
    -   `### Fixed` for any bug fixes.
    -   `### Security` in case of vulnerabilities.
-   **Content**: Descriptions should be concise and user-focused.

### Example
```markdown
## [Unreleased]

### Added
- Auto-scroll to bottom when loading chat files.

### Fixed
- Memory parsing issue on Safari.
```

## 2. README.md

The README is the landing page for the project.

### Rules
-   **Features Section**: Must be kept up-to-date with new major capabilities.
-   **Tech Stack**: Update if new libraries are added.
-   **Consistency**: Ensure the "How to use" steps remain accurate.

## 3. Workflow
-   **Synchronous Update**: Documentation should be updated in the **same PR/Commit** as the code change.
-   **Verification**: Check rendered markdown for formatting errors.
