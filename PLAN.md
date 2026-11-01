# Umsetzungsplan

Stand: 2026-11-01

## Ziel

Die bestätigten Probleme in der lokalen Produktprüfung und in der Benchmark-Verwaltung gezielt beheben, Regressionen absichern und die Projektänderungen nachvollziehbar veröffentlichen. Eine externe Validierung anhand historischer Produktrezepturen und tatsächlicher Sezia-Live-Ergebnisse bleibt ein späterer, separat ausgewiesener Schritt. Es werden keine Validierungsergebnisse vorweggenommen oder erfunden.

## Ausgangsstand

- Statische, clientseitige Website ohne Build-Schritt oder externe Laufzeitabhängigkeiten. `rules.js` enthält Parser und Bewertungsregeln; `app.js` steuert Oberfläche und Ergebniszustand.
- Bei Änderung der Zutatenliste wird aktuell nur der Zähler aktualisiert. Sichtbare Ergebnisse und „Copy results“ können sich weiterhin auf die vorherige Eingabe beziehen.
- Der Parser trennt auch an Kommata innerhalb von Klammerzusätzen.
- Balanced-Modus blendet auch Galactomyces-Regeln aus, ohne dies in der Modusnotiz ausdrücklich zu nennen.
- Der optionale 100-Formeln-Runner ordnet Annotationen über Zeilen-IDs zu und bindet sie nicht verbindlich an den Inhalt der Formel beziehungsweise die Quelldatei.
- Die Sezia-Beispielfixture meldet 124 unterschiedliche Namen, enthält aber einen doppelten Eintrag (`Sodium Cocoyl Isethionate`): 124 Einträge, 123 eindeutige Namen.
- Bei der Erstaufnahme bestanden die lokalen Ausgangstests unter Node v24.17.0: `rules.test.js` (92 Assertions), `benchmark.test.js` (58 Checks), `quality/sezia_examples.test.js` (124 Fixture-Einträge), `quality/scenarios.test.js` (100 synthetische Listen / 1.785 Assertions). Die aktuellen Ergebnisse nach Schritt 1 stehen unter dessen Abnahme.
- Die Chromium-Aussage in `COMPARISON.md` wurde bei der Bestandsaufnahme nicht reproduziert. Der historische 100-Formeln-Runner wurde nicht ausgeführt; er benötigt eine externe Quelle oder Eingabedatei und erzeugt Berichtsdateien.
- Bei der Erstaufnahme war das Arbeitsverzeichnis kein Git-Repository und die GitHub-URL noch nicht bekannt. Der aktuelle Repository-Status steht in Schritt 4.

## Arbeitsschritte und Abnahmekriterien

### 1. Ergebniszustand, Parser und Modustransparenz

- [x] Festlegen und implementieren, wie eine nachträglich geänderte Zutatenliste den zuvor angezeigten Bericht behandelt. Ein kopierter Bericht darf nicht stillschweigend zu einer inzwischen geänderten Eingabe gehören; Zustand und Oberfläche müssen übereinstimmen.
- [x] Den Parser so anpassen, dass Kommas innerhalb geklammerter Zusätze nicht als Listentrenner behandelt werden, während übliche Komma-, Semikolon- und Zeilenumbruchlisten weiterhin korrekt verarbeitet werden.
- [x] Balanced-Modus-Notiz und passende Erklärungen in der Oberfläche/Dokumentation so präzisieren, dass die Unterdrückung von Galactomyces (3/3 im strikten Modus) erkennbar ist.
- [x] Gezielte Regressionstests ergänzen: Eingabe nach abgeschlossener Analyse ändern und Berichtszustand prüfen; Kommas innerhalb und außerhalb von Klammern; strikte und ausgewogene Ergebnisse für Galactomyces, 1/3-Treffer und unsichere Öl-Heuristiken.

**Abnahme:** Die neue Eingabe und ein verfügbarer Kopierbericht können nicht auseinanderlaufen. Parenthesierte Kommas beschädigen die Ingredient-Tokens nicht; Listentrenner funktionieren weiterhin. Nutzer sehen klar, welche Warnklassen Balanced-Modus ausblendet. Alle neuen Regressionstests bestehen.

