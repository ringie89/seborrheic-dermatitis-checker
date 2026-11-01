'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = require('./rules.js');
let assertions = 0;
const eq = (name, expected, label) => {
  const actual = R.matchOne(name)?.rating || 0;
  assert.equal(actual, expected, `${label || name}: expected ${expected}/3, got ${actual}/3`);
  assertions++;
};
const positive = [
  ['Oleic Acid',3],['Palmitic Acid',3],['Alpha-Linolenic Acid',3],['Arachidonic Acid',3],
  ['Olea Europaea Fruit Oil',3],['Butyrospermum Parkii (Shea) Butter',3],['Cera Alba',3],
  ['Vitis Vinifera Seed Oil',3],['Hydrogenated Castor Oil',3],
  ['Glyceryl Stearate',2],['Glyceryl Oleate',2],['Sorbitan Olivate',2],
  ['Polysorbate 20',2],['PEG-40 Hydrogenated Castor Oil',2],
  ['PEG-150 Pentaerythrityl Tetrastearate',2],['Ethylhexyl Palmitate',2],
  ['Hydrogenated Jojoba Oil',2],['Moringa Macassar Seed Oil',2],
  ['Squalene',1],['C10-30 Cholesterol/Lanosterol Esters',2],['Hydrolyzed Jojoba Esters',2],
  ['Galactomyces Ferment Filtrate',3], ['Lactobacillus Ferment Lysate',1],
  ['Saccharomyces/Rice Ferment Filtrate',1],
  ['Sodium Lauroyl Sarcosinate',1],['Sodium Methyl Cocoyl Taurate',1]
];
const negative = [
  'Aqua','Water','Squalane','Mineral Oil','Paraffinum Liquidum','Petrolatum',
  'Caprylic/Capric Triglyceride','PEG-7 Caprylic/Capric Glycerides','Glyceryl Caprylate','Glyceryl Caprate',
  'Coco-Caprylate','Dimethicone','PEG-40 Dimethicone','Stearyl Alcohol',
  'Cetyl Alcohol','Cetearyl Alcohol','Behenyl Alcohol','Ceramide NP',
  'Ketoconazole','Piroctone Olamine','Sodium Laureth Sulfate','Coco-Glucoside',
  'Glycerin','Hyaluronic Acid','Panthenol','Sodium Benzoate','Phenoxyethanol',
  'Citric Acid','Salicylic Acid','Niacinamide','Sodium Chloride',
  'C12-15 Alkyl Benzoate','Ethylhexyl Methoxycinnamate',
  'Coconut Alkanes','PEG-8 Dimethicone','Polyquaternium-10',
  'Parfum','Fragrance','Limonene','Linalool','Citral','Benzyl Salicylate',
  'Sodium Lauryl Sulfate','Sodium Coco-Sulfate','Methylisothiazolinone',
  'Methylchloroisothiazolinone','DMDM Hydantoin','Formaldehyde','Alcohol Denat.',
  'Ethanol','Cocamidopropyl Betaine','Propylene Glycol','Tea Tree Oil',
  'Lavandula Angustifolia Oil','Eucalyptus Globulus Leaf Oil',
  'Citrus Limon Peel Oil','Mentha Piperita Oil','Menthol', 'Oleyl Alcohol'
];
for (const [n,r] of positive) eq(n,r);
for (const n of negative) eq(n,0);
const aliasCases = [
  ['Polysorbate-80','Polysorbate 80',2,'ester'],
  ["Beeswax/Cera Alba/Cire d'abeille",'Beeswax',3,'lipid'],
  ['Butyrospermum Parkii (Shea Butter)','Shea Butter',3,'lipid'],
  ['Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)','Microcrystalline Wax',0,null]
];
const rawLabelKey = value => String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
for (const [alias, reference, rating, group] of aliasCases) {
  const aliasFinding = R.matchOne(alias);
  const referenceFinding = R.matchOne(reference);
  assert.equal(aliasFinding?.rating || 0, rating, `${alias}: exact alias rating`); assertions++;
  assert.equal(aliasFinding?.group || null, group, `${alias}: exact alias group`); assertions++;
  assert.equal(aliasFinding?.rating || 0, referenceFinding?.rating || 0, `${alias}: matches reference rating`); assertions++;
  assert.equal(aliasFinding?.group || null, referenceFinding?.group || null, `${alias}: matches reference group`); assertions++;
  for (const strict of [true, false]) {
    const aliasAnalysis = R.analyze(alias, {strict});
    const referenceAnalysis = R.analyze(reference, {strict});
    const summarize = analysis => analysis.matches.map(entry => ({rating: entry.finding.rating, group: entry.finding.group}));
    assert.equal(aliasAnalysis.total, 1, `${alias}: parsed as one ingredient`); assertions++;
    assert.deepEqual(summarize(aliasAnalysis), summarize(referenceAnalysis), `${alias}: ${strict ? 'strict' : 'balanced'} analysis matches reference`); assertions++;
  }
  const rawVariant = R.matchOne(` \t${alias.toUpperCase()} \n`);
  assert.equal(rawVariant?.rating || 0, rating, `${alias}: case and outer whitespace are tolerated`); assertions++;
  assert.equal(rawVariant?.group || null, group, `${alias}: raw-label group is preserved`); assertions++;
}
assert.equal(R.rawAliasCount, 4, 'only the four approved raw aliases are registered'); assertions++;
assert.equal(R.matchOne("Beeswax/Cera Alba/Cire d'abeille")?.match, 'Exact list', 'the complete known raw alias remains protected from slash decomposition'); assertions++;

