'use strict';
/**
 * Independent fixture: explicitly printed example names from Sezia's public
 * category pages (as consulted 2026-11-01). Not live checker responses.
 * Tests conservative category detection, not clinical accuracy.
 */
const R=require('../rules.js');
const assert=require('node:assert/strict');
const references={
  'fatty-acids': {
    rating:3, src:'https://www.sezia.co/ingredients/fatty-acids',
    names:`Undecylenic Acid|Lauric Acid|Tridecylic Acid|Myristic Acid|Pentadecylic Acid|Palmitic Acid|Palmitoleic Acid|Margaric Acid|Stearic Acid|Vaccenic Acid|Oleic Acid|Elaidic Acid|Linoleic Acid|Linolelaidic Acid|Alpha-linolenic Acid|Gamma-linolenic Acid|Stearidonic Acid|Nonadecylic Acid|Arachidic Acid|Gondoic Acid|Dihomo-Y-linolenic Acid|Mead Acid|Arachidonic Acid|Eicosapentaenoic Acid|Heneicosylic Acid|Behenic Acid|Erucic Acid|Docosatetraenoic Acid|Docosahexaenoic Acid|Tricosylic Acid|Lignoceric Acid|Nervonic Acid`
  },
  'high-sensitivity': {
    rating:1,src:'https://www.sezia.co/ingredients/high-sensitivity',
    names:`Aspergillus Ferment|Bacillus Ferment|Alteromonas Ferment Extract|Lactococcus Ferment Lysate|Lactococcus Ferment|Pseudoalteromonas Ferment Extract|Thermus Thermophillus Ferment|Leuconostoc/Radish Root Ferment Filtrate|Rice Ferment Filtrate|Saccharomyces Xylinum Black Tea Ferment|Saccharomyces/Camellia Sinensis Leaf/Cladosiphon Okamuranus/Rice Ferment Filtrate|Aspergillus/Rice Ferment Filtrate|Bacillus/Soybean/Folic Acid Ferment|Lactobacillus/Pumpkin Fruit Ferment Filtrate|Lactobacillus/Rice Ferment Filtrate|Saccharomyces Cerevisiae Extract|Saccharomyces Ferment Filtrate|Saccharomyces Copper Ferment|Yeast Extract|Faex|Hydrolyzed Yeast Extract`
  },
  'unverified': {
    rating:1,src:'https://www.sezia.co/ingredients/unverified',
    names:`Sodium Cocoyl Lauryl Isethionate|Sodium Lauryl Isethionate|Sodium Lauroyl Methyl Isethionate|Sodium Cocoyl Isethionate|Sodium Palmitoyl Isethionate|Calcium Lauroyl Taurate|Magnesium Methyl Cocoyl Taurate|Potassium Cocoyl Taurate|Potassium Methyl Cocoyl Taurate|Potassium Taurate|Sodium Caproyl Methyltaurate|Sodium Cocoyl Taurate|Sodium Lauroyl Taurate|Sodium Methyl Cocoyl Taurate|Sodium Methyl Lauroyl Taurate|Sodium Methyl Myristoyl Taurate|Sodium Methyl Oleoyl Taurate|Sodium Methyl Palmitoyl Taurate|Sodium Methyl Stearoyl Taurate|Sodium Methyltaurate|Sodium Methyltaurate Isopalmitamide|Sodium Methyltaurine Cocoyl Methyltaurate|Sodium N-Isostearoyl Methyltaurate|Sodium Taurate|Sodium Taurine Cocoyl Methyltaurate|PEG-6 Cocamide|PEG-4 Rapeseedamide|PPG-2 Hydroxyethyl Coco/Isostearamide|Cetyl-PG Hydroxyethyl Palmitamide|Aluminum Dimyristate|Ammonium Coco Monoglyceride Sulfate|Ammonium Cocomonoglyceride Sulfate|Arginine Cocoate|Calcium Stearate|Disodium Cocoamphodiacetate|Lysine Cocoate|Magnesium Cocoate|Magnesium Myristate|Magnesium Stearate|Potassium Boababate|Potassium Castorate|Potassium Cocoate|Potassium Hydrogenated Cocoate|Potassium Isostearate|Potassium Laurate|Potassium Myristate|Potassium Oliviate|Potassium Palmitate|Potassium Stearate|Sodium C14-16 Olefin Sulfonate|Sodium Coco Monoglyceride Sulfate|Sodium Cocoamphoacetate|Sodium Cocoate|Sodium Cocomonoglyceride Sulfate|Sodium Cocomonoglyceride Sulfonate|Sodium Hydrogenated Cocoate|Sodium Isostearate|Sodium Laurate|Sodium Myristate|Sodium Oleate|Sodium Palm Glyceride Sulfonate|Sodium Palm Kernelate|Sodium Palmitate|Sodium PEG-7 Olive Oil Carboxylate|Sodium PEG-8 Palm Glycerides Carboxylate|Sodium Stearate|Zinc Isostearate|Zinc Myristate|Zinc Ricinoleate|Zinc Stearate`
  }
};
let n=0;const missed=[];const duplicates=[];let passed=0;const seen=new Set();
for(const [category,v] of Object.entries(references)){
 const names=v.names.split('|');
 for(const name of names){n++;
 const key=R.normalize(name);if(seen.has(key))duplicates.push({name,category});else seen.add(key);
 const got=R.matchOne(name);const score=got?.rating||0;
 if(score!==v.rating){missed.push({name,category,expected:v.rating,got:score,group:got?.group||'none'})}
 else passed++;
 }
}
if(missed.length||duplicates.length){console.error(`Current Sezia public example benchmark: ${passed}/${n} match documented category-based caution.`);if(missed.length)console.error('Rating mismatches:',JSON.stringify(missed,null,2));if(duplicates.length)console.error('Duplicate names:',JSON.stringify(duplicates,null,2));process.exitCode=1}
else console.log(`PASS: ${seen.size} unique public Sezia category examples (category-derived levels; not live checker output)`);
module.exports={references,missed,duplicates};