**Ergebnis Schritt 1 — umgesetzt und vom Root-Reviewer freigegeben:** Eingabeänderung blendet die bisherige Analyse aus, verwirft den Kopierzustand und zeigt einen Hinweis zum erneuten Prüfen. Der Parser erhält Kommas, Semikolons und Bullet-Zeichen innerhalb balancierter Klammern; echte Zeilenumbrüche bleiben Trenner, Ziffernkommas bleiben geschützt. Strict/Balanced-Hinweise und passende englische Website-Texte nennen die ausgeblendeten Galactomyces- und unbekannten Öl/Wachs-Muster.

**Regressionsergebnisse (Node v24.17.0):** `node app.test.js` bestanden (DOM-Stub prüft Invalidierung, blockierten alten Bericht, erneute Analyse und 0/3-Kopierbericht); `node rules.test.js` **98** Assertions bestanden; `node benchmark.test.js` **58** Checks bestanden; `node quality/sezia_examples.test.js` **124** Fixture-Einträge bestanden; `node quality/scenarios.test.js` **100** synthetische Listen / **1.785** Assertions bestanden. Die zusätzliche Chromium-Prüfung wurde in diesem Schritt nicht wiederholt. Externe Validierung bleibt offen.

### 2. Formelstabile Benchmark-Annotationen und Fixture-Korrektur

- [x] Annotationen an stabile Produkt-/Formelidentität binden, einschließlich Prüfsumme des Zutatenlisteninhalts und Herkunfts-/Datensatzkennung. Eine nicht passende Quelldatei oder Formel muss erkannt und darf nicht stillschweigend mit alten Beobachtungen verglichen werden.
- [x] Vorlagen eindeutig versionieren oder bei abweichendem Datensatz neu ausgeben, ohne vorhandene Nutzerannotation unbemerkt zu überschreiben. Ungültige, doppelte oder nicht zuordenbare Annotationen sollen verständlich gemeldet werden.
- [x] Offline-Regressionstests ergänzen, die unveränderte Formeln akzeptieren und geänderte Formel, geänderte Quelle sowie doppelte oder veraltete Identitäten zurückweisen. Die Tests dürfen keinen Netzwerkzugriff benötigen.
- [x] Den doppelten Sezia-Fixture-Namen entfernen oder durch ein anderes belegtes, eindeutiges öffentliches Kategoriebeispiel ersetzen. Die Fixture-Prüfung soll Eindeutigkeit erzwingen und die tatsächliche Anzahl ausweisen.
- [x] Zählungen und Aussagen in `quality/QUALITY_SUMMARY.md`, `COMPARISON.md` und `README.md` anhand der korrigierten Fixture aktualisieren.

**Abnahme:** Jede Live-Beobachtung wird nur derselben Formel und Quelldatenbasis zugeordnet, für die sie erhoben wurde; Abweichungen brechen mit nachvollziehbarer Meldung ab. Fixture und Dokumentation stimmen in Anzahl und Eindeutigkeit überein. Offline-Tests decken diese Bedingungen ab.

**Ergebnis Schritt 2 — umgesetzt:** `real100.mjs` schreibt source-hash-spezifische Vorlagen mit erforderlichen `source_sha256`- und `formula_sha256`-Spalten. Annotations-IDs und beide Prüfsummen werden gegen den aktuellen Lauf geprüft; fehlende Hashes/Spalten, veraltete Quellen/Formeln, unbekannte oder doppelte IDs, ungültige `reviewed`-Werte sowie ungültiges/abgeschnittenes CSV werden mit Zeilenhinweisen abgelehnt. Eine veränderte vorhandene Vorlage wird erkannt und nicht überschrieben. `--output-dir` isoliert Bericht, JSON und Vorlage. Der Fixture-Duplikatname wurde entfernt; jetzt sind es **123 eindeutige Beispiele**. README, Vergleich, Qualitätsübersicht und Workflow sind synchronisiert. Annotation-CSV-Felder müssen einzeilig sein; eingebettete Zeilenumbrüche werden ausdrücklich abgelehnt.

### 3. Review und Regression