const castorSlashLabel = 'RICINUS COMMUNIS SEED OIL / CASTOR SEED OIL';
assert.deepEqual(R.parseIngredients(castorSlashLabel), [castorSlashLabel], 'slash synonyms stay one original ingredient token'); assertions++;
const castorSlashAnalysis = R.analyze(castorSlashLabel);
assert.equal(castorSlashAnalysis.total, 1, 'slash synonyms count as one ingredient'); assertions++;
assert.equal(castorSlashAnalysis.matches.length, 1, 'slash synonyms produce at most one finding'); assertions++;
assert.equal(castorSlashAnalysis.matches[0].name, castorSlashLabel, 'a slash finding retains the original ingredient label'); assertions++;
assert.equal(castorSlashAnalysis.matches[0].finding.rating, 3, 'the exact Ricinus component wins over the unknown Castor Seed Oil heuristic'); assertions++;
assert.equal(castorSlashAnalysis.matches[0].finding.group, 'lipid'); assertions++;
assert.match(castorSlashAnalysis.matches[0].finding.match, /Slash component "RICINUS COMMUNIS SEED OIL" \(Exact list\)/, 'the match identifies the exact slash component'); assertions++;
assert.equal(R.parseIngredients(`${castorSlashLabel}, ${castorSlashLabel}`).length, 1, 'duplicate slash labels remain one deduplicated ingredient'); assertions++;
const compactCastorSlash = 'RICINUS COMMUNIS SEED OIL/CASTOR SEED OIL';
assert.deepEqual(R.parseIngredients(compactCastorSlash), [compactCastorSlash], 'slashes without surrounding spaces also stay within one ingredient'); assertions++;
assert.equal(R.analyze(compactCastorSlash).matches[0]?.finding.rating, 3, 'compact slash labels receive the same component matching'); assertions++;

const exactTieSlash = 'Glyceryl Stearate / Unlisted Seed Oil';
for (const strict of [true, false]) {
  const analysis = R.analyze(exactTieSlash, {strict});
  assert.equal(analysis.highest, 2, `${strict ? 'Strict' : 'Balanced'} keeps the tied exact ester component`); assertions++;
  assert.equal(analysis.matches[0]?.finding.group, 'ester', `${strict ? 'Strict' : 'Balanced'} exact component wins over full oilunknown heuristic`); assertions++;
  assert.match(analysis.matches[0]?.finding.match || '', /Slash component "Glyceryl Stearate" \(Exact list\)/, 'the tie winner names the exact component'); assertions++;
}

