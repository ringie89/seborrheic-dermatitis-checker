# Seborrheic Dermatitis Product Checker

An English-language, static website for screening shampoo, cleanser, and skincare ingredient lists. Inspired by Sezia, with independently curated rules focused exclusively on potential Malassezia and seborrheic-dermatitis relevance.

**No hosted demo is included.** Publish the site on GitHub Pages to get a public URL. **The scope intentionally excludes generic allergy and irritation warnings**: perfume, unrelated preservatives, and harsh surfactants do not lower the score merely for causing possible irritation.

## Interface

The header contains three keyboard-accessible tabs: **Product checker**, **Rating criteria**, and **References & limitations**. The latter two are hidden until selected, rather than displayed beneath the product checker. The red / amber / green assessment is deliberately high contrast. A 0/3 result clearly says the product looks suitable based on the checker’s current rules, with a qualification that individual compatibility cannot be guaranteed. There is no sample-list button, branding, marketing copy, or logo.

## Quick start

1. Put `index.html`, `style.css`, `rules.js`, and `app.js` in **the same directory**.
2. Open `index.html` in a web browser. No build step, server, npm installation, API key, or account is needed.
3. Paste an ingredient list and click **Check product**. The page displays flagged ingredients, caution levels, brief explanations, and source links.

## Publish to GitHub Pages

1. Create a new **public repository** at https://github.com/new (for example, `seborrheic-dermatitis-checker`).
2. Select **Add file → Upload files** and upload the files from this project to the repository root. You can also include `README.md`, `LICENSE`, and `rules.test.js`.
3. Under **Settings → Pages → Build and deployment**, select **Deploy from a branch** as the source.
4. Choose the **main** branch and **/(root)** directory, then save.
5. Once published, GitHub will show the site URL, usually something like `https://YOUR-USERNAME.github.io/seborrheic-dermatitis-checker/`.

## How ratings work

- **3/3 – High caution:** Explicitly listed C11–C24 free fatty acids, many botanical oils and butters, and Galactomyces in strict screening. This is a precautionary flag, **not proof of a clinical trigger**.
- **2/3 – Moderate caution:** Fatty acid esters and uncertain complex lipids of potential Malassezia relevance.
- **1/3 – Low-confidence flag:** Sezia-listed unverified fatty-acid-related salts/acyl compounds, selected ferments, and an exact `Squalene` flag based on a preliminary in-vitro Malassezia mechanism. These flags appear only in Strict mode; they do not establish a clinical product trigger.
- **0/3 – No rule matches:** No implemented rule flagged an ingredient. **This is not a safety guarantee.**

The overall rating equals the **highest individual caution level**, not a percentage or a medically validated flare-up prediction. The number of flagged ingredients is shown separately. **Strict screening** is enabled by default. **Balanced mode** hides all 1/3 flags, Galactomyces (3/3), and the 2/3 heuristic for unknown oil/wax names. Other 2/3 rules remain active. Neither mode clinically validates product safety.

The checker includes **hundreds of ingredient names and aliases**, counted automatically in the app, plus name-pattern rules for certain esters, lipids, ferments, and Galactomyces ingredients. Slash-separated labels remain one displayed item; when the complete label is unknown, top-level slash components are also checked individually. Known exact, neutral, and explicitly listed volatile-oil full names take precedence over component heuristics. It cannot catalog every possible INCI term. Pattern rules can yield false positives or missed flags. **No match does not mean proven safe.**

**Notable exceptions:** `Caprylic/Capric Triglyceride`, `Glyceryl Caprylate`, `Glyceryl Caprate`, `Squalane`, `Mineral Oil`, `Dimethicone`, many fatty alcohols, ceramides, and treatment ingredients such as `Ketoconazole` or `Piroctone Olamine` are not automatically marked as Malassezia nutrients.

## Customize the data and rules

Edit `rules.js` to change screening criteria. `add('Ingredient1|Ingredient2|...', 'group')` lists exact names and aliases. The `matchOne(...)` function contains fallback regular-expression patterns. The `GROUP` constant stores English explanations, caution ratings, evidence labels, and source links. `NEUTRAL` holds exceptions that reduce false positives.

You can add more entries or update explanations and references. This project does **not** claim to reproduce the full Sezia database or offer clinically validated ingredient-level risk scores.

## Tests

If Node.js is installed, run:

```bash
node app.test.js
node rules.test.js
```

Also run the Sezia-methodology benchmark and real-formula regression tests:

```bash
node benchmark.test.js
```

There are no external dependencies.

## Sezia methodology benchmark (2026-11-01)

