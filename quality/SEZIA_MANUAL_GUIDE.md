# Manuelle Sezia-Sammelabfrage

## Ablauf

1. Öffne Sezia und füge den vollständigen Inhalt von `SEZIA_INGREDIENTS.txt` als eine einzige Zutatenliste ein.
2. Wenn Sezia die Eingabe ablehnt oder erkennbar abschneidet, kopiere die Meldung und den sichtbaren Umfang zurück. Danach entscheiden wir nachvollziehbar, ob und wie Teilabfragen nötig sind.
3. Kopiere alle hervorgehobenen Treffer vollständig mit der angezeigten Kategorie, Einstufung und Erklärung zurück. Falls Sezia keine Treffer zeigt, bestätige ausdrücklich: **„Keine Treffer angezeigt.“**

## Umfang und Grenzen

Die eine Liste enthält **1432** unterschiedliche Quelllabels. Die Quellen sind der aktuelle lokale 100-Einträge-Archivscan, das rohe Regelregister samt NEUTRAL- und volatile-oil-Namen sowie vorhandene Projektfixtures. Die Namen wurden nur nach NFKC, Kleinschreibung, Whitespace-Zusammenfassung und äußerem Trim dedupliziert; Klammerzusätze, Marketingpräfixe, Schreibweisen und Tippfehler bleiben als Varianten erhalten.

Sie umfasst 2725 geparste Ingredient-Positionen aus 100 historischen Katalogeinträgen; diese Listen sind nicht manuell als vollständig oder aktuell verifiziert. Originaldaten-Fragmente wie Acid oder Caprylic/Capric sowie angehängter Marketingtext können vorkommen. Synthetische Testformeln sind als Quelle ausgewiesen; explizite Platzhalter sind ausgeschlossen: Moringa Macassar Seed Oil, UnknownIngredient.
Quellenzählungen: 436 rohe add-Aliasvorkommen (432 normalisierte Regelnamen), 92 NEUTRAL-Namen, 19 volatile-oil-Namen, 23 positive und 58 negative Rules-Testfälle, 50 Benchmark-Einzelstofffälle und 6 Herstellerformeln, 123 veröffentlichte Sezia-Beispiel-Labels sowie 100 synthetische Rezeptur-Fixtures.

Einzelne Kommata innerhalb geklammerter Namen bleiben erhalten. Ändere sie vor dem Einfügen nicht. Die Abfrage prüft eine gemeinsame Menge von Einzelstoffnamen; sie ersetzt keine Formelprüfung eines konkreten Produkts.

Die Payload enthält nur Namen aus Projektregeln, dem lokalen Archiv und benannten Fixtures; sie ist keine vollständige INCI-Liste der Welt. Die Bewertungen in `sezia_manual_expected.json` sind die lokalen Strict-/Balanced-Vorhersagen des Checkers, keine Live-Sezia-Ergebnisse und keine klinische Aussage.

## Provenienz

- Payload SHA-256 (UTF-8 ohne abschließenden Zeilenumbruch): `5244c9a78e26505b0ec6a47ce9d9b4093227eb42222d952b8b5c13591f8a27ae`.
- Historisches CSV-Archiv SHA-256: `672ec3278dbcc220e65fa543203353c2bf4954c6450ffbca6b5572504f870d2a`; verwendeter lokaler Snapshot: `quality/real-product-audit-output/Prod1.csv` (wegen ungeklärter Weiterverbreitungsrechte nicht eingecheckt).
- Quellenarten: rules.test.js positive and negative cases; benchmark.test.js ingredient cases and manufacturer-listed formulas; quality/sezia_examples.test.js published-category examples; quality/synthetic_100.json 100 explicitly synthetic formula scenarios; quality/real100.test.mjs explicitly synthetic offline CLI formula; app.test.js input fixture.
- Die ursprüngliche Einzelprobe SRC-0035 ergab keinen auswertbaren Live-Resultatblock. Für diese Sammelabfrage gibt es noch **0 bestätigte manuelle Beobachtungen**.