for (const label of [
  'Caprylic/Capric Triglyceride',
  'Caprylic / Capric Triglyceride',
  'Coco-Caprylate/Caprate',
  'Coco-Caprylate / Caprate',
  'C12-15 Alkyl Benzoate'
]) {
  const analysis = R.analyze(label);
  assert.equal(analysis.total, 1, `${label}: preserved as one full label`); assertions++;
  assert.equal(analysis.highest, 0, `${label}: full neutral chemistry is not overridden by a fragment heuristic`); assertions++;
}
for (const label of ['C10-30 Cholesterol/Lanosterol Esters','C10-30 Cholesterol / Lanosterol Esters']) {
  const finding = R.matchOne(label);
  assert.equal(finding?.rating, 2, `${label}: exact full ester remains 2/3`); assertions++;
  assert.equal(finding?.group, 'ester', `${label}: exact full ester identity is retained`); assertions++;
  assert.equal(finding?.match, 'Exact list', `${label}: a known full label is not reported as a component hit`); assertions++;
}

const mixedSlashLabel = 'Galactomyces Ferment Filtrate / Glyceryl Stearate';
const strictMixedSlash = R.analyze(mixedSlashLabel);
assert.equal(strictMixedSlash.total, 1, 'mixed slash labels count once in Strict'); assertions++;
assert.equal(strictMixedSlash.highest, 3, 'Strict keeps the highest slash candidate'); assertions++;
const balancedMixedSlash = R.analyze(mixedSlashLabel, {strict:false});
assert.equal(balancedMixedSlash.total, 1, 'mixed slash labels count once in Balanced'); assertions++;
assert.equal(balancedMixedSlash.highest, 2, 'Balanced filters hidden Galactomyces before choosing the highest visible candidate'); assertions++;
assert.equal(balancedMixedSlash.matches.length, 1, 'Balanced returns one visible finding for the original item'); assertions++;
assert.equal(balancedMixedSlash.matches[0].name, mixedSlashLabel, 'Balanced retains the full original slash label'); assertions++;
assert.equal(balancedMixedSlash.matches[0].finding.group, 'ester', 'the visible ester is not lost behind hidden Galactomyces'); assertions++;
assert.equal(balancedMixedSlash.matches[0].suppressed, null, 'the active ester is not marked suppressed'); assertions++;
const allSuppressedSlash = R.analyze('Galactomyces Ferment Filtrate / Squalene', {strict:false}).ingredients[0];
assert.equal(allSuppressedSlash.finding, null, 'Balanced hides a slash label when every candidate is suppressed'); assertions++;
assert.equal(allSuppressedSlash.suppressed?.group, 'galactomyces', 'the highest suppressed slash candidate remains available for explanation'); assertions++;

const volatileSlash = 'Oleic Acid / Citrus Limon Peel Oil';
const volatileSlashFinding = R.analyze(volatileSlash).matches[0];
assert.equal(volatileSlashFinding?.name, volatileSlash, 'a volatile-oil pattern on the full label cannot hide the other component'); assertions++;
assert.equal(volatileSlashFinding?.finding.group, 'fatty'); assertions++;
assert.equal(volatileSlashFinding?.finding.rating, 3); assertions++;
assert.match(volatileSlashFinding?.finding.match || '', /Slash component "Oleic Acid" \(Exact list\)/, 'the known acid component is reported as the match source'); assertions++;
assert.equal(R.matchOne('Unknown Ingredient (Galactomyces / Oleic Acid)'), null, 'slashes inside parentheses are not treated as ingredient boundaries'); assertions++;
assert.equal(R.matchOne('Unknown (Galactomyces / Oleic Acid) / Glyceryl Stearate')?.rating, 2, 'only top-level slash components contribute candidates'); assertions++;

