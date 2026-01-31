---
name: offline-devops
description: Use this skill when the user asks about "deployment", "CI/CD", "workflows", "github actions", or "release process". It defines the DevOps standards for OffLine.
---

# OffLine DevOps Standards

This skill defines the CI/CD and deployment best practices.

## 1. Branching Strategy

- **`main`**: The production branch. Always deployable. Protected from direct pushes.
- **`feature/*`**: Development branches. Must pass CI before merging to main.
- **`chore/*` `fix/*`**: Ad-hoc branches for maintenance.

## 2. CI/CD Pipeline (GitHub Actions)

We follow a "Verify then Deploy" model.

### Continuous Integration (CI)
**Trigger**: Pull Request to `main`
**Jobs**:
1.  **Checking**: `npm run lint` (ESLint) & `npm run type-check` (TSC)
2.  **Testing**: `npm run test` (Vitest)
3.  **Building**: `npm run build` (Validate buildability)

### Continuous Deployment (CD)
**Trigger**: Push Tag `v*` (Release)
**Jobs**:
1.  **Build**: Create production artifacts.
2.  **Deploy**: Push `dist/` to GitHub Pages.

## 3. Versioning & Release
- **Semantic Versioning**: Follow `MAJOR.MINOR.PATCH`.
- **Manual Bump**: Currently manually updated in `package.json` before merge.
## 4. Workflow Optimization (Open Source Best Practices)
- **Concurrency Groups**: configured to cancel in-progress runs to save resources and get faster feedback.
- **Draft PRs**: CI should ideally skip "Draft" PRs to reduce noise.
- **Fork Safety**: CI workflows must be safe for fork PRs (no access to secrets).
