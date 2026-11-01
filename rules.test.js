'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
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
  ['Galactomyces Ferment Filtrate',3], ['Lactobacillus Ferment Lysate',1],
  ['Saccharomyces/Rice Ferment Filtrate',1],
  ['Sodium Lauroyl Sarcosinate',1],['Sodium Methyl Cocoyl Taurate',1]
];
const negative = [
  'Aqua','Water','Squalane','Mineral Oil','Paraffinum Liquidum','Petrolatum',
  'Caprylic/Capric Triglyceride','Glyceryl Caprylate','Glyceryl Caprate',
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
const microcrystallineCommaInput = 'Aqua, Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline), Oleic Acid';
assert.deepEqual(R.parseIngredients(microcrystallineCommaInput), ['Aqua','Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)','Oleic Acid']); assertions++;
assert.deepEqual(R.analyze(microcrystallineCommaInput).matches.map(entry => entry.name), ['Oleic Acid']); assertions++;
eq('Polysorbate-81',0,'unlisted hyphenated Polysorbate does not inherit the alias');
eq('Polysorbate-80 Blend',0,'suffix is not matched as an alias');
eq("Beeswax/Cera Alba/Cire d'abeille extract",0,'extended composite wax label is not matched by substring');
eq('Butyrospermum Parkii (Unlisted Butter)',0,'unlisted parenthetical Shea variant remains unmatched');
eq('Butyrospermum Parkii (Shea Butter) derivative',0,'suffix is not matched as the exact Shea alias');
eq('Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline) derivative',2,'extended Cera label falls through to the existing oilunknown heuristic');
assert.equal(R.matchOne('Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline) derivative')?.group, 'oilunknown'); assertions++;

const historicalManualSnapshot = JSON.parse(fs.readFileSync('quality/sezia_manual_expected.json', 'utf8'));
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
assert.deepEqual(strictSnapshotChanges.sort(), aliasCases.map(([alias]) => rawLabelKey(alias)).sort(), 'only the four approved aliases change Strict results across the frozen 1,432-label set'); assertions++;
assert.deepEqual(balancedSnapshotChanges.sort(), aliasCases.slice(0,3).map(([alias]) => rawLabelKey(alias)).sort(), 'only the three positive aliases change Balanced results across the frozen 1,432-label set'); assertions++;

for (const [label, rating, group] of [
  ['Squalene',0,null],
  ['Polyhydroxystearic Acid',0,null],
  ['Milk Protein',0,null],
  ['PEG-7 Caprylic/Capric Glycerides',2,'glycerides']
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
