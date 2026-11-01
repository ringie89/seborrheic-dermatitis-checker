# Manuelle Sezia-Sammelausgabe: Abgleich

Stand: 2026-11-01. Eine vom Nutzer zurückgegebene Sezia-Ausgabe wurde mit den damals erwarteten lokalen Label-Einstufungen verglichen. Das ist ein Abgleich von Ingredient-Namen, keine Prüfung vollständiger Produktformeln und keine klinische Validierung. Die nachträglich beschlossenen, eng begrenzten Alias-Korrekturen sind separat unter „Korrekturen nach dem Snapshot“ dokumentiert; die ursprüngliche Messung wurde nicht überschrieben.

## Eingabe und Zuordnung

Die Ausgabe meldet 436 problematische Einträge. Die Abschnittsmarker und drei Schlusslabels ohne eigenen Marker ergeben 147 Ester, 48 Fettsäuren, 197 Lipide, 5 Galactomyces-Einträge und 39 High-Sensitivity-Einträge. Die 436 Labels sind nach NFKC, Kleinschreibung und Whitespace-Bereinigung eindeutig; Satzzeichen, Klammern und Schreibvarianten blieben erhalten. 434 Labels stimmen exakt mit der vorbereiteten 1.432-Label-Liste überein. Zwei unvollständige Fragmente ließen sich nicht sicher zuordnen: `olus (vegetable oil` und `ferment extract (platycodon grandiflorum root`. Sie wurden nicht ergänzt oder geraten. In der kopierten Ausgabe ist kein Abschnitt „Unverified“ sichtbar.

Das vollständige rohe Ausgabe-Textdokument wird nicht in diesem Bericht wiederholt. Prüfsummen, Kategorien, Zuordnungszahlen und Abweichungs-Labelsets stehen in [sezia_manual_comparison.json](sezia_manual_comparison.json). Die erwarteten lokalen Einstufungen und ihre Herkunft sind in [sezia_manual_expected.json](sezia_manual_expected.json) dokumentiert; die abgefragte Liste steht in [SEZIA_INGREDIENTS.txt](SEZIA_INGREDIENTS.txt).

## Label-Abgleich

| Modus | Lokale markierte Labels | Exakt gemeinsam | Sezia-Label lokal ohne Treffer | Lokal markiert, in Ausgabe nicht vorhanden |
|---|---:|---:|---:|---:|
| Strict | 553 | 421 | 13 | 132 |
| Balanced | 402 | 361 | 73 | 41 |

Der Nenner für die Ausgabe ist 434 exakt zugeordnete Labels; zwei Fragmente bleiben außerhalb des Vergleichs. Die Listen der 13 bzw. 132 Strict-Abweichungen und der 73 bzw. 41 Balanced-Abweichungen sowie lokale Regelgruppen sind im JSON vollständig aufgeführt. Das sind **keine** Präzisions-, Recall- oder Fehlerquoten. Nicht aufgeführte Labels sind keine bestätigten Sezia-Negativbefunde und gelten nicht dadurch als sicher. Insbesondere fehlt ein sichtbarer „Unverified“-Abschnitt. Sezia-Kategorien und lokale Regelgruppen sind außerdem nicht zwingend chemisch gleichartige Kategorien.

Die folgenden 13 Sezia-Labels hatten im ursprünglichen Snapshot keine lokale Strict-Regel, unverändert aus der Ausgabe übernommen:

| Sezia-Label | Abschnitt |
|---|---|
| `c10-30 cholesterol/lanosterol esters` | Esters |
| `hydrolyzed jojoba esters` | Esters |
| `methyl glucose sesquistearatem` | Esters |
| `polysorbate 20 polyglyceryl-3 methylglucose disterarate` | Esters |
| `polysorbate-80` | Esters |
| `polyhydroxystearic acid` | Fatty Acids |
| `beeswax/cera alba/cire d'abeille` | Lipids |
| `butyrospermum parkii (shea butter)` | Lipids |
| `goat milk extract` | Lipids |
| `milk protein` | Lipids |
| `milk protein extract` | Lipids |
| `olive oil unsaponifiables` | Lipids |
| `squalene` | Lipids |

