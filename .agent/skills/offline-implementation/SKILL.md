---
name: offline-implementation
description: Use this skill when the user asks to "develop features", "fix bugs", "implement new UI", or "refactor code" in the OffLine repository. It provides the technical stack, coding rules, and design patterns.
---

# OffLine Implementation Standards

This skill defines the development guidelines for the OffLine project.

## Tech Stack

-   **Framework**: React 18 + TypeScript + Vite
-   **Styling**: Native CSS Modules `[name].css` with CSS Variables `var(--color-primary)`
-   **State Management**: React Hooks (`useState`, `useMemo`, `useCallback`, `useTransition`)
-   **Virtualization**: `react-window` (Required for lists > 50 items)

## Core Coding Rules

### 1. Memory Management (Critical)
-   **Avoid `string.split` on large content**: Never use `split('\n')` on the entire file string. It causes immediate OOM on large files.
-   **Use Iterative Parsing**: Use `indexOf` loops to scan for delimiters line-by-line.
-   **Browser Compatibility**: Safely access `performance.memory` (Chrome only). Handle `undefined` for Safari/Firefox.

### 2. File Handling
-   **Size Parsing**: Always work with `File` objects directly.
-   **Warning Thresholds**: Check for files > 50MB and warn the user.

### 3. UI/UX Patterns
-   **Glassmorphism**: Use the `.glass` utility class or established CSS variables for transparency effects.
-   **Native Look**: Font stack should prioritize San Francisco (Apple) standards.
-   **Responsive**: Support dynamic sidebar resizing and mobile views.

## Implementation Workflow

1.  **Analyze**: Understand the feature scope.
2.  **Plan**: Check against "Privacy First" principles (No external calls).
3.  **Code**: Implement using TypeScript strict mode.
4.  **Document**: Update `CHANGELOG.md` and `README.md` (Refer to `offline-documentation`).