const squaleneFinding = R.matchOne('Squalene');
assert.equal(squaleneFinding?.group, 'mechanistic', 'Squalene has its own exact low-confidence group'); assertions++;
assert.match(squaleneFinding?.reason || '', /non-peer-reviewed.*preprint.*single-strain/i, 'Squalene reason labels the single-strain preprint as not peer-reviewed'); assertions++;
assert.equal(squaleneFinding?.source, 'https://pubmed.ncbi.nlm.nih.gov/36789756/', 'Squalene flag links to the primary oxidation study'); assertions++;
assert.equal(R.matchOne('  SQUALENE  ')?.group, 'mechanistic', 'exact Squalene matching tolerates case and outer whitespace'); assertions++;
assert.equal(R.analyze('Squalene').highest, 1, 'Squalene is a 1/3 Strict-only finding'); assertions++;
const balancedSqualene = R.analyze('Squalene', {strict:false}).ingredients[0];
assert.equal(R.analyze('Squalene', {strict:false}).highest, 0, 'Balanced suppresses the low-confidence Squalene flag'); assertions++;
assert.equal(balancedSqualene.suppressed?.group, 'mechanistic', 'Balanced suppression retains the finding explanation'); assertions++;
assert.equal(R.matchOne('Squalene derivative'), null, 'Squalene does not use substring matching'); assertions++;
const squaleneAndSqualane = R.analyze('Squalene, Squalane');
assert.deepEqual(squaleneAndSqualane.matches.map(x=>x.name), ['Squalene'], 'Squalene flag is separate from neutral Squalane'); assertions++;
assert.equal(squaleneAndSqualane.ingredients[1].finding, null, 'Squalane stays neutral beside flagged Squalene'); assertions++;
eq('PEG-7 Caprylic/Capric Glyceride',2,'nearby singular glyceride does not inherit the exact neutral exception');
assert.equal(R.matchOne('PEG-7 Caprylic/Capric Glyceride')?.group, 'glycerides'); assertions++;
assert.equal(R.matchOne('PEG-7 Glyceryl Cocoate')?.group, 'ester', 'unrelated PEG esters keep their existing rule'); assertions++;
for (const [label, group] of [
  ['C10-30 Cholesterol/Lanosterol Esters','ester'],
  ['Hydrolyzed Jojoba Esters','ester']
]) {
  assert.equal(R.matchOne(label)?.rating, 2, `${label}: exact 2/3 ester classification`); assertions++;
  assert.equal(R.matchOne(label)?.group, group, `${label}: remains in the existing ester group`); assertions++;
}
assert.equal(R.matchOne('C10-30 Cholesterol/Lanosterol Esters')?.source, 'https://kcia.or.kr/cid/search/ingd_view.php?no=3088', 'C10-30 ester outcome links to its ingredient identity definition'); assertions++;
assert.match(R.matchOne('C10-30 Cholesterol/Lanosterol Esters')?.reason || '', /chain distribution.*not established/i, 'C10-30 reason does not assume a long-chain fraction'); assertions++;
assert.match(R.matchOne('Hydrolyzed Jojoba Esters')?.reason || '', /composition and availability.*not established/i, 'jojoba override preserves composition and usability uncertainty'); assertions++;
assert.equal(R.matchOne('Hydrolyzed Jojoba Esters derivative'), null, 'extended jojoba label is not matched by substring'); assertions++;
const volatileExactLabels = [
  'Salvia Officinalis Oil','Sage Oil','Salvia Officinalis (Sage) Oil','Sage (Salvia Officinalis) Oil',
  'Citrus Aurantium Bergamia Fruit Oil','Bergamot Fruit Oil',
  'Citrus Aurantium Bergamia (Bergamot) Fruit Oil','Bergamot (Citrus Aurantium Bergamia) Fruit Oil',
  'Citrus Aurantifolia Oil','Lime Oil','Lime (Citrus Aurantifolia) Oil',
  'Lavandula Hybrida Oil','Lavendin Oil','Lavendin (Lavandula Hybrida) Oil','Pogostemon Cablin Oil'
];
for (const label of volatileExactLabels) {
  assert.equal(R.matchOne(label), null, `${label}: documented volatile-oil identity is not assigned oilunknown`); assertions++;
}
for (const [label, rating, group] of [
  ['Salvia Officinalis Seed Oil',2,'oilunknown'],
  ['Sage Seed Oil',2,'oilunknown'],
  ['Bergamot Seed Oil',2,'oilunknown'],
  ['Citrus Aurantifolia Seed Oil',2,'oilunknown'],
  ['Salvia Hispanica Seed Oil',3,'lipid'],
  ['Citrus Auranthium Bergamia (Bergamot) Fruit Oil',2,'oilunknown']
]) {
  assert.equal(R.matchOne(label)?.rating || 0, rating, `${label}: non-whitelisted/seed/typo baseline rating`); assertions++;
  assert.equal(R.matchOne(label)?.group || null, group, `${label}: non-whitelisted/seed/typo baseline group`); assertions++;
}
const microcrystallineCommaInput = 'Aqua, Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline), Oleic Acid';
assert.deepEqual(R.parseIngredients(microcrystallineCommaInput), ['Aqua','Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)','Oleic Acid']); assertions++;
assert.deepEqual(R.analyze(microcrystallineCommaInput).matches.map(entry => entry.name), ['Oleic Acid']); assertions++;
eq('Polysorbate-81',0,'unlisted hyphenated Polysorbate does not inherit the alias');
eq('Polysorbate-80 Blend',0,'suffix is not matched as an alias');
eq("Beeswax/Cera Alba/Cire d'abeille extract",3,'extended composite wax label matches its exact Beeswax slash component');
assert.equal(R.matchOne("Beeswax/Cera Alba/Cire d'abeille extract")?.group, 'lipid'); assertions++;
eq('Butyrospermum Parkii (Unlisted Butter)',0,'unlisted parenthetical Shea variant remains unmatched');
eq('Butyrospermum Parkii (Shea Butter) derivative',0,'suffix is not matched as the exact Shea alias');
eq('Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline) derivative',2,'extended Cera label falls through to the existing oilunknown heuristic');
assert.equal(R.matchOne('Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline) derivative')?.group, 'oilunknown'); assertions++;