- [x] Änderungen und Tests gemeinsam auf Randfälle, verständliche UI-Texte und konsistente Dokumentation prüfen. **Root-Review für Schritte 2 und 3 bestanden.**
- [x] Alle fünf vorhandenen lokalen Suiten und die neue hermetische CLI-Testsuite ausführen.
- [x] Chromium-Desktop-/Mobile-Prüfungen wurden nicht wiederholt; die Dokumentation kennzeichnet den früher berichteten Pass als historisch.
- [x] Die Ergebnisse mit ausgeführten Befehlen, Zahlen und bekannten Grenzen festhalten. Keine klinische Genauigkeit oder Live-Sezia-Übereinstimmung aus lokalen Regressionstests ableiten.

**Abnahme:** Alle lokalen Regressionen bestehen; Abweichungen und nicht ausgeführte externe/UI-Prüfungen sind explizit dokumentiert. Der Reviewer kann die Änderungen anhand des Diffs und der Testausgaben nachvollziehen.

**Lokaler Schritt-3-Stand:** `node app.test.js`, `node rules.test.js` (**98**), `node benchmark.test.js` (**58**), `node quality/sezia_examples.test.js` (**123 eindeutige Beispiele**), `node quality/scenarios.test.js` (**100 synthetische Listen / 1.785 Assertions**) und `node quality/real100.test.mjs` (Offline-CLI-Integration mit **100 ausdrücklich synthetischen CSV-Zeilen**) bestanden. Root-Review für Schritte 2 und 3 bestanden. Chromium wurde nicht erneut ausgeführt; historische Produktdaten und Sezia-Livevergleiche wurden in Schritt 3 nicht abgerufen oder ausgeführt. Der historische Katalogscan wurde separat in Schritt 5a ausgeführt; ein gültiges Live-Ergebnis liegt weiterhin nicht vor.

### 4. GitHub anbinden und ersten Push durchführen

- [x] Repository-URL erhalten: `https://github.com/ringie89/seborrheic-dermatitis-checker.git`. Read-only `git ls-remote --heads --tags origin` war erfolgreich und lieferte keine Refs; das Remote ist leer. Eine unauthentifizierte GitHub-Metadatenabfrage ergab HTTP 404, daher bleibt die Sichtbarkeit unbestätigt.
- [x] Lokal Branch `main` initialisiert, `origin` exakt auf die bereitgestellte URL gesetzt, `.gitignore` ergänzt, bekannte Projektdateien explizit gestaged und den Staging-Stand auf Geheimnis-Muster geprüft. Git-Identität wurde nur lokal im Repository mit dem vom Nutzer gewählten GitHub-Login und ID-basierten noreply-Format eingerichtet.
- [x] Nach Root-Review den initialen Commit `9b4beea` erstellt und `main` ohne Force-Push nach `origin/main` übertragen. Remote-HEAD entsprach danach lokalem HEAD; Arbeitsbaum war sauber.
- [x] Repository-Sichtbarkeit als unbestätigt dokumentiert und unverändert gelassen.

**Abnahme:** Erfüllt. Der reviewed Stand einschließlich Tests und Dokumentation wurde gepusht; lokaler und entfernter `main`-Stand waren identisch, der Arbeitsbaum sauber.

**Statushinweis:** Repository-URL und lokale Git-Identität liegen vor. Die Sichtbarkeit bleibt wegen HTTP 404 der unauthentifizierten Metadatenabfrage unbestätigt; es wurde keine Sichtbarkeit geändert.

### 5. Spätere externe Validierung: historische Formeln und manuelle Sezia-Sammelabfrage

