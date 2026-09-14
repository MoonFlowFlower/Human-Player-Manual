# QA outputs

Run `browser_check.py --base-url URL` against a production `dist/` server for full HTTP/reload/storage checks, or `--offline` for policy-compatible rendering of the built offline artifact. `interaction_regressions.py` retains targeted SVG/focus/price-context regressions on that same built artifact.

Current generated reports and screenshots go to `qa/results/` (ignored by Git). The PR Verify artifact contains those results and the offline production page. The red/green/final text files at this directory's root are retained **first-edition history**, not the current run's evidence. See `docs/qa-report.md` for precise verification boundaries.
