# Malassezia-only screening comparison

Updated: 2026-11-01

## Scope

This website screens cosmetic ingredients **only** for potential associations with **Malassezia lipid metabolism** or **seborrheic dermatitis**. It does **not** assess fragrance sensitivity, contact allergies, general irritation, sensitizing preservatives, drying effects of alcohol, or generic detergent harshness. No such substances affect product scores unless they independently meet a Malassezia-specific rule.

## Current classification

| Caution level | Category | Meaning |
|---|---|---|
| 3/3 | C11–C24 fatty acids and botanical lipid sources | Conservative possible Malassezia nutrient pathway; some ingredients, notably free oleic acid, also have evidence related to seborrheic-dermatitis flaking. |
| 3/3 | Galactomyces | Sezia-derived conservative warning; clinical relevance is weak and unestablished. |
| 2/3 | Fatty acid esters, long-chain glycerides, complex lipids | May liberate long-chain fatty acids, but hydrolysis and effect vary by ester, species, formulation and dose. |
| 1/3 | Sezia unverified fatty-acid-related salts/acyl compounds | Explicitly low confidence, optional strict screening. |
| 1/3 | Selected fermented/yeast-derived ingredients | Sezia-inspired caution about microbiome interactions; direct Malassezia/SD relevance is **not established**. Only included in strict mode. |
| 0/3 | All other names | No active Malassezia/SD matching rule. **Not a medical assurance of tolerance.** |

**Strict mode** includes all listed flags. **Balanced mode** suppresses all 1/3 flags, Galactomyces (3/3), and the 2/3 heuristic for unknown oil/wax names; other 2/3 rules remain active.

## Regression tests: ingredients that must not trigger a warning

`Parfum`, `Fragrance`, `Limonene`, `Linalool`, `Citral`, `Sodium Lauryl Sulfate`, `Sodium Coco-Sulfate`, `Cocamidopropyl Betaine`, `Alcohol Denat.`, `Methylisothiazolinone`, `Methylchloroisothiazolinone`, `DMDM Hydantoin`, `Mentha Piperita Oil`, `Tea Tree Oil` and other volatile essential oils have **0/3** from their general irritation/allergy properties.

## Real manufacturer ingredient lists (formulas retrieved 2026-11-01)

| Product | Current rating | Relevant findings |
|---|---:|---|
| Balea med Anti-Schuppen Ultra Sensitive Shampoo | 2/3 | Glyceryl Oleate; Hydrogenated Palm Glycerides Citrate |
| Balea med Ultra Sensitive Shampoo | 2/3 | Sodium Cocoamphoacetate (unverified); Ascorbyl Palmitate; Glyceryl Oleate; Hydrogenated Palm Glycerides Citrate; Lecithin |
| Balea med Totes Meer Ultra Sensitive Shampoo | 2/3 | Sodium Cocoamphoacetate (unverified); Glyceryl Oleate; Ascorbyl Palmitate; Glycol Distearate; Glyceryl Stearate; Hydrogenated Palm Glycerides Citrate; Lecithin |
| Balea Niacinamide Serum | 0/3 | None |
| Balea med Ultra Sensitive Waschgel | 0/3 | None; its Cocamidopropyl Betaine is NOT scored for contact allergy |
| Balea med Ultra Sensitive Reinigungsmilch | 2/3 | Glyceryl Stearate Citrate |

Lists may change; recheck packaging for current use. These are *ingredient-detection* tests, not evidence of how a product performs clinically.

## Reproduced tests

- `node rules.test.js`: **98** pass.
- `node app.test.js`: app-state checks pass, including stale-result invalidation and re-analysis after editing.
- `node benchmark.test.js`: **58** pass, including six manufacturer formulas.
- `node quality/sezia_examples.test.js`: **123** unique public Sezia examples, all pass according to published category-derived expected levels.
- `node quality/real100.test.mjs`: Offline synthetic CLI checks pass for source/formula binding and malformed annotations.
- `node quality/scenarios.test.js`: **100 synthetic full lists / 1,785 assertions** pass.
- A prior manual desktop/mobile Chromium check was reported as passing; it was not repeated during this update.

**Historical scan performed; formula-level live comparison remains open:** On 2026-11-01, `quality/real100.mjs` selected 100 historical catalog entries from 499 minimum-filter candidates (2,725 parsed ingredient positions). Its simplified published-category model produced 258 shared findings, 1 comparator-only finding, and 74 checker-only findings; these are not actual Sezia form results. One unchanged SRC-0035 public-form submission returned HTTP 200 with a generic visible error and no ingredient assessment; the cause is unknown. Valid formula-level Sezia observations remain **0/100**. A separate user-returned ingredient-union output was received and compared: 436 reported entries, 434 exact mappings and 2 unresolved fragments. The label-level differences and review candidates are in [the manual comparison](quality/SEZIA_COMPARISON.md); this is not product-formula validation. No live agreement or clinical accuracy percentage is claimed. See [validation provenance and status](quality/VALIDATION_STATUS.md).

## References

- [Sezia — ingredient categories](https://www.sezia.co/ingredients)
- [Sezia — unverified](https://www.sezia.co/ingredients/unverified)
- [Seborrheic dermatitis and Malassezia review, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11942342/)
- [Review of role of Malassezia in seborrheic dermatitis, 2024](https://pubmed.ncbi.nlm.nih.gov/38472524/)
- [American Academy of Dermatology — treatments](https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-treatment)