- [x] Den historischen 100-Formeln-Lauf ausführen und Datensatz, Abrufdatum, lokale Quelldatei und SHA-256, Auswahlregel, Parsergrenzen und Resultate dokumentieren. Es wurden 100 historische Katalogeinträge nach dem Mindestfilter ausgewählt (499 Kandidaten, 2.725 geparste Ingredient-Positionen); das sind keine manuell verifizierten vollständigen oder aktuellen INCI-Listen.
- [x] Die einzelne 1.432-Label-Sammelliste wurde bei Sezia abgefragt; die Nutzerrückgabe mit 436 ausgewiesenen Einträgen wurde erhalten und mit dem lokalen Erwartungsdatensatz abgeglichen. Die frühere separate SRC-0035-Formularprobe lieferte HTTP 200 mit generischer Fehlermeldung und keinem Ergebnis; Ursache unklar.
- [x] Abdeckung und Grenzen des zurückgegebenen Sammelergebnisses mit Nenner ausweisen: 436 gelistete Einträge, 434 exakte Zuordnungen und 2 unaufgelöste Fragmente. Die historische Formelabdeckung bleibt davon getrennt bei 0/100 gültigen Live-Ergebnissen.
- [x] Root-Review der Abweichungslisten abschließen: Analyse geprüft, die zwei Fragmente und übrigen Grenzen dokumentiert. Fachliche Detailprüfung einzelner Fälle bleibt getrennte Folgearbeit; aus bloßer Abwesenheit eines Labels wird keine Sicherheits- oder Sezia-Negativaussage abgeleitet.
- [x] Historischen Scan und dessen Grenzen separat reviewen; als Ingredient-Matching-Vergleich ausweisen, nicht als klinische Validierung oder persönliche Verträglichkeitsprognose. Root-Review des historischen Ergebnisses bestanden.

**Abnahme:** Herkunft und Zuordnung der beobachteten Bezeichnungen sowie nicht auflösbare Fragmente sind dokumentiert. Das Ergebnis beschreibt den Ingredient-Namen-Abgleich; es belegt weder 100 vollständige Produktformeln noch weltweite INCI-Abdeckung oder klinische Genauigkeit.

**Ergebnis Schritt 5a:** Der historische Kataloglauf ist dokumentiert in [quality/VALIDATION_STATUS.md](quality/VALIDATION_STATUS.md). Die vereinfachte veröffentlichte Kategorien-Übereinstimmung (258 gemeinsam, 1 nur im Comparator, 74 nur im Checker) ist kein Live-Sezia-Vergleich. Der Quelldatensatz ist lokal hashgesichert, aber wegen ungeklärter Weiterverbreitungsrechte nicht eingecheckt. Es wurden keine Produktregeln geändert.

**Ergebnis Schritt 5b — Sammelantwort abgeglichen und reviewed:** Eine Nutzerrückgabe mit 436 Sezia-Labels wurde auf 434 exakte Namen abgebildet; zwei Fragmente blieben ungelöst und sind als Limit dokumentiert. Die Strict-/Balanced-Abweichungslisten und Reviewkandidaten stehen in [quality/SEZIA_COMPARISON.md](quality/SEZIA_COMPARISON.md) und [quality/sezia_manual_comparison.json](quality/sezia_manual_comparison.json). Die frühere separate SRC-0035-Probe lieferte keine verwertbare Zutatenbewertung. Der vereinbarte Sammel-Namensabgleich ist abgeschlossen; fachliche Detailfälle sind getrennte Folgearbeit. 100 separate Produkt-Liveprüfungen sind kein Abnahmekriterium.

### 6. Vier bestätigte Aliasfamilien gezielt angleichen

**Status:** Implementiert und regressionstestgeschützt; Root-Code-Review bestanden. Fachliche Detailprüfung der ausdrücklich offenen Fälle bleibt separat ausstehend. Grundlage ist der reviewed Abgleich in `quality/SEZIA_COMPARISON.md`. Geändert werden ausschließlich diese vier beobachteten Schreibweisen:

| Exakte Schreibweise | Sollverhalten | Referenzverhalten |
|---|---|---|
| `Polysorbate-80` | 2/3, Gruppe `ester` | wie `Polysorbate 80` |
| `Beeswax/Cera Alba/Cire d'abeille` | 3/3, Gruppe `lipid` | wie `Beeswax` |
| `Butyrospermum Parkii (Shea Butter)` | 3/3, Gruppe `lipid` | wie `Shea Butter` |
| `Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)` | 0/3 in beiden Modi | wie `Microcrystalline Wax` (`NEUTRAL`) |

