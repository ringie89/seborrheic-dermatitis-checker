'use strict';
// Tests 100 complete but SYNTHETIC lists. These are not manufacturer products!
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const R=require('../rules.js');
const cases=JSON.parse(fs.readFileSync(path.join(__dirname,'synthetic_100.json'),'utf8'));
assert.equal(cases.length,100,'Exactly 100 regression fixtures');
let testCount=0;
for(const scenario of cases){
 const a=R.analyze(scenario.inci,{strict:true});
 assert.equal(a.highest,scenario.expected_max,`${scenario.id}: overall level`);testCount++;
 for(const [name,score] of Object.entries(scenario.expected)){
  const found=a.matches.find(x=>R.normalize(x.name)===R.normalize(name));
  assert.ok(found,`${scenario.id}: missing ${name}`);
  assert.equal(found.finding.rating,score,`${scenario.id}: incorrect rating for ${name}`);
  testCount+=2;
 }
 // All reference neutral ingredients must remain unflagged: catch false positives.
 for (const ing of a.ingredients){
  if(Object.prototype.hasOwnProperty.call(scenario.expected,ing.name)) continue;
  assert.equal(ing.finding,null,`${scenario.id}: false flag for ${ing.name}`);testCount++;
 }
 assert.ok(a.total>=10,`${scenario.id}: not a full fixture`);testCount++;
}
console.log(`PASS: ${cases.length} synthetic complete INCI scenarios / ${testCount} assertions`);
