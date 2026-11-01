# Browser check (2026-11-01)

Automated UI check of the local static site using headless Chromium 149 (`Chrome/149.0.7827.55`) over CDP and a loopback-only HTTP server. The 20 browser assertions passed at desktop viewport **1440 × 1000** and mobile viewport **390 × 844**. The root reviewer also visually reviewed the four screenshots saved in the session artifact folder.

The check covered the initial page and tabs, Analyze, six-token parsing with a parenthesized comma, Strict/Balanced results (`Squalene` 1/3, `Squalane` 0/3, Galactomyces 3/3; Strict total 3/3 and Balanced total 0/3), result invalidation after editing, stale-copy suppression, the Rating Criteria and References tabs, and ArrowRight tab navigation. No horizontal overflow was found at either viewport or on the mobile tabs.

**Clipboard limit:** Clicking Copy caused one native `writeText` call to resolve and displayed “Results copied.” The browser denied clipboard readback with `NotAllowedError`, so native clipboard contents were not confirmed. The expected report text was separately verified through the browser engine's clipboard stub. Do not read this as an end-to-end native clipboard confirmation.

There were no application console errors or uncaught page errors, and the page made no external requests. The only browser resource error was a cosmetic `favicon.ico` 404 from the local server. This was a headless browser check, not a physical smartphone test.

The detailed JSON report and four screenshots remain in the local session artifact directory; they are not tracked in the repository. [Open the browser audit JSON](</C:/Users/Andreas/.codex/visualizations/2026/11/01/01a196f8-4f6f-7bc2-a1ce-0b4829fa30be/browser-audit-report.json>).
