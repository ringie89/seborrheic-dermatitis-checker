# Quality checks — Seborrheic Dermatitis Product Checker

Updated: 2026-11-01. The scope is limited to potential **Malassezia** or **seborrheic dermatitis** relevance. General allergy and skin-irritation warnings are deliberately omitted.

## Executed checks

| Suite | Result | Meaning |
|---|---|---|
| `app.test.js` | Passed | App state, changed-input invalidation, copy behavior, re-analysis, and mode-note wording. |
| `rules.test.js` | 219 assertions passed | Covers the four earlier aliases, the approved exact evidence cases, a frozen 1,432-label scope comparison (15 Strict / 6 Balanced changes relative to the historical snapshot), and negative controls. |
| `benchmark.test.js` | 58 cases passed | 50 individually selected names, 6 real manufacturer-listed full formulas, and 2 parsing tests. |
| `quality/sezia_examples.test.js` | 123/123 passed | Unique examples copied from Sezia's *published category pages*; **not** actual Sezia live responses. |
| `quality/real100.test.mjs` | Passed | Offline CLI checks with 100 explicitly synthetic CSV rows; source/formula hash validation, stale template preservation, and malformed annotation rejection. |
| `quality/scenarios.test.js` | 100 synthetic full lists / 1,785 assertions | Reproducible rule regression test; no clinical ground truth. |
| Desktop/mobile Chromium | Historical reported pass; not rerun in this update | Form input, scores, scope exclusion, mode switching, mobile width. |
| Historical catalog scan | 100 entries / 2,725 parsed ingredient positions | Executed on 2026-11-01; source selection and limitations below. This is not live Sezia validation. |
| Live Sezia head-to-head | 0/100 valid formula-level observations; 1/1 manual union outputs received | The earlier SRC-0035 form attempt returned HTTP 200 with a generic error and no ingredient assessment; cause unknown. The separate user-returned union output is mapped below and does not validate product formulas. |

## Returned manual union comparison

A single copy-ready payload contains **1,432** distinct labels (35,256 characters), with provenance and the original per-label local strict/balanced findings in `sezia_manual_expected.json`. Its payload SHA-256 is `5244c9a78e26505b0ec6a47ce9d9b4093227eb42222d952b8b5c13591f8a27ae`. The returned Sezia output reports 436 entries: **434 exact label matches and 2 unresolved fragments**. It has no visible Unverified section. The original label-level comparison and mismatch lists are in [SEZIA_COMPARISON.md](SEZIA_COMPARISON.md) and [sezia_manual_comparison.json](sezia_manual_comparison.json). Four aliases and later evidence-reviewed exact labels have current rules; the original payload and comparison remain frozen at their pre-update values, including the historical 421/13/132 Strict counts. Current outcomes and evidence limits are summarized in [INGREDIENT_EVIDENCE_REVIEW.md](INGREDIENT_EVIDENCE_REVIEW.md). Local expected ratings are checker outputs, not Sezia observations. This is one ingredient-union response, not product-formula validation; historical formula-level live coverage remains **0/100**. Possible output truncation remains unresolved. See the [manual guide](SEZIA_MANUAL_GUIDE.md) and [payload](SEZIA_INGREDIENTS.txt).
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

### Historical scan results (2026-11-01)

The runner selected 100 historical catalog entries from 499 minimum-filter candidates and parsed 2,725 ingredient positions (9–62 per entry). The simplified published-category comparator reported 258 shared findings, 1 comparator-only finding, and 74 checker-only findings (99.6% recall and 77.7% precision proxies against that model only). These percentages are **not** live agreement, ground truth, or clinical accuracy. The dataset is not manually verified as complete/current INCI. Its `master` source URL is mutable; source SHA-256 is `672ec3278dbcc220e65fa543203353c2bf4954c6450ffbca6b5572504f870d2a`. A hash-matched source snapshot is kept in ignored `quality/real-product-audit-output/Prod1.csv` and is not committed because redistribution rights are unclear. The report's `as_of` is its generation time, not an exact source-download timestamp. See [the complete validation status](VALIDATION_STATUS.md) for parsing limitations, candidates for review, and the current 0/100 live-observation coverage.