## Priorisierte Reviewkandidaten zum Zeitpunkt des Snapshots

Die folgenden Beobachtungen waren zum Zeitpunkt des manuellen Snapshots Prüfhinweise, keine automatische Regeländerung oder abschließende Bewertung:

- **Im Snapshot nachweisbare lokale Überwarnung durch Alias-/Musterlücke:** `Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)` erhielt 2/3 als `oilunknown`, während das alleinstehende `Microcrystalline Wax` in `NEUTRAL` liegt. Die historischen Treffer stammen aus `SRC-0408` und `SRC-0443`; die neutrale Schreibweise aus `SRC-0134`. Dieser konkrete Aliasfall ist in der späteren Korrektur unten behoben.
- **Formulierungsabhängiger Review:** `PEG-7 Caprylic/Capric Glycerides` erhält 2/3 als generisches `glycerides`-Muster; `Caprylic/Capric Triglyceride` ist dagegen neutral. Die Namen bezeichnen unterschiedliche Stoffe/Formulierungen. Daraus folgt weder eine Entwarnung noch ein bestätigter Trigger.
- **Volatile-Öl-/Synonymmuster prüfen:** `Salvia Officinalis (Sage) Oil` sowie mehrere Bergamot-Fruit-Oil-Schreibweisen erhalten lokal 2/3 als `oilunknown`, obwohl die Regelnotiz generische Essential-Oil-Warnungen ausschließt und `Bergamot Oil` neutral ist. Das sind mögliche Whitelist-/Namensmusterlücken; eine Prüfung botanischer Quellen und des Regelumfangs steht aus.
- **Mögliche Alias- und Erkennungsunterschiede bei Sezia-Labels:** `Polysorbate-80`, `Beeswax/Cera Alba/Cire d'abeille` und `Butyrospermum Parkii (Shea Butter)` erhielten später eng begrenzte Aliasbehandlungen (siehe unten). Die Ester `C10-30 Cholesterol/Lanosterol Esters` und `Hydrolyzed Jojoba Esters` bleiben fachlich offen. Eine zusammengesetzte Schreibweise allein beweist keine fehlende chemische Stofffamilie.
- **Eingabefehler nicht still reparieren:** `methyl glucose sesquistearatem` und `polysorbate 20 polyglyceryl-3 methylglucose disterarate` sehen nach Schreibfehlern bzw. verklebten Namen aus. Sie wurden im Abgleich nicht normalisiert oder aufgeteilt.
- **Namensinhalt ist kein Nachweis der Zusammensetzung:** `milk protein`, `milk protein extract` und `goat milk extract` belegen für sich keinen bestimmten Milchfettanteil. `Polyhydroxystearic Acid` ist laut [CIR-Sicherheitsbericht](https://www.cir-safety.org/sites/default/files/FR_PolyhydroxystearicAcid_032023.pdf) ein Polymer aus Hydroxycarbonsäure-Monomeren; der Name ist nicht mit freier Hydroxystearinsäure gleichzusetzen.
- **Squalene separat von Squalane prüfen:** Studien berichten mechanistische bzw. assoziative Befunde zu Squalenoxidation und Schuppen/Malassezia ([2016](https://pubmed.ncbi.nlm.nih.gov/26842231/), [2023](https://pubmed.ncbi.nlm.nih.gov/36789756/)). Sie belegen keine patientenbezogene Produktvorhersage und rechtfertigen hier keine automatische Regeländerung. Squalene und Squalane sind unterschiedliche Bezeichnungen/Stoffe.
- **75 Strict-only Salzlabels sind kein bestätigter Bug:** Diese 75 lokal als `salt` markierten Labels sind in der kopierten Trefferliste nicht enthalten; ein eigener Abschnitt „Unverified“ fehlt. Sechs weitere lokale `salt`-Labels werden von Sezia als `Esters` ausgegeben. Sezia beschreibt Salze/Taurate/Isethionate auf der separaten [Unverified-Seite](https://www.sezia.co/ingredients/unverified) als unzureichend erforscht. Kategorien und lokale Regelgruppen sind daher nicht gleichzusetzen.

## Korrekturen nach dem Snapshot

Nach dem Root-Review wurden ausschließlich vier exakt beobachtete Schreibweisen an bereits bestehende Referenzverhalten gebunden:

| Label | Eingefrorener Snapshot | Aktuelle lokale Regel |
|---|---|---|
| `Polysorbate-80` | 0/3 | 2/3 `ester`, wie `Polysorbate 80` |
| `Beeswax/Cera Alba/Cire d'abeille` | 0/3 | 3/3 `lipid`, wie `Beeswax` |
| `Butyrospermum Parkii (Shea Butter)` | 0/3 | 3/3 `lipid`, wie `Shea Butter` |
| `Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)` | 2/3 `oilunknown` | 0/3, wie `Microcrystalline Wax` (`NEUTRAL`) |

Ein Korpusvergleich gegen die eingefrorenen 1.432 lokalen Erwartungslabels fand für diesen Alias-Schritt genau vier Strict- und drei Balanced-Änderungen an Rating/Gruppe. Die Balanced-Einstufung des Cera-Microcristallina-Labels war bereits 0/3, weil die frühere `oilunknown`-Heuristik dort unterdrückt wurde; die neue Neutralbehandlung entfernt diese heuristische Unterdrückung ohne Änderung des sichtbaren Balanced-Ratings. Dieser Absatz beschreibt ausschließlich den damaligen Alias-Schritt.

### Spätere fachlich geprüfte Regelentscheidungen

Nach separater Prüfung wurden weitere exakte Labels enger bewertet: `Squalene` erhält einen vorläufigen 1/3-Mechanismushinweis nur in Strict; `PEG-7 Caprylic/Capric Glycerides` wird neutral; zwei dokumentierte komplexe Ester bleiben in der bestehenden 2/3-Estergruppe; belegte volatile Öl-Aliase werden exakt von der unbekannten Ölheuristik ausgenommen. Die unveränderten Bewertungen mehrerer anderer Reviewlabels und die Gründe sind im [gemeinsamen Evidenzreview](INGREDIENT_EVIDENCE_REVIEW.md) dokumentiert. Dies aktualisiert keine historischen Sezia-Beobachtungen.

`SEZIA_INGREDIENTS.txt`, `sezia_manual_expected.json`, `sezia_manual_comparison.json` und die Nutzerquelle blieben bytegleich. Der Generator `sezia_manual.mjs` lehnt geänderte Ableitungen jetzt vor sämtlichen Datei-Schreibvorgängen mit „historical snapshot is kept unchanged“ ab. Der einmalige Guardlauf endete erwartungsgemäß am veränderten Expected-Snapshot; Payload, Expected, Vergleich, Anleitung und Nutzerquelle behielten ihre Vorher-Hashes.

## Grenzen und nächster Schritt

Der einzelne Sammelvergleich bleibt eine 1/1 manuelle Antwort; die historische Formelvalidierung bleibt separat bei 0/100 gültigen Live-Ergebnissen. Zwei Fragmente und mögliche Ausgabeabschneidung bleiben Grenzen der zurückgegebenen Liste. Der 421/13/132-Vergleich ist der eingefrorene Stand vor diesen Regeländerungen und keine aktuelle Agreement-Messung. Die lokale Auswertung enthält keine klinische Ground Truth und sagt nichts über die Verträglichkeit eines konkreten Produkts aus.
