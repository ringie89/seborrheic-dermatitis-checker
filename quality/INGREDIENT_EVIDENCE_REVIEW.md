# Einzelfallprüfung offener Zutaten

Stand: 2026-11-01. Die Evidenzentscheidungen unten wurden vom Root fachlich geprüft und sind für die gebündelte Implementierung freigegeben. Es handelt sich um vorsorgliche Regeln eines Malassezia-/SD-Screeners, nicht um klinische Sicherheitsurteile. Keine 100 getrennten Produkt-Liveprüfungen sind erforderlich.

## Entscheidungen und Änderungsgrenzen

| Label/Familie | Vorher → freigegebene Regel | Begründung und Grenze |
|---|---|---|
| `Squalene` | 0/3 → **1/3 Strict-only**; Balanced unterdrückt den Hinweis. Neue Gruppe `mechanistic`. | Ein direkter *M. furfur*-Kulturversuch in einem 2026-Preprint liefert einen vorläufigen Hyphenbefund; veröffentlichte Arbeiten untersuchen vor allem SQOOH/MDA und Oxidation. Keine klinische Produktbehauptung. Nur das exakte Label `Squalene`. |
| `Squalane` | 0/3 → 0/3 | Separater gesättigter Stoff; die zitierten Squalene-Experimente testeten Squalane nicht. [PubChem: Squalene](https://pubchem.ncbi.nlm.nih.gov/compound/Squalene), [PubChem: Squalane](https://pubchem.ncbi.nlm.nih.gov/compound/Squalane). |
| `PEG-7 Caprylic/Capric Glycerides` | 2/3 `glycerides` → **0/3 neutral** | CIR beschreibt C8/C10-Fettsäuren und durchschnittlich sieben Ethylenoxid-Einheiten. Das ist Identitäts-/Zusammensetzungskontext, kein SD-Test. Der CIR-Bericht ist eine Literaturübersicht zur öffentlichen Kommentierung, keine finale Sicherheits- oder klinische Bewertung. [CIR SLR, S. 10](https://cir-safety.org/sites/default/files/PEGalk062014SLR.pdf). Keine anderen PEG- oder Glycerideinträge werden neutralisiert. |
| `C10-30 Cholesterol/Lanosterol Esters` | 0/3 → **2/3 `ester`** | Die kosmetische Zutatenbeschreibung ordnet den Namen als Cholesterol-/Lanosterolester mit C10–C30-Säuren ein. Exakte Zuordnung zur vorhandenen Estergruppe; keine 3/3- oder klinische Aussage. [Korea Cosmetic Ingredient Association](https://kcia.or.kr/cid/search/ingd_view.php?no=3088). |
| `Hydrolyzed Jojoba Esters` | 0/3 → **2/3 `ester`** | CIR beschreibt ein Hydrolysat und klassifiziert es als Esterzutat. Die lokale Begründung nennt Mischung/Hydrolyse und unklare Zusammensetzung bzw. Nutzbarkeit; der Name belegt keine freie Fettsäure. [CIR-Zutatenbericht, S. 3](https://www.cir-safety.org/sites/default/files/115_buff3f_suppl.pdf), [CIR-Eintrag](https://www.cir-safety.org/ingredient/hydrolyzed-jojoba-esters). |
| `Polyhydroxystearic Acid` | 0/3 → 0/3 | CIR beschreibt ein Polymer aus Hydroxycarbonsäure-Monomeren, nicht einfach freie Hydroxystearinsäure. Im Bericht wurde kein direkter Malassezia-/SD-Nachweis herangezogen. [CIR Final Report](https://www.cir-safety.org/sites/default/files/FR_PolyhydroxystearicAcid_032023.pdf). |
| `Milk Protein`, `Milk Protein Extract`, `Goat Milk Extract` | 0/3 → 0/3 | Protein-/Extraktbezeichnungen legen keinen einheitlichen Milchfettanteil fest; der Zutatenname allein reicht nicht für eine Lipideinstufung. [CIR Milk Proteins](https://cir-safety.org/sites/default/files/mlkpro092017final.pdf), [KCIA Goat Milk Extract](https://kcia.or.kr/cid/search/ingd_view.php?no=5554). Keine Aussage über klinische Verträglichkeit. |
| `Olive Oil Unsaponifiables` | 0/3 → 0/3 | Der IOC-Standard behandelt unverseifbare Bestandteile als eine Fraktion, nicht als synonymes triglyceridreiches Olivenöl; Mengen einzelner Komponenten lassen sich aus dem Label nicht zuverlässig ableiten. Squalene wird nicht aus dem Namen inferiert. [IOC-Methode](https://www.internationaloliveoil.org/wp-content/uploads/2022/10/COI-T20-Doc.10-REV-1-2001-Eng.pdf). |

## Exakte volatile-Öl-Aliase

Die folgenden nachgewiesenen Schreibweisen werden nur in der bestehenden Exakt-Whitelist als 0/3 geführt, damit die allgemeine `oilunknown`-Heuristik sie nicht als unbekanntes Öl einstuft:

- `Salvia Officinalis Oil`, `Sage Oil` — Identitätskontext: [CIR Sage Tentative Report, S. 12](https://www.cir-safety.org/sites/default/files/TR_Sage_122021.pdf).
- `Citrus Aurantium Bergamia Fruit Oil`, `Bergamot Fruit Oil` — Herstellerdatenblatt nennt Frucht-/Schalenherkunft sowie beide INCI-Bezeichnungen; das belegt Identität, keine klinische Sicherheit. [Biolandes TDS, S. 1–2](https://www.biolandes.com/wp-content/uploads/fiche-technique-B123.pdf).
- `Citrus Aurantifolia Oil`, `Lime Oil` — INCI-Identität im [Lime-Öl-Sicherheitsdatenblatt](https://docs.newdirectionsaromatics.com/msds/MSDS_LimeOrganicEssentialOil.pdf).
- `Lavandula Hybrida Oil`, `Lavendin Oil` — Namensbezug in [Elixens](https://www.elixens.com/en/product-sheet/essential-oil-lavandin-lavsu100276) und [EU SCCS, Anlage 1, S. 82 (gedruckte S. 83)](https://health.ec.europa.eu/system/files/2016-11/sccs_o_073_annex1_0.pdf).
- `Pogostemon Cablin Oil` — Identitätsdatensatz der [FDA Substance Registration System](https://precision.fda.gov/ginas/app/ui/substances/F3IN55X5PO).

Diese exakten Identitätsquellen sind keine klinischen Trigger- oder Sicherheitstests. Keine Seed-/Kernel-Öle werden dadurch neutralisiert: `Sage Seed Oil`, `Bergamot Seed Oil` und `Citrus Aurantifolia Seed Oil` bleiben der bisherigen Heuristik unterstellt; `Salvia Hispanica Seed Oil` bleibt die vorhandene 3/3-Lipidregel. Die nicht belegte Schreibweise `Citrus Auranthium Bergamia (Bergamot) Fruit Oil` wird nicht als Alias aufgenommen.

## Squalene-Evidenz kurz

- **2016, Beobachtung:** 10 schuppenfreie und 10 betroffene Personen, dazu 24 Betroffene mit gepaartem Zonenvergleich. SQOOH/Squalene-Verhältnis und Oxidationsmarker waren in betroffenen Zonen erhöht; freies Squalene war dort geringer. Das ist eine Assoziation, keine Produktintervention. Die Studie weist L’Oréal-Finanzierung und Beschäftigungsverhältnisse aus und meldet zugleich keinen Interessenkonflikt. [PubMed](https://pubmed.ncbi.nlm.nih.gov/26842231/), [Volltext/Finanzierung](https://pmc.ncbi.nlm.nih.gov/articles/PMC4796319/).
- **2023, Kultur + Hautmodell:** *M. restricta* bildete aus Kulturbedingungen mit Linolsäure und Squalene SQOOH; auf rekonstruierter Epidermis wurden SQOOH und MDA als Oxidationsprodukte getestet. Kein klinischer oder Squalene-Kosmetikprodukt-Endpunkt. Autor:innen-Affiliationen und COI stehen auf [PubMed](https://pubmed.ncbi.nlm.nih.gov/36789756/).
- **2026, Preprint:** *M. furfur* CBS7019 zeigte in Kultur nach längerer Inkubation Hyphenbildung mit Squalene; 1 % Tween 60 verstärkte den Befund, Olivenöl war stärker. Die MAT-Genexpression unterschied sich häufig nicht signifikant vom Medium. Die Squalene-Menge war nicht quantifiziert; es gab keinen klinischen Produktversuch und keinen Squalene-spezifischen Patientenendpunkt. Der PMC-Eintrag kennzeichnet den Text ausdrücklich als nicht peer-reviewed; Förderangaben stehen in den [Danksagungen](https://pmc.ncbi.nlm.nih.gov/articles/PMC13405305/).

Dieser gemeinsame Bericht ist die maßgebliche Evidenzquelle. Die Datei `SQUALENE_REVIEW.md` ist lediglich ein Verweis hierher. Die Bewertung 1/3 bezeichnet nur vorläufige mechanistische Relevanz im Strict-Modus; sie sagt nicht voraus, ob ein Mensch auf ein Produkt reagiert.

## Snapshot und Abnahmegrenzen

Die historische Sammelantwort, `quality/SEZIA_INGREDIENTS.txt`, `quality/sezia_manual_expected.json` und `quality/sezia_manual_comparison.json` bleiben unverändert. Der Originalvergleich 421/13/132 bleibt eine historische, vor diesen Regeländerungen aufgenommene Labelabweichung. Der Regression-Scope ist auf Squalene (Strict-only), PEG-7, die beiden exakten Esterlabels und die sieben betroffenen historischen volatile-Öl-Labels begrenzt; Step 6 behält seine ursprünglichen vier Strict-/drei Balanced-Abweichungen. Near-miss-Seedöle und nicht belegte Tippvarianten bleiben unverändert. Das ist ein Ingredient-Namensvergleich, keine Produktformel- oder klinische Validierung.

## Implementierungs- und Prüfstatus

Zum Abschluss von Schritt 7 bestanden die gebündelten Regeln und Tests mit **219 Assertions und 439 bekannten exakten Namen/Aliasen**; der eingefrorene 1.432-Label-Korpus zeigte damals genau **15 Strict- und 6 Balanced-Änderungen** über die historischen Erwartungswerte hinweg. Der Exporter-Guard wies eine geänderte Ableitung vor Datei-Writes zurück. Root-Code-Review der Evidenzumsetzung bestanden. Alle geprüften Fälle sind entschieden oder bleiben mit dokumentierter Begründung unverändert.

Der aktuelle Stand nach Schritt 9 besteht mit **269 Assertions und 439 Namen/Aliasen**. Die zusätzlichen Slash-Regressionen prüfen Ein-Item-Ausgabe, Komponentenwahl, Modusfilterung und Schutz bekannter Vollnamen; der neue Resolver änderte keines der eingefrorenen 1.432 Labels zusätzlich.
