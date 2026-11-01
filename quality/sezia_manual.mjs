import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requireRules = createRequire(path.join(root, 'rules.js'));
const R = requireRules('./rules.js');
const hash = value => createHash('sha256').update(value).digest('hex');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

function loadFixture(relative, append = '') {
  const filename = path.join(root, relative);
  const moduleObject = {exports: {}};
  const processState = {exitCode: 0};
  const quietConsole = {log() {}, warn() {}, error() {}};
  const run = new Function('module', 'exports', 'require', 'process', 'console', read(relative) + append);
  run(moduleObject, moduleObject.exports, createRequire(pathToFileURL(filename)), processState, quietConsole);
  assert.equal(processState.exitCode, 0, relative + ' fixture checks');
  return moduleObject.exports.__manualFixtures || moduleObject.exports;
}

function conservativeKey(label) {
  return String(label).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

const labels = new Map();
function addLabel(value, source) {
  const label = String(value).trim();
  if (!label) return;
  assert.ok(!/[\r\n]/.test(label), 'ingredient labels must be single-line');
  const key = conservativeKey(label);
  if (!labels.has(key)) labels.set(key, {label, key, sources: new Set()});
  labels.get(key).sources.add(source);
}

const ruleSource = read('rules.js');
const addPattern = /\badd\(\s*(['\x60])([\s\S]*?)\1\s*,\s*'[A-Za-z]+'/g;
let addMatch;
let rawRegistryCount = 0;
const rawRegistryLabels = [];
while ((addMatch = addPattern.exec(ruleSource))) {
  for (const name of addMatch[2].split('|')) {
    if (!name.trim()) continue;
    rawRegistryCount++;
    rawRegistryLabels.push(name);
    addLabel(name, 'rules.js:add registry');
  }
}
assert.ok(rawRegistryCount > 400, 'captured the expected rule alias registry');
const normalizedRegistryKeys = new Set(rawRegistryLabels.map(name => R.normalize(name)).filter(Boolean));
assert.equal(normalizedRegistryKeys.size, R.knownCount, 'raw add literals cover the entire normalized exact-rule map');

const neutralMatch = ruleSource.match(/const NEUTRAL = new Set\([\x60]([\s\S]*?)[\x60]\.split\('\|'\)\.map\(normalize\)\);/);
assert.ok(neutralMatch, 'captured the raw NEUTRAL set');
const neutralNames = neutralMatch[1].split('|');
for (const name of neutralNames) addLabel(name, 'rules.js:NEUTRAL');

const volatileMatch = ruleSource.match(/const volatileOilNames = new Set\([\x60]([\s\S]*?)[\x60]\.split\('\|'\)\.map\(normalize\)\);/);
assert.ok(volatileMatch, 'captured the raw volatileOilNames set');
const volatileNames = volatileMatch[1].split('|');
for (const name of volatileNames) addLabel(name, 'rules.js:volatileOilNames');

const archivePath = 'quality/real-product-audit-output/Prod1.csv';
const archiveBytes = fs.readFileSync(path.join(root, archivePath));
const archiveSha256 = hash(archiveBytes);
const reportPath = 'quality/real-product-audit-output/real_100_results.json';
const archiveReport = JSON.parse(read(reportPath));
assert.equal(archiveReport.source_sha256, archiveSha256, 'local source archive matches audit provenance');
assert.equal(archiveReport.products.length, 100, 'current historical archive has 100 records');
assert.equal(new Set(archiveReport.products.map(product => product.id)).size, 100, 'historical source IDs are unique');
let historicalPositions = 0;
for (const product of archiveReport.products) {
  const parsed = R.parseIngredients(product.inci);
  assert.equal(parsed.length, product.ingredient_count, product.id + ' parsed count matches archived report');
  historicalPositions += parsed.length;
  for (const name of parsed) addLabel(name, 'historical archive:' + product.id);
}

const rulesFixtures = loadFixture(
  'rules.test.js',
  '\nmodule.exports.__manualFixtures = {positive, negative};\n'
);
for (const [name, rating] of rulesFixtures.positive) {
  assert.equal(R.matchOne(name)?.rating || 0, rating, 'rules.test.js positive fixture ' + name);
  addLabel(name, 'rules.test.js:positive');
}
for (const name of rulesFixtures.negative) {
  assert.equal(R.matchOne(name)?.rating || 0, 0, 'rules.test.js negative fixture ' + name);
  addLabel(name, 'rules.test.js:negative');
}

const benchmark = loadFixture(
  'benchmark.test.js',
  '\nmodule.exports.__manualFixtures = {ingredients, products};\n'
);
for (const [name, rating] of benchmark.ingredients) {
  assert.equal(R.matchOne(name)?.rating || 0, rating, 'benchmark ingredient fixture ' + name);
  addLabel(name, 'benchmark.test.js:ingredient case');
}
for (const product of benchmark.products) {
  for (const name of R.parseIngredients(product.inci)) addLabel(name, 'benchmark.test.js:manufacturer formula fixture');
}

const seziaReferences = loadFixture(
  'quality/sezia_examples.test.js',
  '\nmodule.exports.__manualFixtures = references;\n'
);
for (const [category, reference] of Object.entries(seziaReferences)) {
  for (const name of reference.names.split('|')) addLabel(name, 'quality/sezia_examples.test.js:' + category);
}
const seziaExampleCount = Object.values(seziaReferences).reduce((sum, reference) => sum + reference.names.split('|').length, 0);

const syntheticCases = JSON.parse(read('quality/synthetic_100.json'));
assert.equal(syntheticCases.length, 100, 'synthetic fixture count');
for (const scenario of syntheticCases) {
  for (const name of R.parseIngredients(scenario.inci)) addLabel(name, 'quality/synthetic_100.json:' + scenario.id);
}

const cliTestSource = read('quality/real100.test.mjs');
const cliFixture = cliTestSource.match(/const inci\s*=\s*'((?:\\.|[^'\\])*)';/);
assert.ok(cliFixture, 'captured the offline CLI ingredient fixture');
const cliInci = cliFixture[1].replace(/\\n/g, '\n').replace(/\\'/g, "'");
for (const name of R.parseIngredients(cliInci)) addLabel(name, 'quality/real100.test.mjs:synthetic CLI fixture');

const appTestSource = read('app.test.js');
const appFixture = /get\('ingredients'\)\.value\s*=\s*'((?:\\.|[^'\\])*)'/g;
let appMatch;
while ((appMatch = appFixture.exec(appTestSource))) {
  const inci = appMatch[1].replace(/\\n/g, '\n').replace(/\\'/g, "'");
  for (const name of R.parseIngredients(inci)) addLabel(name, 'app.test.js:input fixture');
}

const excluded = [];
for (const [key, entry] of labels) {
  const testOnly = [...entry.sources].every(source => source.startsWith('rules.test.js:') || source.startsWith('benchmark.test.js:') || source.startsWith('quality/synthetic_100.json:') || source.startsWith('quality/real100.test.mjs:synthetic'));
  const isUnknownPlaceholder = /^unknown(?:$|[\s_-]|[A-Z0-9])/i.test(entry.label);
  const isPatternPlaceholder = key === conservativeKey('Moringa Macassar Seed Oil');
  if (testOnly && (isUnknownPlaceholder || isPatternPlaceholder)) {
    excluded.push({label: entry.label, sources: [...entry.sources].sort(), reason: isUnknownPlaceholder ? 'Explicit unknown/test placeholder; not an INCI claim.' : 'Test-only pattern example with no rule-registry or archive source; not included as a real INCI label.'});
    labels.delete(key);
  }
}
for (const placeholder of new Set(read('rules.test.js').match(/\bUnknown[A-Za-z0-9_-]*/g) || [])) {
  if (!excluded.some(item => item.label === placeholder)) {
    excluded.push({label: placeholder, sources: ['rules.test.js:unmatched-input sentinel'], reason: 'Explicit unknown/test placeholder; not an INCI claim.'});
  }
}

const entries = [...labels.values()].sort((a, b) => a.label.localeCompare(b.label, 'en'));
assert.ok(entries.length > 0, 'ingredient payload is not empty');
assert.equal(new Set(entries.map(entry => entry.key)).size, entries.length, 'conservative deduplication has no duplicate keys');
for (const entry of entries) {
  assert.ok(entry.sources.size > 0, 'each label has provenance');
  assert.ok(!/^unknown(?:$|[\s_-]|[A-Z0-9])/i.test(entry.label), 'unknown placeholders are excluded');
}
const entryKeys = new Set(entries.map(entry => entry.key));
for (const name of [...rawRegistryLabels, ...neutralNames, ...volatileNames]) {
  assert.ok(entryKeys.has(conservativeKey(name)), 'raw rule label retained: ' + name);
}

function summarize(label, mode) {
  const match = R.matchOne(label);
  const suppressed = !!match && mode === 'balanced' && (match.rating === 1 || match.group === 'galactomyces' || match.group === 'oilunknown');
  return {
    rating: match && !suppressed ? match.rating : 0,
    group: match && !suppressed ? match.group : null,
    suppressed: suppressed ? {rating: match.rating, group: match.group} : null
  };
}

const payload = entries.map(entry => entry.label).join(', ');
const payloadSha256 = hash(Buffer.from(payload, 'utf8'));
const strictMatches = entries.filter(entry => summarize(entry.label, 'strict').rating > 0).length;
const balancedMatches = entries.filter(entry => summarize(entry.label, 'balanced').rating > 0).length;
const testFixtureSources = [
  'rules.test.js positive and negative cases',
  'benchmark.test.js ingredient cases and manufacturer-listed formulas',
  'quality/sezia_examples.test.js published-category examples',
  'quality/synthetic_100.json 100 explicitly synthetic formula scenarios',
  'quality/real100.test.mjs explicitly synthetic offline CLI formula',
  'app.test.js input fixture'
];
const guide = [
  '# Manuelle Sezia-Sammelabfrage',
  '',
  '## Ablauf',
  '',
  '1. Öffne Sezia und füge den vollständigen Inhalt von `SEZIA_INGREDIENTS.txt` als eine einzige Zutatenliste ein.',
  '2. Wenn Sezia die Eingabe ablehnt oder erkennbar abschneidet, kopiere die Meldung und den sichtbaren Umfang zurück. Danach entscheiden wir nachvollziehbar, ob und wie Teilabfragen nötig sind.',
  '3. Kopiere alle hervorgehobenen Treffer vollständig mit der angezeigten Kategorie, Einstufung und Erklärung zurück. Falls Sezia keine Treffer zeigt, bestätige ausdrücklich: **„Keine Treffer angezeigt.“**',
  '',
  '## Umfang und Grenzen',
  '',
  'Die eine Liste enthält **' + entries.length + '** unterschiedliche Quelllabels. Die Quellen sind der aktuelle lokale 100-Einträge-Archivscan, das rohe Regelregister samt NEUTRAL- und volatile-oil-Namen sowie vorhandene Projektfixtures. Die Namen wurden nur nach NFKC, Kleinschreibung, Whitespace-Zusammenfassung und äußerem Trim dedupliziert; Klammerzusätze, Marketingpräfixe, Schreibweisen und Tippfehler bleiben als Varianten erhalten.',
  '',
  'Sie umfasst ' + historicalPositions + ' geparste Ingredient-Positionen aus 100 historischen Katalogeinträgen; diese Listen sind nicht manuell als vollständig oder aktuell verifiziert. Originaldaten-Fragmente wie Acid oder Caprylic/Capric sowie angehängter Marketingtext können vorkommen. Synthetische Testformeln sind als Quelle ausgewiesen; explizite Platzhalter sind ausgeschlossen: ' + (excluded.map(item => item.label).join(', ') || 'keine') + '.',
  'Quellenzählungen: ' + rawRegistryCount + ' rohe add-Aliasvorkommen (' + normalizedRegistryKeys.size + ' normalisierte Regelnamen), ' + neutralNames.length + ' NEUTRAL-Namen, ' + volatileNames.length + ' volatile-oil-Namen, ' + rulesFixtures.positive.length + ' positive und ' + rulesFixtures.negative.length + ' negative Rules-Testfälle, ' + benchmark.ingredients.length + ' Benchmark-Einzelstofffälle und ' + benchmark.products.length + ' Herstellerformeln, ' + seziaExampleCount + ' veröffentlichte Sezia-Beispiel-Labels sowie ' + syntheticCases.length + ' synthetische Rezeptur-Fixtures.',
  '',
  'Einzelne Kommata innerhalb geklammerter Namen bleiben erhalten. Ändere sie vor dem Einfügen nicht. Die Abfrage prüft eine gemeinsame Menge von Einzelstoffnamen; sie ersetzt keine Formelprüfung eines konkreten Produkts.',
  '',
  'Die Payload enthält nur Namen aus Projektregeln, dem lokalen Archiv und benannten Fixtures; sie ist keine vollständige INCI-Liste der Welt. Die Bewertungen in `sezia_manual_expected.json` sind die lokalen Strict-/Balanced-Vorhersagen des Checkers, keine Live-Sezia-Ergebnisse und keine klinische Aussage.',
  '',
  '## Provenienz',
  '',
  '- Payload SHA-256 (UTF-8 ohne abschließenden Zeilenumbruch): `' + payloadSha256 + '`.',
  '- Historisches CSV-Archiv SHA-256: `' + archiveSha256 + '`; verwendeter lokaler Snapshot: `quality/real-product-audit-output/Prod1.csv` (wegen ungeklärter Weiterverbreitungsrechte nicht eingecheckt).',
  '- Quellenarten: ' + testFixtureSources.join('; ') + '.',
  '- Die ursprüngliche Einzelprobe SRC-0035 ergab keinen auswertbaren Live-Resultatblock. Für diese Sammelabfrage gibt es noch **0 bestätigte manuelle Beobachtungen**.'
].join('\n');

const expected = {
  metadata: {
    generated_from: 'quality/sezia_manual.mjs',
    payload_sha256_utf8_without_trailing_newline: payloadSha256,
    payload_characters: payload.length,
    payload_utf8_bytes: Buffer.byteLength(payload, 'utf8'),
    unique_label_count: entries.length,
    strict_flagged_label_count: strictMatches,
    balanced_flagged_label_count: balancedMatches,
    source_archive_url: archiveReport.source,
    source_archive_file: archivePath,
    source_archive_sha256: archiveSha256,
    source_archive_records: archiveReport.products.length,
    historical_parsed_positions: historicalPositions,
    manual_union_batch_observations: 0,
    source_counts: {
      rules_add_raw_alias_occurrences: rawRegistryCount,
      rules_add_normalized_unique_names: normalizedRegistryKeys.size,
      neutral_names: neutralNames.length,
      volatile_oil_names: volatileNames.length,
      rules_test_positive: rulesFixtures.positive.length,
      rules_test_negative: rulesFixtures.negative.length,
      benchmark_ingredient_cases: benchmark.ingredients.length,
      benchmark_manufacturer_formulas: benchmark.products.length,
      published_sezia_example_labels: seziaExampleCount,
      synthetic_100_scenarios: syntheticCases.length,
      excluded_test_placeholders: excluded.length
    },
    live_sezia_observations: 0,
    deduplication: 'NFKC + lowercase + collapse whitespace + trim only; punctuation, parenthetical text, prefixes, and spelling variants retained.'
  },
  excluded_test_placeholders: excluded,
  ingredients: entries.map(entry => ({
    label: entry.label,
    canonical_key: R.normalize(entry.label),
    strict: summarize(entry.label, 'strict'),
    balanced: summarize(entry.label, 'balanced'),
    sources: [...entry.sources].sort()
  }))
};

const payloadFile = path.join(root, 'quality/SEZIA_INGREDIENTS.txt');
const expectedFile = path.join(root, 'quality/sezia_manual_expected.json');
const guideFile = path.join(root, 'quality/SEZIA_MANUAL_GUIDE.md');
fs.writeFileSync(payloadFile, payload + '\n', 'utf8');
fs.writeFileSync(expectedFile, JSON.stringify(expected, null, 2) + '\n', 'utf8');
fs.writeFileSync(guideFile, guide + '\n', 'utf8');

const payloadWritten = fs.readFileSync(payloadFile, 'utf8').replace(/\n$/, '');
assert.equal(payloadWritten, payload, 'one-line copy payload exactly covers the expected labels');
assert.equal(hash(Buffer.from(payloadWritten, 'utf8')), expected.metadata.payload_sha256_utf8_without_trailing_newline);
assert.equal(expected.ingredients.length, expected.metadata.unique_label_count);
assert.equal(expected.excluded_test_placeholders.some(item => /Moringa Macassar Seed Oil/i.test(item.label)), true, 'test-only Moringa Macassar pattern label is documented as excluded');

console.log('PASS: ' + entries.length + ' unique ingredient labels; ' + rawRegistryCount + ' raw registry aliases; ' + neutralNames.length + ' neutral names; ' + volatileNames.length + ' volatile-oil names; ' + archiveReport.products.length + ' historical records / ' + historicalPositions + ' parsed positions.');
console.log('Payload: ' + payload.length + ' characters; SHA-256 ' + payloadSha256 + '; strict active ' + strictMatches + ', balanced active ' + balancedMatches + '.');
console.log('Excluded test-only placeholders: ' + excluded.length + '.');
