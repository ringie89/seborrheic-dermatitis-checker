# Quality checks — Seborrheic Dermatitis Product Checker

Updated: 2026-11-01. The scope is limited to potential **Malassezia** or **seborrheic dermatitis** relevance. General allergy and skin-irritation warnings are deliberately omitted.

## Executed checks

| Suite | Result | Meaning |
|---|---|---|
| `app.test.js` | Passed | App state, changed-input invalidation, copy behavior, re-analysis, and mode-note wording. |
| `rules.test.js` | 98 assertions passed | Includes negative controls for fragrance, alcohol, allergens, preservatives, and detergent irritancy. |
| `benchmark.test.js` | 58 cases passed | 50 individually selected names, 6 real manufacturer-listed full formulas, and 2 parsing tests. |
| `quality/sezia_examples.test.js` | 123/123 passed | Unique examples copied from Sezia's *published category pages*; **not** actual Sezia live responses. |
| `quality/real100.test.mjs` | Passed | Offline CLI checks with 100 explicitly synthetic CSV rows; source/formula hash validation, stale template preservation, and malformed annotation rejection. |
| `quality/scenarios.test.js` | 100 synthetic full lists / 1,785 assertions | Reproducible rule regression test; no clinical ground truth. |
| Desktop/mobile Chromium | Historical reported pass; not rerun in this update | Form input, scores, scope exclusion, mode switching, mobile width. |
| Live Sezia head-to-head | Not done (0/100) | Needs actual interactive observations to measure agreement. |
| 100 real archived commercial formulas | Runner provided, not executed here | `quality/real100.mjs` requires external catalog download or offline CSV. |

## How to run tests

```bash
node app.test.js
node rules.test.js
node benchmark.test.js
node quality/sezia_examples.test.js
node quality/scenarios.test.js
node quality/real100.test.mjs
```

### Reproducible commercial-formula checker

```bash
node quality/real100.mjs   # internet required
# or
node quality/real100.mjs --input Prod1.csv
# optionally isolate generated files
node quality/real100.mjs --input Prod1.csv --output-dir audit-output
```

Data source: [historical skincareAPI public dataset](https://github.com/LauraAddams/skincareAPI/blob/master/db/seed_data/Prod1.csv). Products/formulas may be outdated. Its report compares with a simplified independent model of Sezia's public categories, **not** with the live checker. To measure true agreement, capture verified Sezia live output for the exact same products and fill the generated source-hash-specific annotation template. Every row must retain its `source_sha256` and `formula_sha256`; the runner rejects missing, stale, unknown, or duplicate records. Annotation rows and notes must be single-line CSV fields. A 0/3 score only means no current rule matched; it is not proof of safety or clinical suitability.