const historicalManualSnapshot = JSON.parse(fs.readFileSync(path.join(__dirname,'quality/sezia_manual_expected.json'), 'utf8'));
const strictSnapshotChanges = [];
const balancedSnapshotChanges = [];
const snapshotLabelsWithMultipleTokens = [];
for (const entry of historicalManualSnapshot.ingredients) {
  const parsed = R.parseIngredients(entry.label);
  if (parsed.length !== 1) {
    snapshotLabelsWithMultipleTokens.push(entry.label);
    continue;
  }
  const strictFinding = R.matchOne(parsed[0]);
  const strictState = {rating: strictFinding?.rating || 0, group: strictFinding?.group || null};
  if (JSON.stringify(strictState) !== JSON.stringify({rating: entry.strict.rating, group: entry.strict.group})) {
    strictSnapshotChanges.push(rawLabelKey(entry.label));
  }
  const balancedEntry = R.analyze(parsed[0], {strict:false}).ingredients[0];
  const balancedState = {rating: balancedEntry.finding?.rating || 0, group: balancedEntry.finding?.group || null};
  if (JSON.stringify(balancedState) !== JSON.stringify({rating: entry.balanced.rating, group: entry.balanced.group})) {
    balancedSnapshotChanges.push(rawLabelKey(entry.label));
  }
}
assert.deepEqual(snapshotLabelsWithMultipleTokens, [], 'frozen ingredient labels parse as one token for mode comparison'); assertions++;
const approvedStep7StrictChanges = [
  'Squalene','PEG-7 Caprylic/Capric Glycerides','C10-30 Cholesterol/Lanosterol Esters','Hydrolyzed Jojoba Esters',
  'Salvia Officinalis (Sage) Oil','Sage (Salvia Officinalis) Oil',
  'Citrus Aurantium Bergamia (Bergamot) Fruit Oil','Bergamot (Citrus Aurantium Bergamia) Fruit Oil',
  'Lime (Citrus Aurantifolia) Oil','Lavendin (Lavandula Hybrida) Oil','Pogostemon Cablin Oil'
].map(rawLabelKey);
const approvedStep7BalancedChanges = [
  'PEG-7 Caprylic/Capric Glycerides','C10-30 Cholesterol/Lanosterol Esters','Hydrolyzed Jojoba Esters'
].map(rawLabelKey);
assert.deepEqual(strictSnapshotChanges.sort(), [...aliasCases.map(([alias]) => rawLabelKey(alias)), ...approvedStep7StrictChanges].sort(), 'frozen Strict changes are limited to the four prior aliases and the approved Squalene, PEG-7, ester, and volatile-oil labels'); assertions++;
assert.deepEqual(balancedSnapshotChanges.sort(), [...aliasCases.slice(0,3).map(([alias]) => rawLabelKey(alias)), ...approvedStep7BalancedChanges].sort(), 'frozen Balanced changes are limited to the three prior positive aliases plus exact PEG-7 and ester labels'); assertions++;