**Vorgesehene Änderungsgrenze:** Eng begrenzte exakte Aliase, mit Fall- und äußerer Whitespace-Toleranz, aber unter Erhalt von Satzzeichen und Klammertext beim Aliasabgleich. Für Cera Microcristallina ist eine explizite neutrale Aliasbehandlung vorgesehen. Die allgemeine `normalize`-Klammerlogik bleibt unangetastet; keine Fuzzy-, Teilstring- oder generische Klammerregel.

- [x] Die vier exakten Labels in `rules.js` gezielt vor dem allgemeinen Normalizer abgebildet; keine weiteren Labels oder Rule-Gruppen ergänzt.
- [x] Gezielte Regressionen in `rules.test.js` ergänzt: Rating/Gruppe gegen Referenzlabels, Strict/Balanced, Fall-/Whitespace-Toleranz, vollständige Kommaliste und nahe Negativkontrollen.
- [x] Frozen-Korpusvergleich gegen alle 1.432 Labels ergänzt. Rating-/Gruppenänderungen sind genau vier Strict- und drei Balanced-Fälle; `Squalene`, `Polyhydroxystearic Acid`, `Milk Protein` und `PEG-7 Caprylic/Capric Glycerides` behalten ihre bisherigen Ergebnisse.
- [x] `quality/SEZIA_INGREDIENTS.txt`, `quality/sezia_manual_expected.json`, `quality/sezia_manual_comparison.json` und die Nutzerquelle als unveränderlichen Vor-Änderungs-Snapshot erhalten. Der Exporter erkennt abweichende Ableitungen vor sämtlichen Writes und lässt alle bestehenden Ausgaben unangetastet.
- [x] Sechs lokale Suiten bestanden: `app.test.js`, `rules.test.js` (**159 Assertions / 436 bekannte Namen und Aliase**), `benchmark.test.js` (**58**), `quality/sezia_examples.test.js` (**123**), `quality/scenarios.test.js` (**1.785 Assertions**) und `quality/real100.test.mjs` (Offline-CLI-Integration).
- [x] Root-Code-Review bestanden. Keine Änderungen an den historischen Vergleichslabels oder deren ursprünglichem 421/13/132-Vergleich.

**Explizit weiter offen, ohne Einstufungsänderung in diesem Schritt:** `Squalene`, `Polyhydroxystearic Acid`, Milch-/Milchproteinbezeichnungen, `PEG-7 Caprylic/Capric Glycerides`, komplexe Ester sowie volatile botanische Öle. Diese Fälle benötigen getrennte fachliche Prüfung; aus dem Labelabgleich wird keine Bewertung abgeleitet.

**Abnahme:** Erfüllt für die vier Aliasfälle: Referenzfälle und nahe Negativkontrollen sind regressionstestgeschützt, die gemessene Frozen-Korpusänderung ist auf die erwarteten vier Strict-/drei Balanced-Rating-Gruppen begrenzt, alle sechs lokalen Suiten bestehen und historische Artefakte bleiben bytegleich. Der allgemeine `normalize`-Matcher und offene Fachregeln bleiben unverändert.

## Änderungsgrenze dieses Plans

Schritte 1 bis 4 sind umgesetzt, lokal geprüft beziehungsweise veröffentlicht und vom Root-Reviewer freigegeben. Schritt 4 wurde als Commit `9b4beea` nach `origin/main` gepusht; die Repository-Sichtbarkeit ist unbestätigt und blieb unverändert. Die externe Chromium-Prüfung wurde nicht wiederholt. Schritt 5a (historischer Katalogscan) ist abgeschlossen und reviewed. Die manuelle Sammelausgabe zur 1.432-Label-Liste liegt vor: 436 gemeldete Einträge, 434 exakt zugeordnet und 2 nicht auflösbare Fragmente. Der vereinbarte Sammel-Namensabgleich ist abgeschlossen; fachliche Detailfälle sind getrennte Folgearbeit. 100 separate Produkt-Liveprüfungen sind kein Abnahmekriterium. Schritt 6 korrigiert vier bestätigte Aliasfälle; Root-Code-Review und lokale Regressionen sind bestanden. Die ursprüngliche Sammelauswertung und ihr 421/13/132-Snapshot blieben unverändert. Dieser Ingredient-Namen-Abgleich ist kein Produktparsing.
