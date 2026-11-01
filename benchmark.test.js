'use strict';
// Reproducible manual benchmark of the checker's local screening rules.
// "Sezia category" is based on Sezia's publicly documented matching criteria,
// NOT a claim that searches were submitted to the live Sezia form.
const assert = require('node:assert/strict');
const R = require('./rules.js');

const ingredients = [
  // Expected Sezia categories follow https://www.sezia.co/ingredients/*
  ['Oleic Acid',3,'C11–C24 fatty acid'],
  ['Stearic Acid',3,'C11–C24 fatty acid'],
  ['Lauric Acid',3,'C11–C24 fatty acid'],
  ['Undecylenic Acid',3,'C11–C24 fatty acid; antifungal caveat'],
  ['Organic Cocos Nucifera Oil',3,'Botanical lipid'],
  ['Cold Pressed Olive Oil',3,'Botanical lipid'],
  ['Butyrospermum Parkii (Shea) Butter',3,'Botanical lipid'],
  ['Cera Alba',3,'Wax / complex lipid'],
  ['Milk Lipids',3,'Complex lipid'],
  ['Glyceryl Stearate',2,'Fatty acid ester'],
  ['Glyceryl Stearate Citrate',2,'Fatty acid ester'],
  ['Glyceryl Oleate',2,'Fatty acid ester'],
  ['Ethyl Oleate',2,'Fatty acid ester'],
  ['Isopropyl Myristate',2,'Fatty acid ester'],
  ['Decyl Oleate',2,'Fatty acid ester; limited hydrolysis in one study'],
  ['Polysorbate 80',2,'Polysorbate'],
  ['Sorbitan Olivate',2,'Fatty acid ester'],
  ['Ascorbyl Palmitate',2,'Palmitate ester'],
  ['Polyglyceryl-3 Diisostearate',2,'Fatty acid ester'],
  ['PEG-120 Methyl Glucose Dioleate',2,'Oleate ester'],
  ['Hydrogenated Palm Glycerides Citrate',2,'Uncertain complex glycerides'],
  ['C12-18 Triglycerides',2,'Uncertain fatty acid composition'],
  ['Galactomyces Ferment Filtrate',3,'Galactomyces'],
  ['Galactomyces Filtrate',3,'Galactomyces'],
  ['Lactobacillus Ferment Lysate',1,'High sensitivity / ferment'],
  ['Bacillus/Soybean Ferment Extract',1,'High sensitivity / ferment'],
  ['Saccharomyces/Rice Ferment Filtrate',1,'High sensitivity / ferment'],
  // Deliberately NOT flagged: general irritation and allergy are outside scope.
  ['Parfum',0,'Fragrance allergy outside scope'],
  ['Limonene',0,'Fragrance allergen outside scope'],
  ['Sodium Coco-Sulfate',0,'Irritation outside scope'],
  ['Cocamidopropyl Betaine',0,'Contact allergy outside scope'],
  ['Sodium Cocoamphoacetate',1,'Sezia unverified salt'],
  ['Sodium C14-16 Olefin Sulfonate',1,'Sezia unverified salt'],
  ['Methylisothiazolinone',0,'Contact allergy outside scope'],
  // Confirm absence of false flags; an unflagged item is NOT a safety guarantee.
  ['Caprylic/Capric Triglyceride',0,'C8/C10 triglycerides'],
  ['Glyceryl Caprylate',0,'C8 ester'],
  ['Glyceryl Caprate',0,'C10 ester'],
  ['Squalane',0,'Hydrocarbon'],
  ['Petrolatum',0,'Hydrocarbon'],
  ['Dimethicone',0,'Silicone'],
  ['Cetearyl Alcohol',0,'Fatty alcohol (not free acid)'],
  ['Stearyl Alcohol',0,'Fatty alcohol (not free acid)'],
  ['Sodium Laureth Sulfate',0,'Not SLS'],
  ['Piroctone Olamine',0,'Anti-dandruff active'],
  ['Ketoconazole',0,'Antifungal active'],
  ['Coco-Glucoside',0,'Surfactant, not an oil'],
  ['Coconut Alkanes',0,'Hydrocarbon, not coconut oil'],
  ['Olive Oil Unsaponifiables',0,'Composition not a generic triglyceride'],
  ['Diethylhexyl Malate',0,'Malic acid (C4), not C11–24 fatty acid'],
  ['Isostearyl Neopentanoate',0,'Neopentanoic acid (C5), not C11–24 fatty acid'],
];

