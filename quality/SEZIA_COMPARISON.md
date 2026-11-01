# Manuelle Sezia-Sammelausgabe: Abgleich

Stand: 2026-11-01. Eine vom Nutzer zurückgegebene Sezia-Ausgabe wurde mit den erwarteten lokalen Label-Einstufungen verglichen. Das ist ein Abgleich von Ingredient-Namen, keine Prüfung vollständiger Produktformeln und keine klinische Validierung. Produktregeln wurden nicht geändert.

## Eingabe und Zuordnung

Die Ausgabe meldet 436 problematische Einträge. Die Abschnittsmarker und drei Schlusslabels ohne eigenen Marker ergeben 147 Ester, 48 Fettsäuren, 197 Lipide, 5 Galactomyces-Einträge und 39 High-Sensitivity-Einträge. Die 436 Labels sind nach NFKC, Kleinschreibung und Whitespace-Bereinigung eindeutig; Satzzeichen, Klammern und Schreibvarianten blieben erhalten. 434 Labels stimmen exakt mit der vorbereiteten 1.432-Label-Liste überein. Zwei unvollständige Fragmente ließen sich nicht sicher zuordnen: `olus (vegetable oil` und `ferment extract (platycodon grandiflorum root`. Sie wurden nicht ergänzt oder geraten. In der kopierten Ausgabe ist kein Abschnitt „Unverified“ sichtbar.

Das vollständige rohe Ausgabe-Textdokument wird nicht in diesem Bericht wiederholt. Prüfsummen, Kategorien, Zuordnungszahlen und Abweichungs-Labelsets stehen in [sezia_manual_comparison.json](sezia_manual_comparison.json). Die erwarteten lokalen Einstufungen und ihre Herkunft sind in [sezia_manual_expected.json](sezia_manual_expected.json) dokumentiert; die abgefragte Liste steht in [SEZIA_INGREDIENTS.txt](SEZIA_INGREDIENTS.txt).

## Label-Abgleich

| Modus | Lokale markierte Labels | Exakt gemeinsam | Sezia-Label lokal ohne Treffer | Lokal markiert, in Ausgabe nicht vorhanden |
|---|---:|---:|---:|---:|
| Strict | 553 | 421 | 13 | 132 |
| Balanced | 402 | 361 | 73 | 41 |

Der Nenner für die Ausgabe ist 434 exakt zugeordnete Labels; zwei Fragmente bleiben außerhalb des Vergleichs. Die Listen der 13 bzw. 132 Strict-Abweichungen und der 73 bzw. 41 Balanced-Abweichungen sowie lokale Regelgruppen sind im JSON vollständig aufgeführt. Das sind **keine** Präzisions-, Recall- oder Fehlerquoten. Nicht aufgeführte Labels sind keine bestätigten Sezia-Negativbefunde und gelten nicht dadurch als sicher. Insbesondere fehlt ein sichtbarer „Unverified“-Abschnitt. Sezia-Kategorien und lokale Regelgruppen sind außerdem nicht zwingend chemisch gleichartige Kategorien.

Die 13 Sezia-Labels ohne lokale Strict-Regel, unverändert aus der Ausgabe übernommen:

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

## Priorisierte Reviewkandidaten

Diese Beobachtungen sind Prüfhinweise, keine automatische Regeländerung oder abschließende Bewertung:

- **Mögliche lokale Überwarnung durch Alias-/Musterlücken:** `Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)` erhält lokal 2/3 als `oilunknown`, während das alleinstehende `Microcrystalline Wax` in `NEUTRAL` liegt. Die historischen Treffer stammen aus `SRC-0408` und `SRC-0443`; die neutrale Schreibweise aus `SRC-0134`. Das ist eine konkrete interne Alias-Inkonsistenz.
- **Formulierungsabhängiger Review:** `PEG-7 Caprylic/Capric Glycerides` erhält 2/3 als generisches `glycerides`-Muster; `Caprylic/Capric Triglyceride` ist dagegen neutral. Die Namen bezeichnen unterschiedliche Stoffe/Formulierungen. Daraus folgt weder eine Entwarnung noch ein bestätigter Trigger.
- **Volatile-Öl-/Synonymmuster prüfen:** `Salvia Officinalis (Sage) Oil` sowie mehrere Bergamot-Fruit-Oil-Schreibweisen erhalten lokal 2/3 als `oilunknown`, obwohl die Regelnotiz generische Essential-Oil-Warnungen ausschließt und `Bergamot Oil` neutral ist. Das sind mögliche Whitelist-/Namensmusterlücken; eine Prüfung botanischer Quellen und des Regelumfangs steht aus.
- **Mögliche Alias- und Erkennungsunterschiede bei Sezia-Labels:** `Polysorbate-80`, `Beeswax/Cera Alba/Cire d'abeille` und `Butyrospermum Parkii (Shea Butter)` sowie die Ester `C10-30 Cholesterol/Lanosterol Esters` und `Hydrolyzed Jojoba Esters` verdienen eine manuelle Regelprüfung. Die zusammengesetzte Schreibweise allein beweist keine fehlende chemische Stofffamilie.
- **Eingabefehler nicht still reparieren:** `methyl glucose sesquistearatem` und `polysorbate 20 polyglyceryl-3 methylglucose disterarate` sehen nach Schreibfehlern bzw. verklebten Namen aus. Sie wurden im Abgleich nicht normalisiert oder aufgeteilt.
- **Namensinhalt ist kein Nachweis der Zusammensetzung:** `milk protein`, `milk protein extract` und `goat milk extract` belegen für sich keinen bestimmten Milchfettanteil. `Polyhydroxystearic Acid` ist laut [CIR-Sicherheitsbericht](https://www.cir-safety.org/sites/default/files/FR_PolyhydroxystearicAcid_032023.pdf) ein Polymer aus Hydroxycarbonsäure-Monomeren; der Name ist nicht mit freier Hydroxystearinsäure gleichzusetzen.
- **Squalene separat von Squalane prüfen:** Studien berichten mechanistische bzw. assoziative Befunde zu Squalenoxidation und Schuppen/Malassezia ([2016](https://pubmed.ncbi.nlm.nih.gov/26842231/), [2023](https://pubmed.ncbi.nlm.nih.gov/36789756/)). Sie belegen keine patientenbezogene Produktvorhersage und rechtfertigen hier keine automatische Regeländerung. Squalene und Squalane sind unterschiedliche Bezeichnungen/Stoffe.
- **75 Strict-only Salzlabels sind kein bestätigter Bug:** Diese 75 lokal als `salt` markierten Labels sind in der kopierten Trefferliste nicht enthalten; ein eigener Abschnitt „Unverified“ fehlt. Sechs weitere lokale `salt`-Labels werden von Sezia als `Esters` ausgegeben. Sezia beschreibt Salze/Taurate/Isethionate auf der separaten [Unverified-Seite](https://www.sezia.co/ingredients/unverified) als unzureichend erforscht. Kategorien und lokale Regelgruppen sind daher nicht gleichzusetzen.

## Grenzen und nächster Schritt

Der einzelne Sammelvergleich ist für 1/1 manuelle Antwort abgeschlossen; die historische Formelvalidierung bleibt separat bei 0/100 gültigen Live-Ergebnissen. Die zwei Fragmente, mögliche Ausgabeabschneidung und die genannten Regelkandidaten müssen fachlich geprüft werden. Bis zu einem separaten Review bleiben die Projektregeln unverändert. Die lokale Auswertung enthält keine klinische Ground Truth und sagt nichts über die Verträglichkeit eines konkreten Produkts aus.