**Important validation distinction:** Sezia's public homepage and published ratings page responded to read-only requests. One ordinary public-form submission returned HTTP 200 with a generic error message and no ingredient assessment. The comparison in this section uses Sezia's **published ingredient categories, matching requirements, and examples**; it is **not** a measured head-to-head live scan and cannot establish an overall percentage agreement with Sezia. The historical 100-formula measurement recorded 0/100 valid product-formula observations. The separate manual union output was received and compared: 436 reported entries, 434 exact labels mapped, and 2 shortened raw fragments, each with one matching full label in the original payload. These fragments remain incomplete in the Sezia copy. See [the comparison](quality/SEZIA_COMPARISON.md), [external validation status](quality/VALIDATION_STATUS.md), and [desktop/mobile browser check](quality/BROWSER_CHECK.md).

Four observed aliases and a later set of narrowly evidence-reviewed ingredient rules were changed after the manual comparison. The historical 1,432-label expected-results and comparison files remain frozen at the pre-correction state; current outcomes and scope are documented in [the evidence review](quality/INGREDIENT_EVIDENCE_REVIEW.md) and [comparison report](quality/SEZIA_COMPARISON.md). No general fuzzy or parenthetical matching rule was added.

`benchmark.test.js` includes **50 ingredient-level comparison and edge cases, six real manufacturer-listed ingredient formulas, and two parsing tests**. Along with the 269 assertions in `rules.test.js` and the app-state checks in `app.test.js`, these are executable regression checks—not clinical accuracy estimates.

