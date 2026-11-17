# Dependency security maintenance — 2026-11-17

## Changes

- Next.js 16.4.1 → 16.4.6 (same minor, security patch).
- Zod 3.25.76 → 4.6.7; server actions use `ZodError.issues` instead of the removed `errors` alias. Regression tests exercise invalid login, mismatched signup passwords, and invite validation without backend calls.
- Refreshed affected transitive packages including source-map-js, PostCSS, Vite and TypeScript ESLint tooling.
- Updated serialize-javascript to 7.1.3 and constrained postcss-selector-parser to the patched 6.x release.
- Removed unused Mocha: repository tests use Node's built-in test runner, and no source/test/script imports Mocha. This removes its vulnerable glob/minimatch dependency chain without forcing incompatible transitive overrides.
- Updated both standalone Spline example lockfiles.

## Verification

- Root npm audit: 17 findings before, 0 after (including development dependencies).
- Both Spline example npm audits: 0 findings after updates.
- `npm test`: 31 passed, 0 failed.
- `npm run typecheck`: passed.
- ESLint on changed server actions and new regression test: passed.
- `git diff --check`: passed.
- Both standalone Spline example builds: passed (bundle-size warnings).
- Full repository lint: failed with 1,118 errors and 23 warnings, primarily existing vendored Draco wrapper JavaScript under the Spline assets. These files were not changed.
- Production webpack build: compilation and TypeScript passed; page-data collection failed for `/events/[eventSlug]` with `Public content is temporarily unavailable.` This environment has no public Supabase URL/anonymous key, required by `src/app/lib/public-content.ts`. A full build with the intended content backend and browser smoke tests remains necessary before production release. No production backend writes were made.

## Release boundary

Changes are pushed on a security-fix branch, not merged or deployed to production. Audit results describe the checked lockfiles at verification time; they are not a guarantee of application security or proof that deployed production dependencies have changed.
