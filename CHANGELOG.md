# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-01-31

### Added
- **File Size & Memory Protection**: Added a real file size check. Files larger than 50MB now trigger a warning modal before processing to prevent browser crashes.
- **Accurate Memory Status**: Added a memory usage monitor in the footer (visible after clicking the version number 10 times) for Chrome/Edge/Opera users.
- **Auto-Scroll to Bottom**: The chat view now automatically scrolls to the newest message upon loading a file, improving the initial user experience.

### Changed
- **Optimized Parsing Logic**: Refactored `lineParser.ts` to use iterative scanning instead of `split()`, significantly reducing peak memory consumption during file parsing.
- **Landing Page UX**: Now displays the actual file size and units alongside memory estimation.
- **Memory Display**: Standardized memory usage display to consistently show "MB" units.

### Fixed
- Fixed the issue where "is large file" detection was inaccurate.
- Fixed the issue where initial scroll position was at the top (oldest message).