// Real manufacturer-listed formulas transcribed from official dm.de product pages
// as retrieved 2026-11-01. A different packaging/formula can change the result.
const products = [
 {name:'Balea med Anti-Schuppen Ultra Sensitive Shampoo',source:'https://www.dm.de/p/d/2968885/balea-med-shampoo-anti-schuppen-ultra-sensitive',inci:'AQUA, SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE, COCO-GLUCOSIDE, PANTHENOL, BISABOLOL, NIACINAMIDE, GUAR HYDROXYPROPYLTRIMONIUM CHLORIDE, GLYCERIN, PIROCTONE OLAMINE, TOCOPHEROL, SODIUM CHLORIDE, GLYCERYL OLEATE, LAURETH-2, HYDROGENATED PALM GLYCERIDES CITRATE, CITRIC ACID, SODIUM BENZOATE',mustInclude:['GLYCERYL OLEATE','HYDROGENATED PALM GLYCERIDES CITRATE'],mustNotInclude:['PIROCTONE OLAMINE'],maxRating:2},
 {name:'Balea med Ultra Sensitive Shampoo',source:'https://www.dm.de/p/d/1569035/balea-med-shampoo-ultra-sensitive',inci:'Aqua, Coco-Glucoside, Glycerin, Sodium Coco-Sulfate, Sodium Cocoamphoacetate, Citric Acid, Panthenol, Niacinamide, Tocopherol, Ascorbyl Palmitate, Glyceryl Oleate, Hydroxypropyl Guar Hydroxypropyltrimonium Chloride, Hydrogenated Palm Glycerides Citrate, Lecithin, Sodium Benzoate, Potassium Sorbate, Sodium Chloride, Sodium Hydroxide',mustInclude:['Ascorbyl Palmitate','Glyceryl Oleate','Hydrogenated Palm Glycerides Citrate'],mustNotInclude:['Sodium Coco-Sulfate','Cocamidopropyl Betaine'],maxRating:2},
 {name:'Balea med Totes Meer Ultra Sensitive Shampoo',source:'https://www.dm.de/p/d/3058568/balea-med-shampoo-totes-meer-ultra-sensitive',inci:'Aqua, Coco-Glucoside, Glycerin, Sodium Coco-Sulfate, Sodium Cocoamphoacetate, Citric Acid, Glyceryl Oleate, Panthenol, Maris Sal, Niacinamide, Tocopherol, Ascorbyl Palmitate, Glycol Distearate, Hydroxypropyl Guar Hydroxypropyltrimonium Chloride, Glyceryl Stearate, Hydrogenated Palm Glycerides Citrate, Lecithin, Sodium Benzoate, Potassium Sorbate, Benzoic Acid, Sodium Chloride, Sodium Hydroxide',mustInclude:['Glycol Distearate','Glyceryl Stearate','Hydrogenated Palm Glycerides Citrate'],maxRating:2},
 {name:'Balea Niacinamide Serum',source:'https://www.dm.de/p/d/1676288/balea-serum-niacinamide',inci:'AQUA, NIACINAMIDE, GLYCERIN, PENTYLENE GLYCOL, ALOE BARBADENSIS LEAF JUICE, ZINC PCA, PANTHENOL, PHENOXYETHANOL, CELLULOSE GUM, ALLANTOIN, SODIUM BENZOATE, CITRIC ACID, XANTHAN GUM, ETHYLHEXYLGLYCERIN, TRISODIUM ETHYLENEDIAMINE DISUCCINATE, SODIUM HYALURONATE',mustInclude:[],maxRating:0},
 {name:'Balea med Ultra Sensitive Waschgel',source:'https://www.dm.de/p/d/1691474/balea-med-waschgel-ultra-sensitive',inci:'AQUA, GLYCERIN, PENTYLENE GLYCOL, COCAMIDOPROPYL BETAINE, DECYL GLUCOSIDE, XANTHAN GUM, SODIUM CHLORIDE, PANTHENOL, BISABOLOL, CITRIC ACID',mustInclude:[],mustNotInclude:['COCAMIDOPROPYL BETAINE'],maxRating:0},
 {name:'Balea med Ultra Sensitive Reinigungsmilch',source:'https://www.dm.de/p/d/1623935/balea-med-reinigungsmilch-ultra-sensitive',inci:'AQUA, CAPRYLIC/CAPRIC TRIGLYCERIDE, BUTYLENE GLYCOL, C12_15 ALKYL BENZOATE, GLYCERIN, ISONONYL ISONONANOATE, PENTYLENE GLYCOL, GLYCERYL STEARATE CITRATE, METHYLPROPANEDIOL, STEARYL ALCOHOL, XANTHAN GUM, PANTHENOL, ETHYLHEXYLGLYCERIN, GLYCERYL CAPRYLATE, NIACINAMIDE, SODIUM HYDROXIDE, TOCOPHEROL',mustInclude:['GLYCERYL STEARATE CITRATE'],mustNotInclude:['CAPRYLIC/CAPRIC TRIGLYCERIDE','STEARYL ALCOHOL','GLYCERYL CAPRYLATE'],maxRating:2},
];

let pass = 0;
for (const [name, rating] of ingredients) {
  assert.equal(R.matchOne(name)?.rating||0,rating,`Rating mismatch for: ${name}`);
  pass++;
}
for (const p of products) {
  const a=R.analyze(p.inci);
  assert.equal(a.highest,p.maxRating,`${p.name}: overall risk`);
  const flagged=new Set(a.matches.map(x=>x.name.toLowerCase()));
  for(const n of p.mustInclude||[]) assert.ok(flagged.has(n.toLowerCase()),`${p.name}: missing ${n}`);
  for(const n of p.mustNotInclude||[]) assert.ok(!flagged.has(n.toLowerCase()),`${p.name}: unwanted ${n}`);
  pass++;
  console.log(`${p.name}: ${a.total} ingredients, ${a.matches.length} flagged, max ${a.highest}/3, [${a.matches.map(x=>x.name).join(', ')}]`);
}
assert.deepEqual(R.parseIngredients('INGREDIENTS, SASTOJCI, съставки: AQUA, GLYCERIN, GLYCERYL OLEATE'),['AQUA','GLYCERIN','GLYCERYL OLEATE']); pass++;
assert.deepEqual(R.parseIngredients('Ingredients: AQUA | SODIUM LAURETH SULFATE | COCO|GLUCOSIDE | GLYCERYL OLEATE'),['AQUA','SODIUM LAURETH SULFATE','COCO-GLUCOSIDE','GLYCERYL OLEATE']); pass++;
console.log(`✓ ${pass} benchmark checks (${ingredients.length} ingredient cases, ${products.length} real product formula cases, 2 parsing cases)`);
module.exports={ingredients,products};
