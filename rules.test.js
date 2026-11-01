'use strict';
const assert = require('node:assert/strict');
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