for (const [label, rating, group] of [
  ['Squalene',1,'mechanistic'],
  ['Polyhydroxystearic Acid',0,null],
  ['Milk Protein',0,null],
  ['Milk Protein Extract',0,null],
  ['Goat Milk Extract',0,null],
  ['Olive Oil Unsaponifiables',0,null],
  ['PEG-7 Caprylic/Capric Glycerides',0,null],
  ['Squalane',0,null]
]) {
  const finding = R.matchOne(label);
  assert.equal(finding?.rating || 0, rating, `${label}: unresolved review baseline rating`); assertions++;
  assert.equal(finding?.group || null, group, `${label}: unresolved review baseline group`); assertions++;
}
assert.deepEqual(R.parseIngredients('Ingredients: Aqua (Water), Oleic Acid; Parfum\nGlycerin • Panthenol'),['Aqua (Water)','Oleic Acid','Parfum','Glycerin','Panthenol']); assertions++;
assert.deepEqual(R.parseIngredients('Aqua (Water, Eau; H2O • alternate), Oleic Acid\r\nGlycerin; Panthenol'),['Aqua (Water, Eau; H2O • alternate)','Oleic Acid','Glycerin','Panthenol']); assertions++;
assert.deepEqual(R.analyze('Aqua (Water, Eau), Oleic Acid').matches.map(x=>x.name),['Oleic Acid']); assertions++;
assert.deepEqual(R.parseIngredients('Aqua, Aqua, GLYCERIN, Glycerin'), ['Aqua','GLYCERIN']); assertions++;
assert.equal(R.analyze('Aqua, Oleic Acid, Glyceryl Oleate, Parfum, Glycerin').highest,3); assertions++;
assert.equal(R.analyze('Aqua, Glycerin, Squalane').highest,0); assertions++;
assert.equal(R.analyze('Aqua, Glycerin, UnknownIngredient').withoutMatch,3); assertions++;
assert.equal(R.analyze('Aqua, Sodium Lauryl Sulfate, Methylisothiazolinone, Parfum, Limonene').highest,0); assertions++;
assert.equal(R.analyze('Aqua, Glyceryl Stearate, Parfum, Limonene').matches.length,1); assertions++;
assert.equal(R.analyze('Aqua, Lactobacillus Ferment Filtrate',{strict:false}).highest,0); assertions++;
assert.equal(R.analyze('Aqua, Lactobacillus Ferment Filtrate',{strict:true}).highest,1); assertions++;
assert.equal(R.analyze('Galactomyces Ferment Filtrate',{strict:true}).highest,3); assertions++;
assert.equal(R.analyze('Galactomyces Ferment Filtrate',{strict:false}).highest,0); assertions++;
assert.equal(R.analyze('Moringa Macassar Seed Oil',{strict:true}).highest,2); assertions++;
assert.equal(R.analyze('Moringa Macassar Seed Oil',{strict:false}).highest,0); assertions++;
assert.deepEqual(R.parseIngredients('2-Bromo-2-Nitropropane-1,3-Diol, Aqua'),['2-Bromo-2-Nitropropane-1,3-Diol','Aqua']); assertions++;
assert.ok(R.knownCount>400); assertions++;
console.log(`✓ ${assertions} assertions passed · ${R.knownCount} exact ingredient names/aliases`);
