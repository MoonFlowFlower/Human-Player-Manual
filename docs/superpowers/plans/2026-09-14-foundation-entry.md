# Foundation entry implementation plan

Goal: replace the bread-first entrance with six learning directions, seven usable adult foundation chapters and a complete recall exercise, retaining the current TypeScript/CSS/SVG application and old URLs.

The user supplied and authorized the product specification in the implementation request. Changes are confined to the feature branch; main is not merged or rewritten.

- [x] Add regression tests for the actual new entry, everyday search aliases, shared content references, independent legacy exercises and isolated learning storage. Run them against the existing implementation and retain the failing output.
- [x] Add typed chapter/direction data and verified source scopes; separate recommended reading from genuine prerequisites and world relationships. Keep existing concepts as references, not duplicate articles.
- [x] Implement homepage, direction overview and chapter views with route-context next/skip behavior, explicit read status, optional sleep notes, and a validated second local-storage namespace that never maps old completions into new lessons.
- [x] Implement recall: read example, hide, recall, self-compare, transfer question, specific retry feedback, completed attempt and review-later state. Resume actual exercise state, not a completion shortcut.
- [x] Integrate navigation/search/atlas/old exercises; remove old manifestos and misleading locks or completion claims. Preserve graph controls and old deep links.
- [x] Run typecheck, lint, tests and production build. Exercise desktop/mobile routes, keyboard search, feedback/retry, back/next, storage failure, genuine reload where navigation is available, reduced motion and graph controls. Inspect screenshots.
- [ ] Refresh documentation with observed results and limitations. Commit verified changes to the existing remote branch, open a PR and independently inspect remote files, CI and main deployment status.

Verification uses Node's existing test runner and Playwright/Chromium; no application runtime dependencies are added. Browser snapshots are evidence of rendering, not evidence of human learning. Research lookup is not professional clinical review.
