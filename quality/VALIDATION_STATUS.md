# External validation status

Updated: 2026-11-01. Phase 5a and the single manual ingredient-union comparison are complete as data collection; review of the mapped differences remains open. The separate historical product-formula live comparison has no valid observations. This document separates those results. None is a clinical validation.

## Historical catalog scan

On 2026-11-01, `node quality/real100.mjs --output-dir quality/real-product-audit-output` selected 100 historical catalog entries from the public [skincareAPI dataset](https://raw.githubusercontent.com/LauraAddams/skincareAPI/master/db/seed_data/Prod1.csv). The runner's minimum filter admitted 499 candidates. These are historical catalog records, not 100 manually verified complete or current package INCI lists.

| Measure | Result |
|---|---:|
| Selected catalog entries | 100 |
| Parsed ingredient positions | 2,725 |
| Parsed positions per record | 9–62 |
| Published-category comparator shared / comparator-only / checker-only | 258 / 1 / 74 |
| Simplified-model recall / precision proxies | 99.6% / 77.7% |
| Actual formula-level Sezia live observations | 0 / 100 |

The comparison above uses a simplified model derived from Sezia's published categories. Its proxy percentages are not measured live agreement, ground truth, safety estimates, or clinical accuracy. The single comparator-only `Microcrystalline Wax` finding is a known `NEUTRAL` exception in the checker and is not treated as a confirmed rule defect. The 74 checker-only findings need case review; examples worth reviewing include `Cera Microcristallina`, volatile-oil-looking names, and `PEG-7 Caprylic/Capric Glycerides`. These are review candidates, not asserted errors. No product rules were changed from this scan.

### Source provenance and limits

- Source URL: `https://raw.githubusercontent.com/LauraAddams/skincareAPI/master/db/seed_data/Prod1.csv` (the `master` URL is mutable; no source commit permalink was pinned).
- Downloaded source SHA-256: `672ec3278dbcc220e65fa543203353c2bf4954c6450ffbca6b5572504f870d2a`.
- The downloaded bytes are retained locally at `quality/real-product-audit-output/Prod1.csv`; this generated directory is ignored by Git because the dataset's redistribution rights have not been established. Its SHA-256 matched the run input. The report's `as_of` field is report-generation time, not a precise HTTP retrieval timestamp.
- Internal consistency checks found 100 unique source IDs, names, formula hashes, and raw INCI strings; recomputed formula hashes and parsed position counts matched all 100 report rows. This does not verify ingredient-list completeness or current product formulas.
- `SRC-0035` includes an ingredient boundary that appears to be missing, several apparent spelling errors, and trailing marketing text. It demonstrates why the source should not be described as a set of complete, verified INCI lists. The original text is preserved unchanged for any comparison.

## Sezia public form comparison

The public Sezia homepage and published ratings page responded to ordinary read-only GET requests with HTTP 200. The homepage's public form uses `/search` and a `search[ingredients]` field, and includes a session form token. Sezia's instructions call for a full English ingredient list and state that spelling errors are not corrected. The single comparison attempt used `SRC-0035`, using its original source text without repairs.

For the 100 historical product formulas, no valid Sezia assessment is available (**0/100**). Separately, the user's one-list ingredient union was returned and compared (**1/1 manual output received**); it is not a formula-level observation. The earlier single public-form submission returned HTTP 200 but displayed the homepage error “Something went wrong. Please reach out to us if it happens again.” The original input was not echoed and no ingredient assessment appeared. The cause is unknown; this does not establish whether the issue was server-side, session-related, or otherwise. The submitted UTF-8 payload SHA-256 was e5d379dc87d0faeaa93a2a49dceaf1711ac628fbc3d8ead4c564a3133f3f5fda. A sanitized copy of visible response text and metadata is stored locally in the ignored output directory; no token, cookie, or raw HTML is tracked. The browser automation paths were unavailable in this environment: `node_repl` initialization for `@oai/sky` failed with `windows sandbox failed: helper_unknown_error: setup refresh had errors` and then `trusted Node process exited unexpectedly; kernel reset, rerun your request`; the separate `mcp__cua_repl` initialization failed with the same Windows sandbox helper error. These are local tooling failures and do not indicate that Sezia blocks access. The automatic challenge/error marker check returned false, a false negative for the visible generic error; manual inspection of sanitized visible text found it. No further public-form submission was attempted after this single error response. Do not infer or fabricate a live result from published categories.

## Returned one-list manual comparison

The user requested a single manual Sezia query over a union of project rule names, neutral and volatile-oil names, the 100 historical records' parsed ingredient labels, and named fixtures. The copy-ready payload contains **1,432** distinct labels (35,256 characters), SHA-256 `5244c9a78e26505b0ec6a47ce9d9b4093227eb42222d952b8b5c13591f8a27ae`. The user's returned output reports 436 entries: 434 map exactly to payload labels and two truncated-looking fragments remain unresolved. It has no visible Unverified section. The full label-level set comparison, input hash, and category counts are in [SEZIA_COMPARISON.md](SEZIA_COMPARISON.md) and [sezia_manual_comparison.json](sezia_manual_comparison.json). This is **1/1 manual union outputs received**, not 1/1 complete product scans or a clinical assessment. Possible output truncation and the candidate differences await separate review; no rules were changed. The earlier public-form SRC-0035 attempt still yielded no valid ingredient assessment, and the 100 historical product formulas remain at **0/100** formula-level live results.
## Reproduction

The historical scan can be reproduced from the local ignored source snapshot with:

```bash
node quality/real100.mjs --input quality/real-product-audit-output/Prod1.csv --output-dir quality/real-product-audit-output
```

The generated report and JSON remain local. The tracked source, report, and rules do not contain the 100-record dataset or claim a 100/100 Sezia comparison.