| Manufacturer-listed product | Strict rating | Flagged ingredients | Key findings |
|---|---:|---:|---|
| [Balea med Anti-Schuppen Ultra Sensitive Shampoo](https://www.dm.de/p/d/2968885/balea-med-shampoo-anti-schuppen-ultra-sensitive) | 2/3 | 2/17 | Glyceryl Oleate and Hydrogenated Palm Glycerides Citrate; Cocamidopropyl Betaine is deliberately not flagged for contact allergy. |
| [Balea med Ultra Sensitive Shampoo](https://www.dm.de/p/d/1569035/balea-med-shampoo-ultra-sensitive) | 2/3 | 5/18 | Ascorbyl Palmitate, Glyceryl Oleate, palm glycerides, lecithin, plus an unverified salt flag; irritancy is excluded. |
| [Balea med Totes Meer Ultra Sensitive Shampoo](https://www.dm.de/p/d/3058568/balea-med-shampoo-totes-meer-ultra-sensitive) | 2/3 | 7/22 | Multiple fatty acid esters, including Glycol Distearate and Glyceryl Stearate. |
| [Balea Niacinamide Serum](https://www.dm.de/p/d/1676288/balea-serum-niacinamide) | 0/3 | 0/16 | No current rule matches; **not** a promise of skin compatibility. |
| [Balea med Ultra Sensitive Waschgel](https://www.dm.de/p/d/1691474/balea-med-waschgel-ultra-sensitive) | 0/3 | 0/10 | Cocamidopropyl Betaine not flagged; contact allergy is outside scope. |
| [Balea med Ultra Sensitive Reinigungsmilch](https://www.dm.de/p/d/1623935/balea-med-reinigungsmilch-ultra-sensitive) | 2/3 | 1/17 | Glyceryl Stearate Citrate, while C8/C10 triglycerides are *not* automatically flagged. |

These results use ingredient lists recorded from the linked official product pages on **November 1, 2026**. Manufacturer formulations can change. Source lists may be displayed with unusual delimiters, so retailer formatting should be checked against the packaging.

**Corrections based on the benchmark:**
- Recognizes `Organic Cocos Nucifera Oil`, `Cold Pressed Olive Oil`, and other standard oil marketing prefixes like their corresponding botanical oils.
- Recognizes `Hydrogenated Palm Glycerides Citrate` as an uncertain glyceride blend, not an unproblematic unspecified ingredient.
- Treats select salts such as `Sodium Cocoamphoacetate` and `Sodium C14-16 Olefin Sulfonate` as **low-confidence / unverified**, consistent with [Sezia's separate unverified list](https://www.sezia.co/ingredients/unverified).
- Avoids automatically assigning long-chain fatty acid ester warnings to `Diethylhexyl Malate` and `Isostearyl Neopentanoate`: the corresponding acids are C4 and C5, respectively. That is a more chemically specific decision, **not a verified Sezia match**.
- Corrects parsing of multi-language `INGREDIENTS, ...:` headers and some pipe-separated retailer lists.
- Highlights when a product contains an established anti-dandruff active: the presence of a potentially problematic excipient does not negate the treatment's clinical benefit.

Published evidence to inform disagreements: [Mayser et al., 1995](https://pubmed.ncbi.nlm.nih.gov/7604636/) found that ester hydrolysis depended on the alcohol component; [Liebregts et al., 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12416284/) reported Malassezia species differences; and the [American Academy of Dermatology](https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-treatment) recommends therapeutic anti-dandruff treatments where indicated. These findings do not establish patient-specific predictions from ingredient names alone.

## Limitations and medical considerations

Seborrheic dermatitis cannot be explained simply as a result of supplying nutrients to yeast. Malassezia interactions depend on the species, substance, formulation, and individual skin response. **This checker is intentionally conservative and may flag effective or well-tolerated products.** That includes medicinal products containing fatty acid ester excipients: the clinical benefit of an antifungal treatment may outweigh theoretical concerns.

**Out of scope:** fragrance allergy, contact allergy, generic irritation from alcohol or detergents, and unrelated sensitivities. Such substances do not affect the rating unless they independently qualify under a specific Malassezia-related lipid rule.

This website is not a diagnostic tool, medical treatment advice, or a guarantee of individual tolerability.

## References

- [Sezia – Ratings and ingredient categories](https://www.sezia.co/ingredients/ratings)
- [Sezia – Fatty acids](https://www.sezia.co/ingredients/fatty-acids)
- [Sezia – Lipids](https://www.sezia.co/ingredients/lipids)
- [Sezia – Esters](https://www.sezia.co/ingredients/esters)
- [Sezia – High-sensitivity / ferments](https://www.sezia.co/ingredients/high-sensitivity)
- [Sezia – Galactomyces](https://www.sezia.co/ingredients/galactomyces)
- [Simple Skincare Science – Malassezia and skincare](https://simpleskincarescience.com/pityrosporum-folliculitis-treatment-malassezia-cure/)
- [Mayser et al. (1995), PubMed](https://pubmed.ncbi.nlm.nih.gov/7604636/) — ester hydrolysis depends on the alcohol moiety.
- [Sezia – Unverified ingredients](https://www.sezia.co/ingredients/unverified) — salts and other ingredient classes with inadequate evidence.
- [Mayser & Koch (2021), PubMed](https://pubmed.ncbi.nlm.nih.gov/34304284/) — topical lipids can have varying, including inhibitory, effects.
- [Experimental study (2025), PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12416284/) — metabolism depends on the lipid and yeast species.
- [Malassezia restricta-mediated lipoperoxidation (2023), PubMed](https://pubmed.ncbi.nlm.nih.gov/36789756/) — mechanistic evidence about squalene oxidation products, not a product trial.
- [Malassezia furfur skin-lipid study (2026 preprint), PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC13405305/) — explicitly not peer-reviewed; preliminary in-vitro result.
- [Review of seborrheic dermatitis (2025), PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11942342/) — oleic acid and the skin barrier.
- [American Academy of Dermatology – Seborrheic dermatitis self-care](https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-self-care)
- [American Academy of Dermatology – Seborrheic dermatitis treatment](https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-treatment)

## Privacy and licensing

All ingredient analysis runs locally in the browser. Ingredient lists are not sent to a server, no cookies are set, and no external JavaScript libraries are loaded. External source links open third-party sites only if you click them.

This is an independently written project, unaffiliated with Sezia. The code is provided under the MIT License (see `LICENSE`).

## Quality audit (synthetic scenarios and historical catalog scan)

The project includes 100 **synthetic** ingredient lists with explicit expected results. Separately, the historical catalog runner was executed on 2026-11-01: it selected 100 historical catalog entries from 499 candidates and parsed 2,725 ingredient positions. These are not manually verified complete or current package INCI lists. The simplified published-category comparison reported 258 shared, 1 comparator-only, and 74 checker-only findings; these are not live Sezia results or clinical accuracy estimates. The historical formula-level measurement recorded 0/100 valid Sezia observations. The user-returned manual output for the separate 1,432-label union contains 436 reported entries, 434 exact mappings, and 2 shortened raw fragments with one matching full payload label each; it does not validate complete product formulas. See the [manual comparison](quality/SEZIA_COMPARISON.md), [copy-ready union](quality/SEZIA_INGREDIENTS.txt), [manual guide](quality/SEZIA_MANUAL_GUIDE.md), [validation status](quality/VALIDATION_STATUS.md), and [browser check](quality/BROWSER_CHECK.md).

```bash
node rules.test.js
node benchmark.test.js
node app.test.js
node quality/sezia_examples.test.js  # 123 unique public, category-derived Sezia examples
node quality/scenarios.test.js
node quality/real100.test.mjs  # Offline synthetic annotation-integrity CLI tests
node quality/real100.mjs    # Requires internet, or pass --input Prod1.csv
```

See **[Quality methodology and results](quality/QUALITY_SUMMARY.md)** and the [ingredient evidence review](quality/INGREDIENT_EVIDENCE_REVIEW.md) for tested counts, caveats, source boundaries, and current screening decisions. Annotation templates are tied to the exact source CSV and each formula by SHA-256; legacy or stale annotations are rejected. Notes and annotation rows must stay on one physical line. GitHub Actions includes regression testing and a manually triggered historical-formula audit.

## Voluntary use disclaimer

The website describes itself as a free, voluntary information tool provided as-is, without warranty or acceptance of liability. This is not medical advice; enforceability of disclaimers depends on local law.
